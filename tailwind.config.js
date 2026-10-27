/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        sub: 'var(--ink-soft)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        display: [
          '"Playfair Display"',
          '"Noto Serif SC"',
          'Didot',
          '"Bodoni MT"',
          '"Songti SC"',
          'STSong',
          'SimSun',
          'serif',
        ],
      },
      keyframes: {
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        floatSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.15 },
        },
      },
      animation: {
        spinSlow: 'spinSlow 120s linear infinite',
        floatSoft: 'floatSoft 7s ease-in-out infinite',
        glowPulse: 'glowPulse 5s ease-in-out infinite',
        blink: 'blink 1.6s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
