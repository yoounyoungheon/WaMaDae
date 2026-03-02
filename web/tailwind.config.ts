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
        /* ===== Primary ===== */
        "primary-main": "#A65BEF",
        "primary-action": "#7641AA",
        "primary-disabled": "#D6B4F8",

        /* ===== Secondary ===== */
        "secondary-main": "#F2D58B",

        /* ===== Background ===== */
        "background-default": "#FFFFFF",
        "background-01": "#FCFCFD",
        "background-02": "#FAFAFB",
        "background-03": "#F8F8FA",

        /* ===== Text ===== */
        "text-strong": "#000000",
        "text-01": "#1A1A1A",
        "text-02": "#4E4F53",
        "text-03": "#818389",
        "text-04": "#A5A6AB",
        "text-disabled-01": "#F4F5F7",
        "text-disabled-02": "#CBCCCF",

        /* ===== Error ===== */
        "error-main": "#E54848",
        "error-action": "#A33333",
        "error-cancel": "#EE8484",

        /* ===== Line ===== */
        "line-default": "#8E9096",
        "line-focus": "#3C3C3F",
        "line-disabled": "#CBCCCF",

        /* ===== Scale Colors ===== */
        "main-purple": {
          50: "#f6effd",
          100: "#e3ccfa",
          200: "#d6b4f8",
          300: "#c39ff4",
          400: "#b87cf2",
          500: "#a65bef",
          600: "#9753d9",
          700: "#7641aa",
          800: "#5b3283",
          900: "#462664",
        },
        "main-light-gray": {
          50: "#fefefe",
          100: "#fcfcfd",
          200: "#fafafb",
          300: "#f8f8fa",
          400: "#f6f7f9",
          500: "#f4f5f7",
          600: "#dedfe1",
          700: "#adaeaf",
          800: "#868788",
          900: "#666768",
        },
        "main-gray": {
          50: "#f4f4f5",
          100: "#dcddee",
          200: "#cbcccf",
          300: "#b3b5b9",
          400: "#a5a6ab",
          500: "#8e9096",
          600: "#818389",
          700: "#65666b",
          800: "#4e4f53",
          900: "#3c3c3f",
        },

        "main-red": {
          50: "#ffeded",
          100: "#f7c8c6",
          200: "#f3aab7",
          300: "#ee8484",
          400: "#ea6d6d",
          500: "#e54848",
          600: "#d04242",
          700: "#a33333",
          800: "#7e2828",
          900: "#601e1e",
        },

        "main-yellow": {
          50: "#fffdf3",
          100: "#fbf2db",
          200: "#f9ecaa",
          300: "#f6e3b1",
          400: "#f5dda2",
          500: "#f2d58b",
          600: "#dcc27e",
          700: "#ac9763",
          800: "#85574c",
          900: "#65593a",
        },

        /* ===== System ===== */
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
  plugins: [],
};

export default config;
