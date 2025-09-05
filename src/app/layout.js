import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Grand Medical Equipment',
  description: 'Your Trusted Source for Pre-Owned Medical Equipment',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
