/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  darkMode: ['class'],
  safelist: [
    'text-red',
    'text-yellow',
    'text-green',
    'text-blue',
    'text-cyan',
    'text-pink',
    'text-teal',
    'text-purple',
    'text-white',
    'text-black',
    'text-emerald',
  ],
  prefix: '',
  theme: {
    fontSize: {
      'sm': '12px',
      'normal': '14px',
      'md': '16px',
      'lg': '18px',
      'xl': '20px',
      '2xl': '24px',
      '4xl': '32px',
    },
    extend: {
      // catppucin colors
      colors: {
        'red': '#ea8594',
        'yellow': '#ead09c',
        'green': '#a4d793',
        'blue': '#89acf3',
        'cyan': '#8cd8cc',
        'pink': '#f1bbe3',
        'teal': '#1f8da3',
        'purple': '#8637ee',
        'white': '#cfdaf7',
        'black': '#24273a',
        'emerald': '#3d952a',
      },
    },
  },
};
