'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/auth-store';
import { ActionButton } from '@ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FALogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (require2FA) {
        if (!totpCode || totpCode.length !== 6) {
          setError('Masukkan kode 6 digit dari authenticator app');
          setLoading(false);
          return;
        }
        await verify2FALogin(totpCode);
        router.push('/dashboard');
      } else {
        const authStore = useAuthStore.getState();
        await login(email, password);
        if (!authStore.require2FA) {
          router.push('/dashboard');
        } else {
          setRequire2FA(true);
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || (require2FA ? 'Kode TOTP tidak valid' : 'Login gagal. Periksa email dan password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">WorkFlowOS</CardTitle>
          <CardDescription>{require2FA ? 'Masukkan kode TOTP' : 'Masuk ke akun Anda'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {!require2FA && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}
            
            {require2FA && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Shield className="h-5 w-5" />
                  <span>Masukkan kode 6 digit dari authenticator app</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totpCode">Kode TOTP</Label>
                  <Input
                    id="totpCode"
                    name="totpCode"
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    disabled={loading}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
              </div>
            )}
            
            <ActionButton type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (require2FA ? 'Verifikasi' : 'Masuk')}
            </ActionButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}