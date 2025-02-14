import Link from 'next/link';

export function Footer() {
  return (
    <footer className="text-center py-4 text-sm text-gray-500">
      Powered by{' '}
      <Link href="https://dmno.dev" className="hover:text-gray-800 transition-colors">
        DMNO
      </Link>
    </footer>
  );
}
