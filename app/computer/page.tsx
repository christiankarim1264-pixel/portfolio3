import ComputerDesktop from "../components/ComputerDesktop";

// Full-screen version of the desktop (the room shows the same desktop inside a monitor modal)
export default function Computer() {
  return (
    <div className="h-dvh w-full">
      <ComputerDesktop />
    </div>
  );
}
