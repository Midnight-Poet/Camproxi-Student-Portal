import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useRegisterMutation,
	useLazyCheckEmailQuery,
	useLazyCheckUsernameQuery,
} from '../store/apiSlice';
import { Icon } from '../components/Icon.jsx';

// ── Haversine distance in km ──────────────────────────────────────────────────
function calcDistance(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Shared input component ────────────────────────────────────────────────────
function Field({ label, error, children }) {
	return (
		<div>
			<label className='text-xs font-bold text-cx-ink3 mb-1.5 block'>
				{label}
			</label>
			{children}
			{error && (
				<p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
					<Icon name='error' size={12} style={{ color: '#ef4444' }} />
					{error}
				</p>
			)}
		</div>
	);
}

function Input({
	type = 'text',
	value,
	onChange,
	placeholder,
	autoComplete,
	right,
}) {
	return (
		<div className='relative'>
			<input
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className='w-full rounded-xl border border-cx-border bg-cx-input px-4 py-3 text-sm text-cx-ink placeholder-cx-muted outline-none focus:border-cx-teal transition-colors'
				style={{ fontFamily: 'inherit', paddingRight: right ? 44 : 16 }}
			/>
			{right && (
				<div className='absolute right-3 top-1/2 -translate-y-1/2'>
					{right}
				</div>
			)}
		</div>
	);
}

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
	const [show, setShow] = useState(false);
	return (
		<Input
			type={show ? 'text' : 'password'}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			autoComplete={autoComplete}
			right={
				<button
					type='button'
					onClick={() => setShow((s) => !s)}
					className='border-none bg-transparent cursor-pointer p-0 flex items-center'
				>
					<Icon
						name={show ? 'visibility_off' : 'visibility'}
						size={18}
						style={{ color: '#9aa0ab' }}
					/>
				</button>
			}
		/>
	);
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step, total = 2 }) {
	return (
		<div className='flex items-center gap-1.5'>
			{Array.from({ length: total }).map((_, i) => (
				<div
					key={i}
					className='h-1.5 rounded-full transition-all duration-300 flex-1'
					style={{ background: i < step ? '#14b8a6' : '#e5e8ed' }}
				/>
			))}
		</div>
	);
}

