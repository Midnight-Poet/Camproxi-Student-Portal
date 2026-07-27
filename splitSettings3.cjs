const fs = require('fs');
const txt = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

const fnNames = [
  { name: 'BackButton', search: 'function BackButton' },
  { name: 'RowItem', search: 'function RowItem' },
  { name: 'SectionCard', search: 'function SectionCard' },
  { name: 'Divider', search: 'function Divider' },
  { name: 'InputField', search: 'function InputField' },
  { name: 'SaveButton', search: 'function SaveButton' },
  { name: 'EditProfileView', search: 'function EditProfileView' },
  { name: 'NotificationsView', search: 'function NotificationsView' },
  { name: 'PrivacyView', search: 'function PrivacyView' },
  { name: 'VerificationView', search: 'function VerificationView' },
  { name: 'Settings', search: 'export function Settings' }
];

let positions = fnNames.map(info => {
  return { name: info.name, index: txt.indexOf(info.search) };
});

const components = {};
for (let i = 0; i < positions.length - 1; i++) {
  components[positions[i].name] = txt.substring(positions[i].index, positions[i+1].index);
}
components['Settings'] = txt.substring(positions[positions.length - 1].index);

fs.mkdirSync('src/pages/Settings/components', { recursive: true });

// UI components
const uiCode = `import React from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\n\n` + 
  `export ${components['BackButton']}\n\n` +
  `export ${components['RowItem']}\n\n` +
  `export ${components['SectionCard']}\n\n` +
  `export ${components['Divider']}\n\n` +
  `export ${components['InputField']}\n\n` +
  `export ${components['SaveButton']}\n\n`;

fs.writeFileSync('src/pages/Settings/components/SharedUI.jsx', uiCode);

const viewImports = {
  EditProfileView: `import React, { useState } from 'react';\nimport { AvatarCircle } from '../../../components/ui';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { InputField, SaveButton, SectionCard } from './SharedUI.jsx';\n\n`,
  NotificationsView: `import React, { useState } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, RowItem, SaveButton } from './SharedUI.jsx';\n\n`,
  PrivacyView: `import React, { useState } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, InputField, SaveButton } from './SharedUI.jsx';\nimport { useApp } from '../../../context.jsx';\n\n`,
  VerificationView: `import React from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, RowItem } from './SharedUI.jsx';\n\n`
};

for (const view of ['EditProfileView', 'NotificationsView', 'PrivacyView', 'VerificationView']) {
  fs.writeFileSync(`src/pages/Settings/components/${view}.jsx`, viewImports[view] + `export ${components[view]}`);
}

const header = txt.substring(0, positions[0].index);
// Ensure we use the proper ../../ paths for everything in index.jsx
let indexHeader = header.replace(/from '\.\.\//g, "from '../../");

const indexCode = indexHeader + `
import { BackButton, RowItem, SectionCard, Divider } from './components/SharedUI.jsx';
import { EditProfileView } from './components/EditProfileView.jsx';
import { NotificationsView } from './components/NotificationsView.jsx';
import { PrivacyView } from './components/PrivacyView.jsx';
import { VerificationView } from './components/VerificationView.jsx';
` + components['Settings'];

fs.writeFileSync('src/pages/Settings/index.jsx', indexCode);
fs.unlinkSync('src/pages/Settings.jsx');
