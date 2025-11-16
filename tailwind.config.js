/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#cfe8ff",
          200: "#9fd0ff",
          300: "#6fb9ff",
          400: "#3fa1ff",
          500: "#1788ff",
          600: "#0f6fd6",
          700: "#0a55a3",
          800: "#063a6f",
          900: "#021f3c"
        },
        slate: {
          950: "#0b1220"
        }
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 40px -20px rgba(15, 111, 214, 0.35)"
      }
    }
  },
  plugins: []
};
