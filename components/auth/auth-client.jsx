'use client';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { loginSchema, registerSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { HeartMark } from '@/components/ui/heart-mark';

export function AuthClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'login' ? 'login' : 'register');
  const [submitting, setSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const isLogin = mode === 'login';

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGoogleReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  function go(hasCouple) {
    router.replace(hasCouple ? '/dashboard' : '/connect');
  }

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      if (isLogin) {
        const data = await api.post('/api/auth/login', values);
        go(data.hasCouple);
      } else {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await api.post('/api/auth/register', { ...values, timezone: tz });
        toast.success('Welcome to HeartSYNC 💞');
        go(false);
      }
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle(credentialResponse) {
    setSubmitting(true);
    try {
      const data = await api.post('/api/auth/google', { credential: credentialResponse.credential });
      go(data.hasCouple);
    } catch (e) {
      toast.error(e.message || 'Google sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    reset();
    setMode(isLogin ? 'register' : 'login');
  }

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-5xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_0.8fr] lg:gap-20 lg:px-12">
      <section className="hidden max-w-md space-y-8 lg:block">
        <HeartMark size={64} />
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">A private space for two</p>
          <h1 className="text-balance text-6xl font-black leading-[0.95] tracking-[-0.06em]">
            Keep the little things close.
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-[var(--muted)]">
            Conversations, memories, plans, and the everyday details that make your relationship yours.
          </p>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-[var(--primary)] pl-4 text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">HeartSYNC</span>
          <span aria-hidden="true">/</span>
          <span>Made for your shared world</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <HeartMark size={52} className="mb-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">HeartSYNC</p>
        </div>
        <div className="surface-elevated p-6 sm:p-8">
          <div className="mb-7 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isLogin ? 'Welcome back.' : 'Start your shared space.'}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {isLogin ? 'Pick up where you left off.' : 'A private home for the two of you.'}
            </p>
          </div>
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
          >
            {!isLogin && (
              <Field label="Your name" error={errors.name?.message}>
                <Input placeholder="Alex…" autoComplete="name" {...register('name')} />
              </Field>
            )}
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com…" autoComplete="email" spellCheck={false} {...register('email')} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                {...register('password')}
              />
            </Field>

            <Button type="submit" className="w-full" loading={submitting}>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </motion.form>
        </AnimatePresence>

        <div className="my-4 flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="h-px flex-1 bg-[rgb(var(--border)/0.2)]" />
          or
          <span className="h-px flex-1 bg-[rgb(var(--border)/0.2)]" />
        </div>

          {googleReady && (
            <div className="flex justify-center [color-scheme:light]">
              <GoogleLogin
                onSuccess={onGoogle}
                onError={() => toast.error('Google sign-in failed')}
                shape="pill"
                text={isLogin ? 'signin_with' : 'signup_with'}
              />
            </div>
          )}
        </div>

      <button
        onClick={switchMode}
        className="mt-5 w-full text-center text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
      >
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <span className="font-semibold text-[var(--primary)]">{isLogin ? 'Sign up' : 'Sign in'}</span>
      </button>
      </section>
    </main>
  );
}
