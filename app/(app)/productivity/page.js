'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Input, Textarea } from '@/components/ui/input';
import { Spinner, EmptyState } from '@/components/ui/spinner';
=======
import { Field, Input, Textarea } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState, ErrorState } from '@/components/ui/spinner';
import { PageSkeleton } from '@/components/ui/skeleton';
import { friendlyError } from '@/lib/friendly-error';
>>>>>>> origin/main
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export default function ProductivityPage() {
  const user = useAppStore((state) => state.user);
  const partner = useAppStore((state) => state.partner);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  async function load() {
    try {
      setLoadError(null);
      const data = await api.get('/api/productivity/tasks');
      setTasks(data.tasks || []);
    } catch (e) {
      setLoadError(friendlyError(e, 'Could not load your tasks.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = await api.post('/api/productivity/tasks', {
        title,
        description: description || undefined,
        assignedTo: assignedTo || null,
        dueAt: dueAt ? new Date(`${dueAt}T23:59:00`).toISOString() : null,
      });
      setTasks((current) => [data.task, ...current]);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueAt('');
      toast.success('Task added');
    } catch (e) {
      toast.error(friendlyError(e, 'Could not add the task. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    const status = task.status === 'done' ? 'open' : 'done';
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status } : item));
    try {
      await api.patch(`/api/productivity/tasks/${task.id}`, { status });
    } catch (e) {
      setTasks((current) => current.map((item) => item.id === task.id ? task : item));
      toast.error(e.message || 'Could not update task');
    }
  }

  async function deleteTask(task) {
    setTasks((current) => current.filter((item) => item.id !== task.id));
    try {
      await api.del(`/api/productivity/tasks/${task.id}`);
    } catch (e) {
      setTasks((current) => [task, ...current]);
      toast.error(e.message || 'Could not delete task');
    }
  }

  const openCount = useMemo(() => tasks.filter((task) => task.status !== 'done').length, [tasks]);

  if (loading) return <PageSkeleton rows={3} />;
  if (loadError) {
    return (
      <ErrorState title="Tasks did not load" onRetry={() => { setLoading(true); load(); }}>
        {loadError}
      </ErrorState>
    );
  }

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="display-title text-5xl">Our Shared Ledger</h1>
        <p className="ink-stamp mt-2 text-[var(--muted)]">
          {openCount} open {openCount === 1 ? 'task' : 'tasks'} in our plans
        </p>
      </header>

      <div className="journal-card p-6">
        <form onSubmit={addTask} className="space-y-5">
          <h2 className="font-serif text-xl font-medium">Add a shared task</h2>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            maxLength={160}
            className="font-serif"
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details…"
            rows={3}
            maxLength={1000}
            className="font-serif"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 font-serif text-sm font-medium">
              Assign to
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
                className="w-full rounded-xl border border-[var(--ink)]/10 bg-[var(--paper)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--primary)] transition"
              >
=======
    <div className="space-y-6 pb-6">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Tasks</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">{openCount} open {openCount === 1 ? 'task' : 'tasks'} for your shared plans.</p>
      </header>

      <GlassCard>
        <form onSubmit={addTask} className="space-y-3">
          <h2 className="font-semibold">Add a shared task</h2>
          <Field label="Task">
            <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" maxLength={160} required />
          </Field>
          <Field label="Details (optional)">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Anything to remember…" rows={3} maxLength={1000} />
          </Field>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 [&>label]:min-w-0">
            <label className="space-y-1.5 text-sm font-medium">
              Assign to
              <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="min-h-11 w-full min-w-0 rounded-2xl border border-[rgb(var(--border)/0.16)] bg-[var(--surface)] px-4 py-3 text-[var(--text)]">
>>>>>>> origin/main
                <option value="">Anyone</option>
                <option value={user?.id}>Me</option>
                {partner && <option value={partner.id}>{partner.name}</option>}
              </select>
            </label>
            <label className="space-y-2 font-serif text-sm font-medium">
              Due date
              <Input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="font-serif" />
            </label>
          </div>
          <Button type="submit"
            loading={saving}
            disabled={!title.trim()}
            className="journal-card w-full py-3 font-serif text-lg font-medium transition-all hover:translate-y-[-2px]"
          >
            Pencil it in
          </Button>
        </form>
      </div>

      <section className="space-y-4">
        <h2 className="ink-stamp px-1 text-[var(--muted)]">Our Shared Tasks</h2>
        {tasks.length === 0 ? (
<<<<<<< HEAD
          <EmptyState title="Nothing planned yet">Add a task to start organizing life together.</EmptyState>
=======
          <EmptyState
            icon="ListTodo"
            title="Nothing planned yet"
            action={<Button variant="glass" onClick={() => document.getElementById('task-title')?.focus()}>Add the first task</Button>}
          >
            Add a task to start organizing life together.
          </EmptyState>
>>>>>>> origin/main
        ) : (
          tasks.map((task) => (
            <div key={task.id}
              className={cn(
                "journal-card flex items-start gap-4 p-5 transition-all hover:translate-x-1",
                task.status === 'done' ? 'opacity-60 grayscale' : ''
              )}
            >
              <button type="button" aria-label={task.status === 'done' ? 'Reopen task' : 'Complete task'} onClick={() => toggleTask(task)}
                className="mt-0.5 shrink-0 text-[var(--primary)]"
              >
                <Icon name={task.status === 'done' ? 'CheckSquare' : 'Square'} size={22} />
              </button>
              <div className="min-w-0 flex-1">
<<<<<<< HEAD
                <p className={cn("font-serif text-lg font-medium truncate", task.status === 'done' ? 'line-through text-[var(--muted)]' : '')}>{task.title}</p>
                {task.description && <p className="mt-1 font-serif text-sm leading-relaxed text-[var(--muted)]">{task.description}</p>}
                <p className="ink-stamp mt-2 text-[var(--muted)]">
                  {task.assigned_to === user?.id ? 'Assigned to you' : task.assigned_to === partner?.id ? `Assigned to ${partner.name?.split(' ')[0]}` : 'Shared'}
                  {task.due_at ? ` · Due ${new Date(task.due_at).toLocaleDateString()}` : ''}
                </p>
              </div>
              <Button type="button" aria-label="Delete task" onClick={() => deleteTask(task)}
                className="shrink-0 text-rose-500 opacity-0 transition-opacity group-hover:opacity-100"
                variant="ghost" size="icon"
              >
=======
                <p className={`font-semibold ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</p>
                {task.description && <p className="mt-1 text-sm text-[var(--muted)]">{task.description}</p>}
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {task.assigned_to === user?.id ? 'Assigned to you' : task.assigned_to === partner?.id ? `Assigned to ${partner.name}` : 'Shared'}
                  {task.due_at ? ` · Due ${new Date(task.due_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </p>
              </div>
              <button type="button" aria-label="Delete task" onClick={() => deleteTask(task)} className="shrink-0 text-[var(--muted)] hover:text-[var(--danger-text)]">
>>>>>>> origin/main
                <Icon name="Trash2" size={18} />
              </Button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
