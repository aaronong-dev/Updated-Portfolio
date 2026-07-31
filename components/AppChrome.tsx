"use client";

import type { ReactNode } from "react";
import Dock from "@/components/dock";
import { MessageModal, useMessageModal } from "@/components/message-modal";

export default function AppChrome({ children }: { children: ReactNode }) {
  const { openMessageModal } = useMessageModal();

  return (
    <>
      <Dock onMessagesClick={openMessageModal} />
      {children}
      <MessageModal />
    </>
  );
}
