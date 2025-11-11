/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f7cff",
          dark: "#3c63d1",
        },
      },
      boxShadow: {
        card: "0 6px 20px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        lg: "12px",
      },
      fontFamily: {
        sans: ["Exo 2", "sans-serif"], // default body font
        heading: ["Space Grotesk", "sans-serif"], // special font for titles
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
