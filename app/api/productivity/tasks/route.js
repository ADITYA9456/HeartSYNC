import { withCouple, json, error, parseBody } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { taskSchema } from '@/lib/validators';

export const GET = withCouple(async ({ couple }) => {
  const { data, error: e } = await supabase
    .from('couple_tasks')
    .select('*, assignee:users!couple_tasks_assigned_to_fkey(id, name, avatar_url)')
    .eq('couple_id', couple.id)
    .order('status', { ascending: true })
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (e) return error('Could not load tasks', 500);
  return json({ tasks: data || [] });
});

export const POST = withCouple(async ({ req, user, members, couple }) => {
  const body = await parseBody(req, taskSchema);
  if (body.assignedTo && !members.some((member) => member.user_id === body.assignedTo)) {
    return error('Assigned partner is not part of this couple', 400);
  }
  const { data, error: e } = await supabase
    .from('couple_tasks')
    .insert({
      couple_id: couple.id,
      created_by: user.id,
      assigned_to: body.assignedTo || null,
      title: body.title,
      description: body.description || null,
      due_at: body.dueAt || null,
    })
    .select('*')
    .single();
  if (e) return error('Could not create task', 500);
  return json({ task: data }, 201);
});
