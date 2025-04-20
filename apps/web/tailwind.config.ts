import type { Config } from 'tailwindcss';

import sharedConfig from '@oliBootstrap/tailwind-config';

const config: Pick<Config, 'content' | 'presets'> = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig],
};

// eslint-disable-next-line import/no-default-export
export default config;
