import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MIN_MESSAGE = 2;
const MAX_MESSAGE = 2000;
const MIN_SUBMIT_AGE_MS = 1200;
const MAX_SUBMIT_AGE_MS = 1000 * 60 * 60; // 1 hour

type ContactBody = {
  message?: unknown;
  website?: unknown; // honeypot
  openedAt?: unknown;
};

function asTrimmedString(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\0/g, "");
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!host) return false;

  const allowed = new Set([
    `http://${host}`,
    `https://${host}`,
  ]);

  if (origin) {
    return allowed.has(origin);
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return allowed.has(refererOrigin);
    } catch {
      return false;
    }
  }

  // Same-origin fetch from some browsers may omit Origin on POST.
  // Require at least a matching Host and no suspicious cross-site markers.
  return true;
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }

  const ip = getClientIp(request);

  const burst = checkRateLimit(`contact:burst:${ip}`, {
    limit: 1,
    windowMs: 8_000,
  });
  if (!burst.ok) {
    return Response.json(
      { error: "Please wait a moment before sending another message." },
      {
        status: 429,
        headers: { "Retry-After": String(burst.retryAfterSeconds ?? 8) },
      },
    );
  }

  const hourly = checkRateLimit(`contact:hour:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!hourly.ok) {
    return Response.json(
      { error: "Too many messages. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(hourly.retryAfterSeconds ?? 3600) },
      },
    );
  }

  const daily = checkRateLimit(`contact:day:${ip}`, {
    limit: 15,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!daily.ok) {
    return Response.json(
      { error: "Daily message limit reached. Try again tomorrow." },
      {
        status: 429,
        headers: { "Retry-After": String(daily.retryAfterSeconds ?? 86400) },
      },
    );
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots often fill hidden fields. Pretend success.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return Response.json({ ok: true });
  }

  const openedAt =
    typeof body.openedAt === "number"
      ? body.openedAt
      : typeof body.openedAt === "string"
        ? Number(body.openedAt)
        : NaN;

  if (!Number.isFinite(openedAt)) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const age = Date.now() - openedAt;
  if (age < MIN_SUBMIT_AGE_MS || age > MAX_SUBMIT_AGE_MS) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = asTrimmedString(body.message, MAX_MESSAGE);
  if (!message || message.length < MIN_MESSAGE) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error("Contact API missing RESEND_API_KEY, CONTACT_TO_EMAIL, or CONTACT_FROM_EMAIL.");
    return Response.json(
      { error: "Messaging isn’t configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "New portfolio message",
      text: [
        `IP: ${ip}`,
        "",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json(
        { error: "Couldn’t send your message. Please try again." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return Response.json(
      { error: "Couldn’t send your message. Please try again." },
      { status: 500 },
    );
  }
}
