import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05070e",
        card: "#0d1322",
        primary: "#6366f1",
        gold: "#f59e0b",
        neonBlue: "#38bdf8",
      },
    },
  },
  plugins: [],
} satisfies Config;
