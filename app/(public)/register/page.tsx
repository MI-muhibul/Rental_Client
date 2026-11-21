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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle ImgBB image upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    if (!imgbbKey) {
      toast.error('ImgBB API key not configured. Please paste a direct Photo URL.');
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading('Uploading avatar to ImgBB...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setPhotoUrl(data.data.url);
        toast.success('Image uploaded successfully!', { id: toastId });
      } else {
        throw new Error(data.error?.message || 'Failed to upload image');
      }
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Valid email address is required');
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    setLoading(true);

    try {
      // 1. Register with Better Auth
      const { data, error } = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        image: photoUrl.trim() || undefined,
      });

      if (error) {
        throw new Error(error.message || 'Registration failed');
      }

      // 2. Synchronize user record to backend MongoDB collection
      await syncUserToBackend({
        email: email.trim(),
        name: name.trim(),
        photo: photoUrl.trim(),
        avatar: photoUrl.trim(),
        role: 'customer',
      });

      // 3. Show SweetAlert success confirmation
      await Swal.fire({
        title: 'Registration Successful!',
        text: `Welcome to HEAVYRENT, ${name}! Your contractor account is ready.`,
        icon: 'success',
        background: '#1a1e24',
        color: '#f4f3ee',
        confirmButtonColor: '#ff6600',
        confirmButtonText: 'Enter Equipment Fleet',
      });

      router.push('/equipment');
    } catch (err: any) {
      toast.error(err.message || 'Registration error occurred');
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
          <span className="hazard-badge mb-2">NEW OPERATOR ENROLLMENT</span>
          <Heading level={1} size="lg" className="mt-1">
            Create Account
          </Heading>
          <p className="text-sm text-gray-400 mt-2 font-mono">
            Register to rent, manage fleet, and track invoices.
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
            OR OPERATOR CREDENTIALS
          </span>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Miller"
              className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-sm px-4 py-2.5 rounded-xs outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Email Address *
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
              Avatar / Photo (URL or Upload)
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-[#121519] border border-base-300 focus:border-primary text-white text-xs px-4 py-2 rounded-xs outline-none transition-colors"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-gray-400 cursor-pointer bg-neutral hover:bg-base-300 px-3 py-1.5 border border-base-300 rounded-xs transition-colors">
                  {uploadingImage ? 'Uploading...' : '📁 Upload Image via ImgBB'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {photoUrl && (
                  <span className="text-xs text-primary font-mono truncate max-w-[200px]">
                    ✓ Linked
                  </span>
                )}
              </div>
            </div>
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
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log In to Operations
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
