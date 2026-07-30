import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — IA para Emprender",
  description: "Panel interno de marketing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
