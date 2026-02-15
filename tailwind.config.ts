import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tita: {
          primary: "#0c4a6e",
          "primary-light": "#0e7490",
          accent: "#f59e0b",
          sand: "#fef3c7",
          ocean: "#06b6d4",
          verde: "#0a2e1b",
          "verde-medio": "#0d3d2a",
          "verde-oscuro": "#062018",
          oro: "#d4af37",
          "oro-claro": "#e8c547",
          beige: "#e8dcc4",
          "beige-claro": "#f5f0e6",
          "cafe-oscuro": "#2c1810",
          "cafe-oscuro-hover": "#3d2314",
        },
      },
      boxShadow: {
        "oro-glow": "0 0 12px rgba(212, 175, 55, 0.4)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

export default config
