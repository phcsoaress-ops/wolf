import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir: string, cb: (filepath: string) => void) {
  readdirSync(dir).forEach(f => {
    let dirPath = join(dir, f);
    if(statSync(dirPath).isDirectory()) walk(dirPath, cb);
    else cb(dirPath);
  });
}

walk('src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = readFileSync(filepath, 'utf8');
    let newContent = content.replace(/#FF4081/g, '#C679FF'); // Pink to Lilac
    
    // replace blue to orange logic
    newContent = newContent.replace(/blue-600/g, 'orange-500');
    newContent = newContent.replace(/blue-500/g, 'orange-400');
    newContent = newContent.replace(/blue-400/g, 'orange-400');
    newContent = newContent.replace(/blue-300/g, 'orange-300');
    newContent = newContent.replace(/blue-200/g, 'orange-200');
    newContent = newContent.replace(/blue-100/g, 'orange-100');
    newContent = newContent.replace(/blue-800/g, 'orange-800');
    newContent = newContent.replace(/blue-900/g, 'orange-900');
    newContent = newContent.replace(/drop-shadow-\[0_0_20px_blue\]/g, 'drop-shadow-[0_0_20px_orange]');
    newContent = newContent.replace(/drop-\[0_0_30px_rgba\(250,204,21,1\)\]/g, 'drop-shadow-[0_0_30px_rgba(255,123,62,1)]');

    newContent = newContent.replace(/pink-100/g, 'purple-100');
    newContent = newContent.replace(/pink-200/g, 'purple-200');

    if (content !== newContent) {
      writeFileSync(filepath, newContent);
      console.log('Updated', filepath);
    }
  }
});

