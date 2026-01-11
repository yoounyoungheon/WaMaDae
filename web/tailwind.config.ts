import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'mysom-primary': "#6F4CA5",
        'mysom-secondary': "#EEE2FF",
        'mysom-purple': "#873FD3",
        'mysom-lightpurple': "#A36BDF",
        'mysom-lightgray': "#EDEDED",
        'mysom-darkgray': "#818181",
        'mysom-background': "#F8F8F8",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "bottom-sheet-in": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "bottom-sheet-out": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "bottom-sheet-in": "bottom-sheet-in 300ms ease-out",
        "bottom-sheet-out": "bottom-sheet-out 200ms ease-in",
      },
    },
  },
  plugins: [
    
  ],
};
export default config;
