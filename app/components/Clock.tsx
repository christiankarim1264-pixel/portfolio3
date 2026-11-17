'use client';
import { useSyncExternalStore } from "react";

// The taskbar clock. React reads the current second from the browser and re-renders when it
// changes. On the server there is no "now" for the visitor, so it shows nothing until the page loads.
const subscribe = (tick: () => void) => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
};
const currentSecond = () => Math.floor(Date.now() / 1000);
const onServer = () => null;

export default function Clock({ className }: { className?: string }) {
  const second = useSyncExternalStore(subscribe, currentSecond, onServer);
  if (second === null) return null;
  const now = new Date(second * 1000);

  return (
    <div className={`text-sm text-white text-center leading-tight font-segoe ${className ?? ''}`}>
      <div>{now.toLocaleTimeString('en-us', { hour: "2-digit", minute: "2-digit", second:"2-digit", hourCycle:"h23" })}</div>
      <div>{now.toLocaleDateString('en-us', {weekday:'short', month:'short', day:'numeric'}).replace(",", "")}</div>
    </div>
  );
}
