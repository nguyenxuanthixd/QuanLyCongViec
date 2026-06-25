/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { EvaluationType } from '../types';
import { CheckCircle2, AlertTriangle, X, Award, HelpCircle } from 'lucide-react';

interface TaskEvaluationModalProps {
  isOpen: boolean;
  taskContent: string;
  onClose: () => void;
  onSubmit: (evaluation: EvaluationType, remarks: string) => void;
}

export default function TaskEvaluationModal({
  isOpen,
  taskContent,
  onClose,
  onSubmit,
}: TaskEvaluationModalProps) {
  const [evaluation, setEvaluation] = useState<EvaluationType>('Dat');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!remarks.trim()) {
      setError('Vui lòng nhập nhận xét hoặc bài học rút ra để hoàn tất!');
      return;
    }
    onSubmit(evaluation, remarks.trim());
    setRemarks('');
    setEvaluation('Dat');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        id="evaluation-modal-container"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-slate-950/40 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Đánh Giá Kết Quả Công Việc</h3>
          </div>
          <button
            type="button"
            id="close-modal-btn"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Công việc vừa hoàn thành:
            </span>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100/40 dark:border-indigo-950/20 italic">
              "{taskContent}"
            </p>
          </div>

          {/* Chọn kết quả Đạt / Không đạt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Kết quả đánh giá <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="eval-btn-dat"
                onClick={() => setEvaluation('Dat')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition duration-200 ${
                  evaluation === 'Dat'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-750 dark:text-emerald-400 ring-2 ring-emerald-500/10'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${evaluation === 'Dat' ? 'text-emerald-600' : 'text-gray-400 dark:text-slate-500'}`} />
                <span>Đạt yêu cầu</span>
              </button>

              <button
                type="button"
                id="eval-btn-khongdat"
                onClick={() => setEvaluation('KhongDat')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition duration-200 ${
                  evaluation === 'KhongDat'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-750 dark:text-rose-400 ring-2 ring-rose-500/10'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${evaluation === 'KhongDat' ? 'text-rose-600' : 'text-gray-400 dark:text-slate-500'}`} />
                <span>Không đạt</span>
              </button>
            </div>
          </div>

          {/* Nhận xét / Bài học rút ra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Nhận xét / Bài học cần khắc phục <span className="text-red-500">*</span>
            </label>
            <textarea
              id="evaluation-remarks-input"
              rows={4}
              placeholder={
                evaluation === 'Dat'
                  ? 'Ghi lại lý do đạt kết quả tốt, điểm cộng hoặc kinh nghiệm có ích...'
                  : 'Ghi lại nguyên nhân chưa đạt, lỗi phát sinh và bài học để khắc phục ở dự án tiếp theo...'
              }
              className="w-full rounded-xl border border-gray-200 dark:border-slate-850 px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-550 placeholder:text-gray-400 dark:placeholder:text-slate-600"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-950/30 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-slate-950/40 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            id="cancel-modal-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg transition duration-150 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            id="save-evaluation-btn"
            onClick={handleSave}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition duration-150 flex items-center gap-1 shadow-sm cursor-pointer ${
              evaluation === 'Dat' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            Lưu hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}
