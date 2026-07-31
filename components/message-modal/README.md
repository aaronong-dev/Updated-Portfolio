# Message Modal

Contact / messages UI: provider, modal form, and optional page CTA. Drop this folder into another Next.js app and copy the companion API files listed below.

## Copy these

**Core (this folder)**

```text
components/message-modal/
```

**Assets**

```text
public/contact/           # Message-Icon, click-me CTA, Personal-Profile avatar
```

**Companion backend (required for sending mail)**

```text
app/api/contact/route.ts
lib/rate-limit.ts
```

## Dependencies

- `next` (`next/image`)
- `resend` — only needed for the API route
- React client components (`"use client"`)

## Environment

Create `.env.local` (or set these in your host):

```bash
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

Without them, the modal still opens; only send fails.

## Usage

```tsx
// app/layout.tsx (server)
import { MessageModalProvider } from "@/components/message-modal";
import AppChrome from "@/components/AppChrome"; // or your own client wrapper

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MessageModalProvider>
          <AppChrome>{children}</AppChrome>
        </MessageModalProvider>
      </body>
    </html>
  );
}
```

```tsx
// client wrapper
"use client";

import { MessageModal, useMessageModal } from "@/components/message-modal";
import Dock from "@/components/dock"; // optional

export default function AppChrome({ children }) {
  const { openMessageModal } = useMessageModal();
  return (
    <>
      <Dock onMessagesClick={openMessageModal} />
      {children}
      <MessageModal />
    </>
  );
}
```

Optional page CTA:

```tsx
import { Contact } from "@/components/message-modal";

<Contact />
```

Open the modal anywhere with `useMessageModal().openMessageModal` (must be under `MessageModalProvider`).

## Dock minimize animation

On minimize, the modal animates toward `[aria-label="Dock"] [aria-label="Messages"]`. If no Dock is present, it falls back to a default rect — the modal works standalone.

## Exports

| Export | Role |
|--------|------|
| `MessageModalProvider` | Context for open/close |
| `useMessageModal` | Hook: `isOpen`, `openMessageModal`, `closeMessageModal` |
| `MessageModal` | Form UI |
| `Contact` | Optional section CTA |
