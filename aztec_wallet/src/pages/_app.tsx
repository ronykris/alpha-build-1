import type { AppProps } from 'next/app';
import { Inter } from "next/font/google";
import "../styles/globals.css"; // Adjust this path as needed

const inter = Inter({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <Component {...pageProps} />
    </div>
  );
}