const fs = require('fs'); 
const path = require('path'); 
const dir = 'src/components/ui'; 
fs.readdirSync(dir).forEach(file => { 
  if (file.endsWith('.jsx')) { 
    const fp = path.join(dir, file); 
    let content = fs.readFileSync(fp, 'utf8'); 
    content = content.replace(/import { Icon } from '.\/Icon'/g, "import { Icon } from '../Icon.jsx'"); 
    fs.writeFileSync(fp, content); 
  } 
});
