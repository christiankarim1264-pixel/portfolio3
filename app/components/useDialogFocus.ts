'use client';
import { useEffect, useRef } from 'react';

// Moves keyboard focus into a popup when it opens, and back to where it was when it closes.
// Without this, focus stays on the page behind the popup, so keyboard and screen-reader
// users don't know it opened.
//
// Use: const ref = useDialogFocus<HTMLDivElement>();
//      <div ref={ref} role='dialog' tabIndex={-1} ...>
// tabIndex={-1} lets the box itself take focus (so a screen reader reads its label first)
// without adding it to the Tab order.
export function useDialogFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => {
      // only go back if that element is still on the page (a menu item that opened the popup is gone by now)
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}
