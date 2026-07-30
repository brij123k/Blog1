import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import Navbar from "../app/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* <Navbar /> */}
          <div className="app-shell">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}