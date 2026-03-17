/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Buyer theme (orange)
        brand: {
          DEFAULT: '#F85606',
          hover: '#FF6B2B',
          light: '#FFF3EE',
        },
        yellow: { DEFAULT: '#FFC200', light: '#FFFBEE' },
        green: { DEFAULT: '#00853D', light: '#E8F7EF' },
        // Vendor theme (dark)
        dark: {
          bg: '#0F0E0D',
          surface: '#1A1917',
          surface2: '#222120',
          border: '#2E2C2A',
        },
        amber: { DEFAULT: '#F5A623', dim: '#7A4F0C' },
        terra: '#E8623A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        popIn: {
          from: { transform: 'scale(0)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.22s ease both',
        slideUp: 'slideUp 0.26s ease both',
        shimmer: 'shimmer 1.3s infinite',
        spin: 'spin 1s linear infinite',
        popIn: 'popIn 0.5s cubic-bezier(0.17,0.67,0.35,1.3) both',
      },
    },
  },
  plugins: [],
}
