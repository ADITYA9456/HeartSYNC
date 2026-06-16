'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { loginSchema, registerSchema } from '@/lib/validators';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';

export function AuthClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'login' ? 'login' : 'register');
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';

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
        toast.success('Welcome to CoupleSpace 💞');
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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <div className="text-5xl">💞</div>
        <h1 className="mt-2 text-3xl font-black">
          Couple<span className="gradient-text">Space</span>
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {isLogin ? 'Welcome back, lovebird.' : 'Create your private space for two.'}
        </p>
      </div>

      <div className="glass-card p-5">
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
                <Input placeholder="Alex" autoComplete="name" {...register('name')} />
              </Field>
            )}
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" autoComplete="email" {...register('email')} />
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

        <div className="flex justify-center [color-scheme:light]">
          <GoogleLogin
            onSuccess={onGoogle}
            onError={() => toast.error('Google sign-in failed')}
            shape="pill"
            text={isLogin ? 'signin_with' : 'signup_with'}
          />
        </div>
      </div>

      <button onClick={switchMode} className="text-center text-sm text-[var(--muted)]">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <span className="font-semibold text-[var(--primary)]">{isLogin ? 'Sign up' : 'Sign in'}</span>
      </button>
    </main>
  );
}
