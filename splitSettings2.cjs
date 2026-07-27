const fs = require('fs');
const txt = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

const fnNames = [
  'BackButton',
  'RowItem',
  'SectionCard',
  'Divider',
  'InputField',
  'SaveButton',
  'EditProfileView',
  'NotificationsView',
  'PrivacyView',
  'VerificationView',
  'Settings'
];

let positions = fnNames.map(name => {
  return { name, index: txt.indexOf(`function ${name}`) };
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
  NotificationsView: `import React, { useState } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, RowItem } from './SharedUI.jsx';\n\n`,
  PrivacyView: `import React, { useState } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, InputField, SaveButton } from './SharedUI.jsx';\nimport { useApp } from '../../../context.jsx';\n\n`,
  VerificationView: `import React from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { SectionCard, RowItem } from './SharedUI.jsx';\n\n`
};

for (const view of ['EditProfileView', 'NotificationsView', 'PrivacyView', 'VerificationView']) {
  fs.writeFileSync(`src/pages/Settings/components/${view}.jsx`, viewImports[view] + `export ${components[view]}`);
}

const header = txt.substring(0, positions[0].index);
const indexCode = header + `
import { BackButton, RowItem, SectionCard, Divider } from './components/SharedUI.jsx';
import { EditProfileView } from './components/EditProfileView.jsx';
import { NotificationsView } from './components/NotificationsView.jsx';
import { PrivacyView } from './components/PrivacyView.jsx';
import { VerificationView } from './components/VerificationView.jsx';
` + `export ` + components['Settings'];

fs.writeFileSync('src/pages/Settings/index.jsx', indexCode);
fs.unlinkSync('src/pages/Settings.jsx');
