import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)),'..');

export default dirname;