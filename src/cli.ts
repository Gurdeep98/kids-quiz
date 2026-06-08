/**
 * Tiny preview tool: prints a VideoSpec as JSON so you can eyeball what the
 * engine produces.
 *
 *   npm run preview:spec          # the 3 times table
 *   npm run preview:spec -- 7     # the 7 times table
 *   npm run preview:spec -- mixed # a mixed speed quiz
 */

import { specFromArg } from './pipeline/specFromArg';

console.log(JSON.stringify(specFromArg(process.argv[2]), null, 2));
