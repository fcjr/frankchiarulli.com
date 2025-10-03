/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,public}/**/*.{js,ts,jsx,tsx,md,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        headline: 'var(--headline)',
        paragraph: 'var(--text)',
        button: 'var(--button)',
        'button-text': 'var(--button-text)',
        stroke: 'var(--stroke)',
        main: 'var(--main)',
        highlight: 'var(--highlight)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
      },
    },
  },
  plugins: [],
};
