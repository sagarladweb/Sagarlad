const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/karandhiver/Developer/Sagarlad/demo/apps/site/src/**/*.tsx');

let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add card-hover to specific stats that don't have borders but should act like cards
  if (file.includes('AboutMe.tsx')) {
    if (content.includes('className="text-center"')) {
      content = content.replace(/className="text-center"/g, 'className="text-center card-hover rounded-xl p-4 transition-all hover:bg-card/40"');
      changed = true;
    }
  }

  if (file.includes('BookHeroMetrics.tsx')) {
    if (content.includes('className="flex flex-col items-center text-center px-2 sm:px-3"')) {
      content = content.replace(/className="flex flex-col items-center text-center px-2 sm:px-3"/g, 'className="flex flex-col items-center text-center px-2 sm:px-3 card-hover rounded-lg transition-all hover:bg-white/5 py-2"');
      changed = true;
    }
  }
  
  if (file.includes('BookStats.tsx')) {
    if (content.includes('className="flex flex-col items-center text-center px-2 sm:px-3"')) {
      content = content.replace(/className="flex flex-col items-center text-center px-2 sm:px-3"/g, 'className="flex flex-col items-center text-center px-2 sm:px-3 card-hover rounded-lg transition-all hover:bg-white/5 py-2"');
      changed = true;
    }
  }

  // General card classes - add card-hover if not present
  // Regex looks for className="... bg-card ..." and adds card-hover
  const regex = /className="([^"]*\bbg-card\b[^"]*)"/g;
  content = content.replace(regex, (match, p1) => {
    if (!p1.includes('card-hover')) {
      changed = true;
      return `className="card-hover ${p1}"`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${updatedFiles} files.`);
