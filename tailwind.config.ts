import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ec4899", // pink-500
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#fce7f3", // pink-100
          foreground: "#be185d", // pink-700
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#fdf2f8", // pink-50
          foreground: "#9d174d", // pink-800
        },
        accent: {
          DEFAULT: "#fbcfe8", // pink-200
          foreground: "#be185d", // pink-700
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-10px) translateX(-15px)" },
          "75%": { transform: "translateY(-30px) translateX(5px)" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-15px) translateX(-10px)" },
          "66%": { transform: "translateY(-25px) translateX(8px)" },
        },
        "float-fast": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(-12px)" },
        },
        "float-tiny": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "25%": { transform: "translateY(-8px) scale(1.1)" },
          "50%": { transform: "translateY(-15px) scale(0.9)" },
          "75%": { transform: "translateY(-5px) scale(1.05)" },
        },
        "float-heart": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "25%": { transform: "translateY(-10px) rotate(5deg)" },
          "50%": { transform: "translateY(-20px) rotate(-3deg)" },
          "75%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        spiral: {
          "0%": { transform: "rotate(0deg) translateX(20px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(20px) rotate(-360deg)" },
        },
        "title-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 5px rgba(236, 72, 153, 0.3))" },
          "50%": { filter: "drop-shadow(0 0 20px rgba(236, 72, 153, 0.6))" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "button-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(236, 72, 153, 0.6)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(1.1)" },
        },
        "page-enter": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "content-enter": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "title-special": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) scale(0.9)",
            filter: "blur(10px)",
          },
          "50%": {
            opacity: "0.7",
            transform: "translateY(10px) scale(0.95)",
            filter: "blur(5px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0px) drop-shadow(0 0 20px rgba(236, 72, 153, 0.4))",
          },
        },
        "hearts-enter": {
          "0%": { opacity: "0", transform: "scale(0) rotate(-180deg)" },
          "70%": { transform: "scale(1.1) rotate(10deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "hearts-enter-delayed": {
          "0%": { opacity: "0", transform: "scale(0) rotate(180deg)" },
          "70%": { transform: "scale(1.1) rotate(-10deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "button-enter": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) scale(0.8)",
            filter: "blur(5px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0px)",
          },
        },
        "particles-enter": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Splash screen animations
        "splash-enter": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "logo-pulse": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 40px rgba(236, 72, 153, 0.8)" },
        },
        "logo-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "sparkle-1": {
          "0%, 100%": { opacity: "0.3", transform: "rotate(0deg) scale(1)" },
          "50%": { opacity: "1", transform: "rotate(180deg) scale(1.2)" },
        },
        "sparkle-2": {
          "0%, 100%": { opacity: "0.4", transform: "rotate(0deg) scale(1)" },
          "50%": { opacity: "1", transform: "rotate(-180deg) scale(1.1)" },
        },
        "sparkle-3": {
          "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.3)" },
        },
        "sparkle-4": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        "brand-appear": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "tagline-appear": {
          "0%": { opacity: "0", transform: "translateY(5px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "loading-appear": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "loading-dot": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.5)" },
        },
        "bg-particle-1": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-10px) translateX(5px)" },
        },
        "bg-particle-2": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(8px) translateX(-3px)" },
        },
        "bg-particle-3": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-6px) translateX(4px)" },
        },
        "bg-particle-4": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(5px) translateX(-2px)" },
        },
        "menu-item-enter": {
          "0%": {
            opacity: "0",
            transform: "translateX(-20px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-medium": "float-medium 4s ease-in-out infinite",
        "float-fast": "float-fast 3s ease-in-out infinite",
        "float-tiny": "float-tiny 2s ease-in-out infinite",
        "float-heart": "float-heart 5s ease-in-out infinite",
        twinkle: "twinkle 2s ease-in-out infinite",
        spiral: "spiral 8s linear infinite",
        "title-glow": "title-glow 3s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "button-glow": "button-glow 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 1s ease-out",
        wave: "wave 4s ease-in-out infinite",
        "page-enter": "page-enter 1s ease-out",
        "content-enter": "content-enter 1.2s ease-out 0.3s both",
        "title-special": "title-special 1.5s ease-out 0.6s both, title-glow 3s ease-in-out 2s infinite",
        "hearts-enter": "hearts-enter 1s ease-out 0.9s both",
        "hearts-enter-delayed": "hearts-enter-delayed 1s ease-out 1.2s both",
        "button-enter": "button-enter 1s ease-out 1.5s both",
        "particles-enter": "particles-enter 2s ease-out 0.5s both",
        // Splash screen animations
        "splash-enter": "splash-enter 0.8s ease-out",
        "logo-pulse": "logo-pulse 2s ease-in-out infinite",
        "logo-bounce": "logo-bounce 1s ease-in-out infinite",
        "sparkle-1": "sparkle-1 2s ease-in-out infinite",
        "sparkle-2": "sparkle-2 2.5s ease-in-out infinite 0.5s",
        "sparkle-3": "sparkle-3 1.8s ease-in-out infinite 0.3s",
        "sparkle-4": "sparkle-4 2.2s ease-in-out infinite 0.7s",
        "brand-appear": "brand-appear 1s ease-out 0.5s both",
        "tagline-appear": "tagline-appear 1s ease-out 0.8s both",
        "loading-appear": "loading-appear 1s ease-out 1.2s both",
        "loading-dot": "loading-dot 1s ease-in-out infinite",
        "bg-particle-1": "bg-particle-1 4s ease-in-out infinite",
        "bg-particle-2": "bg-particle-2 3s ease-in-out infinite 0.5s",
        "bg-particle-3": "bg-particle-3 5s ease-in-out infinite 1s",
        "bg-particle-4": "bg-particle-4 3.5s ease-in-out infinite 1.5s",
        "menu-item-enter": "menu-item-enter 0.6s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
