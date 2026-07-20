/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cx-teal':     '#14b8a6',
        'cx-teal-d':   '#0c8c81',
        'cx-teal-l':   '#e2f7f3',
        'cx-teal-b':   '#b9ece1',
        'cx-violet':   '#7c6cf0',
        'cx-violet-l': '#ecebfe',
        'cx-ink':      '#1f2430',
        'cx-ink2':     '#2a2f37',
        'cx-ink3':     '#42474f',
        'cx-ink4':     '#5b6270',
        'cx-muted':    '#8a909b',
        'cx-muted2':   '#9aa0ab',
        'cx-border':   '#ebedf0',
        'cx-border-l': '#f2f3f5',
        'cx-surface':  '#fbfbfc',
        'cx-input':    '#f5f6f8',
        'cx-bg':       '#f3f4f6',
        'cx-star':     '#f6a623',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
