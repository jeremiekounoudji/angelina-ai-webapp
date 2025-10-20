// tailwind.config.js
const {heroui} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}" 
  ],
  theme: {
    extend: {
      colors: {
        // Marketing brand colors
        brand: {
          primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80', // Main green accent
            500: '#22c55e', // Primary green
            600: '#16a34a', // Darker green for buttons
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          dark: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db', // Light gray text
            400: '#9ca3af', // Medium gray text
            500: '#6b7280',
            600: '#4b5563', // Border gray
            700: '#374151', // Card borders
            800: '#1f2937', // Dark backgrounds
            900: '#111827', // Darker backgrounds
            950: '#000000', // Pure black background
          }
        },
        // Semantic colors for consistency
        background: {
          primary: '#000000',
          secondary: '#111827',
          card: 'rgba(17, 24, 39, 0.5)', // gray-900/50
          overlay: 'rgba(0, 0, 0, 0.9)', // black/90
        },
        text: {
          primary: '#ffffff',
          secondary: '#d1d5db', // gray-300
          muted: '#9ca3af', // gray-400
          accent: '#4ade80', // green-400
        },
        border: {
          primary: '#374151', // gray-700
          secondary: '#4b5563', // gray-600
          accent: 'rgba(34, 197, 94, 0.5)', // green-500/50
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(to right, #22c55e, #4ade80)',
        'brand-gradient-hover': 'linear-gradient(to right, #4ade80, #86efac)',
      },
      boxShadow: {
        'brand': '0 10px 25px -3px rgba(34, 197, 94, 0.25), 0 4px 6px -2px rgba(34, 197, 94, 0.1)',
        'brand-hover': '0 20px 25px -5px rgba(74, 222, 128, 0.4), 0 10px 10px -5px rgba(74, 222, 128, 0.1)',
      }
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};