'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/lib/admin-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck,
  Sparkles, Map, CalendarCheck, BarChart3,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        await login(email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول. تحقق من البريد وكلمة المرور.');
      }
    });
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-primary-950" dir="rtl">
      {/* Decorative aura */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -end-32 w-[600px] h-[600px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-0 -start-32 w-[500px] h-[500px] rounded-full bg-primary-700/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      {/* LEFT — Branding panel (desktop only) */}
      <aside className="hidden lg:flex relative w-1/2 flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-cream overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-15">
          <Image src="/hero-slides/hero-05.jpg" alt="" fill className="object-cover" sizes="50vw" priority />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/95 via-primary-900/85 to-primary-800/75" />

        {/* Brand mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 backdrop-blur border border-accent/40 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Lotus Sharm" className="w-10 h-10 rounded-lg object-cover" />
          </div>
          <div>
            <div className="font-serif font-bold text-xl leading-none">LOTUS SHARM</div>
            <div className="text-[11px] tracking-[0.35em] text-accent mt-1">TRAVEL · ADMIN</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> منذ 2013
          </div>
          <h1 className="font-serif text-4xl xl:text-5xl font-bold leading-tight">
            أهلاً بك في
            <span className="block text-gold-gradient mt-1">لوحة التحكم</span>
          </h1>
          <p className="text-cream/80 text-sm xl:text-base leading-relaxed">
            إدارة كاملة للرحلات، الحجوزات، العملاء، المدفوعات، التقارير، ومحتوى الموقع بـ 4 لغات — من مكان واحد.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: Map, label: 'الرحلات والمحتوى' },
              { icon: CalendarCheck, label: 'الحجوزات والدفع' },
              { icon: BarChart3, label: 'التقارير والإحصاءات' },
              { icon: ShieldCheck, label: 'محمي بـ JWT' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-cream/5 border border-cream/10">
                <f.icon className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="relative z-10 text-[11px] text-cream/50">
          © {new Date().getFullYear()} لوتس شرم للسياحة · جميع الحقوق محفوظة
        </div>
      </aside>

      {/* RIGHT — Form */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 backdrop-blur border border-accent/40 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Lotus Sharm" className="w-12 h-12 rounded-lg object-cover" />
            </div>
            <div className="text-center">
              <div className="font-serif font-bold text-lg text-cream">LOTUS SHARM</div>
              <div className="text-[10px] tracking-[0.35em] text-accent mt-1">TRAVEL · ADMIN</div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-cream/20 p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-accent font-bold mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                دخول آمن
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-1">تسجيل الدخول</h2>
              <p className="text-sm text-muted-foreground">أدخل بياناتك للوصول إلى لوحة التحكم</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@lotussharm.com"
                    dir="ltr"
                    className="ps-10 h-12 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-foreground/80 mb-1.5 uppercase tracking-wider">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="ps-10 pe-10 h-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={pending}
                size="lg"
                className="w-full h-12 bg-primary hover:bg-primary-800 text-cream font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    تسجيل الدخول
                  </>
                )}
              </Button>

              {/* Footer hint */}
              <p className="text-[11px] text-center text-muted-foreground pt-2">
                هذه صفحة مخصصة لإدارة موقع لوتس شرم. للوصول للموقع العام، اذهب إلى
                {' '}
                <a href="/ar" className="text-primary font-semibold hover:underline">lotussharm.com</a>
              </p>
            </form>
          </div>

          {/* Mobile-only copyright */}
          <p className="lg:hidden text-center text-[11px] text-cream/50 mt-6">
            © {new Date().getFullYear()} لوتس شرم للسياحة
          </p>
        </div>
      </main>
    </div>
  );
}
