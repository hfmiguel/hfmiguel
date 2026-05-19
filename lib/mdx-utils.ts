import fs from 'node:fs';
import path from 'node:path';

const README_PATH = path.join(process.cwd(), 'README.md');

export async function getReadmeContent() {
  const source = fs.readFileSync(README_PATH, 'utf8');
  
  return source;
}
