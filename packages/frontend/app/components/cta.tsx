'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CTA() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="">curl secretagent.sh/start</h2>

      <Link
        href="/dashboard"
        className="inline-flex px-4 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors"
      >
        Get started
      </Link>
    </section>
  );
}
