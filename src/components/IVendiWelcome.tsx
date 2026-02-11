import { useEffect, useState } from "react";
import ivendiLogo from "@/assets/ivendi-logo.png";

interface IVendiWelcomeProps {
  onComplete: () => void;
}

export function IVendiWelcome({ onComplete }: IVendiWelcomeProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 50);
    const t2 = setTimeout(() => setPhase("exit"), 3500);
    const t3 = setTimeout(onComplete, 3900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-400"
      style={{ opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1 }}
    >
      <img
        src={ivendiLogo}
        alt="iVendi"
        className="w-72 md:w-80 h-auto transition-all duration-600 ease-out"
        style={{
          opacity: phase === "visible" ? 1 : 0,
          transform: phase === "visible" ? "scale(1)" : "scale(0.8)",
        }}
      />

      <h1
        className="text-3xl font-semibold mt-8 transition-all duration-500 ease-out"
        style={{
          color: "#4A4A4A",
          opacity: phase === "visible" ? 1 : 0,
          transform: phase === "visible" ? "translateY(0)" : "translateY(20px)",
          transitionDelay: "400ms",
        }}
      >
        Welcome iVendi
      </h1>

      <div className="flex gap-2 mt-6">
        {[0, 150, 300].map((delay) => (
          <div
            key={delay}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: "#6AB547",
              animationDelay: `${delay}ms`,
              opacity: phase === "visible" ? 1 : 0,
              transition: "opacity 500ms ease-out",
              transitionDelay: "800ms",
            }}
          />
        ))}
      </div>
    </div>
  );
}
