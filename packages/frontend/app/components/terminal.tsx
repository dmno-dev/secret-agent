'use client';

import { AUTH_KEY_LOCALSTORAGE_KEY } from '@/lib/api';
import { HelpCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletButton } from './wallet-button';
import { useState } from 'react';
import { DocsModal } from '../dashboard/components/docs-modal';

import { useTypingEffect } from '@/hooks/use-typing-effect';
interface TerminalProps {
  children: React.ReactNode;
}

export function Terminal({ children }: TerminalProps) {
  const { theme, setTheme } = useTheme();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [showDocs, setShowDocs] = useState(false);

  function logout() {
    disconnect();
    window.localStorage.removeItem(AUTH_KEY_LOCALSTORAGE_KEY);
  }

  const siteTitle = useTypingEffect('SecretAgent.sh', 50);

  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-green-400 p-4 transition-colors duration-100">
      <div className="max-w-6xl mx-auto terminal-window rounded-lg overflow-hidden border border-gray-300 dark:border-green-400">
        <div className="flex justify-between items-center bg-gray-200 dark:bg-green-900 p-2 rounded-t-lg">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <a
                href="/"
                className="flex items-center space-x-3 group text-gray-600 dark:text-green-400 hover:text-green-600 dark:hover:text-green-200 transition-none"
              >
                {/* Logo! */}
                <svg
                  className="w-[80px] text-white group-hover:text-green-400 group-hover:text-inherit dark:text-inherit transition-none"
                  viewBox="0 0 400 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M186.204 204.363C190.485 204.185 195.154 204.103 200 204.118C204.846 204.103 209.515 204.185 213.796 204.363C219.381 204.363 224.638 203.705 229.237 202.063C234.494 200.091 240.737 198.119 246.978 196.477C266.362 191.547 287.389 190.891 312.688 193.519C317.109 194.05 321.529 194.675 325.898 195.294C329.647 195.824 333.358 196.35 337 196.805C338.478 196.969 339.957 197.216 341.435 197.462C342.913 197.709 344.392 197.955 345.871 198.119C349.156 198.448 352.441 199.105 356.384 200.091C359.342 200.749 360 202.063 360 205.021C360 208.307 360 211.593 359.672 214.55C359.344 218.494 358.358 219.151 354.743 219.48C350.144 220.138 348.83 221.124 348.172 225.724C348.172 228.024 347.844 230.324 347.515 232.624L347.187 235.91C345.873 246.096 343.573 257.598 339.63 268.77C337.659 274.356 335.359 278.628 332.402 281.914C328.131 287.171 322.874 291.114 316.96 293.086C307.762 296.7 298.562 298.672 289.362 299H288.376C278.204 299 266.392 297.033 264.4 296.701L264.393 296.7C248.622 293.742 236.795 285.528 228.582 271.398C222.997 262.197 218.726 252.01 215.112 239.853C214.127 236.239 213.141 232.295 215.441 228.351C216.098 227.037 215.769 225.723 215.112 224.737C214.455 223.423 213.141 222.765 211.169 222.437C207.241 221.583 203.58 221.172 200 221.206C196.42 221.172 192.759 221.583 188.831 222.437C186.859 222.765 185.545 223.423 184.888 224.737C184.231 225.723 183.902 227.037 184.559 228.351C186.859 232.295 185.873 236.239 184.888 239.853C181.274 252.01 177.003 262.197 171.418 271.398C163.205 285.528 151.378 293.742 135.607 296.7L135.6 296.701C133.607 297.033 121.796 299 111.624 299H110.638C101.438 298.672 92.2385 296.7 83.0397 293.086C77.1262 291.114 71.8695 287.171 67.5983 281.914C64.6412 278.628 62.3414 274.356 60.37 268.77C56.4271 257.598 54.1274 246.096 52.8134 235.91L52.4852 232.624C52.1559 230.324 51.8277 228.024 51.8277 225.724C51.1701 221.124 49.8564 220.138 45.257 219.48C41.6422 219.151 40.6564 218.494 40.3282 214.55C40 211.593 40 208.307 40 205.021C40 202.063 40.6576 200.749 43.6158 200.091C47.5587 199.105 50.8441 198.448 54.1295 198.119C55.6082 197.955 57.0866 197.709 58.565 197.462C60.0433 197.216 61.5215 196.969 63.0001 196.805C66.6416 196.35 70.353 195.824 74.1022 195.294C78.4711 194.675 82.8912 194.05 87.3118 193.519C112.611 190.891 133.638 191.547 153.022 196.477C159.263 198.119 165.506 200.091 170.763 202.063C175.362 203.705 180.619 204.363 186.204 204.363Z"
                    fill="black"
                  />
                  <path
                    d="M200.37 10.2362C200.37 10.2362 168.234 1 154.319 1C126.255 1 103.504 25.9197 103.504 56.6597C103.504 69.4231 96.6948 84.2185 90.7397 97.158C82.3522 115.383 75.659 129.926 92.0708 129.926C95.6569 129.926 100.515 130.278 106.261 130.695C131.341 132.515 200.37 135.206 200.37 135.206C200.37 135.206 269.399 132.515 294.478 130.695C300.225 130.278 305.083 129.926 308.669 129.926C325.081 129.926 318.388 115.383 310 97.1581C304.045 84.2185 297.236 69.4232 297.236 56.6597C297.236 25.9197 274.485 1.00005 246.421 1.00005C232.506 1.00005 200.37 10.2362 200.37 10.2362Z"
                    fill="black"
                  />
                  <ellipse cx="200" cy="143" rx="199" ry="33" fill="black" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M146.24 242.422H146.241C148.516 242.423 150.321 244.289 150.321 246.643C150.321 248.997 148.516 250.864 146.24 250.864L128.271 252.325L139.963 266.45C141.532 268.073 141.532 270.833 139.963 272.456C139.178 273.268 138.08 273.674 137.06 273.674C136.04 273.674 134.941 273.268 134.156 272.456L120.503 260.362L119.09 278.95C119.09 281.304 117.286 283.171 115.01 283.171C113.912 283.171 112.813 282.684 112.107 281.954C111.401 281.223 110.93 280.087 110.93 278.95L109.517 260.362L95.8639 272.456C95.0792 273.268 93.9809 273.674 92.9607 273.674C91.9408 273.674 90.8421 273.268 90.0575 272.456C88.4881 270.833 88.4881 268.073 90.0575 266.45L101.749 252.325L83.78 250.864C82.6817 250.864 81.5831 250.377 80.8768 249.647C80.1705 248.916 79.6998 247.78 79.6998 246.643C79.6998 244.289 81.5046 242.422 83.78 242.422L101.749 240.961L90.0575 226.837C88.4881 225.213 88.4881 222.453 90.0575 220.83C91.6268 219.207 94.2948 219.207 95.8642 220.83L109.518 232.925L110.93 214.336C110.93 211.982 112.735 210.115 115.01 210.115C117.286 210.115 119.091 211.982 119.091 214.336L120.503 232.925L134.157 220.83C135.726 219.207 138.394 219.207 139.963 220.83C141.533 222.453 141.533 225.213 139.963 226.837L128.272 240.961L146.24 242.422ZM314.269 242.422H314.27C316.545 242.423 318.349 244.289 318.349 246.643C318.349 248.997 316.545 250.864 314.269 250.864L296.3 252.325L307.992 266.45C309.561 268.073 309.561 270.833 307.992 272.456C307.207 273.268 306.109 273.674 305.088 273.674C304.068 273.674 302.97 273.268 302.185 272.456L288.532 260.362L287.119 278.95C287.119 281.304 285.315 283.171 283.039 283.171C281.941 283.171 280.842 282.684 280.136 281.954C279.429 281.223 278.959 280.087 278.959 278.95L277.546 260.362L263.893 272.456C263.108 273.268 262.01 273.674 260.989 273.674C259.97 273.674 258.871 273.268 258.086 272.456C256.517 270.833 256.517 268.073 258.086 266.45L269.778 252.325L251.809 250.864C250.71 250.864 249.612 250.377 248.906 249.647C248.199 248.916 247.729 247.78 247.729 246.643C247.729 244.289 249.533 242.422 251.809 242.422L269.778 240.961L258.086 226.837C256.517 225.213 256.517 222.453 258.086 220.83C259.656 219.207 262.324 219.207 263.893 220.83L277.546 232.925L278.959 214.336C278.959 211.982 280.764 210.115 283.039 210.115C285.315 210.115 287.119 211.982 287.119 214.336L288.532 232.925L302.186 220.83C303.755 219.207 306.423 219.207 307.992 220.83C309.562 222.453 309.562 225.213 307.992 226.837L296.3 240.961L314.269 242.422Z"
                    fill="currentColor"
                  />
                </svg>
                <h1 className="text-3xl font-bold">{siteTitle}</h1>
              </a>
              {/* <div
                className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-600 transition-colors"
                onClick={() => isConnected && logout()}
                title={isConnected ? 'Disconnect wallet' : ''}
              ></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div
                className="w-3 h-3 rounded-full bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle theme"
              ></div> */}
            </div>

            {/* {isDashboard && (
              <Link
                href="/"
                className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors font-mono"
              >
                $ cd /home
              </Link>
            )} */}
          </div>

          <div className="flex items-center space-x-4 mr-2">
            {isConnected && !isDashboard && (
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors font-mono"
              >
                Dashboard
              </Link>
            )}
            <WalletButton />
            <button
              onClick={() => setShowDocs(true)}
              className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors"
              title="View Documentation"
            >
              <HelpCircle size={20} />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-gray-600 dark:text-green-400 hover:text-gray-800 dark:hover:text-green-200 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-100">
          {children}
        </div>
        {showDocs && <DocsModal onClose={() => setShowDocs(false)} initialTab="quickstart" />}
      </div>
    </div>
  );
}
