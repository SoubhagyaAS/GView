export interface ProjectItem {
  id: string;
  name: string;
  type: 'phase' | 'milestone' | 'task';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  progress: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  blockers: string[];
  approval: 'pending' | 'approved' | 'rejected' | 'not-required';
  dependencies: string[];
  parentId?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  search: string;
  type: string[];
  status: string[];
  priority: string[];
  assignee: string[];
  approval: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface TimelineConfig {
  startDate: Date;
  endDate: Date;
  scale: 'days' | 'weeks' | 'months';
  zoom: number;
}