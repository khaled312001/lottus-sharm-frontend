'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Mail, Send, Sparkles, Check, Loader2,
  Facebook, Instagram, Youtube,
} from 'lucide-react';

const BYPASS_KEY = 'lotus_preview';
const BYPASS_VALUE = 'lotus2026';

/**
 * Maintenance gate — shows a luxury "Coming Soon" screen until the visitor
 * has the preview unlock cookie. Owner unlocks via:
 *   https://lotussharm.com/?preview=lotus2026
 */
export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const previewParam = url.searchParams.get('preview');
      if (previewParam === BYPASS_VALUE) {
        document.cookie = `${BYPASS_KEY}=${BYPASS_VALUE}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
        url.searchParams.delete('preview');
        window.history.replaceState({}, '', url.toString());
        setUnlocked(true);
      } else {
        const m = document.cookie.match(new RegExp(`${BYPASS_KEY}=([^;]+)`));
        setUnlocked(m?.[1] === BYPASS_VALUE);
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;
  return <ComingSoon />;
}

// Countdown target: end of May 2026 (~2 weeks from contract delivery)
const LAUNCH_DATE = new Date('2026-05-30T12:00:00Z').getTime();

function useCountdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = LAUNCH_DATE - now;
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function ComingSoon() {
  const t = useCountdown();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setErr('بريد إلكتروني غير صالح'); return; }
    setSubmitting(true); setErr(null);
    try {
      const res = await fetch('/api/public/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale: 'AR' }),
      });
      if (!res.ok) throw new Error('فشل الاشتراك');
      setSubscribed(true);
      setEmail('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'حصل خطأ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      className="min-h-screen text-cream relative overflow-hidden flex items-center justify-center px-4 py-10"
      style={{
        background:
          'radial-gradient(ellipse at top right, rgba(201,168,106,0.18), transparent 55%),' +
          'radial-gradient(ellipse at bottom left, rgba(19,73,73,0.55), transparent 60%),' +
          'linear-gradient(135deg, #0a2828 0%, #0d3a3a 50%, #0a2828 100%)',
      }}
    >
      {/* Background hero image — heavily darkened */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <Image
          src="/hero-slides/hero-04.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Gold mesh pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(201,168,106,1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top gold accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      {/* Floating orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-32 w-[480px] h-[480px] rounded-full bg-accent/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 -left-32 w-[420px] h-[420px] rounded-full bg-primary-700/40 blur-3xl pointer-events-none"
      />

      {/* Decorative giant LOTUS text watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.04]">
        <div className="font-serif text-[260px] md:text-[420px] font-black leading-none tracking-[0.05em] text-accent whitespace-nowrap">
          LOTUS
        </div>
      </div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl"
      >
        <div className="relative rounded-3xl bg-primary-950/45 backdrop-blur-xl border border-accent/25 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] p-7 sm:p-10 md:p-14 overflow-hidden">
          {/* Card inner gold accents */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-accent/10 blur-2xl" />

          <div className="relative text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
              className="inline-block mb-7 relative"
            >
              {/* Soft gold halo around logo */}
              <div className="absolute -inset-3 rounded-3xl bg-accent/25 blur-2xl" />
              <Image
                src="/logo.jpg"
                alt="Lotus Sharm"
                width={120}
                height={120}
                className="relative rounded-2xl ring-2 ring-accent/50 shadow-2xl shadow-accent/30"
                priority
              />
            </motion.div>

            {/* Coming Soon chip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-accent text-[11px] font-bold uppercase tracking-[0.3em] mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-accent animate-ping" />
                <span className="relative rounded-full h-2 w-2 bg-accent" />
              </span>
              قريباً · Coming Soon
            </motion.div>

            {/* Headings */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-3 leading-tight"
            >
              <span className="block">الموقع</span>
              <span className="block bg-gradient-to-r from-accent-300 via-accent to-accent-400 bg-clip-text text-transparent">
                تحت الإنشاء
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="font-serif text-lg sm:text-xl text-cream/80 mb-2 italic"
            >
              Our luxury tourism platform is launching soon
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-sm sm:text-base text-cream/65 mb-8 max-w-xl mx-auto leading-relaxed"
            >
              فريق <strong className="text-accent">لوتس شرم</strong> يضع اللمسات الأخيرة على تجربة سياحية فاخرة في شرم الشيخ.
              <br className="hidden sm:block" />
              ترقّبوا الإطلاق الرسمي قريباً جداً.
            </motion.p>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto mb-8"
            >
              {[
                { v: t.d, label: 'يوم' },
                { v: t.h, label: 'ساعة' },
                { v: t.m, label: 'دقيقة' },
                { v: t.s, label: 'ثانية' },
              ].map((c) => (
                <div
                  key={c.label}
                  className="relative bg-cream/5 backdrop-blur border border-accent/20 rounded-2xl p-3 sm:p-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
                  <div className="relative">
                    <div className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-accent tabular-nums leading-none">
                      {String(c.v).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] sm:text-xs text-cream/55 uppercase tracking-wider mt-2 font-semibold">
                      {c.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Email subscribe */}
            {!subscribed ? (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                onSubmit={subscribe}
                className="max-w-md mx-auto mb-8"
              >
                <div className="flex items-center gap-1.5 mb-2 text-xs text-cream/65">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span>اشترك لتعرف أول من يفتح الموقع — وعروض الإطلاق</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 bg-cream/5 backdrop-blur border border-accent/25 rounded-xl p-1.5 focus-within:border-accent/60 transition-colors">
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <Mail className="h-4 w-4 text-accent/70 flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="بريدك الإلكتروني"
                      dir="ltr"
                      className="flex-1 bg-transparent border-0 outline-none text-sm py-2.5 text-cream placeholder:text-cream/40"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-400 text-primary font-bold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-accent/20 transition-colors disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        أعلِمني
                      </>
                    )}
                  </button>
                </div>
                {err && <p className="mt-2 text-xs text-rose-300">{err}</p>}
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto mb-8 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-sm"
              >
                <Check className="h-4 w-4 flex-shrink-0" />
                <span>تمام! هنبعتلك أول إشعار عند الإطلاق</span>
              </motion.div>
            )}

            {/* Divider */}
            <div className="max-w-sm mx-auto my-7 flex items-center gap-3 text-[10px] text-cream/40 uppercase tracking-[0.3em]">
              <span className="h-px flex-1 bg-cream/15" />
              <span>أو تواصل مباشرة</span>
              <span className="h-px flex-1 bg-cream/15" />
            </div>

            {/* Contact buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto"
            >
              <motion.a
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://wa.me/201090767278"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ea954] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                واتساب
              </motion.a>
              <motion.a
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="tel:+201090767278"
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-400 text-primary font-bold py-3.5 rounded-xl shadow-lg shadow-accent/30 transition-colors"
                dir="ltr"
              >
                <Phone className="h-4 w-4" />
                +20 109 076 7278
              </motion.a>
            </motion.div>

            {/* Social icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
              className="mt-7 flex items-center justify-center gap-2"
            >
              {[
                { href: 'https://www.facebook.com/share/1DMY8SUNTT/?mibextid=wwXIfr', Icon: Facebook, label: 'Facebook' },
                { href: 'https://www.instagram.com/lotus_sharm', Icon: Instagram, label: 'Instagram' },
                { href: 'https://youtube.com/@lotussharm', Icon: Youtube, label: 'YouTube' },
              ].map(({ href, Icon, label }) => (
                <motion.a
                  key={label}
                  whileHover={{ y: -2 }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-cream/5 border border-cream/15 hover:bg-accent hover:text-primary hover:border-accent text-cream/80 flex items-center justify-center transition-all"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 pt-6 border-t border-accent/15 text-[11px] text-cream/45 leading-relaxed"
            >
              <p>© 2026 Lotus Sharm Tourism · شركة لوتس شرم للاستثمار والتسويق السياحي</p>
              <p className="mt-1 text-[10px] text-cream/40">
                <span className="inline-flex items-center gap-1.5">
                  <span className="opacity-60">سجل تجاري رقم</span>
                  <span className="font-mono tracking-wider text-accent/80">269494</span>
                </span>
              </p>
              <p className="mt-1.5 text-[10px] text-cream/30">
                Developed by <a href="http://barmagly.tech/" target="_blank" rel="noopener" className="text-accent/70 hover:text-accent transition-colors">Barmagly Software</a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
