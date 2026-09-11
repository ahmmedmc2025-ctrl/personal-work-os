import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Project,
  Task,
  Subtask,
  Idea,
  InboxItem,
  Note,
  ActivityLog,
  CloudSyncStatus,
  TaskStatus,
  IdeaCategory,
} from '../types';
import { getInitialSeedData } from '../data/seedData';
import confetti from 'canvas-confetti';

const STORAGE_KEY_PREFIX = 'work_os_data_';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function useWorkOSData() {
  const { user, isDemoUser } = useAuth();
  const userId = user?.id || 'demo-user-id-12345';
  const isRealUser = !isDemoUser && isSupabaseConfigured && Boolean(user?.id) && isValidUUID(userId);

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('synced');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Save to local cache key per user (Demo Mode or cache fallback)
  const saveLocalState = useCallback(
    (p: Project[], t: Task[], st: Subtask[], ides: Idea[], inb: InboxItem[], n: Note[]) => {
      if (!userId) return;
      const dataToSave = { projects: p, tasks: t, subtasks: st, ideas: ides, inboxItems: inb, notes: n };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(dataToSave));
    },
    [userId]
  );

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setSyncStatus('syncing');

    // 1. Explicit Demo Mode (no real Supabase auth session)
    if (!isRealUser) {
      const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProjects(parsed.projects || []);
          setTasks(parsed.tasks || []);
          setSubtasks(parsed.subtasks || []);
          setIdeas(parsed.ideas || []);
          setInboxItems(parsed.inboxItems || []);
          setNotes(parsed.notes || []);
        } catch {
          const seeded = getInitialSeedData(userId);
          setProjects(seeded.projects);
          setTasks(seeded.tasks);
          setSubtasks(seeded.subtasks);
          setIdeas(seeded.ideas);
          setInboxItems(seeded.inboxItems);
          setNotes(seeded.notes);
          saveLocalState(seeded.projects, seeded.tasks, seeded.subtasks, seeded.ideas, seeded.inboxItems, seeded.notes);
        }
      } else {
        const seeded = getInitialSeedData(userId);
        setProjects(seeded.projects);
        setTasks(seeded.tasks);
        setSubtasks(seeded.subtasks);
        setIdeas(seeded.ideas);
        setInboxItems(seeded.inboxItems);
        setNotes(seeded.notes);
        saveLocalState(seeded.projects, seeded.tasks, seeded.subtasks, seeded.ideas, seeded.inboxItems, seeded.notes);
      }
      setLoading(false);
      setSyncStatus('synced');
      return;
    }

    // 2. Real Authenticated Supabase Cloud Fetching
    try {
      const [pRes, tRes, stRes, iRes, inRes, nRes, aRes] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('subtasks').select('*').eq('user_id', userId),
        supabase.from('ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('inbox_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      ]);

      const loadedP = (pRes.data as Project[]) || [];
      const loadedT = (tRes.data as Task[]) || [];
      const loadedSt = (stRes.data as Subtask[]) || [];
      const loadedI = (iRes.data as Idea[]) || [];
      const loadedIn = (inRes.data as InboxItem[]) || [];
      const loadedN = (nRes.data as Note[]) || [];
      const loadedA = (aRes.data as ActivityLog[]) || [];

      // NO AUTOMATIC CLOUD SEEDING! An empty database remains empty.
      setProjects(loadedP);
      setTasks(loadedT);
      setSubtasks(loadedSt);
      setIdeas(loadedI);
      setInboxItems(loadedIn);
      setNotes(loadedN);
      setActivityLogs(loadedA);

      setSyncStatus('synced');
    } catch (err) {
      console.error('Cloud sync fetch error:', err);
      setSyncStatus('error');
      showToast('Error loading cloud data', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, isRealUser, saveLocalState, showToast]);

  // Realtime Supabase Subscription for Cross-Device Sync
  useEffect(() => {
    fetchData();

    if (!isRealUser) return;

    const channel = supabase
      .channel('work_os_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', filter: `user_id=eq.${userId}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isRealUser, fetchData]);

  // Log activity
  const logActivity = async (action: string, entity_type: ActivityLog['entity_type'], entity_id?: string, details: string = '') => {
    const log: ActivityLog = {
      id: 'log-' + Date.now(),
      user_id: userId,
      action,
      entity_type,
      entity_id,
      details,
      created_at: new Date().toISOString(),
    };
    setActivityLogs(prev => [log, ...prev.slice(0, 19)]);

    if (isRealUser) {
      await supabase.from('activity_logs').insert(log);
    }
  };

  // Recalculate project progress based on tasks
  const updateProjectProgress = useCallback((projId: string, updatedTasks: Task[]) => {
    const projTasks = updatedTasks.filter(t => t.project_id === projId && t.status !== 'backlog');
    if (projTasks.length === 0) return;
    const completedCount = projTasks.filter(t => t.status === 'done').length;
    const newProgress = Math.round((completedCount / projTasks.length) * 100);

    setProjects(prev =>
      prev.map(p => (p.id === projId ? { ...p, progress: newProgress, updated_at: new Date().toISOString() } : p))
    );

    if (isRealUser) {
      supabase.from('projects').update({ progress: newProgress, updated_at: new Date().toISOString() }).eq('id', projId);
    }
  }, [isRealUser]);

  // ===================== PROJECT CRUD =====================
  const createProject = async (data: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress'>) => {
    const tempProj: Project = {
      ...data,
      id: 'proj-' + Date.now(),
      user_id: userId,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Project;

    showToast(`Project "${data.name}" created`);
    logActivity('Created project', 'project', undefined, data.name);

    if (isRealUser) {
      const { data: inserted, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          status: data.status,
          priority: data.priority,
          start_date: data.start_date,
          deadline: data.deadline,
          progress: 0,
          tags: data.tags,
        })
        .select()
        .single();

      if (error) {
        showToast('Failed to sync project to cloud', 'error');
      } else if (inserted) {
        setProjects(prev => [inserted as Project, ...prev]);
      }
    } else {
      const nextP = [tempProj, ...projects];
      setProjects(nextP);
      saveLocalState(nextP, tasks, subtasks, ideas, inboxItems, notes);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const nextP = projects.map(p => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    setProjects(nextP);
    showToast('Project updated');

    if (isRealUser) {
      await supabase.from('projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      saveLocalState(nextP, tasks, subtasks, ideas, inboxItems, notes);
    }
  };

  const deleteProject = async (id: string) => {
    const projName = projects.find(p => p.id === id)?.name || 'Project';
    const nextP = projects.filter(p => p.id !== id);
    const nextT = tasks.filter(t => t.project_id !== id);
    setProjects(nextP);
    setTasks(nextT);
    showToast(`Deleted "${projName}"`);
    logActivity('Deleted project', 'project', id, projName);

    if (isRealUser) {
      await supabase.from('projects').delete().eq('id', id);
    } else {
      saveLocalState(nextP, nextT, subtasks, ideas, inboxItems, notes);
    }
  };

  const archiveProject = async (id: string) => {
    await updateProject(id, { status: 'archived' });
    showToast('Project moved to Archive');
  };

  // ===================== TASK CRUD =====================
  const createTask = async (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>, initialSubtasks: string[] = []) => {
    showToast(`Task "${data.title}" created`);
    logActivity('Created task', 'task', undefined, data.title);

    if (isRealUser) {
      const { data: insertedTask, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          project_id: data.project_id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date,
          tags: data.tags,
          completed_at: data.status === 'done' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        showToast('Cloud task save failed', 'error');
      } else if (insertedTask) {
        const newTask = insertedTask as Task;
        setTasks(prev => [newTask, ...prev]);

        if (initialSubtasks.length > 0) {
          const subsToInsert = initialSubtasks.map(title => ({
            user_id: userId,
            task_id: newTask.id,
            title,
            completed: false,
          }));
          const { data: insertedSubs } = await supabase.from('subtasks').insert(subsToInsert).select();
          if (insertedSubs) setSubtasks(prev => [...prev, ...(insertedSubs as Subtask[])]);
        }
      }
    } else {
      const newTask: Task = {
        ...data,
        id: 'task-' + Date.now(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: data.status === 'done' ? new Date().toISOString() : null,
      };
      const nextT = [newTask, ...tasks];
      setTasks(nextT);

      const createdSubs: Subtask[] = initialSubtasks.map((title, i) => ({
        id: `sub-${Date.now()}-${i}`,
        user_id: userId,
        task_id: newTask.id,
        title,
        completed: false,
        created_at: new Date().toISOString(),
      }));
      const nextSt = [...subtasks, ...createdSubs];
      setSubtasks(nextSt);
      saveLocalState(projects, nextT, nextSt, ideas, inboxItems, notes);
      if (newTask.project_id) updateProjectProgress(newTask.project_id, nextT);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const nextT = tasks.map(t => {
      if (t.id === id) {
        const isNowDone = updates.status === 'done';
        const wasDone = t.status === 'done';
        return {
          ...t,
          ...updates,
          completed_at: isNowDone && !wasDone ? new Date().toISOString() : !isNowDone ? null : t.completed_at,
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });

    const updated = nextT.find(t => t.id === id);
    if (updated && updates.status === 'done') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }

    setTasks(nextT);
    if (updated?.project_id) updateProjectProgress(updated.project_id, nextT);
    showToast('Task updated');

    if (isRealUser) {
      await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      saveLocalState(projects, nextT, subtasks, ideas, inboxItems, notes);
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isCompleted = task.status === 'done';
    const newStatus: TaskStatus = isCompleted ? 'todo' : 'done';

    if (!isCompleted) {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }

    await updateTask(id, { status: newStatus });
    logActivity(isCompleted ? 'Reopened task' : 'Completed task', 'task', id, task.title);
  };

  const moveTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const deleteTask = async (id: string) => {
    const taskTitle = tasks.find(t => t.id === id)?.title || 'Task';
    const nextT = tasks.filter(t => t.id !== id);
    const nextSt = subtasks.filter(st => st.task_id !== id);
    setTasks(nextT);
    setSubtasks(nextSt);
    showToast(`Deleted task "${taskTitle}"`);
    logActivity('Deleted task', 'task', id, taskTitle);

    if (isRealUser) {
      await supabase.from('tasks').delete().eq('id', id);
    } else {
      saveLocalState(projects, nextT, nextSt, ideas, inboxItems, notes);
    }
  };

  // ===================== SUBTASK CRUD =====================
  const createSubtask = async (taskId: string, title: string) => {
    if (isRealUser) {
      const { data: inserted } = await supabase
        .from('subtasks')
        .insert({ user_id: userId, task_id: taskId, title, completed: false })
        .select()
        .single();
      if (inserted) setSubtasks(prev => [...prev, inserted as Subtask]);
    } else {
      const newSub: Subtask = {
        id: 'sub-' + Date.now(),
        user_id: userId,
        task_id: taskId,
        title,
        completed: false,
        created_at: new Date().toISOString(),
      };
      const nextSt = [...subtasks, newSub];
      setSubtasks(nextSt);
      saveLocalState(projects, tasks, nextSt, ideas, inboxItems, notes);
    }
  };

  const toggleSubtask = async (id: string) => {
    const nextSt = subtasks.map(st => (st.id === id ? { ...st, completed: !st.completed } : st));
    setSubtasks(nextSt);

    const sub = subtasks.find(s => s.id === id);
    if (isRealUser && sub) {
      await supabase.from('subtasks').update({ completed: !sub.completed }).eq('id', id);
    } else {
      saveLocalState(projects, tasks, nextSt, ideas, inboxItems, notes);
    }
  };

  const deleteSubtask = async (id: string) => {
    const nextSt = subtasks.filter(st => st.id !== id);
    setSubtasks(nextSt);

    if (isRealUser) {
      await supabase.from('subtasks').delete().eq('id', id);
    } else {
      saveLocalState(projects, tasks, nextSt, ideas, inboxItems, notes);
    }
  };

  // ===================== IDEAS CRUD =====================
  const createIdea = async (data: Omit<Idea, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    showToast(`Idea "${data.title}" saved`);
    logActivity('Created idea', 'idea', undefined, data.title);

    if (isRealUser) {
      const { data: inserted } = await supabase
        .from('ideas')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
          tags: data.tags,
        })
        .select()
        .single();
      if (inserted) setIdeas(prev => [inserted as Idea, ...prev]);
    } else {
      const newIdea: Idea = {
        ...data,
        id: 'idea-' + Date.now(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const nextI = [newIdea, ...ideas];
      setIdeas(nextI);
      saveLocalState(projects, tasks, subtasks, nextI, inboxItems, notes);
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    const nextI = ideas.map(i => (i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i));
    setIdeas(nextI);
    showToast('Idea updated');

    if (isRealUser) {
      await supabase.from('ideas').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      saveLocalState(projects, tasks, subtasks, nextI, inboxItems, notes);
    }
  };

  const deleteIdea = async (id: string) => {
    const nextI = ideas.filter(i => i.id !== id);
    setIdeas(nextI);
    showToast('Idea removed');

    if (isRealUser) {
      await supabase.from('ideas').delete().eq('id', id);
    } else {
      saveLocalState(projects, tasks, subtasks, nextI, inboxItems, notes);
    }
  };

  const convertIdeaToProject = async (ideaId: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    await createProject({
      name: idea.title,
      description: idea.description,
      status: 'active',
      priority: 'medium',
      tags: [...idea.tags, idea.category],
    });

    await updateIdea(ideaId, { status: 'building' });
    showToast(`Converted idea "${idea.title}" into an Active Project!`);
  };

  const convertIdeaToTask = async (ideaId: string, projectId?: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    await createTask({
      title: idea.title,
      description: idea.description,
      status: 'todo',
      priority: 'medium',
      project_id: projectId || null,
      tags: idea.tags,
    });

    await updateIdea(ideaId, { status: 'planning' });
    showToast(`Converted idea "${idea.title}" into a Task!`);
  };

  // ===================== INBOX CRUD =====================
  const createInboxItem = async (text: string, type: string = 'quick_note') => {
    showToast('Captured into Inbox');

    if (isRealUser) {
      const { data: inserted } = await supabase
        .from('inbox_items')
        .insert({ user_id: userId, text, type, status: 'unprocessed' })
        .select()
        .single();
      if (inserted) setInboxItems(prev => [inserted as InboxItem, ...prev]);
    } else {
      const newItem: InboxItem = {
        id: 'inbox-' + Date.now(),
        user_id: userId,
        text,
        type,
        status: 'unprocessed',
        created_at: new Date().toISOString(),
      };
      const nextIn = [newItem, ...inboxItems];
      setInboxItems(nextIn);
      saveLocalState(projects, tasks, subtasks, ideas, nextIn, notes);
    }
  };

  const deleteInboxItem = async (id: string) => {
    const nextIn = inboxItems.filter(i => i.id !== id);
    setInboxItems(nextIn);

    if (isRealUser) {
      await supabase.from('inbox_items').delete().eq('id', id);
    } else {
      saveLocalState(projects, tasks, subtasks, ideas, nextIn, notes);
    }
  };

  const convertInboxToTask = async (inboxId: string, projectId?: string) => {
    const item = inboxItems.find(i => i.id === inboxId);
    if (!item) return;
    await createTask({
      title: item.text,
      description: 'Captured from Inbox',
      status: 'todo',
      priority: 'medium',
      project_id: projectId || null,
      tags: ['Inbox'],
    });
    await deleteInboxItem(inboxId);
    showToast('Inbox item converted to Task');
  };

  const convertInboxToIdea = async (inboxId: string, category: IdeaCategory = 'Personal') => {
    const item = inboxItems.find(i => i.id === inboxId);
    if (!item) return;
    await createIdea({
      title: item.text,
      description: 'Captured from Inbox',
      category,
      status: 'idea',
      tags: ['Inbox'],
    });
    await deleteInboxItem(inboxId);
    showToast('Inbox item converted to Idea');
  };

  const convertInboxToProject = async (inboxId: string) => {
    const item = inboxItems.find(i => i.id === inboxId);
    if (!item) return;
    await createProject({
      name: item.text,
      description: 'Created from Inbox capture',
      status: 'active',
      priority: 'medium',
      tags: ['Inbox'],
    });
    await deleteInboxItem(inboxId);
    showToast('Inbox item converted to Project');
  };

  // ===================== NOTES CRUD =====================
  const createNote = async (data: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    showToast(`Note "${data.title}" saved`);

    if (isRealUser) {
      const { data: inserted } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          project_id: data.project_id,
          title: data.title,
          content: data.content,
          tags: data.tags,
        })
        .select()
        .single();
      if (inserted) setNotes(prev => [inserted as Note, ...prev]);
    } else {
      const newNote: Note = {
        ...data,
        id: 'note-' + Date.now(),
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const nextN = [newNote, ...notes];
      setNotes(nextN);
      saveLocalState(projects, tasks, subtasks, ideas, inboxItems, nextN);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const nextN = notes.map(n => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n));
    setNotes(nextN);
    showToast('Note updated');

    if (isRealUser) {
      await supabase.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      saveLocalState(projects, tasks, subtasks, ideas, inboxItems, nextN);
    }
  };

  const deleteNote = async (id: string) => {
    const nextN = notes.filter(n => n.id !== id);
    setNotes(nextN);
    showToast('Note deleted');

    if (isRealUser) {
      await supabase.from('notes').delete().eq('id', id);
    } else {
      saveLocalState(projects, tasks, subtasks, ideas, inboxItems, nextN);
    }
  };

  // ===================== BACKUP & SEED RESET =====================
  const exportDataAsJSON = () => {
    const exportObj = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      user_id: userId,
      projects,
      tasks,
      subtasks,
      ideas,
      inboxItems,
      notes,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work_os_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded');
  };

  const importDataFromJSON = async (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.projects || !parsed.tasks) {
        throw new Error('Invalid JSON format');
      }

      setProjects(parsed.projects || []);
      setTasks(parsed.tasks || []);
      setSubtasks(parsed.subtasks || []);
      setIdeas(parsed.ideas || []);
      setInboxItems(parsed.inboxItems || []);
      setNotes(parsed.notes || []);

      if (isRealUser) {
        // Bulk sync imported items to Supabase assigned to current user
        await Promise.all([
          supabase.from('projects').insert((parsed.projects || []).map((p: any) => ({ ...p, user_id: userId }))),
          supabase.from('tasks').insert((parsed.tasks || []).map((t: any) => ({ ...t, user_id: userId }))),
          supabase.from('subtasks').insert((parsed.subtasks || []).map((st: any) => ({ ...st, user_id: userId }))),
          supabase.from('ideas').insert((parsed.ideas || []).map((i: any) => ({ ...i, user_id: userId }))),
          supabase.from('inbox_items').insert((parsed.inboxItems || []).map((inb: any) => ({ ...inb, user_id: userId }))),
          supabase.from('notes').insert((parsed.notes || []).map((n: any) => ({ ...n, user_id: userId }))),
        ]);
      } else {
        saveLocalState(
          parsed.projects || [],
          parsed.tasks || [],
          parsed.subtasks || [],
          parsed.ideas || [],
          parsed.inboxItems || [],
          parsed.notes || []
        );
      }

      showToast('Data imported successfully');
    } catch (err) {
      showToast('Failed to import JSON: Invalid file structure', 'error');
    }
  };

  // EXPLICIT Manual Action Only: Re-seed Database with sample data
  const seedDataReset = async () => {
    const seeded = getInitialSeedData(userId);
    setProjects(seeded.projects);
    setTasks(seeded.tasks);
    setSubtasks(seeded.subtasks);
    setIdeas(seeded.ideas);
    setInboxItems(seeded.inboxItems);
    setNotes(seeded.notes);

    if (isRealUser) {
      await Promise.all([
        supabase.from('projects').delete().eq('user_id', userId),
        supabase.from('tasks').delete().eq('user_id', userId),
        supabase.from('subtasks').delete().eq('user_id', userId),
        supabase.from('ideas').delete().eq('user_id', userId),
        supabase.from('inbox_items').delete().eq('user_id', userId),
        supabase.from('notes').delete().eq('user_id', userId),
      ]);
      await Promise.all([
        supabase.from('projects').insert(seeded.projects),
        supabase.from('tasks').insert(seeded.tasks),
        supabase.from('subtasks').insert(seeded.subtasks),
        supabase.from('ideas').insert(seeded.ideas),
        supabase.from('inbox_items').insert(seeded.inboxItems),
        supabase.from('notes').insert(seeded.notes),
      ]);
    } else {
      saveLocalState(seeded.projects, seeded.tasks, seeded.subtasks, seeded.ideas, seeded.inboxItems, seeded.notes);
    }
    showToast('Database reset to fresh sample data');
  };

  return {
    projects,
    tasks,
    subtasks,
    ideas,
    inboxItems,
    notes,
    activityLogs,
    loading,
    syncStatus,
    toastMessage,
    showToast,
    // Project operations
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    // Task operations
    createTask,
    updateTask,
    toggleTaskComplete,
    moveTaskStatus,
    deleteTask,
    // Subtask operations
    createSubtask,
    toggleSubtask,
    deleteSubtask,
    // Idea operations
    createIdea,
    updateIdea,
    deleteIdea,
    convertIdeaToProject,
    convertIdeaToTask,
    // Inbox operations
    createInboxItem,
    deleteInboxItem,
    convertInboxToTask,
    convertInboxToIdea,
    convertInboxToProject,
    // Note operations
    createNote,
    updateNote,
    deleteNote,
    // Backup & Reset
    exportDataAsJSON,
    importDataFromJSON,
    seedDataReset,
    refreshData: fetchData,
  };
}
