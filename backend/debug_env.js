import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);
