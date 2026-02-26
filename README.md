# Forma (فرما) - Handoff-Ready Production Package

Persian-first RTL full-stack platform for a design-build studio:
- Public website
- Client portal
- Admin panel + CMS
- PostgreSQL + Prisma
- NextAuth
- S3/MinIO uploads
- SMTP notifications
- Dockerized dev/prod

## EN - Client Handoff

### 1) Access URLs
- Public site: `https://your-domain.com`
- Admin panel: `https://your-domain.com/admin`
- Client portal: `https://your-domain.com/portal`

### 2) Default seeded logins (change immediately)
- Super Admin: `admin@forma.ir` / `FormaAdmin123!`
- Sales: `sales@forma.ir` / `FormaSales123!`
- Demo client: `client@forma.ir` / `FormaClient123!`

### 3) Add/Edit projects
1. Log in to `/admin`.
2. Go to `Projects`.
3. Create/edit title, category, location, year, area, services, description.
4. Upload gallery images.
5. Optional: add video URLs.
6. Mark as `Published` to show on public site.

### 4) Manage requests + send estimates
1. Go to `Requests`.
2. Filter by status/type/category/date.
3. Open a request.
4. Assign responsible user, update status, add internal notes.
5. Send estimate in `تومان` from the estimate form.
6. Client sees estimate immediately in portal and receives email.

### 5) Consultation availability
1. Go to `Availability`.
2. Add one-off slots (or weekly repeats).
3. Booked slots are locked and cannot be removed.

### 6) CMS content editing
Admin → `Content` lets you edit:
- Homepage hero text
- About intro
- Services text
- Contact data (phones/hours/address/instagram/map/email optional)

Public email is hidden until filled in CMS.

## EN - Production Deploy

### Required env vars
- Auth: `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_SECRET`
- DB: `DATABASE_URL`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`
- S3: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_BASE_URL`
- Security/Ops: `CRON_SECRET`
- Optional analytics: `PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_GA_ID`

Use `.env.production.example` as template.

### Docker (production)
1. Copy and edit env:
```bash
cp .env.production.example .env.production
```
2. Run with external S3 (AWS or compatible):
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
3. Or run with MinIO profile:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production --profile minio up -d --build
```
4. Health check:
```bash
curl http://localhost:3000/api/health
```

### Meeting reminder cron
Run hourly (or via scheduler) with `CRON_SECRET`:
```bash
curl -X POST https://your-domain.com/api/cron/meeting-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

## EN - Branding
- Primary logo (transparent): `/public/32.png`
- Secondary logo (white background): `/public/1.jpg`
- App icons used by metadata:
  - `/public/favicon.png`
  - `/public/apple-touch-icon.png`
  - `/public/icon-192.png`
  - `/public/icon-512.png`

To replace branding later, swap those files and keep same names.

## EN - Smoke Test Checklist (Click-by-Click)
1. Public browsing:
- Open `/`, `/about`, `/services`, `/portfolio`, `/contact`.
- Verify Persian RTL UI, logo, contact block, footer details.
2. Portfolio filters:
- Apply category/year/service/search filters and confirm results/empty state.
3. Project CTA prefill:
- Open a project and click `درخواست برآورد برای پروژه مشابه`.
- Confirm request form is prefilled with project context.
4. Client auth:
- Sign up/sign in at `/auth/signup` and `/auth/signin`.
5. Request creation + uploads:
- Submit estimate request with files.
6. Admin review + estimate:
- Open request in `/admin/requests`, update status/assignee, send estimate.
7. Email checks:
- Dev: confirm emails in Mailpit.
- Prod: confirm SMTP delivery.
8. Consultation booking + lock:
- Submit consultation using a slot.
- Try reusing same slot from another request and confirm lock/error.

---

# راهنمای فارسی (تحویل نهایی)

## تحویل به کارفرما

### ۱) آدرس‌های اصلی
- سایت: `https://your-domain.com`
- پنل مدیریت: `https://your-domain.com/admin`
- پرتال کارفرما: `https://your-domain.com/portal`

### ۲) اطلاعات ورود اولیه (بلافاصله تغییر داده شود)
- سوپر ادمین: `admin@forma.ir` / `FormaAdmin123!`
- فروش: `sales@forma.ir` / `FormaSales123!`
- کاربر دمو: `client@forma.ir` / `FormaClient123!`

### ۳) مدیریت پروژه‌ها
1. ورود به `/admin`.
2. بخش `پروژه‌ها`.
3. ثبت/ویرایش اطلاعات پروژه.
4. آپلود تصاویر گالری و در صورت نیاز لینک ویدئو.
5. فعال‌سازی `منتشر شود` برای نمایش در سایت.

### ۴) مدیریت درخواست‌ها و ارسال برآورد
1. ورود به `درخواست‌ها` در پنل ادمین.
2. فیلتر بر اساس وضعیت/نوع/دسته/تاریخ.
3. تخصیص مسئول، ثبت یادداشت داخلی، تغییر وضعیت.
4. ارسال برآورد با واحد `تومان`.
5. نمایش آنی در پرتال کارفرما + ارسال ایمیل.

### ۵) مدیریت زمان مشاوره
1. بخش `زمان‌های مشاوره`.
2. افزودن اسلات تکی یا تکرار هفتگی.
3. اسلات رزرو شده قفل است و حذف نمی‌شود.

### ۶) مدیریت محتوای سایت (CMS)
در مسیر `/admin/content` قابل ویرایش است:
- متن هدر خانه
- معرفی درباره ما
- متن خدمات
- اطلاعات تماس (شماره‌ها، ساعت کاری، آدرس، اینستاگرام، نقشه، ایمیل اختیاری)

اگر ایمیل تماس خالی باشد، در صفحات عمومی نمایش داده نمی‌شود.

## استقرار Production

### متغیرهای ضروری
- `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `SMTP_*`
- `S3_*`
- `CRON_SECRET`

نمونه آماده: `.env.production.example`

### استقرار با Docker
```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

برای MinIO داخلی:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production --profile minio up -d --build
```

### سلامت سرویس
```bash
curl http://localhost:3000/api/health
```

### کران یادآوری جلسه
```bash
curl -X POST https://your-domain.com/api/cron/meeting-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

## برندسازی
- لوگوی اصلی: `/public/32.png`
- لوگوی ثانویه: `/public/1.jpg`
- آیکن‌ها:
  - `/public/favicon.png`
  - `/public/apple-touch-icon.png`
  - `/public/icon-192.png`
  - `/public/icon-512.png`

## اجرای توسعه (Local)
```bash
cp .env.example .env
docker compose up --build
```

سرویس‌ها:
- اپ: `http://localhost:3000`
- Mailpit: `http://localhost:8025`
- MinIO Console: `http://localhost:9001`

## نکات فنی
- پروژه Persian-first و RTL است (`lang="fa"`, `dir="rtl"`).
- رنگ برند: `#012C22`.
- صفحات عمومی cache-friendly هستند و بعد از تغییر CMS/Project با tag revalidate به‌روز می‌شوند.
- endpoint سلامت: `/api/health`
- robots: مسیرهای `/admin` و `/portal` برای crawler ها مسدود هستند.

# Forma
