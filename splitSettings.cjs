const fs = require('fs');

const txt = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

// Find boundaries
const views = [
  'EditProfileView',
  'NotificationsView',
  'PrivacyView',
  'VerificationView'
];

fs.mkdirSync('src/pages/Settings/components', { recursive: true });

let currentTxt = txt;

// Helper to extract a function
function extractFunction(name) {
  const startStr = `function ${name}(`;
  const startIndex = currentTxt.indexOf(startStr);
  if (startIndex === -1) return null;
  
  // Find the matching closing brace
  let openBraces = 0;
  let endIndex = -1;
  let started = false;
  
  for (let i = startIndex; i < currentTxt.length; i++) {
    if (currentTxt[i] === '{') {
      openBraces++;
      started = true;
    } else if (currentTxt[i] === '}') {
      openBraces--;
      if (started && openBraces === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    const fnCode = currentTxt.substring(startIndex, endIndex);
    currentTxt = currentTxt.substring(0, startIndex) + currentTxt.substring(endIndex);
    return fnCode;
  }
  return null;
}

// Extract Shared UI components first
const uiComponents = [
  'BackButton',
  'RowItem',
  'SectionCard',
  'Divider',
  'InputField',
  'SaveButton'
];

let sharedCode = `import React from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\n\n`;
for (const comp of uiComponents) {
  const code = extractFunction(comp);
  if (code) sharedCode += `export ${code}\n\n`;
}
fs.writeFileSync('src/pages/Settings/components/SharedUI.jsx', sharedCode);

// Extract Views
const viewImports = {
  EditProfileView: `import React, { useState } from 'react';\nimport { AvatarCircle } from '../../../components/ui';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { InputField, SaveButton, SectionCard } from './SharedUI.jsx';\n\n`,
  NotificationsView: `import React, { useState } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, RowItem } from './SharedUI.jsx';\n\n`,
  PrivacyView: `import React, { useState } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, InputField, SaveButton } from './SharedUI.jsx';\nimport { useApp } from '../../../context.jsx';\n\n`,
  VerificationView: `import React from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, RowItem } from './SharedUI.jsx';\n\n`
};

for (const view of views) {
  const code = extractFunction(view);
  if (code) {
    fs.writeFileSync(`src/pages/Settings/components/${view}.jsx`, viewImports[view] + `export ${code}`);
  }
}

// Fix imports in index
const indexHeader = currentTxt.substring(0, currentTxt.indexOf('export function Settings'));
const imports = `
import { BackButton, RowItem, SectionCard, Divider } from './components/SharedUI.jsx';
import { EditProfileView } from './components/EditProfileView.jsx';
import { NotificationsView } from './components/NotificationsView.jsx';
import { PrivacyView } from './components/PrivacyView.jsx';
import { VerificationView } from './components/VerificationView.jsx';
`;
const newIndex = indexHeader + imports + currentTxt.substring(currentTxt.indexOf('export function Settings'));
fs.writeFileSync('src/pages/Settings/index.jsx', newIndex);
fs.unlinkSync('src/pages/Settings.jsx');
