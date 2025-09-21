import { Inter } from "next/font/google";
import "./globals.css";
// CORRECTED: Using named imports with curly braces
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthProvider } from '../lib/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL('https://www.grandmedicalequipment.com'),
  title: "Grand Medical Equipment",
  description: "Your trusted source for pre-owned medical equipment and parts.",
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

