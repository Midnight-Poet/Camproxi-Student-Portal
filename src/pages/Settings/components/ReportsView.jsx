import React from 'react';
import { useGetReportsQuery } from '../../../store/apiSlice';
import { Icon } from '../../../components/Icon';
import { BackButton } from './SharedUI';

export function ReportsView({ goBack, onOpenReportModal }) {
  const { data: reportsRes, isLoading, refetch } = useGetReportsQuery();
  const reports = Array.isArray(reportsRes) ? reportsRes : (reportsRes?.data || []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <BackButton onClick={goBack} label="Reports & Feedback" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Your Reports</h2>
          <p className="text-xs text-slate-500 font-medium">Track your submitted feedback and issues</p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-cx-teal hover:bg-teal-600 text-white rounded-full font-bold text-xs shadow-md shadow-cx-teal/20 transition-all cursor-pointer border-none"
        >
          <Icon name="add" size={16} />
          <span>New Report</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-100/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center my-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-cx-teal flex items-center justify-center mx-auto mb-3">
            <Icon name="assignment_turned_in" size={28} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base mb-1">No reports submitted</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
            If you ever encounter an issue with an agent, listing, or app bug, your reports will appear here.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs hover:bg-slate-800 transition-colors border-none cursor-pointer"
          >
            Report an Issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportId = report.id || report._id;
            const isResolved = report.status === 'RESOLVED';

            return (
              <div
                key={reportId}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Status & Date */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {isResolved ? 'Resolved' : 'Under Review'}
                    </span>

                    {report.targetType && (
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md">
                        {report.targetType}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">
                    {formatDate(report.createdAt)}
                  </span>
                </div>

                {/* Subject */}
                <h4 className="font-extrabold text-slate-900 text-base mb-1">
                  {report.subject}
                </h4>

                {/* Message */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                  {report.message}
                </p>

                {/* Admin Reply */}
                {report.reply ? (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-lg bg-cx-teal/10 text-cx-teal flex items-center justify-center flex-none mt-0.5">
                      <Icon name="admin_panel_settings" size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-0.5">
                        Admin Response
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-normal">
                        {report.reply}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
