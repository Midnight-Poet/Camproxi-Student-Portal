import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { Field, Input, PasswordInput } from '../../../components/ui';
import { useLazyCheckUsernameQuery, useLazyCheckEmailQuery } from '../../../store/apiSlice';

export function StepPersonalDetails({ data, onChange, onNext, onBack }) {
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
		phone: !data.phone
			? 'Phone number is required'
			: !/^\+?[0-9]{10,15}$/.test(data.phone.replace(/[\s-]/g, ''))
				? 'Enter a valid phone number'
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
			phone: true,
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

				{/* Phone */}
				<div>
					<Field label='Phone number' error={touched.phone && errors.phone}>
						<Input
							type='tel'
							value={data.phone}
							onChange={(e) => {
								onChange('phone', e.target.value);
								setTouched((t) => ({ ...t, phone: true }));
							}}
							placeholder='+234 800 000 0000'
							autoComplete='tel'
						/>
					</Field>
				</div>

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


// STEP 2 — Campus selection
// API fields: school*, schoolId*, latitude (opt), longitude (opt), location (opt)
// ═══════════════════════════════════════════════════════════════════════════════
