/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#0f0f0f",
        lightdark: "#2a3236",
      },
      fontFamily: {
        roboto: ['"Roboto"', "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
