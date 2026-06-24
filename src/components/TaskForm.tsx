/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, startTransition, FormEvent } from 'react';
import { Project } from '../types';
import { formatDateTimeLocal } from '../utils';
import { Plus, X, Check, FolderPlus, ClipboardList } from 'lucide-react';

interface TaskFormProps {
  projects: Project[];
  onAddTask: (task: {
    projectId: string;
    content: string;
    startTime: string;
    planEndTime: string;
  }) => void;
  onAddProject: (projectName: string) => string;
}

export default function TaskForm({ projects, onAddTask, onAddProject }: TaskFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  // Thiết lập thời gian mặc định: Bắt đầu = Hiện tại, Kết thúc = 1 ngày sau
  const [startTime, setStartTime] = useState<string>(() => formatDateTimeLocal(new Date()));
  const [planEndTime, setPlanEndTime] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateTimeLocal(tomorrow);
  });

  // Trạng thái cho Thêm nhanh Dự án mới
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [projectError, setProjectError] = useState<string>('');

  // Trạng thái thông báo lỗi của form chính
  const [formError, setFormError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleQuickAddProject = () => {
    if (!newProjectName.trim()) {
      setProjectError('Vui lòng nhập tên dự án!');
      return;
    }
    const newId = onAddProject(newProjectName.trim());
    setSelectedProjectId(newId);
    setNewProjectName('');
    setIsAddingProject(false);
    setProjectError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!selectedProjectId) {
      setFormError('Vui lòng chọn hoặc thêm một dự án!');
      return;
    }
    if (!content.trim()) {
      setFormError('Vui lòng nhập nội dung công việc!');
      return;
    }
    if (!startTime) {
      setFormError('Vui lòng chọn thời gian bắt đầu!');
      return;
    }
    if (!planEndTime) {
      setFormError('Vui lòng chọn kế hoạch hoàn thành!');
      return;
    }

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(planEndTime).getTime();

    if (endMs <= startMs) {
      setFormError('Kế hoạch hoàn thành phải sau Thời gian bắt đầu!');
      return;
    }

    onAddTask({
      projectId: selectedProjectId,
      content: content.trim(),
      startTime,
      planEndTime,
    });

    // Reset Form trừ Project ID để tiện nhập tiếp
    setContent('');
    setStartTime(formatDateTimeLocal(new Date()));
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    setPlanEndTime(formatDateTimeLocal(nextDay));

    setSuccessMsg('Đã thêm công việc mới thành công!');
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-2 mb-5 border-b border-gray-50 dark:border-slate-800/80 pb-3">
        <ClipboardList className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Thêm Công Việc Mới</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Chọn Dự án */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Dự án <span className="text-red-500">*</span>
          </label>

          {!isAddingProject ? (
            <div className="flex gap-2">
              <select
                id="project-select"
                className="flex-1 rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="" className="dark:bg-slate-950">-- Chọn Dự án --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-950">
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                id="toggle-add-project-btn"
                onClick={() => setIsAddingProject(true)}
                className="flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 px-3 py-2 rounded-lg text-sm font-medium transition duration-200 border border-indigo-100/50 dark:border-indigo-900/30"
                title="Thêm nhanh Dự án mới"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="ml-1 hidden sm:inline">Thêm nhanh</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tạo Dự án mới</span>
                <button
                  type="button"
                  id="cancel-add-project-btn"
                  onClick={() => setIsAddingProject(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="new-project-input"
                  placeholder="Ví dụ: Dự án xây dựng..."
                  className="flex-1 rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-1.5 text-sm bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickAddProject();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  id="save-project-btn"
                  onClick={handleQuickAddProject}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-1.5 transition duration-200 flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
              {projectError && <p className="text-xs text-red-500">{projectError}</p>}
            </div>
          )}
        </div>

        {/* Nội dung công việc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Nội dung công việc <span className="text-red-500">*</span>
          </label>
          <textarea
            id="task-content-input"
            rows={3}
            placeholder="Mô tả cụ thể nội dung công việc cần làm..."
            className="w-full rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Thời gian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start-time-input"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-950"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Kế hoạch hoàn thành <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="plan-end-time-input"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-950"
              value={planEndTime}
              onChange={(e) => setPlanEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Thông báo lỗi & thành công */}
        {formError && (
          <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-100">
            {formError}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 text-xs px-3 py-2 rounded-lg border border-emerald-100 flex items-center gap-1">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Nút Submit */}
        <button
          type="submit"
          id="add-task-submit-btn"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-4 font-semibold text-sm transition duration-200 flex items-center justify-center gap-1.5 shadow-sm active:translate-y-px"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm công việc</span>
        </button>
      </form>
    </div>
  );
}
