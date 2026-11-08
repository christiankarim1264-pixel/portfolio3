'use client';
import { useEffect, useState } from "react";

export default function Clock({ className }: { className?: string }) {
  // the current time; empty until the page is in the browser
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <div className={`text-s text-white text-center leading-tight font-segoe ${className ?? ''}`}>
      <div>{now.toLocaleTimeString('en-us', { hour: "2-digit", minute: "2-digit", second:"2-digit", hourCycle:"h23" })}</div>
      <div>{now.toLocaleDateString('en-us', {weekday:'short', month:'short', day:'numeric'}).replace(",", "")}</div>
    </div>
  );
}
