/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Task } from '../types';
import { formatReadableDateTime, exportTasksToCSV } from '../utils';
import { 
  Folder, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Check, 
  X,
  FileCheck2,
  CalendarCheck2,
  FileDown
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
}

export default function Dashboard({ projects, tasks }: DashboardProps) {
  const nowMs = Date.now();

  // 1. Thống kê tổng số lượng
  const totalProjects = projects.length;
  
  // Tổng số dự án đang thực hiện (có ít nhất 1 công việc chưa xong)
  const activeProjectsCount = projects.filter(p => {
    const projTasks = tasks.filter(t => t.projectId === p.id);
    return projTasks.some(t => !t.isCompleted);
  }).length;

  const totalTasksCreated = tasks.length;
  
  const completedTasks = tasks.filter(t => t.isCompleted);
  const completedTasksCount = completedTasks.length;

  const overdueTasksCount = tasks.filter(
    t => !t.isCompleted && new Date(t.planEndTime).getTime() < nowMs
  ).length;

  // 2. Tỷ lệ hoàn thành đúng hạn (KPI)
  // KPI% = (tổng số việc hoàn thành đúng hạn / tổng số việc đã xong)
  const completedOnTime = completedTasks.filter(t => {
    const completedTime = new Date(t.completedAt!).getTime();
    const planEndTime = new Date(t.planEndTime).getTime();
    return completedTime <= planEndTime;
  });
  const completedOnTimeCount = completedOnTime.length;

  const kpiRate = completedTasksCount > 0 
    ? Math.round((completedOnTimeCount / completedTasksCount) * 100) 
    : 0;

  // Thống kê theo từng Dự án
  const projectStats = projects.map(proj => {
    const projTasks = tasks.filter(t => t.projectId === proj.id);
    const activeCount = projTasks.filter(t => !t.isCompleted).length;
    const completedCount = projTasks.filter(t => t.isCompleted).length;
    
    // Tỷ lệ Đạt% = Số việc "Đạt" / Tổng số việc đã xong của dự án
    const passedTasks = projTasks.filter(t => t.isCompleted && t.evaluation === 'Dat');
    const passRate = completedCount > 0 
      ? Math.round((passedTasks.length / completedCount) * 100) 
      : 0;

    // Danh sách các "Nhận xét / Bài học cần khắc phục" của dự án
    // Lấy tất cả bài học, ưu tiên đánh dấu cái "Không đạt" để khắc phục
    const remarksList = projTasks
      .filter(t => t.isCompleted && t.remarks && t.remarks.trim() !== '')
      .map(t => ({
        taskId: t.id,
        content: t.content,
        evaluation: t.evaluation,
        remarks: t.remarks || '',
        completedAt: t.completedAt || '',
      }));

    return {
      ...proj,
      activeCount,
      completedCount,
      passRate,
      remarksList,
      allTasks: projTasks,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Dashboard Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors duration-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Phân Tích Tiến Độ & Hiệu Suất Công Việc
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Theo dõi tỷ lệ hoàn thành đúng hạn (KPI), tỷ lệ đạt yêu cầu của các gói thầu và tổng hợp bài học kinh nghiệm.
          </p>
        </div>
        <button
          type="button"
          id="dashboard-export-excel-btn"
          onClick={() => exportTasksToCSV(projects, tasks)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-150 shrink-0 cursor-pointer active:translate-y-px"
          title="Xuất báo cáo theo dõi ra file Excel (.csv)"
        >
          <FileDown className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel</span>
        </button>
      </div>

      {/* 1. Hàng Thống kê (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng dự án */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Tổng số Dự án</p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{totalProjects}</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{activeProjectsCount}</span> dự án đang chạy
            </p>
          </div>
        </div>

        {/* Card 2: Tổng công việc */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Công việc đã tạo</p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{totalTasksCreated}</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Đang thực hiện: <span className="font-semibold text-sky-600 dark:text-sky-450">{totalTasksCreated - completedTasksCount}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Đã hoàn thành */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Công việc đã xong</p>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{completedTasksCount}</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Đúng hạn: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedOnTimeCount}</span> / {completedTasksCount}
            </p>
          </div>
        </div>

        {/* Card 4: Trễ hạn */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Đang bị Trễ hạn</p>
            <h4 className={`text-2xl font-bold mt-1 ${overdueTasksCount > 0 ? 'text-rose-600 animate-pulse' : 'text-gray-800 dark:text-white'}`}>
              {overdueTasksCount}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Yêu cầu xử lý gấp
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tỷ lệ hoàn thành đúng hạn (KPI) & Biểu đồ trực quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Khối KPI */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md md:col-span-1 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <TrendingUp className="w-48 h-48" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-800/50 px-2.5 py-1 rounded-md">
                Chỉ số hiệu suất KPI
              </span>
              <CalendarCheck2 className="w-5 h-5 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-100">Tỷ Lệ Hoàn Thành Đúng Hạn</h3>
            <p className="text-xs text-indigo-300 mt-1">Đo lường năng lực quản trị thời gian</p>
          </div>

          <div className="my-6 flex items-center justify-center gap-6">
            {/* SVG Circular Progress */}
            <div className="relative w-28 h-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${kpiRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white leading-none">{kpiRate}%</span>
                <span className="text-[10px] text-indigo-200 mt-1">ĐÚNG HẠN</span>
              </div>
            </div>

            <div className="text-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full"></div>
                <span>Đúng hạn: <strong>{completedOnTimeCount}</strong> việc</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <div className="w-2.5 h-2.5 bg-white/20 rounded-full"></div>
                <span>Tổng đã xong: <strong>{completedTasksCount}</strong> việc</span>
              </div>
            </div>
          </div>

          <div className="border-t border-indigo-800/60 pt-3">
            <p className="text-xs text-indigo-200">
              {kpiRate >= 80 
                ? 'Excellent! Kỹ năng quản lý tiến độ tuyệt vời.' 
                : kpiRate >= 50 
                ? 'Good! Bạn đang giữ nhịp khá tốt, hãy cải thiện thêm.' 
                : completedTasksCount === 0 
                ? 'Chưa có công việc nào hoàn thành để tính KPI.' 
                : 'Cảnh báo! Bạn đang bị trễ hạn nhiều, hãy tối ưu hóa kế hoạch.'}
            </p>
          </div>
        </div>

        {/* Khối Tóm tắt Hiệu suất Dự án */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm md:col-span-2 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-gray-50 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Hiệu Suất Theo Dự Án</h3>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500">Tỷ lệ Đạt yêu cầu</span>
          </div>

          <div className="space-y-4">
            {projectStats.map(p => {
              const totalProjTasks = p.activeCount + p.completedCount;
              return (
                <div key={p.id} className="bg-gray-50/20 dark:bg-slate-950/40 rounded-xl p-4 border border-gray-100/70 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-800 dark:text-slate-200 truncate max-w-[240px] sm:max-w-md" title={p.name}>
                      {p.name}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                      Tỷ lệ Đạt: {p.passRate}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.passRate >= 80 
                          ? 'bg-emerald-500' 
                          : p.passRate >= 50 
                          ? 'bg-indigo-500' 
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${p.passRate}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 dark:text-slate-500 border-b border-gray-100/50 dark:border-slate-800/50 pb-2.5">
                    <span>
                      Trạng thái: <strong>{p.activeCount}</strong> đang chạy / <strong>{p.completedCount}</strong> đã xong
                    </span>
                    <span>
                      Tổng: {totalProjTasks} công việc
                    </span>
                  </div>

                  {/* Danh sách các công việc cụ thể thuộc dự án này */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Công việc thực hiện ({p.allTasks.length}):
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                      {p.allTasks.map(t => {
                        const isOverdue = !t.isCompleted && new Date(t.planEndTime).getTime() < nowMs;
                        return (
                          <div 
                            key={t.id} 
                            className={`flex items-start justify-between gap-3 text-xs p-2.5 rounded-lg border transition duration-150 ${
                              t.isCompleted 
                                ? t.evaluation === 'Dat'
                                  ? 'bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-100/40 dark:border-emerald-900/20 text-gray-700 dark:text-slate-300'
                                  : 'bg-rose-50/10 dark:bg-rose-950/10 border-rose-100/40 dark:border-rose-900/20 text-gray-700 dark:text-slate-300'
                                : isOverdue
                                  ? 'bg-rose-50/10 dark:bg-rose-950/20 border-rose-200/30 dark:border-rose-900/30 text-gray-850 dark:text-slate-200'
                                  : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-200'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <p className={`font-semibold leading-relaxed ${t.isCompleted ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-700 dark:text-slate-200'}`}>
                                {t.content}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500">
                                {t.isCompleted 
                                  ? `Đã xong: ${formatReadableDateTime(t.completedAt || '')}`
                                  : `Hạn: ${formatReadableDateTime(t.planEndTime)}`
                                }
                              </p>
                            </div>

                            {/* Badge trạng thái công việc */}
                            <div className="shrink-0 pt-0.5">
                              {t.isCompleted ? (
                                t.evaluation === 'Dat' ? (
                                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-900/30">
                                    Đạt
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-900/30">
                                    Không đạt
                                  </span>
                                )
                              ) : isOverdue ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-md animate-pulse">
                                  Trễ hẹn
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                                  Đang chạy
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {p.allTasks.length === 0 && (
                        <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-4 italic bg-white dark:bg-slate-950 rounded-lg border border-dashed border-gray-100 dark:border-slate-800">
                          Chưa có công việc nào trong dự án này.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {projectStats.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Chưa có dự án nào được khởi tạo.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Chi tiết từng dự án & Tổng hợp Nhận xét / Bài học cần khắc phục */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-50 dark:border-slate-800 pb-3">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-800 dark:text-white">Tổng Hợp Bài Học Kinh Nghiệm & Khắc Phục</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projectStats.map(proj => {
            return (
              <div 
                key={proj.id} 
                className="bg-gray-50/50 dark:bg-slate-950/40 rounded-xl p-5 border border-gray-100/80 dark:border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-slate-800 pb-2 mb-3">
                    <h4 className="font-bold text-gray-800 dark:text-slate-200 text-sm line-clamp-2" title={proj.name}>
                      {proj.name}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      proj.passRate >= 80 
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400' 
                        : proj.passRate >= 50 
                        ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-400' 
                        : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400'
                    }`}>
                      Đạt {proj.passRate}%
                    </span>
                  </div>

                  {/* Sổ ghi chép bài học */}
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {proj.remarksList.map((item, idx) => (
                      <div 
                        key={item.taskId} 
                        className={`p-3 rounded-lg border text-xs space-y-1.5 transition duration-150 ${
                          item.evaluation === 'Dat' 
                            ? 'bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-100/40 dark:border-emerald-900/30' 
                            : 'bg-rose-50/10 dark:bg-rose-950/10 border-rose-100/40 dark:border-rose-900/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-500 dark:text-slate-400">Mục #{idx + 1}</span>
                          <span className={`flex items-center gap-0.5 font-bold ${
                            item.evaluation === 'Dat' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                          }`}>
                            {item.evaluation === 'Dat' ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đạt</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                <span>Không đạt</span>
                              </>
                            )}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-slate-300 font-medium line-clamp-2" title={item.content}>
                          <strong>Việc:</strong> {item.content}
                        </p>
                        
                        <div className="pt-1.5 border-t border-dashed border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400">
                          <p className="italic font-normal">
                            <strong>Ghi chép:</strong> {item.remarks}
                          </p>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 text-right pt-0.5">
                          Xong: {formatReadableDateTime(item.completedAt)}
                        </p>
                      </div>
                    ))}

                    {proj.remarksList.length === 0 && (
                      <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs">
                        Chưa có ghi chép đánh giá nào cho dự án này.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 flex justify-between">
                  <span>Hoàn thành: <strong>{proj.completedCount}</strong> việc</span>
                  <span>Đang chạy: <strong>{proj.activeCount}</strong> việc</span>
                </div>
              </div>
            );
          })}

          {projectStats.length === 0 && (
            <div className="lg:col-span-3 text-center py-12 text-gray-400 dark:text-slate-500 text-sm">
              Chưa có dự án và dữ liệu phân tích nào được tạo.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
