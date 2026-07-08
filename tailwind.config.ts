import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        // Little Ilmies brand palette — extracted from the live site
        // (littleilmies.com): indigo/purple primary, mauve accent bar,
        // green highlight link, cool light-blue background. Token names
        // are kept from the earlier placeholder palette so components
        // don't need renaming, but every value below is a real brand color.
        cream: {
          DEFAULT: "#F0F5FA",
          50: "#FFFFFF",
          100: "#F0F5FA",
          200: "#E4ECF5",
          300: "#D3E0EE",
          400: "#BCCFE2",
        },
        ink: {
          DEFAULT: "#2F2957",
          50: "#F2F1F8",
          100: "#DDDAEC",
          200: "#B7B0D8",
          300: "#6F61AE",
          400: "#4B449D",
          500: "#3D3780",
          600: "#2F2957",
          700: "#241F44",
          800: "#171430",
          900: "#0A0918",
        },
        sage: {
          DEFAULT: "#2A7B24",
          50: "#EEF6ED",
          100: "#D3E9D1",
          200: "#A7D3A3",
          300: "#7BBC75",
          400: "#4F9F49",
          500: "#2A7B24",
          600: "#22631D",
          700: "#1A4B16",
          800: "#12330F",
          900: "#091A07",
        },
        gold: {
          DEFAULT: "#9E5D91",
          50: "#F8EFF6",
          100: "#EAD3E4",
          200: "#D5A7C9",
          300: "#C07BAE",
          400: "#AC6DA1",
          500: "#9E5D91",
          600: "#7E4B74",
          700: "#5F3857",
          800: "#3F253A",
          900: "#20131D",
        },
        beige: {
          DEFAULT: "#E4ECF5",
          light: "#F0F5FA",
          dark: "#D3E0EE",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(47, 41, 87, 0.08)",
        card: "0 4px 20px rgba(47, 41, 87, 0.10)",
        lifted: "0 12px 32px rgba(47, 41, 87, 0.18)",
      },
      maxWidth: {
        content: "1280px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "heart-pop": "heart-pop 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
