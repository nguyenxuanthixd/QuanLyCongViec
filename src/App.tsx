/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Project, Task, EvaluationType } from './types';
import { 
  getMockProjects, 
  getMockTasks, 
  getRemainingTimeText, 
  formatReadableDateTime,
  exportTasksToCSV
} from './utils';
import TaskForm from './components/TaskForm';
import TaskEvaluationModal from './components/TaskEvaluationModal';
import Dashboard from './components/Dashboard';
import { 
  Layers, 
  RotateCcw, 
  Trash2, 
  CheckSquare, 
  History, 
  Clock, 
  Search, 
  Filter, 
  AlertCircle, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Sun,
  Moon,
  FileDown
} from 'lucide-react';

export default function App() {
  // 1. Quản lý trạng thái dữ liệu (Projects & Tasks)
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Trạng thái Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('pms_dark_mode');
    return stored === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pms_dark_mode', String(isDarkMode));
  }, [isDarkMode]);
  
  // Trạng thái Tab hiện tại: 'tasks' (Theo dõi công việc) hoặc 'dashboard' (Dashboard tổng quan)
  const [currentTab, setCurrentTab] = useState<'tasks' | 'dashboard'>('dashboard');

  // Trạng thái cập nhật thời gian thực để tự động tính thời gian trễ hẹn
  const [tick, setTick] = useState<number>(Date.now());

  // Trạng thái của Modal đánh giá công việc
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Bộ lọc danh sách công việc (Trang 1)
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Tải và đồng bộ hóa với localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem('pms_projects');
    const storedTasks = localStorage.getItem('pms_tasks');

    if (storedProjects && storedTasks) {
      setProjects(JSON.parse(storedProjects));
      setTasks(JSON.parse(storedTasks));
    } else {
      // Khởi tạo dữ liệu mẫu nếu chưa có gì
      const mockProj = getMockProjects();
      const mockTasks = getMockTasks();
      setProjects(mockProj);
      setTasks(mockTasks);
      localStorage.setItem('pms_projects', JSON.stringify(mockProj));
      localStorage.setItem('pms_tasks', JSON.stringify(mockTasks));
    }
  }, []);

  // Đếm thời gian trôi qua mỗi 30 giây để cập nhật thời gian còn lại
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lưu dự án vào localStorage khi thay đổi
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('pms_projects', JSON.stringify(updatedProjects));
  };

  // Lưu công việc vào localStorage khi thay đổi
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('pms_tasks', JSON.stringify(updatedTasks));
  };

  // 3. Các chức năng tương tác (Actions)
  
  // Thêm nhanh dự án mới
  const handleAddProject = (projectName: string): string => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      createdAt: new Date().toISOString(),
    };
    const updated = [...projects, newProject];
    saveProjects(updated);
    return newProject.id;
  };

  // Thêm công việc mới
  const handleAddTask = (newTaskData: {
    projectId: string;
    content: string;
    startTime: string;
    planEndTime: string;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: newTaskData.projectId,
      content: newTaskData.content,
      startTime: new Date(newTaskData.startTime).toISOString(),
      planEndTime: new Date(newTaskData.planEndTime).toISOString(),
      isCompleted: false,
    };
    const updated = [newTask, ...tasks];
    saveTasks(updated);
  };

  // Mở modal hoàn thành công việc
  const handleOpenCompleteModal = (taskId: string) => {
    setCompletingTaskId(taskId);
  };

  // Hoàn tất đánh giá & lưu hoàn thành công việc
  const handleSaveCompletion = (evaluation: EvaluationType, remarks: string) => {
    if (!completingTaskId) return;

    const updated = tasks.map((t) => {
      if (t.id === completingTaskId) {
        return {
          ...t,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          evaluation,
          remarks,
        };
      }
      return t;
    });

    saveTasks(updated);
    setCompletingTaskId(null);
  };

  // Xóa công việc
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveTasks(updated);
    }
  };

  // Khôi phục dữ liệu mẫu ban đầu
  const handleResetData = () => {
    if (confirm('Hành động này sẽ khôi phục lại dữ liệu mẫu 3 Dự án và 6 Công việc gốc. Các thay đổi hiện tại của bạn sẽ bị ghi đè. Bạn có muốn tiếp tục không?')) {
      const mockProj = getMockProjects();
      const mockTasks = getMockTasks();
      saveProjects(mockProj);
      saveTasks(mockTasks);
      setFilterProjectId('');
      setSearchQuery('');
    }
  };

  // Tìm kiếm và Lọc công việc
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const filterTaskCallback = (t: Task) => {
    // Lọc theo Dự án
    if (filterProjectId && t.projectId !== filterProjectId) return false;
    // Tìm kiếm theo Nội dung
    if (searchQuery.trim()) {
      const contentMatch = t.content.toLowerCase().includes(searchQuery.toLowerCase());
      const proj = projects.find((p) => p.id === t.projectId);
      const projectMatch = proj ? proj.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return contentMatch || projectMatch;
    }
    return true;
  };

  const filteredActiveTasks = activeTasks.filter(filterTaskCallback);
  const filteredCompletedTasks = completedTasks.filter(filterTaskCallback);

  // Tìm nội dung của công việc đang chuẩn bị hoàn thành để hiển thị trên Modal
  const completingTask = tasks.find((t) => t.id === completingTaskId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 pb-12 transition-colors duration-200">
      
      {/* HEADER CAO CẤP */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-850 sticky top-0 z-40 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Tiêu đề */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-sm shadow-indigo-600/30 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Quản Lý Công Việc Thực Hiện
              </h1>
            </div>
          </div>

          {/* Nhóm công cụ */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            {/* Nút Sáng/Tối */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 rounded-xl transition duration-150 active:scale-95"
              title={isDarkMode ? "Chuyển sang Chế độ sáng" : "Chuyển sang Chế độ tối"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* Nút Xuất Excel */}
            <button
              type="button"
              id="export-excel-btn"
              onClick={() => exportTasksToCSV(projects, tasks)}
              className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 px-3 py-2 rounded-xl transition duration-150 active:translate-y-px cursor-pointer"
              title="Xuất tất cả dữ liệu theo dõi và hiệu suất ra file Excel (.csv)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            {/* Công cụ dọn dẹp / khôi phục */}
            <button
              type="button"
              id="reset-mock-data-btn"
              onClick={handleResetData}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/40 px-3 py-2 rounded-xl transition duration-150 active:translate-y-px"
              title="Khôi phục dữ liệu mẫu ban đầu để kiểm tra Dashboard"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu mẫu</span>
            </button>
          </div>
        </div>

        {/* MENU TABS CHUYỂN ĐỔI */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-50 dark:border-slate-800/50">
          <nav className="flex gap-1 py-2" aria-label="Tabs">
            <button
              type="button"
              id="tab-dashboard-btn"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition duration-200 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/15'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Dashboard tổng quan</span>
            </button>

            <button
              type="button"
              id="tab-tasks-btn"
              onClick={() => setCurrentTab('tasks')}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition duration-200 cursor-pointer ${
                currentTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/15'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Theo dõi công việc</span>
            </button>
          </nav>
        </div>
      </header>

      {/* CONTAINER CHÍNH */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'tasks' ? (
          /* TRANG 1: THEO DÕI CÔNG VIỆC */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Cột trái: Form nhập công việc */}
            <div className="lg:col-span-4 space-y-4">
              <TaskForm 
                projects={projects}
                onAddTask={handleAddTask}
                onAddProject={handleAddProject}
              />
              
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/30 rounded-2xl p-4 text-xs text-indigo-800 dark:text-indigo-300 space-y-2 transition-colors duration-200">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Mẹo năng suất cho bạn</span>
                </div>
                <p className="leading-relaxed">
                  Thiết lập thời gian hoàn thành (Kế hoạch hoàn thành) thực tế. Khi kết quả đạt yêu cầu, hãy chọn <strong className="text-emerald-700">Đạt</strong>.
                  Với các việc bị trễ hoặc lỗi, hãy chọn <strong className="text-rose-700">Không đạt</strong> và phân tích kỹ nguyên nhân ở mục nhận xét để Dashboard tự động tổng hợp kinh nghiệm!
                </p>
              </div>
            </div>

            {/* Cột phải: Danh sách công việc */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* THANH LỌC VÀ TÌM KIẾM CÔNG VIỆC */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors duration-200">
                
                {/* Lọc theo Dự án */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
                  <select
                    id="filter-project-select"
                    className="flex-1 md:flex-initial rounded-lg border border-gray-200 dark:border-slate-800 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                    value={filterProjectId}
                    onChange={(e) => setFilterProjectId(e.target.value)}
                  >
                    <option value="">Tất cả Dự án</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tìm kiếm nhanh */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="search-task-input"
                    placeholder="Tìm việc hoặc tên dự án..."
                    className="w-full rounded-lg border border-gray-200 dark:border-slate-800 pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* KHU VỰC 1: NHÓM ĐANG THỰC HIỆN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base">
                      Đang Thực Hiện ({filteredActiveTasks.length})
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">Tự động tính thời gian còn lại</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredActiveTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const deadline = getRemainingTimeText(task.planEndTime);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-xs relative transition duration-150 hover:border-gray-300 dark:hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          deadline.isOverdue 
                            ? 'border-l-4 border-l-rose-500 border-rose-100 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/10' 
                            : 'border-l-4 border-l-indigo-500 border-gray-100 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-2 flex-1">
                          {/* Dự án name */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                              {project ? project.name : 'Dự án không xác định'}
                            </span>
                            
                            {/* Tags trễ hẹn hay còn hạn */}
                            {deadline.isOverdue ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-white bg-rose-600 px-2.5 py-0.5 rounded-full animate-pulse">
                                <Flame className="w-3 h-3 shrink-0" />
                                <span>TRỄ HẸN</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/70 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 shrink-0 text-indigo-500 dark:text-indigo-400" />
                                <span>{deadline.text}</span>
                              </span>
                            )}
                          </div>

                          {/* Nội dung công việc */}
                          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-relaxed">
                            {task.content}
                          </p>

                          {/* Chi tiết thời gian */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-slate-500">
                            <span>Bắt đầu: {formatReadableDateTime(task.startTime)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className={deadline.isOverdue ? 'text-rose-500 font-medium' : 'dark:text-slate-400'}>
                              Hạn chót: {formatReadableDateTime(task.planEndTime)}
                            </span>
                          </div>
                        </div>

                        {/* Nút hành động */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenCompleteModal(task.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition duration-150 flex items-center gap-1 active:translate-y-px cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Hoàn thành</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 rounded-lg transition duration-150 cursor-pointer"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredActiveTasks.length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 p-6">
                      <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">
                        {searchQuery || filterProjectId 
                          ? 'Không tìm thấy công việc nào phù hợp với bộ lọc.' 
                          : 'Hiện không có công việc nào đang chạy. Thêm việc mới ở bên trái!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* KHU VỰC 2: NHÓM ĐÃ HOÀN THÀNH */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base">
                      Đã Hoàn Thành ({filteredCompletedTasks.length})
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500">Đã đánh giá chất lượng</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredCompletedTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const isPassed = task.evaluation === 'Dat';
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-xs relative transition duration-150 flex flex-col justify-between gap-3 ${
                          isPassed 
                            ? 'border-l-4 border-l-emerald-500 border-gray-100 dark:border-slate-800' 
                            : 'border-l-4 border-l-rose-500 border-gray-100 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                                {project ? project.name : 'Dự án không xác định'}
                              </span>
                              
                              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                Hoàn thành lúc: {formatReadableDateTime(task.completedAt || '')}
                              </span>
                            </div>

                            {/* Tag Đạt hay Không đạt */}
                            {isPassed ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/30">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span>Đạt yêu cầu</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200/50 dark:border-rose-900/30">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                                <span>Không đạt</span>
                              </span>
                            )}
                          </div>

                          {/* Nội dung công việc */}
                          <p className="text-sm font-semibold text-gray-800 dark:text-slate-400 line-through decoration-gray-400 dark:decoration-slate-600 decoration-1">
                            {task.content}
                          </p>

                          {/* Bài học / Nhận xét */}
                          {task.remarks && (
                            <div className={`p-3 rounded-lg border text-xs leading-relaxed space-y-1 ${
                              isPassed 
                                ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20 text-gray-700 dark:text-slate-300' 
                                : 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/20 text-gray-700 dark:text-slate-300'
                            }`}>
                              <p className="font-bold text-[11px] text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                {isPassed ? 'Kinh nghiệm thành công:' : 'Bài học cần khắc phục:'}
                              </p>
                              <p className="italic text-gray-600 dark:text-slate-300">"{task.remarks}"</p>
                            </div>
                          )}

                          {/* Chi tiết thời gian hạn */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-50 dark:border-slate-800/50 text-[11px] text-gray-400 dark:text-slate-500">
                            <div className="flex gap-x-3 gap-y-1">
                              <span>Hạn: {formatReadableDateTime(task.planEndTime)}</span>
                              <span>•</span>
                              <span>Bắt đầu: {formatReadableDateTime(task.startTime)}</span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md transition duration-150 cursor-pointer"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {filteredCompletedTasks.length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800 p-6">
                      <p className="text-sm text-gray-400 dark:text-slate-500">
                        {searchQuery || filterProjectId 
                          ? 'Không tìm thấy công việc hoàn thành nào.' 
                          : 'Chưa có công việc hoàn thành nào. Hãy bấm hoàn thành việc đang chạy ở trên!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* TRANG 2: DASHBOARD TỔNG QUAN */
          <Dashboard 
            projects={projects} 
            tasks={tasks} 
          />
        )}

      </main>

      {/* POPUP/KHUNG ĐÁNH GIÁ HOÀN THÀNH */}
      <TaskEvaluationModal
        isOpen={completingTaskId !== null}
        taskContent={completingTask?.content || ''}
        onClose={() => setCompletingTaskId(null)}
        onSubmit={handleSaveCompletion}
      />

    </div>
  );
}
