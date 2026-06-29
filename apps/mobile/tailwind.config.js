/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', '../../packages/ui/src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3525cd',
        'on-primary': '#ffffff',
        background: '#f8f9ff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#464555',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'outline-variant': '#c7c4d8',
        error: '#ba1a1a',
        tertiary: '#7e3000',
        secondary: '#5c5f61',
      },
    },
  },
  plugins: [],
}
