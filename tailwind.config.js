/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#131315',
        'surface-dim': '#131315',
        'surface-bright': '#39393b',
        'surface-container-lowest': '#0e0e10',
        'surface-container-low': '#1c1b1d',
        'surface-container': '#201f22',
        'surface-container-high': '#2a2a2c',
        'surface-container-highest': '#353437',
        'on-surface': '#e5e1e4',
        'on-surface-variant': '#c2c6d6',
        'inverse-surface': '#e5e1e4',
        'inverse-on-surface': '#313032',
        'outline': '#8c909f',
        'outline-variant': '#424754',
        'surface-tint': '#adc6ff',
        'primary': '#adc6ff',
        'on-primary': '#002e6a',
        'primary-container': '#4d8eff',
        'on-primary-container': '#00285d',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc6ff',
        'secondary': '#4edea3',
        'on-secondary': '#003824',
        'secondary-container': '#00a572',
        'on-secondary-container': '#00311f',
        'secondary-fixed': '#6ffbbe',
        'secondary-fixed-dim': '#4edea3',
        'tertiary': '#ffb95f',
        'on-tertiary': '#472a00',
        'tertiary-container': '#ca8100',
        'on-tertiary-container': '#3e2400',
        'tertiary-fixed': '#ffddb8',
        'tertiary-fixed-dim': '#ffb95f',
        'error': '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        'background': '#131315',
        'on-background': '#e5e1e4'
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Geist"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      spacing: {
        'gutter': '1rem',
        'gutter-desktop': '1.5rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.375rem',
        'xl': '0.5rem',
        '2xl': '0.75rem',
        'full': '9999px'
      }
    }
  },
  plugins: []
};

