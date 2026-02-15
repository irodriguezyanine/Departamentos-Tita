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
  title: "Condominio Puerto Pacífico | Arriendo en Viña del Mar, Dalal Saleme",
  description:
    "5 departamentos en arriendo primera línea de playa. Entra y reserva.",
  keywords: [
    "departamentos arriendo",
    "Viña del Mar",
    "Puerto Pacífico",
    "Las Salinas",
    "arriendo vacacional",
  ],
  openGraph: {
    title: "Condominio Puerto Pacífico | Arriendo en Viña del Mar, Dalal Saleme",
    description: "5 departamentos en arriendo primera línea de playa. Entra y reserva.",
    url: "https://www.condominiopuertopacifico.cl",
    siteName: "Condominio Puerto Pacífico",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Condominio Puerto Pacífico | Arriendo en Viña del Mar, Dalal Saleme",
    description: "5 departamentos en arriendo primera línea de playa. Entra y reserva.",
  },
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
          <div className="print:hidden">
            <Header />
          </div>
          <main className="min-h-screen pt-16 md:pt-20 print:pt-0">{children}</main>
          <div className="print:hidden">
            <Footer />
            <WhatsAppButton />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
