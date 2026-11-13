EXAM PREP DASHBOARD — CROSS-DEVICE SYNC

WHAT'S NEW
- Sign in with the same email/password on your phone, laptop and other devices.
- Chapter completion is stored in Supabase cloud storage.
- Realtime updates from another signed-in device are reflected automatically.
- Local browser storage remains as a local fallback and backup/import/export still work.

SETUP (REQUIRED ONCE)
1. Create a free project at https://supabase.com/ and open its project dashboard.
2. Open SQL Editor, paste the full contents of supabase-schema.sql, and run it.
3. In Project Settings > API, copy the Project URL and anon/public key.
4. Open supabase-config.js and replace YOUR_SUPABASE_PROJECT_URL and YOUR_SUPABASE_ANON_PUBLIC_KEY with those values.
   IMPORTANT: Use the anon/public key only. Never put a service_role key in website code.
5. In Supabase Authentication > URL Configuration, add your deployed website URL to Site URL / Redirect URLs.
6. Deploy all files together on your website host (including supabase-config.js).
7. Open the website, create an account, and sign in. Use the same account on every device.

EMAIL CONFIRMATION
If Supabase email confirmation is enabled, confirm the email before signing in. For a quick private test, configure email confirmation in Supabase Auth settings as you prefer; do not disable it for a public app without considering account security.

FILES
- index.html: dashboard UI and login panel
- app.js: dashboard logic, local fallback, authentication and realtime cloud sync
- data.js: syllabus, exam dates and study plan
- supabase-config.js: your project URL and anon/public key (fill these in)
- supabase-schema.sql: database table, security policies and realtime publication setup

IMPORTANT
- The same account shares one progress record across devices. This is not a multi-student admin dashboard.
- The first device that signs in to a brand-new account uploads its existing local progress if no cloud record exists. Once a cloud record exists, signing in on another device downloads that cloud progress.
- Do not share your password. Never expose a Supabase service_role key.
- Keep Export backup for an independent copy of your progress.
