"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MessageModalContextValue = {
  isOpen: boolean;
  openMessageModal: () => void;
  closeMessageModal: () => void;
};

const MessageModalContext = createContext<MessageModalContextValue | null>(null);

export function MessageModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMessageModal = useCallback(() => setIsOpen(true), []);
  const closeMessageModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openMessageModal, closeMessageModal }),
    [isOpen, openMessageModal, closeMessageModal],
  );

  return (
    <MessageModalContext.Provider value={value}>{children}</MessageModalContext.Provider>
  );
}

export function useMessageModal() {
  const context = useContext(MessageModalContext);
  if (!context) {
    throw new Error("useMessageModal must be used within MessageModalProvider");
  }
  return context;
}
