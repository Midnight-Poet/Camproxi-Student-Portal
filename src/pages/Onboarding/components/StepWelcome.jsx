import React from 'react';
import { Icon } from '../../../components/Icon.jsx';

export function StepWelcome({ onNext, onLogin }) {
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


// STEP 1 — Personal details
// API fields: firstName*, lastName*, username*, email*, password*, phone (optional)
// ═══════════════════════════════════════════════════════════════════════════════
