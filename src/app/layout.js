// src/app/layout.js
import "./globals.css";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AuthProvider } from '../lib/AuthContext'; // <-- Import AuthProvider

export const metadata = {
  title: "Grand Medical Equipment - Used Medical Imaging Systems",
  description: "Your trusted source for high-quality, pre-owned medical equipment, including MRI, CT, PET/CT scanners, and parts. 30+ years of experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* <-- Wrap everything inside AuthProvider */}
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}