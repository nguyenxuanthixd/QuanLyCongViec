/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Task } from './types';

/**
 * Định dạng đối tượng Date thành định dạng yêu cầu của input datetime-local (YYYY-MM-DDTHH:mm)
 */
export function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Định dạng chuỗi ISO sang hiển thị tiếng Việt thân thiện (ví dụ: 14:30 - 24/06/2026)
 */
export function formatReadableDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ngày ${day}/${month}/${year}`;
}

/**
 * Tính toán thời gian còn lại đến hạn hoàn thành và kiểm tra xem có trễ hẹn hay không.
 */
export function getRemainingTimeText(planEndTimeStr: string): { text: string; isOverdue: boolean } {
  const diff = new Date(planEndTimeStr).getTime() - Date.now();

  if (diff <= 0) {
    return { text: 'TRỄ HẸN', isOverdue: true };
  }

  const minutesTotal = Math.floor(diff / (60 * 1000));
  const hoursTotal = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days > 0) {
    const remainingHours = hoursTotal % 24;
    return {
      text: `Còn ${days} ngày${remainingHours > 0 ? ` ${remainingHours} giờ` : ''}`,
      isOverdue: false,
    };
  }

  if (hoursTotal > 0) {
    const remainingMinutes = minutesTotal % 60;
    return {
      text: `Còn ${hoursTotal} giờ${remainingMinutes > 0 ? ` ${remainingMinutes} phút` : ''}`,
      isOverdue: false,
    };
  }

  return {
    text: `Còn ${minutesTotal > 0 ? minutesTotal : 1} phút`,
    isOverdue: false,
  };
}

/**
 * Tạo danh sách dự án mẫu
 */
export function getMockProjects(): Project[] {
  const nowMs = Date.now();
  return [
    {
      id: 'proj-1',
      name: 'Gói thầu XL-01: Thi công xây lắp Nhà kỹ thuật cao - Bệnh viện Đa khoa Tỉnh',
      createdAt: new Date(nowMs - 15 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'proj-2',
      name: 'Gói thầu TB-05: Cung cấp & lắp đặt hệ thống Phòng cháy chữa cháy - Trụ sở EVN',
      createdAt: new Date(nowMs - 12 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'proj-3',
      name: 'Gói thầu TV-03: Tư vấn giám sát thi công xây dựng Cầu vượt nút giao An Phú',
      createdAt: new Date(nowMs - 10 * 24 * 3600 * 1000).toISOString(),
    },
  ];
}

/**
 * Tạo danh sách công việc mẫu đa dạng trạng thái
 */
export function getMockTasks(): Task[] {
  const nowMs = Date.now();

  return [
    {
      id: 'task-1',
      projectId: 'proj-1',
      content: 'Nghiên cứu kỹ Hồ sơ mời thầu (HSMT), làm rõ các tiêu chuẩn đánh giá về mặt Kỹ thuật & Tài chính',
      startTime: new Date(nowMs - 2 * 24 * 3600 * 1000).toISOString(),
      planEndTime: new Date(nowMs + 3 * 24 * 3600 * 1000).toISOString(), // Còn hạn
      isCompleted: false,
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      content: 'Bóc tách chi tiết khối lượng phần kết cấu móng và lập bảng dự toán chi phí chi tiết theo đơn giá định mức',
      startTime: new Date(nowMs - 5 * 24 * 3600 * 1000).toISOString(),
      planEndTime: new Date(nowMs - 1 * 24 * 3600 * 1000).toISOString(), // Trễ hạn (đã trễ 1 ngày)
      isCompleted: false,
    },
    {
      id: 'task-3',
      projectId: 'proj-2',
      content: 'Lập thuyết minh biện pháp tổ chức thi công PCCC, biểu đồ nhân lực và sơ đồ tiến độ thi công tổng thể',
      startTime: new Date(nowMs - 6 * 24 * 3600 * 1000).toISOString(),
      planEndTime: new Date(nowMs - 3 * 24 * 3600 * 1000).toISOString(),
      isCompleted: true,
      completedAt: new Date(nowMs - 4 * 24 * 3600 * 1000).toISOString(), // Hoàn thành đúng hạn
      evaluation: 'Dat',
      remarks: 'Biện pháp thi công trình bày trực quan bằng bản vẽ 3D cụ thể, tổ chuyên gia của Chủ đầu tư đánh giá rất cao và chấm điểm kỹ thuật tối đa.',
    },
    {
      id: 'task-4',
      projectId: 'proj-2',
      content: 'Làm việc với Ngân hàng BIDV để phát hành Thư bảo lãnh dự thầu trị giá 250 triệu đồng theo đúng mẫu HSMT',
      startTime: new Date(nowMs - 8 * 24 * 3600 * 1000).toISOString(),
      planEndTime: new Date(nowMs - 5 * 24 * 3600 * 1000).toISOString(),
      isCompleted: true,
      completedAt: new Date(nowMs - 4 * 24 * 3600 * 1000).toISOString(), // Hoàn thành trễ hạn 1 ngày
      evaluation: 'KhongDat',
      remarks: 'Ngân hàng yêu cầu bổ sung báo cáo kiểm toán tài chính đột xuất dẫn đến thư bảo lãnh ra muộn 1 ngày so với tiến độ nội bộ. May mắn vẫn kịp thời hạn nộp thầu chính thức. Cần liên hệ ngân hàng chuẩn bị hồ sơ trước 5 ngày cho các gói sau.',
    },
    {
      id: 'task-5',
      projectId: 'proj-3',
      content: 'Soạn thảo Hồ sơ năng lực pháp lý, tập hợp bằng cấp nhân sự chủ chốt (chỉ huy trưởng, kỹ sư an toàn) và các hợp đồng tương tự',
      startTime: new Date(nowMs - 1 * 24 * 3600 * 1000).toISOString(),
      planEndTime: new Date(nowMs + 2 * 24 * 3600 * 1000).toISOString(), // Còn hạn
      isCompleted: false,
    },
    {
      id: 'task-6',
      projectId: 'proj-3',
      content: 'Kiểm tra toàn bộ tính pháp lý của hồ sơ, ký số số liệu tài chính và thực hiện nộp Hồ sơ đề xuất trên Hệ thống mạng đấu thầu quốc gia',
      startTime: new Date(nowMs - 7 * 24 * 3600 * 1000).toISOString(),
      planEndTime: new Date(nowMs - 6 * 24 * 3600 * 1000).toISOString(),
      isCompleted: true,
      completedAt: new Date(nowMs - 7 * 24 * 3600 * 1000).toISOString(), // Hoàn thành đúng hạn
      evaluation: 'Dat',
      remarks: 'Nộp thầu thành công trước giờ đóng thầu 3 tiếng. Toàn bộ file đính kèm PDF đã tối ưu dung lượng tốt, hệ thống mạng đấu thầu phản hồi biên nhận nhanh chóng.',
    },
  ];
}

/**
 * Xuất dữ liệu công việc và dự án thành file CSV mã hóa UTF-8 với BOM để mở trực tiếp trong Excel không bị lỗi phông chữ tiếng Việt
 */
export function exportTasksToCSV(projects: Project[], tasks: Task[]) {
  const headers = [
    'Mã công việc',
    'Tên Dự án',
    'Nội dung công việc',
    'Thời gian bắt đầu',
    'Hạn chót kế hoạch',
    'Trạng thái',
    'Thời gian thực tế hoàn thành',
    'Kết quả đánh giá',
    'Nhận xét / Bài học rút ra'
  ];

  const rows = tasks.map(task => {
    const project = projects.find(p => p.id === task.projectId);
    const projectName = project ? project.name : 'Không xác định';

    let statusText = 'Đang thực hiện';
    if (task.isCompleted) {
      statusText = 'Đã hoàn thành';
    } else {
      const isOverdue = new Date(task.planEndTime).getTime() < Date.now();
      if (isOverdue) {
        statusText = 'Trễ hạn';
      }
    }

    const evalText = task.isCompleted
      ? (task.evaluation === 'Dat' ? 'Đạt yêu cầu' : 'Không đạt')
      : 'Chưa đánh giá';

    return [
      task.id,
      projectName,
      task.content,
      formatReadableDateTime(task.startTime),
      formatReadableDateTime(task.planEndTime),
      statusText,
      task.completedAt ? formatReadableDateTime(task.completedAt) : '',
      evalText,
      task.remarks || ''
    ];
  });

  // Escape double quotes and join by comma
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  // Prepend UTF-8 BOM
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Format file name with current date
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  
  link.href = url;
  link.setAttribute('download', `bao_cao_theo_doi_va_hieu_suat_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

