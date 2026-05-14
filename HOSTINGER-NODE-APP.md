# دليل نشر الفرونت إند كـ Node.js Application على Hostinger

## في hPanel — إعداد التطبيق

افتح **hPanel → Advanced → Node.js** واملأ الحقول التالية:

| الحقل | القيمة |
|---|---|
| **Node.js version** | `20.x` (مطلوب) |
| **Application mode** | `Production` |
| **Application root** | `lottus-frontend` (أو الفولدر اللي رفعت فيه الكود) |
| **Application URL** | `lotussharm.com` (الدومين الرئيسي) |
| **Application startup file** | `server.js` |

> **مهم:** بعد إعداد التطبيق، Hostinger هتعمل `npm install` تلقائياً، ثم تشغّل `server.js` عبر Passenger.

## متغيرات البيئة (Environment Variables)

في نفس صفحة Node.js Application، اضغط **Add variable** وأضف:

```
NEXT_PUBLIC_API_URL = https://api.lotussharm.com/api
API_INTERNAL_URL    = https://api.lotussharm.com/api
NEXT_PUBLIC_SITE_URL = https://lotussharm.com
NEXT_PUBLIC_WHATSAPP = 201090767278
NODE_ENV            = production
```

> **ملاحظة:** ضع رابط الباك إند بعد إنشاء الـ subdomain (مثلاً `api.lotussharm.com`). لو الـ subdomain لسه مش معمول، الفرونت هيشتغل لكن الصفحات الديناميكية (الرحلات، الحجز، الأدمن) هتعرض حالة فارغة لحد ما الباك إند يبقى online.

## رفع الكود

استخدم واحدة من الطريقتين:
1. **Git Deploy** (موصى به): اربط الـ repo بـ hPanel → Git → Add Repository
2. **FTP/SFTP**: ارفع كل محتويات `lottus-sharm-frontend/` للفولدر اللي حددته كـ Application root
3. **File Manager**: ZIP الفولدر → ارفع → فك الضغط

## أمر البناء

بعد رفع الكود، اضغط **Run NPM Install** ثم **Run** على `npm run build` من واجهة hPanel Node.js (أو من SSH):

```bash
cd ~/lottus-frontend
npm install
npm run build
```

ثم أعد تشغيل التطبيق من زر **Restart** في hPanel.

## التحقق من النجاح

افتح `https://lotussharm.com/` — لازم تظهر الصفحة الرئيسية بالعربي. لو ظهرت 502 أو خطأ، شيك على Logs من hPanel.

## استكشاف الأخطاء

- **502 Bad Gateway**: التطبيق مش شغال. شغل من زر Restart.
- **خطأ في البناء `params not in UrlObject`**: محتاج آخر commit (تم إصلاحه).
- **الرحلات فاضية**: الباك إند لسه مش online. اعمل subdomain `api.lotussharm.com` كـ Node app ثاني.
- **خطأ في الإيميل/الـ Stripe**: محتاج إعدادات Backend (`.env` على الباك إند Node app).
