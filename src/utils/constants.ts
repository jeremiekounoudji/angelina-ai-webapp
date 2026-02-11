// Design system constants
export const COLORS = {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#328E6E',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const SPACING = {
  section: 'py-16 md:py-24',
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
} as const;

export const TYPOGRAPHY = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
  h3: 'text-2xl md:text-3xl font-bold',
  h4: 'text-xl md:text-2xl font-semibold',
  body: 'text-base md:text-lg',
  small: 'text-sm md:text-base',
} as const;

export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-green-400 to-blue-500',
  text: 'bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent',
  card: 'bg-gradient-to-br from-gray-900 to-gray-800',
} as const;

// Animation durations
export const DURATIONS = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.6,
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
} as const;