import { Project, Task, Subtask, Idea, InboxItem, Note } from '../types';

export const getInitialSeedData = (userId: string) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const p1Id = 'proj-yly-season-8';
  const p2Id = 'proj-media-craft';
  const p3Id = 'proj-ai-automation';
  const p4Id = 'proj-portfolio';

  const projects: Project[] = [
    {
      id: p1Id,
      user_id: userId,
      name: 'YLY Season 8',
      description: 'Major campaign organizing and event management for Youth Leadership Year Season 8.',
      status: 'active',
      priority: 'high',
      start_date: '2026-09-01',
      deadline: nextWeekStr,
      progress: 75,
      tags: ['YLY', 'Event', 'Leadership'],
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: p2Id,
      user_id: userId,
      name: 'Media Craft Dashboard',
      description: 'SaaS dashboard client portal and agency operational management platform.',
      status: 'active',
      priority: 'urgent',
      start_date: '2026-08-15',
      deadline: nextWeekStr,
      progress: 60,
      tags: ['Agency', 'SaaS', 'React'],
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: p3Id,
      user_id: userId,
      name: 'AI Automation Workflow',
      description: 'Building automated content pipelines using Deepmind AI API and Webhooks.',
      status: 'planning',
      priority: 'high',
      start_date: '2026-09-10',
      deadline: '2026-10-30',
      progress: 25,
      tags: ['AI', 'Python', 'Automation'],
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: p4Id,
      user_id: userId,
      name: 'Personal Portfolio Upgrade',
      description: 'Redesigning 3D interactive portfolio showcase with Tailwind and Three.js.',
      status: 'active',
      priority: 'medium',
      start_date: '2026-09-05',
      deadline: '2026-10-15',
      progress: 40,
      tags: ['Design', 'Personal', 'Frontend'],
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task-1',
      user_id: userId,
      project_id: p1Id,
      title: 'Finish campaign design for Season 8',
      description: 'Prepare visual direction, social media posters, and hero headers.',
      status: 'in_progress',
      priority: 'urgent',
      due_date: todayStr,
      tags: ['Design', 'YLY'],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-2',
      user_id: userId,
      project_id: p1Id,
      title: 'Edit presentation deck for sponsors',
      description: 'Review key metrics, audience reach, and slide 12 graphics.',
      status: 'todo',
      priority: 'high',
      due_date: todayStr,
      tags: ['Presentation', 'YLY'],
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-3',
      user_id: userId,
      project_id: p2Id,
      title: 'Prepare video reel preview',
      description: 'Render final 60-second agency sizzle reel for Media Craft homepage.',
      status: 'todo',
      priority: 'high',
      due_date: todayStr,
      tags: ['Video', 'MediaCraft'],
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-4',
      user_id: userId,
      project_id: p1Id,
      title: 'Send hall request form to venue manager',
      description: 'Confirm audio/visual setup and 500 seating arrangement.',
      status: 'done',
      priority: 'medium',
      due_date: todayStr,
      tags: ['Logistics'],
      completed_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-5',
      user_id: userId,
      project_id: p2Id,
      title: 'Review project report and analytics',
      description: 'Analyze weekly sprint completion rate and team output velocity.',
      status: 'todo',
      priority: 'medium',
      due_date: todayStr,
      tags: ['Analytics'],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-6',
      user_id: userId,
      project_id: p3Id,
      title: 'Research automation webhooks integration',
      description: 'Evaluate Supabase Database Webhooks vs direct API endpoints.',
      status: 'backlog',
      priority: 'low',
      due_date: yesterdayStr, // Overdue
      tags: ['AI', 'Research'],
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-7',
      user_id: userId,
      project_id: p4Id,
      title: 'Build interactive landing hero',
      description: 'Implement glassmorphism cards and smooth particle hover micro-interactions.',
      status: 'in_progress',
      priority: 'high',
      due_date: tomorrowStr,
      tags: ['Frontend', 'UI'],
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-8',
      user_id: userId,
      project_id: p2Id,
      title: 'Setup Supabase Row Level Security Policies',
      description: 'Lock down projects, tasks, and ideas tables per user ID.',
      status: 'done',
      priority: 'urgent',
      due_date: yesterdayStr,
      completed_at: yesterdayStr,
      tags: ['Database', 'Security'],
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const subtasks: Subtask[] = [
    { id: 'sub-1', user_id: userId, task_id: 'task-1', title: 'Define campaign concept & color palette', completed: true, created_at: new Date().toISOString() },
    { id: 'sub-2', user_id: userId, task_id: 'task-1', title: 'Prepare visual direction mockups', completed: true, created_at: new Date().toISOString() },
    { id: 'sub-3', user_id: userId, task_id: 'task-1', title: 'Create Instagram posts & stories templates', completed: false, created_at: new Date().toISOString() },
    { id: 'sub-4', user_id: userId, task_id: 'task-1', title: 'Final review with leadership', completed: false, created_at: new Date().toISOString() },
    { id: 'sub-5', user_id: userId, task_id: 'task-2', title: 'Draft executive summary slide', completed: true, created_at: new Date().toISOString() },
    { id: 'sub-6', user_id: userId, task_id: 'task-2', title: 'Add budget allocation breakdown chart', completed: false, created_at: new Date().toISOString() },
  ];

  const ideas: Idea[] = [
    {
      id: 'idea-1',
      user_id: userId,
      title: 'AI Content Automation Workflow',
      description: 'Build an automated content generator that ingests voice notes and outputs formatted LinkedIn & X posts.',
      category: 'AI',
      status: 'planning',
      tags: ['AI', 'Automation', 'Content'],
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'idea-2',
      user_id: userId,
      title: 'Micro SaaS Productivity Work OS',
      description: 'Self-hosted modular command center with Supabase sync for digital creators and engineers.',
      category: 'Technology',
      status: 'building',
      tags: ['SaaS', 'Productivity', 'React'],
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'idea-3',
      user_id: userId,
      title: 'Short Video Reel Masterclass Format',
      description: '30-second rapid tech tips with clean motion graphics and high-retention editing style.',
      category: 'Content',
      status: 'idea',
      tags: ['Video', 'Marketing'],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const inboxItems: InboxItem[] = [
    { id: 'inbox-1', user_id: userId, text: 'Idea for a new reel on Supabase real-time sync speed', type: 'idea', status: 'unprocessed', created_at: new Date().toISOString() },
    { id: 'inbox-2', user_id: userId, text: 'Contact venue manager for hall reservation receipt', type: 'task', status: 'unprocessed', created_at: new Date().toISOString() },
    { id: 'inbox-3', user_id: userId, text: 'Research MBA scholarship deadlines for 2027 intake', type: 'note', status: 'unprocessed', created_at: new Date().toISOString() },
  ];

  const notes: Note[] = [
    {
      id: 'note-1',
      user_id: userId,
      project_id: p1Id,
      title: 'YLY Season 8 Core Objectives & Timeline',
      content: '# Season 8 Strategy\n\n1. Target reach: 10,000+ applicants\n2. Keynote speakers confirmed: Dr. Sarah & Tech Lead Omar\n3. Launch date target: September 30\n\n### Deliverables\n- Social media campaign\n- Venue booking\n- Logistics sponsor alignment',
      tags: ['YLY', 'Strategy'],
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'note-2',
      user_id: userId,
      project_id: p2Id,
      title: 'Media Craft SaaS UI Design Tokens',
      content: 'Primary Color: `#1034A8` (Deep Blue)\nAccent: `#FE8F01` (Orange)\nBackground: `#F7F8FA` (Light neutral)\nTypography: Inter / System Sans-serif\n\nKeep all cards rounded with soft subtle box shadows.',
      tags: ['Design', 'Tokens'],
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return { projects, tasks, subtasks, ideas, inboxItems, notes };
};
