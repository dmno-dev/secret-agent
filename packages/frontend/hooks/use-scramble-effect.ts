import { useEffect, useState } from "react";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export function useScrambleEffect(text: string, duration = 1000) {
  const [scrambledText, setScrambledText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    if (!isScrambling) return;

    const start = Date.now();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const progress = (now - start) / duration;

      if (progress >= 1) {
        clearInterval(intervalId);
        setScrambledText(text);
        setIsScrambling(false);
        return;
      }

      const scrambled = text
        .split("")
        .map((char) => {
          if (Math.random() < progress) return char;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join("");

      setScrambledText(scrambled);
    }, 50);

    return () => clearInterval(intervalId);
  }, [text, duration, isScrambling]);

  const startScramble = () => setIsScrambling(true);

  return { scrambledText, startScramble };
}
