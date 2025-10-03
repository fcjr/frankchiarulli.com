/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,public}/**/*.{js,ts,jsx,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        background: '#fef6e4',
        headline: '#001858',
        paragraph: '#172c66',
        button: '#f582ae',
        'button-text': '#001858',
        stroke: '#001858',
        main: '#f3d2c1',
        highlight: '#fef6e4',
        secondary: '#8bd3dd',
        tertiary: '#f582ae',
      },
    },
  },
  plugins: [],
};
