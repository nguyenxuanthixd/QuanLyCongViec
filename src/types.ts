/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export type EvaluationType = 'Dat' | 'KhongDat';

export interface Task {
  id: string;
  projectId: string;
  content: string;
  startTime: string; // ISO DateTime string
  planEndTime: string; // ISO DateTime string
  isCompleted: boolean;
  completedAt?: string; // ISO DateTime string
  evaluation?: EvaluationType; // "Đạt" or "Không đạt"
  remarks?: string; // Nhận xét / bài học
}
