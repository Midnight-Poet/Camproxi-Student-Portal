import React, { useState } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, Divider } from './SharedUI.jsx';
import { useApp } from '../../../context.jsx';
import { 
  useSendEmailVerificationMutation, 
  useVerifyEmailMutation, 
  useSendPhoneVerificationMutation, 
  useVerifyPhoneMutation 
} from '../../../store/apiSlice';

export function VerificationView({ user, school }) {
  const { showToast } = useApp();
  const [activeModal, setActiveModal] = useState(null); // 'email' | 'phone' | null
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [sendEmailVerification] = useSendEmailVerificationMutation();
  const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation();
  const [sendPhoneVerification] = useSendPhoneVerificationMutation();
  const [verifyPhone, { isLoading: isVerifyingPhone }] = useVerifyPhoneMutation();

  const isVerified = user?.isverified || (user?.emailVerified && user?.phoneVerified);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const schoolName = school?.name || school?.schoolName || null;

  async function handleSendOtp(type) {
    try {
      setIsSending(true);
      if (type === 'email') await sendEmailVerification().unwrap();
      if (type === 'phone') await sendPhoneVerification().unwrap();
      
      setActiveModal(type);
      setOtp('');
      showToast(`✓ OTP sent to your ${type}`);
    } catch (err) {
      console.error(err);
      showToast(`Failed to send ${type} verification. Try again.`);
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    if (otp.length < 6) return;
    try {
      if (activeModal === 'email') await verifyEmail({ otp }).unwrap();
      if (activeModal === 'phone') await verifyPhone({ otp }).unwrap();
      
      showToast(`✓ ${activeModal === 'email' ? 'Email' : 'Phone'} verified successfully!`);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      showToast(err?.data?.message || 'Invalid OTP. Please try again.');
    }
  }

  return (
    <div className="animate-in fade-in duration-300 relative">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Verification</h2>

      {/* Status Banner */}
      <div
        className="rounded-3xl p-5 flex items-center gap-4 mb-6 shadow-sm"
        style={isVerified
          ? { background: 'linear-gradient(135deg, #ccfbf1, #e0f2fe)', border: '1px solid #bceae4' }
          : { background: 'linear-gradient(135deg, #fef9c3, #fde68a20)', border: '1px solid #fcd34d' }
        }
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isVerified ? 'bg-white' : 'bg-amber-50'}`}>
          <Icon name={isVerified ? 'verified_user' : 'pending'} size={28} fill={1} style={{ color: isVerified ? '#0d9488' : '#d97706' }} />
        </div>
        <div>
          <p className={`font-extrabold text-base ${isVerified ? 'text-teal-800' : 'text-amber-800'}`}>
            {isVerified ? 'Fully Verified Student' : 'Verification Pending'}
          </p>
          <p className={`text-sm font-medium ${isVerified ? 'text-teal-700' : 'text-amber-700'}`}>
            {isVerified ? 'Your student status has been confirmed' : 'Verify both email and phone to complete'}
          </p>
        </div>
      </div>

      {/* Verification Details */}
      <SectionCard>
        {[
          { id: 'email', label: 'School email', value: user?.email || '—', verified: user?.emailVerified, verifyType: 'email' },
          { id: 'phone', label: 'Phone number', value: user?.phone ? `+${user.phone}` : '—', verified: user?.phoneVerified, verifyType: 'phone' },
          { id: 'school', label: 'School', value: schoolName || '—' },
          { id: 'since', label: 'Member since', value: memberSince },
          { id: 'user', label: 'Username', value: user?.username ? `@${user.username}` : '—' },
        ].map((row, i, arr) => (
          <div key={row.id}>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-bold text-cx-muted">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-cx-ink">{row.value}</span>
                {row.verified === true && (
                  <Icon name="verified" size={16} fill={1} style={{ color: '#14b8a6' }} />
                )}
                {row.verified === false && (row.id === 'email' || row.id === 'phone') && (
                  <button 
                    disabled={isSending}
                    onClick={() => handleSendOtp(row.verifyType)}
                    className="ml-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Verify
                  </button>
                )}
                {row.verified === false && row.id !== 'email' && row.id !== 'phone' && (
                  <Icon name="warning" size={16} style={{ color: '#d97706' }} />
                )}
              </div>
            </div>
            {i < arr.length - 1 && <Divider />}
          </div>
        ))}
      </SectionCard>

      {/* OTP Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 border-none cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
            <div className="w-12 h-12 bg-cx-bg rounded-full flex items-center justify-center mb-4">
              <Icon name={activeModal === 'email' ? 'email' : 'smartphone'} size={24} style={{ color: '#5b6270' }} />
            </div>
            <h3 className="text-xl font-extrabold text-cx-ink mb-2">
              Verify your {activeModal}
            </h3>
            <p className="text-sm text-cx-muted mb-6 leading-relaxed">
              We've sent a 6-digit OTP to your {activeModal}. Please enter it below.
            </p>
            <form onSubmit={handleVerifySubmit}>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-cx-bg border border-cx-border rounded-xl px-4 py-3 text-cx-ink text-center text-xl font-extrabold tracking-widest outline-none focus:border-cx-teal transition-colors mb-4"
                autoFocus
              />
              <button
                type="submit"
                disabled={otp.length < 6 || isVerifyingEmail || isVerifyingPhone}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-cx-teal border-none cursor-pointer hover:bg-teal-600 disabled:opacity-50 transition-all shadow-sm"
              >
                {isVerifyingEmail || isVerifyingPhone ? 'Verifying...' : 'Submit OTP'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}






