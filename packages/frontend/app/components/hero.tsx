"use client";

import { useEffect, useState } from "react";
import { useTypingEffect } from "../../hooks/use-typing-effect";

export function Hero() {
  const title = useTypingEffect("Welcome to SecretAgent.sh", 50);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSubtitle(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const subtitle = useTypingEffect(
    showSubtitle ? "Secure API Access Management for AI Agents" : "",
    30
  );

  return (
    <section className="mb-8">
      <h1 className="text-4xl font-bold mb-4 font-mono">{title}</h1>
      <p className="text-xl mb-4 h-7 terminal-cursor font-mono">{subtitle}</p>
      <p className="text-gray-400">
        SecretAgent.sh provides a robust platform for AI agent developers to
        manage API access securely, enabling seamless integration and control
        over your autonomous systems.
      </p>
    </section>
  );
}
