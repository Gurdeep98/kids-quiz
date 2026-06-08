/**
 * Prints the publishing metadata for a spec as JSON, without rendering anything.
 *
 *   npm run preview:meta
 *   npm run preview:meta -- 7
 *   npm run preview:meta -- mixed
 */

import { buildMetadata } from './engine/metadata';
import { specFromArg } from './pipeline/specFromArg';

console.log(JSON.stringify(buildMetadata(specFromArg(process.argv[2])), null, 2));
