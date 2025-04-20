import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

const config: Omit<Config, 'content'> = {
  theme: {
    extend: {
      colors: {
        primary: '#1B416F',
      },
    },
  },
  plugins: [forms({ strategy: 'class' }), containerQueries],
};
export default config;
