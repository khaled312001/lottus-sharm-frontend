'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Star, Map, Globe } from 'lucide-react';
import { toast } from 'sonner';

type QrItem = {
  key: string;
  title: string;
  desc: string;
  href: string;          // destination URL encoded into the QR
  file: string;          // path under /public
  icon: React.ComponentType<{ className?: string }>;
  accent: string;        // tailwind classes for accent badge
};

const QRS: QrItem[] = [
  {
    key: 'review',
    title: 'QR — صفحة التقييم',
    desc: 'ابعته للعملاء السابقين عشان يدخلوا الصفحة ويتركوا تقييم حقيقي. التقييم بيظهر على الهوم بعد المراجعة.',
    href: 'https://lotussharm.com/ar/review',
    file: '/review-qr.png',
    icon: Star,
    accent: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  },
  {
    key: 'site',
    title: 'QR — الموقع الرئيسي',
    desc: 'يفتح الصفحة الرئيسية مباشرة. مناسب للكروت والمطبوعات والإعلانات.',
    href: 'https://lotussharm.com',
    file: '/site-qr.png',
    icon: Globe,
    accent: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  },
  {
    key: 'trips',
    title: 'QR — صفحة الرحلات',
    desc: 'يفتح قائمة كل الرحلات. مناسب للبنرات والـ counters داخل الفنادق.',
    href: 'https://lotussharm.com/ar/trips',
    file: '/trips-qr.png',
    icon: Map,
    accent: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  },
];

async function downloadFile(url: string, name: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
    toast.success('تم التحميل');
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Error');
  }
}

function printSingle(file: string, title: string) {
  const w = window.open('', '_blank');
  if (!w) return toast.error('السماح بالنوافذ المنبثقة من المتصفح');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{margin:0;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0a2828;color:#f7f1e3;text-align:center;padding:32px}
      img{max-width:80vmin;height:auto;border-radius:24px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6)}
      h1{font-size:22px;color:#c9a86a;margin:24px 0 8px;letter-spacing:0.05em}
      p{font-size:14px;color:#f7f1e3aa;max-width:520px}
      @media print { body{background:#fff;color:#000} h1{color:#a88a52} }
    </style></head><body>
    <h1>${title}</h1>
    <img src="${file}" alt="${title}"/>
    <p>Lotus Sharm · لوتس شرم للسياحة · ${file === '/review-qr.png' ? 'امسح للوصول إلى صفحة التقييم' : 'امسح للوصول إلى الموقع'}</p>
    <script>setTimeout(()=>window.print(),300);</script>
    </body></html>
  `);
  w.document.close();
}

export default function AdminQRCodesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">رموز QR</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          رموز QR جاهزة للطباعة والمشاركة — كلها بألوان وهوية الموقع. اضغط <strong>تحميل</strong> لحفظها كصورة PNG عالية الجودة.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {QRS.map((q) => {
          const Icon = q.icon;
          return (
            <Card key={q.key} className="overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border ${q.accent}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-bold leading-tight">{q.title}</h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{q.desc}</p>

                <div className="relative bg-gradient-to-br from-primary-900 via-primary to-primary-900 rounded-xl p-3 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={q.file}
                    alt={q.title}
                    className="w-full max-w-[280px] h-auto rounded-lg"
                    loading="lazy"
                  />
                </div>

                <div className="text-[11px] font-mono text-muted-foreground truncate" dir="ltr" title={q.href}>
                  → {q.href}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => downloadFile(q.file, `lotus-sharm-${q.key}-qr.png`)} className="flex-1">
                    <Download className="h-4 w-4" /> تحميل PNG
                  </Button>
                  <Button variant="outline" onClick={() => printSingle(q.file, q.title)} className="flex-1">
                    طباعة
                  </Button>
                  <Button variant="outline" asChild className="flex-1 min-w-fit">
                    <a href={q.href} target="_blank" rel="noopener">
                      <ExternalLink className="h-3.5 w-3.5" /> فتح
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-1">💡 نصائح للاستخدام</p>
          <ul className="list-disc list-inside space-y-1">
            <li>ابعت QR التقييمات لأي عميل سابق على واتساب أو كصورة بعد الرحلة مباشرة — كل تقييم بيظهر على الصفحة الرئيسية بعد موافقتك من قسم التقييمات.</li>
            <li>اطبع QR الموقع وحطه في المكتب أو على كروت العمل.</li>
            <li>QR الرحلات مناسب للبنرات والـ Standees في الفنادق والمكاتب السياحية.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
