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
        accent: '#5CE7CB',
        accent2: '#8CECFF',
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
        glow: '0 0 0 1px rgba(92,231,203,0.25), 0 8px 30px -8px rgba(92,231,203,0.35)',
        term: '0 0 0 1px rgba(92,231,203,0.18), 0 20px 50px -20px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 20% 0%, rgba(92,231,203,0.16), transparent 45%), radial-gradient(circle at 80% 10%, rgba(34,201,126,0.12), transparent 40%)',
      },
    },
  },
  plugins: [],
};
