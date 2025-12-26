const colors = require('tailwindcss/colors');
// We delete the deprecated colors to avoid warnings
delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

const theme = {
  ...colors,
  // Membership Auto Brand Colors (matching frontend)
  background: '#0d0d0d',
  foreground: '#ffffff',
  surface: '#1a1a1a',
  border: '#2a2a2a',
  gold: {
    DEFAULT: '#cba86e',
    light: '#e0bf7f',
    dark: '#b8955e',
  },
  textSecondary: '#b3b3b3',
  textMuted: '#707070',
  success: '#4caf50',
  error: '#dd4a48',
  // Keep primary as gold for compatibility
  primary: {
    50: '#fdfbf7',
    100: '#f9f5eb',
    200: '#f1e8d1',
    300: '#e8d9b3',
    400: '#e0bf7f',
    500: '#cba86e', // Main gold
    600: '#b8955e',
    700: '#9a7d4f',
    800: '#7d6642',
    900: '#665437',
  },
};

module.exports = theme;
