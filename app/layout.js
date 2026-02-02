import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import NextTopLoader from "nextjs-toploader"


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900">
        <NextTopLoader showSpinner={false} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

