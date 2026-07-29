import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          active: "rgb(var(--primary-active) / <alpha-value>)",
          neutral: "rgb(var(--primary-neutral) / <alpha-value>)",
          pale: "rgb(var(--primary-pale) / <alpha-value>)",
          50:  "#FFF5F8",
          100: "#FFE4EC",
          200: "#FFC9DA",
          300: "#FFA8C4",
          400: "#FF8AAF",
          500: "#FF6D9E",
          600: "#E85A8A",
        },
        secondary: {
          50:  "#FFFBF5",
          100: "#FFF3E2",
          300: "#FFE0B8",
        },
        accent: {
          bow: "#FF4D8D",
          gold: "#F5C56B",
          orange: "#FF8AAF",
          cyan: "#A8D8FF",
        },
        neutral: {
          white: "#FFFFFF",
          bg: "#FFF9FB",
          100: "#F7EEF2",
          300: "#E5D3DB",
          500: "#A98C97",
          700: "#6B4F58",
          900: "#3D2A30",
        },
        canvas: {
          DEFAULT: "rgb(var(--canvas) / <alpha-value>)",
          soft: "#FFF9FB",
        },
        ink: {
          DEFAULT: "#3D2A30",
          deep: "#23161B",
        },
        body: "#6B4F58",
        mute: "#A98C97",
        positive: {
          DEFAULT: "#7ED9A8",
          deep: "#4CAF80",
        },
        warning: {
          DEFAULT: "#FFCB77",
          deep: "#E5A84B",
          content: "#5A4418",
        },
        negative: {
          DEFAULT: "#FF8FA3",
          deep: "#E56B82",
          darkest: "#B83A52",
          bg: "#FFF0F3",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "28px",
        "3xl": "32px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "Quicksand", "system-ui", "sans-serif"],
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
    },
  },
  plugins: [],
};

export default config;

