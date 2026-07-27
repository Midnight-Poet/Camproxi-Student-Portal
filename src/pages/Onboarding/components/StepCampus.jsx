import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { Field } from '../../../components/ui';
import { useGetSchoolsQuery } from '../../../store/apiSlice';
import { calcDistance } from '../../../utils/geo';

export function StepCampus({ data, onChange, onSubmit, onBack, isLoading, error }) {
	const [detecting, setDetecting] = useState(false);
	const [geoError, setGeoError] = useState(null);
	const [showManual, setShowManual] = useState(false);
	const [schools, setSchools] = useState([]);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const { data: schoolsRes, isLoading: loadingSchools } = useGetSchoolsQuery();

	useEffect(() => {
		if (schoolsRes) {
			try {
				const rawSchools = Array.isArray(schoolsRes) ? schoolsRes : schoolsRes.data || [];
				
				const flatCampuses = [];
				for (const s of rawSchools) {
					if (Array.isArray(s.campus)) {
						for (const c of s.campus) {
							flatCampuses.push({
								id: `${s.id}-${c.name}`,
								schoolId: s.id,
								displayName: `${s.code} ${c.name}`,
								location: c.location,
								campusName: c.name
							});
						}
					}
				}
				setSchools(flatCampuses);
			} catch (err) {
				console.error('Failed to parse schools:', err);
			}
		}
	}, [schoolsRes]);

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
					onChange('campusName', closest.campusName);
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
			onChange('campusName', s.campusName);
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
					{/* <label className='text-xs font-bold text-cx-ink3 mb-1.5 block'>
						{schoolDetected
							? 'Not your campus? Change it'
							: 'Select your campus'}
					</label> */}
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
													onChange('campusName', s.campusName);
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
			{/* {!showManual && !schoolDetected && !detecting && (
				<button
					onClick={() => setShowManual(true)}
					className='text-xs font-semibold text-cx-muted hover:text-cx-teal transition-colors border-none bg-transparent cursor-pointer mb-5 self-center underline underline-offset-2'
				>
					Choose campus manually instead
				</button>
			)} */}

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


// Root Onboarding component
// ═══════════════════════════════════════════════════════════════════════════════