// ── Left brand panel (shared) ─────────────────────────────────────────────────
function BrandPanel({ headline, sub }) {
	return (
		<div
			className='hidden md:flex flex-col justify-between p-12'
			style={{
				width: '46%',
				background:
					'linear-gradient(160deg, #0c8c81 0%, #14b8a6 50%, #1aa5c8 100%)',
				minHeight: '100vh',
			}}
		>
			<div>
				<div className='flex items-center gap-3 mb-12'>
					<div className='w-10 h-10 rounded-xl bg-white flex items-center justify-center font-extrabold text-[#14b8a6] text-lg'>
						C
					</div>
					<span className='text-white font-extrabold text-xl'>
						Camproxi
					</span>
				</div>
				<h2 className='text-white text-3xl font-extrabold leading-tight mb-4'>
					{headline}
				</h2>
				<p className='text-white/80 text-base mb-8'>{sub}</p>
				<div className='flex flex-wrap gap-2'>
					{['Lodges', 'Food & Drinks', 'Groceries', 'Services'].map(
						(chip) => (
							<span
								key={chip}
								className='bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full'
							>
								{chip}
							</span>
						),
					)}
				</div>
			</div>
			<p className='text-white/60 text-xs'>
				Built for students, by students.
			</p>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 0 — Welcome
// ═══════════════════════════════════════════════════════════════════════════════
function StepWelcome({ onNext, onLogin }) {
	return (
		<div className='flex flex-col items-center text-center'>
			{/* Logo mark */}
			<div
				className='w-20 h-20 rounded-[22px] flex items-center justify-center text-4xl font-extrabold text-white mb-8 shadow-lg'
				style={{
					background: 'linear-gradient(135deg, #14b8a6, #0c8c81)',
				}}
			>
				C
			</div>

			{/* Illustration placeholder — styled as a campus grid */}
			<div
				className='w-full rounded-2xl mb-8 overflow-hidden relative'
				style={{ height: 190 }}
			>
				<div
					className='absolute inset-0'
					style={{
						background:
							'linear-gradient(135deg, #e2f7f3 0%, #eef0fb 100%)',
					}}
				/>
				{/* Grid of icon tiles */}
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='grid grid-cols-4 gap-3 p-4'>
						{[
							{
								icon: 'home_work',
								bg: '#e2f7f3',
								color: '#14b8a6',
							},
							{
								icon: 'restaurant',
								bg: '#fff3e0',
								color: '#f97316',
							},
							{
								icon: 'local_grocery_store',
								bg: '#e8f5e9',
								color: '#22c55e',
							},
							{
								icon: 'handyman',
								bg: '#ede9fe',
								color: '#8b5cf6',
							},
							{
								icon: 'directions_bus',
								bg: '#dbeafe',
								color: '#3b82f6',
							},
							{
								icon: 'local_pharmacy',
								bg: '#fce7f3',
								color: '#ec4899',
							},
							{ icon: 'book', bg: '#fef9c3', color: '#ca8a04' },
							{
								icon: 'local_laundry_service',
								bg: '#f1f5f9',
								color: '#64748b',
							},
						].map((t, i) => (
							<div
								key={i}
								className='w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm'
								style={{ background: t.bg }}
							>
								<Icon
									name={t.icon}
									size={22}
									fill={1}
									style={{ color: t.color }}
								/>
							</div>
						))}
					</div>
				</div>
			</div>

			<h1 className='text-2xl font-extrabold text-cx-ink mb-2'>
				Everything near campus,
				<br />
				in one app
			</h1>
			<p className='text-cx-muted text-sm mb-8 leading-relaxed'>
				Find lodges, food, groceries and services around your campus —
				all in one place.
			</p>

			<button
				onClick={onNext}
				className='w-full py-3.5 rounded-2xl text-white font-bold text-base border-none cursor-pointer mb-3 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98]'
				style={{
					background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
				}}
			>
				Get started
			</button>
			<button
				onClick={onLogin}
				className='w-full py-3.5 rounded-2xl font-bold text-base border border-cx-border bg-white text-cx-ink cursor-pointer hover:bg-cx-bg transition-colors'
			>
				I already have an account
			</button>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Personal details
// API fields: firstName*, lastName*, username*, email*, password*, phone (optional)
// ═══════════════════════════════════════════════════════════════════════════════
function StepPersonalDetails({ data, onChange, onNext, onBack }) {
	const [touched, setTouched] = useState({});

	// ── Availability check state ──────────────────────────────────────────────
	const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
	const [emailStatus, setEmailStatus] = useState(null);
	const usernameTimer = useRef(null);
	const emailTimer = useRef(null);

	const [triggerCheckUsername] = useLazyCheckUsernameQuery();
	const [triggerCheckEmail] = useLazyCheckEmailQuery();

	// Debounced username check — fires 600ms after the user stops typing
	const checkUsername = useCallback(
		(val) => {
			clearTimeout(usernameTimer.current);
			if (!val || val.length < 3) {
				setUsernameStatus(null);
				return;
			}
			setUsernameStatus('checking');
			usernameTimer.current = setTimeout(async () => {
				try {
					const res = await triggerCheckUsername(val).unwrap();
					// API returns truthy/object when taken, falsy/null when free
					// We treat any successful response as "taken" and an error/empty as "available"
					setUsernameStatus(
						res?.taken || res?.exists || res?.user || res
							? 'taken'
							: 'available',
					);
				} catch {
					// 404 or similar = not found = available
					setUsernameStatus('available');
				}
			}, 600);
		},
		[triggerCheckUsername],
	);

	// Debounced email check
	const checkEmail = useCallback(
		(val) => {
			clearTimeout(emailTimer.current);
			if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
				setEmailStatus(null);
				return;
			}
			setEmailStatus('checking');
			emailTimer.current = setTimeout(async () => {
				try {
					const res = await triggerCheckEmail(val).unwrap();
					setEmailStatus(
						res?.taken || res?.exists || res?.user || res
							? 'taken'
							: 'available',
					);
				} catch {
					setEmailStatus('available');
				}
			}, 600);
		},
		[triggerCheckEmail],
	);

	// Cleanup timers on unmount
	useEffect(
		() => () => {
			clearTimeout(usernameTimer.current);
			clearTimeout(emailTimer.current);
		},
		[],
	);

	// ── Validation ─────────────────────────────────────────────────────────────
	const errors = {
		firstName: !data.firstName ? 'First name is required' : '',
		lastName: !data.lastName ? 'Last name is required' : '',
		username: !data.username
			? 'Username is required'
			: !/^[a-zA-Z0-9_]{3,}$/.test(data.username)
				? 'Min 3 chars — letters, numbers and underscores only'
				: usernameStatus === 'taken'
					? 'This username is already taken'
					: '',
		email: !data.email
			? 'Email is required'
			: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
				? 'Enter a valid email address'
				: emailStatus === 'taken'
					? 'An account with this email already exists'
					: '',
		password: !data.password
			? 'Password is required'
			: data.password.length < 8
				? 'Password must be at least 8 characters'
				: !/[A-Z]/.test(data.password)
					? 'Password must contain at least one uppercase letter'
					: !/[0-9]/.test(data.password)
						? 'Password must contain at least one number'
						: '',
		confirmPassword: !data.confirmPassword
			? 'Please confirm your password'
			: data.confirmPassword !== data.password
				? 'Passwords do not match'
				: '',
	};

	const isCheckingAvailability =
		usernameStatus === 'checking' || emailStatus === 'checking';
	const isValid =
		Object.values(errors).every((e) => !e) && !isCheckingAvailability;

	function handleNext() {
		setTouched({
			firstName: true,
			lastName: true,
			username: true,
			email: true,
			password: true,
			confirmPassword: true,
		});
		if (isValid) onNext();
	}

	// ── Availability badge ─────────────────────────────────────────────────────
	function AvailabilityBadge({ status }) {
		if (!status) return null;
		if (status === 'checking')
			return (
				<span className='w-4 h-4 border-2 border-cx-teal/40 border-t-cx-teal rounded-full animate-spin' />
			);
		if (status === 'available')
			return (
				<span className='flex items-center gap-1 text-[11px] font-bold text-emerald-600'>
					<Icon
						name='check_circle'
						size={14}
						fill={1}
						style={{ color: '#059669' }}
					/>
					Available
				</span>
			);
		if (status === 'taken')
			return (
				<span className='flex items-center gap-1 text-[11px] font-bold text-red-500'>
					<Icon
						name='cancel'
						size={14}
						fill={1}
						style={{ color: '#ef4444' }}
					/>
					Already taken
				</span>
			);
		return null;
	}

	return (
		<div className='flex flex-col'>
			<button
				onClick={onBack}
				className='w-9 h-9 rounded-full flex items-center justify-center bg-cx-bg border-none cursor-pointer mb-5 hover:opacity-80'
			>
				<Icon
					name='arrow_back'
					size={20}
					style={{ color: '#42474f' }}
				/>
			</button>

			<h2 className='text-xl font-extrabold text-cx-ink mb-1'>
				Create your account
			</h2>
			<p className='text-cx-muted text-sm mb-6'>
				Let's get your details set up.
			</p>

			<div className='space-y-4 mb-6'>
				{/* Name row */}
				<div className='flex gap-3'>
					<div className='flex-1'>
						<Field
							label='First name'
							error={touched.firstName && errors.firstName}
						>
							<Input
								value={data.firstName}
								onChange={(e) => {
									onChange('firstName', e.target.value);
									setTouched((t) => ({
										...t,
										firstName: true,
									}));
								}}
								placeholder='John'
								autoComplete='given-name'
							/>
						</Field>
					</div>
					<div className='flex-1'>
						<Field
							label='Last name'
							error={touched.lastName && errors.lastName}
						>
							<Input
								value={data.lastName}
								onChange={(e) => {
									onChange('lastName', e.target.value);
									setTouched((t) => ({
										...t,
										lastName: true,
									}));
								}}
								placeholder='Doe'
								autoComplete='family-name'
							/>
						</Field>
					</div>
				</div>

				{/* Username — with availability check */}
				<div>
					<div className='flex items-center justify-between mb-1.5'>
						<label className='text-xs font-bold text-cx-ink3'>
							Username
						</label>
						<AvailabilityBadge status={usernameStatus} />
					</div>
					<Input
						value={data.username}
						onChange={(e) => {
							onChange('username', e.target.value);
							setTouched((t) => ({ ...t, username: true }));
							checkUsername(e.target.value);
						}}
						placeholder='johndoe123'
						autoComplete='username'
					/>
					{touched.username && errors.username && (
						<p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
							<Icon
								name='error'
								size={12}
								style={{ color: '#ef4444' }}
							/>
							{errors.username}
						</p>
					)}
				</div>

				{/* Email — with availability check */}
				<div>
					<div className='flex items-center justify-between mb-1.5'>
						<label className='text-xs font-bold text-cx-ink3'>
							School email address
						</label>
						<AvailabilityBadge status={emailStatus} />
					</div>
					<Input
						type='email'
						value={data.email}
						onChange={(e) => {
							onChange('email', e.target.value);
							setTouched((t) => ({ ...t, email: true }));
							checkEmail(e.target.value);
						}}
						placeholder='you@university.edu.ng'
						autoComplete='email'
					/>
					{touched.email && errors.email && (
						<p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
							<Icon
								name='error'
								size={12}
								style={{ color: '#ef4444' }}
							/>
							{errors.email}
						</p>
					)}
				</div>

				{/* Phone (optional) */}
				{/* <Field label='Phone number (optional)'>
					<Input
						type='tel'
						value={data.phone}
						onChange={(e) => onChange('phone', e.target.value)}
						placeholder='+234 800 000 0000'
						autoComplete='tel'
					/>
				</Field> */}

				{/* Password */}
				<div>
					<label className='text-xs font-bold text-cx-ink3 mb-1.5 block'>
						Password
					</label>
					<PasswordInput
						value={data.password}
						onChange={(e) => {
							onChange('password', e.target.value);
							setTouched((t) => ({ ...t, password: true }));
						}}
						placeholder='Min. 8 chars, 1 uppercase, 1 number'
						autoComplete='new-password'
					/>
					{touched.password && errors.password && (
						<p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
							<Icon
								name='error'
								size={12}
								style={{ color: '#ef4444' }}
							/>
							{errors.password}
						</p>
					)}
					{/* Password strength hints */}
					{data.password && (
						<div className='flex gap-3 mt-2'>
							{[
								{
									label: '8+ chars',
									pass: data.password.length >= 8,
								},
								{
									label: 'Uppercase',
									pass: /[A-Z]/.test(data.password),
								},
								{
									label: 'Number',
									pass: /[0-9]/.test(data.password),
								},
							].map((rule) => (
								<span
									key={rule.label}
									className='flex items-center gap-1 text-[10px] font-bold'
									style={{
										color: rule.pass
											? '#059669'
											: '#9aa0ab',
									}}
								>
									<Icon
										name={
											rule.pass
												? 'check_circle'
												: 'radio_button_unchecked'
										}
										size={11}
										fill={rule.pass ? 1 : 0}
										style={{ color: 'inherit' }}
									/>
									{rule.label}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Confirm password */}
				<Field
					label='Confirm password'
					error={touched.confirmPassword && errors.confirmPassword}
				>
					<PasswordInput
						value={data.confirmPassword}
						onChange={(e) => {
							onChange('confirmPassword', e.target.value);
							setTouched((t) => ({ ...t, confirmPassword: true }));
						}}
						placeholder='Re-enter your password'
						autoComplete='new-password'
					/>
				</Field>
			</div>

			<button
				onClick={handleNext}
				disabled={isCheckingAvailability}
				className='w-full py-3.5 rounded-2xl text-white font-bold text-base border-none cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0'
				style={{
					background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
				}}
			>
				{isCheckingAvailability ? (
					<span className='flex items-center justify-center gap-2'>
						<span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
						Checking…
					</span>
				) : (
					'Continue'
				)}
			</button>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Campus selection
// API fields: school*, schoolId*, latitude (opt), longitude (opt), location (opt)
// ═══════════════════════════════════════════════════════════════════════════════
function StepCampus({ data, onChange, onSubmit, onBack, isLoading, error }) {
	const [detecting, setDetecting] = useState(false);
	const [geoError, setGeoError] = useState(null);
	const [showManual, setShowManual] = useState(false);
	const [schools, setSchools] = useState([]);
	const [loadingSchools, setLoadingSchools] = useState(true);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	// Fetch schools list silently (no permission needed)
	useEffect(() => {
		async function fetchSchools() {
			try {
				const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/school`);
				const json = await res.json();
				const rawSchools = Array.isArray(json) ? json : json.data || [];
				
				const flatCampuses = [];
				for (const s of rawSchools) {
					if (Array.isArray(s.campus)) {
						for (const c of s.campus) {
							flatCampuses.push({
								id: `${s.id}-${c.name}`,
								schoolId: s.id,
								displayName: `${s.code} ${c.name}`,
								location: c.location
							});
						}
					}
				}
				setSchools(flatCampuses);
			} catch (err) {
				console.error('Failed to fetch schools:', err);
			} finally {
				setLoadingSchools(false);
			}
		}
		fetchSchools();
	}, []);

	function handleDetectLocation() {
		if (!navigator.geolocation) {
			setGeoError('Location is not supported by your browser.');
			setShowManual(true);
			return;
		}
		setDetecting(true);
		setGeoError(null);

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const lat = pos.coords.latitude;
				const lng = pos.coords.longitude;
				onChange('latitude', lat);
				onChange('longitude', lng);
				onChange('location', { latitude: lat, longitude: lng });

				let closest = null;
				let minDist = 20; // km
				for (const s of schools) {
					if (!s.location?.latitude || !s.location?.longitude)
						continue;
					const d = calcDistance(
						lat,
						lng,
						s.location.latitude,
						s.location.longitude,
					);
					if (d < minDist) {
						minDist = d;
						closest = s;
					}
				}

				if (closest) {
					onChange('school', closest.displayName);
					onChange('schoolId', closest.schoolId);
				} else {
					setGeoError(
						'No campus found near your location. Please select manually.',
					);
					setShowManual(true);
				}
				setDetecting(false);
			},
			(err) => {
				setGeoError(
					err.code === 1
						? 'Location access was denied. Please select your campus manually.'
						: 'Could not detect your location. Please select manually.',
				);
				setShowManual(true);
				setDetecting(false);
			},
			{ timeout: 10000 },
		);
	}

	function handleSchoolSelect(e) {
		const s = schools.find((x) => x.displayName === e.target.value);
		if (s) {
			onChange('school', s.displayName);
			onChange('schoolId', s.schoolId);
		}
	}

	const isFormValid = data.schoolId && data.school;
	const schoolDetected = !detecting && data.schoolId && !showManual;

	return (
		<div className='flex flex-col'>
			<button
				onClick={onBack}
				className='w-9 h-9 rounded-full flex items-center justify-center bg-cx-bg border-none cursor-pointer mb-5 hover:opacity-80'
			>
				<Icon
					name='arrow_back'
					size={20}
					style={{ color: '#42474f' }}
				/>
			</button>

			<h2 className='text-xl font-extrabold text-cx-ink mb-1'>
				Find your campus
			</h2>
			<p className='text-cx-muted text-sm mb-6'>
				We'll match you with the nearest campus using your location.
			</p>

			{/* Detect button — hidden once a school is confirmed */}
			{!schoolDetected && (
				<button
					onClick={handleDetectLocation}
					disabled={detecting || loadingSchools}
					className='w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm border-none cursor-pointer mb-3 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0'
					style={{
						background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
						color: 'white',
					}}
				>
					{detecting ? (
						<>
							<span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
							Detecting location…
						</>
					) : (
						<>
							<Icon
								name='my_location'
								size={18}
								fill={1}
								style={{ color: 'white' }}
							/>
							Use my location
						</>
					)}
				</button>
			)}

			{/* Geo error */}
			{geoError && (
				<p className='text-xs text-amber-600 font-medium mb-3 flex items-center gap-1.5'>
					<Icon name='info' size={14} style={{ color: '#d97706' }} />
					{geoError}
				</p>
			)}

			{/* Confirmed school card */}
			{schoolDetected && (
				<div
					className='rounded-2xl p-4 flex items-center gap-3 mb-4 border'
					style={{ background: '#e2f7f3', borderColor: '#a7e8df' }}
				>
					<div
						className='w-10 h-10 rounded-xl flex items-center justify-center flex-none'
						style={{ background: '#14b8a6' }}
					>
						<Icon
							name='school'
							size={20}
							fill={1}
							style={{ color: 'white' }}
						/>
					</div>
					<div className='flex-1 min-w-0'>
						<p className='font-bold text-cx-ink text-sm truncate'>
							{data.school}
						</p>
						<p className='text-xs text-cx-muted'>
							Detected from your location
						</p>
					</div>
					<Icon
						name='check_circle'
						size={22}
						fill={1}
						style={{ color: '#14b8a6' }}
					/>
				</div>
			)}

			{/* Manual dropdown */}
			{(showManual || schoolDetected) && (
				<div className='mb-5'>
					<label className='text-xs font-bold text-cx-ink3 mb-1.5 block'>
						{schoolDetected
							? 'Not your campus? Change it'
							: 'Select your campus'}
					</label>
					<div className='relative'>
						{/* Custom Select Trigger */}
						<div
							onClick={() => !loadingSchools && setDropdownOpen(!dropdownOpen)}
							className={`w-full rounded-xl border bg-cx-input px-4 py-3.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${dropdownOpen ? 'border-cx-teal ring-2 ring-cx-teal/10' : 'border-cx-border hover:border-cx-teal/50'} ${loadingSchools ? 'opacity-60 cursor-not-allowed' : ''}`}
						>
							<span className={data.school ? 'text-cx-ink font-semibold' : 'text-cx-muted'}>
								{loadingSchools ? 'Loading campuses…' : data.school || 'Select a campus…'}
							</span>
							<Icon
								name={dropdownOpen ? 'expand_less' : 'expand_more'}
								size={20}
								style={{ color: dropdownOpen ? '#14b8a6' : '#5b6270' }}
							/>
						</div>

						{/* Custom Select Menu */}
						{dropdownOpen && !loadingSchools && (
							<>
								{/* Invisible overlay to close on click-outside */}
								<div 
									className="fixed inset-0 z-40" 
									onClick={() => setDropdownOpen(false)} 
								/>
								<div 
									className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-cx-border rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50 max-h-60 overflow-y-auto p-1.5 transform origin-top transition-all duration-200"
								>
									{schools.map((s) => {
										const isSelected = data.school === s.displayName;
										return (
											<button
												key={s.id}
												onClick={() => {
													onChange('school', s.displayName);
													onChange('schoolId', s.schoolId);
													setDropdownOpen(false);
												}}
												className={`w-full text-left px-3 py-3 mb-0.5 rounded-lg text-sm transition-all cursor-pointer border-none flex items-center justify-between ${
													isSelected 
														? 'bg-[#e2f7f3] text-[#0d9488] font-bold' 
														: 'bg-transparent text-cx-ink hover:bg-cx-bg hover:translate-x-1'
												}`}
											>
												{s.displayName}
												{isSelected && (
													<Icon name="check" size={16} style={{ color: '#0d9488' }} />
												)}
											</button>
										);
									})}
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* Choose manually link */}
			{!showManual && !schoolDetected && !detecting && (
				<button
					onClick={() => setShowManual(true)}
					className='text-xs font-semibold text-cx-muted hover:text-cx-teal transition-colors border-none bg-transparent cursor-pointer mb-5 self-center underline underline-offset-2'
				>
					Choose campus manually instead
				</button>
			)}

			{/* Registration API error */}
			{error && (
				<div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium mb-4 flex items-center gap-2'>
					<Icon name='error' size={16} style={{ color: '#ef4444' }} />
					{error.data?.message ||
						'Failed to create account. Please try again.'}
				</div>
			)}

			<button
				onClick={onSubmit}
				disabled={isLoading || detecting || !isFormValid}
				className='w-full py-3.5 rounded-2xl text-white font-bold text-base border-none cursor-pointer disabled:opacity-50 transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] mt-2'
				style={{
					background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
				}}
			>
				{isLoading ? (
					<span className='flex items-center justify-center gap-2'>
						<span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />
						Creating account…
					</span>
				) : (
					'Complete Registration'
				)}
			</button>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Root Onboarding component
// ═══════════════════════════════════════════════════════════════════════════════
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
