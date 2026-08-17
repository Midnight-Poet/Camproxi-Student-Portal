import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { useSubmitReportMutation } from '../store/apiSlice';
import { useApp } from '../context';

export function ReportModal({
  isOpen,
  onClose,
  targetType = 'GENERAL',
  targetId = null,
  itemCategory = null,
  targetName = '',
}) {
  const { showToast } = useApp();
  const [submitReport, { isLoading }] = useSubmitReportMutation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Default subject options based on targetType
  const getSubjectOptions = () => {
    if (targetType === 'AGENT') {
      return [
        'Inappropriate behavior',
        'Scam / Fraud attempt',
        'Unresponsive or rude',
        'Misleading information',
        'Other',
      ];
    }
    if (targetType === 'ITEM') {
      return [
        'Fake or duplicated listing',
        'Inaccurate pricing or details',
        'Unsafe or non-existent property/item',
        'Offensive content or images',
        'Other',
      ];
    }
    return [
      'App bug / Technical issue',
      'Account issue',
      'Feature request',
      'General feedback',
      'Other',
    ];
  };

  useEffect(() => {
    if (isOpen) {
      setSubject(getSubjectOptions()[0]);
      setMessage('');
    }
  }, [isOpen, targetType]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please describe the issue', { position: 'top' });
      return;
    }

    try {
      const payload = {
        subject: subject.trim(),
        message: message.trim(),
        targetType,
      };

      if (targetId) payload.targetId = targetId;
      if (itemCategory) payload.itemCategory = itemCategory;

      await submitReport(payload).unwrap();
      showToast('Report submitted successfully. Thank you!', { position: 'top' });
      onClose();
    } catch (err) {
      showToast(err?.data?.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 flex-none">
              <Icon name="flag" size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                {targetName ? `Report ${targetName}` : targetType === 'AGENT' ? 'Report Agent' : targetType === 'ITEM' ? 'Report Listing' : 'Report a Problem'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Help us keep the Camproxi community safe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reason / Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold focus:outline-none focus:border-red-400 focus:bg-white transition-all"
            >
              {getSubjectOptions().map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Details
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide more context about what happened..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Icon name="send" size={16} />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
