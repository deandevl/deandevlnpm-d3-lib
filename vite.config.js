/**
 * Created by Rick Dean on 2024-02-16.
 */
'use strict';

import { defineConfig } from 'vite'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name:'deandevlnpm-d3-lib',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      //   into the library
      external: ['d3']
		},
	},
})