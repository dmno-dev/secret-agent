"use client";

import { useState } from "react";
import { CodeExample } from "./components/code-example";
import { CTA } from "./components/cta";
import { Features } from "./components/features";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { Terminal } from "./components/terminal";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Terminal isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
        <Hero />
        <CTA />
        <Features />
        <HowItWorks />
        <CodeExample />
      </Terminal>
    </div>
  );
}
