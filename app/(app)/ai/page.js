'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { AI_FEATURES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { ResultReveal } from '@/components/ai/result-reveal';

const MAX = 1000;

export default function AiCopilotPage() {
  const [activeId, setActiveId] = useState(AI_FEATURES[0].id);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null); // { result, entry }
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expanded, setExpanded] = useState({}); // entryId -> bool

  const lastPromptRef = useRef('');

  const active = useMemo(
    () => AI_FEATURES.find((f) => f.id === activeId) || AI_FEATURES[0],
    [activeId]
  );

  const loadHistory = useCallback(async (feature) => {
    setHistoryLoading(true);
    try {
      const data = await api.get(`/api/ai?feature=${encodeURIComponent(feature)}&limit=30`);
      setHistory(data.history || []);
    } catch (e) {
      toast.error(e.message);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Reset the workspace + reload history whenever the active feature changes.
  useEffect(() => {
    setPrompt('');
    setResult(null);
    setExpanded({});
    loadHistory(activeId);
  }, [activeId, loadHistory]);

  async function generate(overridePrompt) {
    const p = (overridePrompt ?? prompt).trim();
    if (!p) {
      toast.error('Tell the Copilot what you have in mind first 💭');
      return;
    }
    if (p.length > MAX) {
      toast.error(`Keep it under ${MAX} characters.`);
      return;
    }
    setGenerating(true);
    lastPromptRef.current = p;
    try {
      const data = await api.post('/api/ai', { feature: activeId, prompt: p });
      setResult(data);
      loadHistory(activeId);
    } catch (e) {
      // 429 = too fast, 502 = copilot unavailable — both come through as err.message.
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function copyResult(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied 💌');
    } catch {
      toast.error('Could not copy');
    }
  }

  async function saveFavorite() {
    if (!result?.entry?.id) return;
    setSaving(true);
    try {
      const { entry } = await api.patch(`/api/ai/${result.entry.id}`, { favorite: true });
      setResult((r) => (r ? { ...r, entry } : r));
      setHistory((h) => h.map((x) => (x.id === entry.id ? entry : x)));
      toast.success('Saved to favorites ⭐');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleFavorite(item) {
    const next = !item.favorite;
    setHistory((h) => h.map((x) => (x.id === item.id ? { ...x, favorite: next } : x)));
    try {
      const { entry } = await api.patch(`/api/ai/${item.id}`, { favorite: next });
      setHistory((h) => h.map((x) => (x.id === entry.id ? entry : x)));
      if (result?.entry?.id === item.id) setResult((r) => ({ ...r, entry }));
    } catch (e) {
      // revert
      setHistory((h) => h.map((x) => (x.id === item.id ? { ...x, favorite: item.favorite } : x)));
      toast.error(e.message);
    }
  }

  async function deleteItem(item) {
    if (!window.confirm('Delete this generation? This cannot be undone.')) return;
    const prev = history;
    setHistory((h) => h.filter((x) => x.id !== item.id));
    try {
      await api.del(`/api/ai/${item.id}`);
      if (result?.entry?.id === item.id) setResult(null);
      toast.success('Deleted');
    } catch (e) {
      setHistory(prev);
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl [background:linear-gradient(120deg,var(--primary),var(--primary-2))] text-white shadow-lg shadow-[color-mix(in_srgb,var(--primary)_40%,transparent)]">
            <Icon name="Sparkles" size={20} />
          </span>
          <h1 className="text-2xl font-black gradient-text">AI Copilot</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Your little love assistant — date plans, captions, notes, apologies and gift ideas, made just for the two of you.
        </p>
      </header>

      {/* Feature selector */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {AI_FEATURES.map((f) => {
          const isActive = f.id === activeId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveId(f.id)}
              aria-pressed={isActive}
              className={[
                'relative flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.97]',
                isActive
                  ? 'text-white [background:linear-gradient(120deg,var(--primary),var(--primary-2))] shadow-lg shadow-[color-mix(in_srgb,var(--primary)_35%,transparent)]'
                  : 'glass text-[var(--text)]',
              ].join(' ')}
            >
              <Icon name={f.icon} size={16} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Workspace — animates between features */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <div className="px-1">
            <p className="text-sm font-medium text-[var(--text)]">{active.blurb}</p>
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX))}
            placeholder={`e.g. ${active.placeholder}`}
            rows={4}
            disabled={generating}
          />
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="text-xs text-[var(--muted)]">
              {prompt.length}/{MAX}
            </span>
            <Button
              variant="primary"
              onClick={() => generate()}
              loading={generating}
              disabled={!prompt.trim()}
            >
              {!generating && <Icon name="Sparkles" size={16} />}
              {generating ? 'Conjuring…' : 'Generate'}
            </Button>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.entry?.id || 'result'}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--primary)]">
                    <Icon name="Sparkles" size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {active.label}
                    </span>
                  </div>

                  <ResultReveal text={result.result} />

                  <div className="flex flex-wrap gap-2 border-t border-[rgb(var(--border)/0.15)] pt-3">
                    <Button variant="glass" size="sm" onClick={() => copyResult(result.result)}>
                      <Icon name="Copy" size={15} />
                      Copy
                    </Button>
                    <Button
                      variant={result.entry?.favorite ? 'outline' : 'glass'}
                      size="sm"
                      onClick={saveFavorite}
                      loading={saving}
                      disabled={result.entry?.favorite}
                    >
                      <Icon name={result.entry?.favorite ? 'Star' : 'StarOff'} size={15} />
                      {result.entry?.favorite ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => generate(lastPromptRef.current)}
                      disabled={generating}
                    >
                      <Icon name="RefreshCw" size={15} />
                      Regenerate
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* History */}
      <section>
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-2xl px-1 py-2 text-left"
          aria-expanded={historyOpen}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
            <Icon name="History" size={16} className="text-[var(--muted)]" />
            History
            {history.length > 0 && (
              <span className="rounded-full bg-[rgb(var(--card)/0.6)] px-2 py-0.5 text-xs text-[var(--muted)]">
                {history.length}
              </span>
            )}
          </span>
          <motion.span animate={{ rotate: historyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Icon name="ChevronDown" size={18} className="text-[var(--muted)]" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2">
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : history.length === 0 ? (
                  <EmptyState emoji="🌱" title="Nothing here yet">
                    Your {active.label.toLowerCase()} will show up here once you generate something.
                  </EmptyState>
                ) : (
                  history.map((item) => {
                    const isOpen = !!expanded[item.id];
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="glass-card space-y-2 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text)]">
                            {item.prompt}
                          </p>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleFavorite(item)}
                              aria-label={item.favorite ? 'Unfavorite' : 'Favorite'}
                              className="rounded-full p-1.5 transition hover:bg-[rgb(var(--card)/0.5)]"
                            >
                              <Icon
                                name="Star"
                                size={16}
                                className={
                                  item.favorite
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-[var(--muted)]'
                                }
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item)}
                              aria-label="Delete"
                              className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                            >
                              <Icon name="Trash2" size={16} />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }))
                          }
                          className="block w-full text-left"
                        >
                          <p
                            className={[
                              'whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]',
                              isOpen ? '' : 'line-clamp-3',
                            ].join(' ')}
                          >
                            {item.result}
                          </p>
                        </button>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <span className="text-xs text-[var(--muted)]">
                            {item.created_at
                              ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                              : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyResult(item.result)}
                              className="text-xs font-medium text-[var(--primary)] hover:underline"
                            >
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }))
                              }
                              className="text-xs font-medium text-[var(--primary)] hover:underline"
                            >
                              {isOpen ? 'Less' : 'More'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
