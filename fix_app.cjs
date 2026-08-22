const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// Fix imports
content = content.replace(/MessageSquare\n  Menu/, 'MessageSquare,\n  Menu');

// Fix the usages (remove the weird Menu insertion)
content = content.replace(/icon: MessageSquare\n  Menu/g, 'icon: MessageSquare');
content = content.replace(/<MessageSquare\n  Menu className="w-5 h-5" \/>/g, '<MessageSquare className="w-5 h-5" />');

fs.writeFileSync('App.tsx', content);
