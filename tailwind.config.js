/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "pink": {
          "DEFAULT": "#ff66aa",
          "300": "#ffddee",
          "400": "#ff99cc",
          "500": "#ff66aa",
          "600": "#ee3399",
          "700": "#bb1177",
        }
      }
    },
  },
  plugins: [],
}

