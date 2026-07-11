/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E17',
        surface: '#131728',
        surface2: '#1A1F38',
        border: '#242A4A',
        muted: '#8892B0',
        fg: '#EDEFFB',
        accent: '#6C5CE7',
        accent2: '#9C8CFF',
        yes: '#22C97E',
        no: '#F1477A',
        gold: '#F5B942',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(108,92,231,0.25), 0 8px 30px -8px rgba(108,92,231,0.35)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 20% 0%, rgba(108,92,231,0.18), transparent 45%), radial-gradient(circle at 80% 10%, rgba(34,201,126,0.12), transparent 40%)',
      },
    },
  },
  plugins: [],
};
