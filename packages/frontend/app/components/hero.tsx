'use client';

import { useEffect, useState } from 'react';
import { useTypingEffect } from '../../hooks/use-typing-effect';

export function Hero() {
  // const title = useTypingEffect('Welcome to SecretAgent.sh', 50);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSubtitle(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const subtitle = useTypingEffect(
    showSubtitle ? 'Secure secret management for crypto-native AI agents' : '',
    30
  );

  return (
    <section className="mb-8">
      {/* <h1 className="text-4xl font-bold mb-4 font-mono">{title}</h1> */}
      <p className="text-2xl mb-2 h-32 sm:h-16 md:h-7 terminal-cursor font-mono text-green-400 font-bold">
        {subtitle}
      </p>
      <p className="text-lg dark:text-gray-200 text-gray-500">
        Protect your secrets, monitor your agents, simplify development
      </p>
    </section>
  );
}
