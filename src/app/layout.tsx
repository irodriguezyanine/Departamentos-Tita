import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { SessionProvider } from "@/components/SessionProvider"

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
})

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Departamentos Tita | Arriendo en Puerto Pacífico, Viña del Mar",
  description:
    "Departamentos en arriendo en el exclusivo Condominio Puerto Pacífico, Viña del Mar. Más de 20 años de servicio excepcional. Piscinas, gimnasio, frente a la playa.",
  keywords: [
    "departamentos arriendo",
    "Viña del Mar",
    "Puerto Pacífico",
    "Las Salinas",
    "arriendo vacacional",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <Header />
          <main className="min-h-screen pt-16 md:pt-20">{children}</main>
          <Footer />
          <WhatsAppButton />
        </SessionProvider>
      </body>
    </html>
  )
}
