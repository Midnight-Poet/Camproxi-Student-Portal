const fs = require('fs');

const txt = fs.readFileSync('src/pages/Onboarding.jsx', 'utf8');

const welcomeStart = txt.indexOf('function StepWelcome');
const pdStart = txt.indexOf('function StepPersonalDetails');
const campusStart = txt.indexOf('function StepCampus');
const onboardingStart = txt.indexOf('export function Onboarding');

const welcomeCode = "import React from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\n\n" + txt.substring(welcomeStart, pdStart).replace(/\/\/ ═+[\s\S]*?$/m, '');
const pdCode = "import React, { useState, useEffect, useCallback, useRef } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { Field, Input, PasswordInput } from '../../../components/ui';\nimport { useLazyCheckUsernameQuery, useLazyCheckEmailQuery } from '../../../store/apiSlice';\n\n" + txt.substring(pdStart, campusStart).replace(/\/\/ ═+[\s\S]*?$/m, '');
const campusCode = "import React, { useState, useEffect } from 'react';\nimport { Icon } from '../../../components/Icon.jsx';\nimport { Field } from '../../../components/ui';\nimport { useGetSchoolsQuery } from '../../../store/apiSlice';\nimport { calcDistance } from '../../../utils/geo';\n\n" + txt.substring(campusStart, onboardingStart).replace(/\/\/ ═+[\s\S]*?$/m, '');

fs.mkdirSync('src/pages/Onboarding/components', { recursive: true });
fs.writeFileSync('src/pages/Onboarding/components/StepWelcome.jsx', welcomeCode);
fs.writeFileSync('src/pages/Onboarding/components/StepPersonalDetails.jsx', pdCode);
fs.writeFileSync('src/pages/Onboarding/components/StepCampus.jsx', campusCode);

const indexHeader = txt.substring(0, welcomeStart).replace(/function Field[\s\S]*?function BrandPanel.*?}[\r\n]+/g, '');
const imports = `
import { StepWelcome } from './components/StepWelcome.jsx';
import { StepPersonalDetails } from './components/StepPersonalDetails.jsx';
import { StepCampus } from './components/StepCampus.jsx';
import { ProgressBar, BrandPanel } from '../../components/ui';
`;
const indexCode = indexHeader + imports + txt.substring(onboardingStart);
fs.writeFileSync('src/pages/Onboarding/index.jsx', indexCode);
fs.unlinkSync('src/pages/Onboarding.jsx');
