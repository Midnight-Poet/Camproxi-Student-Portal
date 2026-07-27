const fs = require('fs');
let txt = fs.readFileSync('src/pages/Settings/index.jsx', 'utf8');
const imports = `import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context.jsx';
import { useUpdateProfileMutation, useUpdateNotificationsMutation, useLogoutMutation, useGetMeQuery, useGetSchoolByIdQuery } from '../../store/apiSlice';
import { Toggle } from '../../components/Toggle.jsx';
import { Icon } from '../../components/Icon.jsx';

const CAMPUS_OPTIONS = ['Crystal Campus', 'Lagos State University', 'University of Ibadan', 'OAU Campus'];
const CURRENCY_OPTIONS = ['₦ Naira', '$ US Dollar', '€ Euro', '£ Pound'];
const DISTANCE_OPTIONS = ['Kilometres', 'Miles'];
const LANGUAGE_OPTIONS = ['English', 'Yoruba', 'Igbo', 'Hausa'];

`;
fs.writeFileSync('src/pages/Settings/index.jsx', imports + txt);
