# Dock

Draggable macOS-style dock that snaps to screen edges. Drop this folder into another Next.js app and wire it up.

## Copy these

```text
components/dock/          # this folder
public/dock/              # all icons (Home, Profile, Projects, LinkedIn, GitHub, Messages)
```

## Dependencies

- `next` (`next/image`)
- `lucide-react` (drag handle icon)
- React client components (`"use client"`)

## Usage

```tsx
"use client";

import Dock from "@/components/dock";

export default function Example() {
  return <Dock onMessagesClick={() => console.log("open messages")} />;
}
```

`onMessagesClick` is optional. If omitted, the Messages item still renders but does nothing when clicked. Pair it with the [message-modal](../message-modal/) package when you want the contact form.

## CSS variables

Uses (with graceful degradation if missing):

- `--ease-out` — snap / transition easing
- `--font-body` — tooltip text

Define them on `:root` or in your global CSS if you want an exact match to this portfolio.

## Customize

Edit `DOCK_ITEMS` in `Dock.tsx` for labels, icons, hrefs, and external links. Persistence uses `localStorage` key `portfolio-dock-edge`.
