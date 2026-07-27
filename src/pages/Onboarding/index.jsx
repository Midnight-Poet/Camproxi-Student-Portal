import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useRegisterMutation,
	useLazyCheckEmailQuery,
	useLazyCheckUsernameQuery,
	useGetSchoolsQuery,
} from '../../store/apiSlice';
import { Icon } from '../../components/Icon.jsx';

// Imported calcDistance from utils/geo.js
import { calcDistance } from '../../utils/geo';



import { StepWelcome } from './components/StepWelcome.jsx';
import { StepPersonalDetails } from './components/StepPersonalDetails.jsx';
import { StepCampus } from './components/StepCampus.jsx';
import { BrandPanel } from '../../components/ui/BrandPanel.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
export function Onboarding() {
	const navigate = useNavigate();
	const [register, { isLoading, error }] = useRegisterMutation();
	const [step, setStep] = useState(0);

	const [formData, setFormData] = useState({
		// Required by API
		firstName: '',
		lastName: '',
		username: '',
		email: '',
		password: '',
		confirmPassword: '', // UI only — not sent to API
		school: '',
		schoolId: '',
		campusName: '',
		// Optional by API
		phone: '',
		latitude: null,
		longitude: null,
		location: null,
	});

	function updateForm(key, value) {
		setFormData((prev) => ({ ...prev, [key]: value }));
	}

	async function handleSubmit() {
		try {
			// Build payload — only send what the API expects
			const payload = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				username: formData.username,
				email: formData.email,
				password: formData.password,
				school: formData.school,
				schoolId: formData.schoolId,
				campusName: formData.campusName,
			};

			// phone: API expects a number
			if (formData.phone) {
				const digits = parseInt(formData.phone.replace(/\D/g, ''), 10);
				if (!isNaN(digits)) payload.phone = digits;
			}

			// Location fields — all optional
			if (formData.latitude && formData.longitude) {
				payload.latitude = formData.latitude;
				payload.longitude = formData.longitude;
				payload.location = formData.location;
			}

			await register(payload).unwrap();
			navigate('/home');
		} catch (err) {
			console.error('Registration failed:', err);
		}
	}

	const brandCopy = {
		0: {
			headline: 'Everything around campus, in one place.',
			sub: 'Discover lodges, order food, shop for groceries, and book services — all within minutes of your campus.',
		},
		1: {
			headline: 'Join thousands of students already on Camproxi.',
			sub: 'Create your account in under a minute and start exploring everything your campus has to offer.',
		},
		2: {
			headline: 'Your campus, your marketplace.',
			sub: 'We use your location to connect you with listings, vendors and services at your specific school.',
		},
	};

	const { headline, sub } = brandCopy[step] || brandCopy[0];

	return (
		<div className='min-h-screen bg-white flex'>
			{/* Left brand panel */}
			<BrandPanel headline={headline} sub={sub} />

			{/* Right form panel */}
			<div className='flex-1 flex flex-col min-h-screen md:min-h-0'>
				{/* Progress bar — only on steps 1 & 2 */}
				{step > 0 && (
					<div className='px-6 pt-6 pb-2'>
						<ProgressBar step={step} total={2} />
						<p className='text-[11px] text-cx-muted mt-1.5 text-right'>
							Step {step} of 2
						</p>
					</div>
				)}

				<div className='flex-1 flex flex-col justify-center px-6 py-8 max-w-[420px] w-full mx-auto'>
					{step === 0 && (
						<StepWelcome
							onNext={() => setStep(1)}
							onLogin={() => navigate('/login')}
						/>
					)}
					{step === 1 && (
						<StepPersonalDetails
							data={formData}
							onChange={updateForm}
							onNext={() => setStep(2)}
							onBack={() => setStep(0)}
						/>
					)}
					{step === 2 && (
						<StepCampus
							data={formData}
							onChange={updateForm}
							onSubmit={handleSubmit}
							onBack={() => setStep(1)}
							isLoading={isLoading}
							error={error}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
