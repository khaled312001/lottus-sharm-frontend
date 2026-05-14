'use client';

import { useState, useTransition } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        await login(email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-2">
            L
          </div>
          <CardTitle>لوحة تحكم لوتتس شرم</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">البريد الإلكتروني</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@lottussharm.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">كلمة المرور</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={pending} className="w-full" size="lg">
              <LogIn className="h-4 w-4" /> دخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
