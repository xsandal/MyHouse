import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          bg: '#E1F5EE',
          text: '#085041',
          cta: '#1D9E75',
        },
        house: {
          bg: '#E6F1FB',
          text: '#0C447C',
          cta: '#378ADD',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
