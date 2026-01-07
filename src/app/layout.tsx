import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modern Pokédex | Descubre Pokémon",
  description: "Una aplicación moderna para explorar el mundo de los Pokémon con un diseño premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
