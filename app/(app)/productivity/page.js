'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';

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

  async function load() {
    try {
      const data = await api.get('/api/productivity/tasks');
      setTasks(data.tasks || []);
    } catch (e) {
      toast.error(e.message || 'Could not load tasks');
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
      toast.error(e.message || 'Could not add task');
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

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
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
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" maxLength={160} required />
          </Field>
          <Field label="Details (optional)">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Anything to remember…" rows={3} maxLength={1000} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Assign to
              <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="w-full rounded-2xl border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--card)/0.5)] px-4 py-3 text-[var(--text)]">
                <option value="">Anyone</option>
                <option value={user?.id}>Me</option>
                {partner && <option value={partner.id}>{partner.name}</option>}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Due date
              <Input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
            </label>
          </div>
          <Button type="submit" loading={saving} disabled={!title.trim()}>Add task</Button>
        </form>
      </GlassCard>

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Shared task list</h2>
        {tasks.length === 0 ? (
          <EmptyState icon="ListTodo" title="Nothing planned yet">Add a task to start organizing life together.</EmptyState>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`glass-card flex gap-3 p-4 ${task.status === 'done' ? 'opacity-65' : ''}`}>
              <button type="button" aria-label={task.status === 'done' ? 'Reopen task' : 'Complete task'} onClick={() => toggleTask(task)} className="mt-0.5 shrink-0 text-[var(--primary)]">
                <Icon name={task.status === 'done' ? 'CircleCheck' : 'Circle'} size={22} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</p>
                {task.description && <p className="mt-1 text-sm text-[var(--muted)]">{task.description}</p>}
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {task.assigned_to === user?.id ? 'Assigned to you' : task.assigned_to === partner?.id ? `Assigned to ${partner.name}` : 'Shared'}
                  {task.due_at ? ` · Due ${new Date(task.due_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </p>
              </div>
              <button type="button" aria-label="Delete task" onClick={() => deleteTask(task)} className="shrink-0 text-[var(--muted)] hover:text-rose-500">
                <Icon name="Trash2" size={18} />
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
