# Aaron Ong — Portfolio

Personal portfolio site built with Next.js.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Contact form (optional)

The contact modal sends mail through [Resend](https://resend.com). Create a `.env.local` file in the project root:

```bash
RESEND_API_KEY=         # from https://resend.com/api-keys
CONTACT_TO_EMAIL=       # inbox that receives messages
CONTACT_FROM_EMAIL=     # verified Resend sender, e.g. Portfolio <onboarding@resend.dev>
```

Without these, the rest of the site still runs; only message sending needs them.

## Project structure

```text
app/                 # routes, layout, API, fonts
components/
  dock/              # reusable dock — see components/dock/README.md
  message-modal/     # reusable contact modal — see components/message-modal/README.md
  …                  # page sections (Hero, Profile, Projects, …)
lib/                 # shared utilities (includes contact rate-limit)
public/              # static assets, grouped by section
  brand/             # signature / brand marks
  bowling-tournaments/
  collage-stickers/
  contact/           # message modal + Contact CTA assets
  dock/              # dock icons
  hero/
  languages/
  polaroids/
  profile/           # portrait, desk setup, clients, audio
  projects/
  services/
```

To reuse the dock or message modal in another project, copy the matching `components/…` folder and follow its README (assets + companion files listed there).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Production build         |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint               |

## Deploy

Deploy on [Vercel](https://vercel.com/new) and set the same env vars in the project settings if you want the contact form live.
