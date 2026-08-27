const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/karandhiver/Developer/Sagarlad/demo/apps/site/src/**/*.tsx');

let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We are looking for things that look like buttons: 
  // 1. bg-accent, bg-brand, bg-primary, bg-black, bg-white
  // 2. rounded-full, rounded-md, rounded-lg
  // 3. px- and py- or h-10 w-10 (icon buttons)
  // We want to add `btn-premium` and strip conflicting tailwind hover/transform classes.

  const regex = /className="([^"]*(?:bg-accent|bg-brand|bg-primary|bg-[#ffd51d]|bg-black|bg-white)[^"]*(?:px-[0-9]+|h-[0-9]+\s*w-[0-9]+)[^"]*)"/g;

  content = content.replace(regex, (match, p1) => {
    // Skip if already btn-premium
    if (p1.includes('btn-premium')) return match;
    
    // We only want interactive elements, so we'll just check if it's got hover/transition things, or just apply it anyway.
    // Strip conflicting hover/transform classes
    let newClasses = p1
      .replace(/hover:-?translate-y-[^ ]+/g, '')
      .replace(/hover:-?translate-x-[^ ]+/g, '')
      .replace(/hover:scale-[^ ]+/g, '')
      .replace(/hover:shadow-[^ ]+/g, '')
      .replace(/transition-[^ ]+/g, '')
      .replace(/duration-[^ ]+/g, '')
      .replace(/ease-[^ ]+/g, '')
      .replace(/active:scale-[^ ]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    changed = true;
    return `className="btn-premium ${newClasses}"`;
  });

  // Also catch generic `<button` classNames
  const btnRegex = /<button[^>]*className="([^"]*)"/g;
  content = content.replace(btnRegex, (match, p1) => {
    if (p1.includes('btn-premium')) return match;
    
    let newClasses = p1
      .replace(/hover:-?translate-y-[^ ]+/g, '')
      .replace(/hover:scale-[^ ]+/g, '')
      .replace(/hover:shadow-[^ ]+/g, '')
      .replace(/transition-[^ ]+/g, '')
      .replace(/duration-[^ ]+/g, '')
      .replace(/ease-[^ ]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    changed = true;
    return match.replace(p1, `btn-premium ${newClasses}`);
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${updatedFiles} files.`);
