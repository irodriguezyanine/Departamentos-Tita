import type { Metadata } from "next"
import { headers } from "next/headers"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { SessionProvider } from "@/components/SessionProvider"

const DEFAULT_OG = {
  title: "Arriendos Puerto Pacífico | Arriendo en Viña del Mar, Dalal Saleme",
  description: "5 departamentos en arriendo primera línea de playa. Entra y reserva.",
  image: "/og-image.png",
}

async function getSettings() {
  try {
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const base = `${protocol}://${host}`
    const res = await fetch(`${base}/api/settings`, { cache: "no-store" })
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title = settings?.ogTitle ?? DEFAULT_OG.title
  const description = settings?.ogDescription ?? DEFAULT_OG.description
  const image = settings?.ogImage ?? DEFAULT_OG.image
  const imageUrl = image.startsWith("http")
    ? image
    : `https://www.condominiopuertopacifico.cl${image.startsWith("/") ? image : `/${image}`}`
  return {
    title,
    description,
    keywords: [
      "departamentos arriendo",
      "Viña del Mar",
      "Puerto Pacífico",
      "Las Salinas",
      "arriendo vacacional",
    ],
    openGraph: {
      title,
      description,
      url: "https://www.condominiopuertopacifico.cl",
      siteName: "Arriendos Puerto Pacífico",
      locale: "es_CL",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    metadataBase: new URL("https://www.condominiopuertopacifico.cl"),
  }
}

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
