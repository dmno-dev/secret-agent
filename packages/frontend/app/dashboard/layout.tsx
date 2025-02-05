"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Terminal } from "../components/terminal";
import { CommandLine } from "./components/command-line";
import { DashboardNav } from "./components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.replace("/");
    }
  }, [isConnected, router, mounted]);

  // Don't render anything until mounted to prevent hydration errors
  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return null;
  }

  return (
    <Terminal>
      <div className="flex flex-col">
        <DashboardNav />
        <main className="flex-grow p-6">{children}</main>
        <CommandLine />
      </div>
    </Terminal>
  );
}
