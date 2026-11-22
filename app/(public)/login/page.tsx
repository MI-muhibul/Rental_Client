'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { authClient } from '@/lib/auth-client';
import { syncUserToBackend } from '@/lib/user-sync';
import SectionContainer from '@/components/ui/SectionContainer';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate password rules (each failed rule triggers a distinct toast)
  const validatePassword = (pwd: string): boolean => {
    let isValid = true;

    if (pwd.length < 6) {
      toast.error('Password must be at least 6 characters long');
      isValid = false;
    }
    if (!/[A-Z]/.test(pwd)) {
      toast.error('Password must contain at least one uppercase letter (A-Z)');
      isValid = false;
    }
    if (!/[a-z]/.test(pwd)) {
      toast.error('Password must contain at least one lowercase letter (a-z)');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in with Better Auth
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid email or password');
      }

      // 2. Determine Clearance Role
      const isSuperAdmin = email.trim().toLowerCase() === 'admin@heavyrent.com';
      const userRole = isSuperAdmin ? 'admin' : ((data?.user as any)?.role || 'customer');

      // 3. Synchronize user record to backend MongoDB collection
      await syncUserToBackend({
        email: email.trim(),
        name: data?.user?.name || (isSuperAdmin ? 'Superintendent Admin' : ''),
        photo: data?.user?.image || '',
        avatar: data?.user?.image || '',
        role: userRole,
      });

      // 4. Show SweetAlert success confirmation
      await Swal.fire({
        title: 'Authentication Successful',
        text: `Clearance confirmed as ${userRole.toUpperCase()}. Entering management terminal...`,
        icon: 'success',
        background: '#1a1e24',
        color: '#f4f3ee',
        confirmButtonColor: '#ff6600',
        confirmButtonText: 'Enter Terminal',
        timer: 1800,
        timerProgressBar: true,
      });

      // 5. Intelligent Role-Based Redirection
      if (userRole === 'admin') {
        router.push('/dashboard/admin');
      } else if (userRole === 'owner') {
        router.push('/dashboard/owner');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (err: any) {
      toast.error('Google login could not be initiated.');
    }
  };

  return (
    <SectionContainer className="min-h-[85vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-base-200 border border-base-300 rounded-sm p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="hazard-badge mb-2">OPERATIONS ACCESS</span>
          <Heading level={1} size="lg" className="mt-1">
            Operator Login
          </Heading>
          <p className="text-sm text-gray-400 mt-2 font-mono">
            Enter credentials to manage bookings and equipment.
          </p>
        </div>

        {/* Google OAuth Quick Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-6 flex items-center justify-center gap-3 bg-[#121519] border border-base-300 hover:border-primary/60 text-white font-heading font-semibold py-3 px-4 rounded-xs transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-base-300 w-full" />
          <span className="bg-base-200 px-3 text-xs uppercase font-mono text-gray-500 absolute">
            OR EMAIL SIGN IN
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Operator Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@contractor.com"
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none transition-colors"
            />
            <p className="text-[11px] text-gray-500 mt-1 font-mono">
              Requirements: 6+ characters, 1 uppercase (A-Z), 1 lowercase (a-z)
            </p>
          </div>

          <Button type="submit" fullWidth disabled={loading} className="mt-6">
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Need an operator account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register New Account
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
