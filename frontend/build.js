import { build } from 'vite';
import config from './vite.config.js';

build(config).catch((err) => {
  process.exit(1);
});