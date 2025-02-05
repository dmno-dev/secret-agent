import { CodeExample } from "./components/code-example";
import { CTA } from "./components/cta";
import { Features } from "./components/features";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { Terminal } from "./components/terminal";

export default function Home() {
  return (
    <Terminal>
      <div className="p-8 min-h-full flex flex-col">
        <Hero />
        <Features />
        <HowItWorks />
        <CodeExample />
        <CTA />
      </div>
    </Terminal>
  );
}
