export type ProjectStatus = 'active' | 'planning' | 'on_hold' | 'completed' | 'archived';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type IdeaStatus = 'idea' | 'planning' | 'building' | 'completed' | 'archived';
export type IdeaCategory = 'Business' | 'Content' | 'Design' | 'AI' | 'Technology' | 'Personal' | 'YLY' | 'Marketing' | 'Other';
export type InboxStatus = 'unprocessed' | 'processed' | 'archived';
export type ViewMode = 'dashboard' | 'tasks' | 'projects' | 'calendar' | 'ideas' | 'inbox' | 'notes' | 'analytics' | 'archive' | 'settings';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  start_date?: string;
  deadline?: string;
  progress: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date?: string | null;
  tags: string[];
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  user_id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface InboxItem {
  id: string;
  user_id: string;
  text: string;
  type: string;
  status: InboxStatus;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: 'project' | 'task' | 'idea' | 'note' | 'inbox';
  entity_id?: string | null;
  details: string;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  user_name: string;
  updated_at?: string;
}

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'error';
