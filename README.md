# Personal Bible Studies — Private Multiuser Progress

Two independent, 28-day personal Bible studies using only the **New World Translation** and **Watchtower Online Library** as their Bible/research sources.

## Websites

- [Personal Relationship With Jehovah](https://ckcgoodnews-oss.github.io/Personal-Relationship/) — 28 daily lessons.
- [Do Not Impose Your Conscience on Others](https://ckcgoodnews-oss.github.io/Personal-Relationship/conscience-study.html) — 28 daily lessons and practice scenarios.
- [My Study Dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/account/) — private, per-user totals and email-link sign-in.

Each study has a daily timer, Scripture and WOL links, completion indicators, and personal study-journal entries.

## How tracking works

The public GitHub Pages site runs in each user's browser. **Supabase Authentication** provides separate email-based accounts; PostgreSQL stores each person's progress and journal entries. **Row Level Security (RLS)** restricts each signed-in person to their own records. No administrator dashboard is included.

People who do not sign in can still use a study with local browser-only progress. To bring earlier local notes into an account, sign in first and choose **Import device notes** on the relevant study page. Import requires confirmation. Different accounts remain separate. The same-day changes made on two devices at once can overwrite each other.

The app publishes only the Supabase **public publishable key**, never a database secret or service-role key.

## Required Supabase email authentication setup

The separate Supabase project is **Personal-Bible-Study-Tracking** (project ID `lyuyzfmfcsbjeizgmgvp`).

1. Open [Supabase Authentication → URL Configuration](https://supabase.com/dashboard/project/lyuyzfmfcsbjeizgmgvp/auth/url-configuration).
2. Set the Site URL to `https://ckcgoodnews-oss.github.io/Personal-Relationship/account/`.
3. Add the same full URL to the allowed **Redirect URLs**.
4. Under **Authentication → Providers**, verify that Email / passwordless sign-in is enabled.
5. Visit the [account dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/account/) and request a sign-in link. Check both studies after signing in.

Supabase's default email service may have sending limits. Configure an email provider if you require regular usage by many people.

## Repository structure

- `index.html` — Jehovah friendship study
- `conscience-study.html` — Conscience and Christian discernment study
- `account/index.html` — User dashboard
- `shared/config.js` — Public Supabase settings
- `shared/study-cloud.js` — Per-user authentication and synchronization
- `.nojekyll` — Static site marker

The `main` branch root is the GitHub Pages publishing source. If a new study is added, give it a distinct ID, register it in the shared study catalog, and add a private RLS-protected progress table entry as appropriate.

## Privacy and safety

The website and research references are public; users' notes are **not committed to GitHub**. Signed-in records are private to that user by Supabase RLS; anyone with access to a device/browser session may also access the locally cached entries, so sign out on shared devices. Export notes as a backup.

This is an **unofficial personal study aid**, not produced or endorsed by Jehovah's Witnesses or the Watch Tower Bible and Tract Society.
