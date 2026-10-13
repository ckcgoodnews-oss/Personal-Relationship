# Personal Bible Study Hub

A single umbrella repository for personal Bible study resources, hosted on GitHub Pages. All Bible research links use the **New World Translation** and **Watchtower Online Library**.

## Open the hub

**[All Bible Studies — Hub](https://ckcgoodnews-oss.github.io/Personal-Relationship/hub/)**

| Resource | Lessons | Open |
| --- | ---: | --- |
| Personal Relationship With Jehovah | 28 | [Study](https://ckcgoodnews-oss.github.io/Personal-Relationship/) |
| Do Not Impose Your Conscience on Others | 28 | [Study](https://ckcgoodnews-oss.github.io/Personal-Relationship/conscience-study.html) |
| Loving My Adult Son Without Controlling Him | 7 | [Study](https://ckcgoodnews-oss.github.io/Personal-Relationship/studies/mother-study.html) |
| Daily Personal Bible Study Guide | Self-paced (1 completion milestone) | [Guide](https://ckcgoodnews-oss.github.io/Personal-Relationship/studies/daily-study-guide.html) |

The mother-and-son study and daily training guide were copied from `ckcgoodnews-oss/conscience-study` and `ckcgoodnews-oss/personal-bible-study-guide`. Their source repositories remain intact to prevent broken existing links. The central umbrella repository now hosts all four study resources.

## Account and administrator

- [My private study dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/account/)
- [Admin completion dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/admin/)

Authentication and storage use **Supabase** project `Personal-Bible-Study-Tracking` (US East, free tier), project ref `lyuyzfmfcsbjeizgmgvp`.

### Roles and permissions

- **Kathy and CJ — students**: each signs in with their own email link. Each person sees only their own progress and private journal entries.
- **Admin**: can view each student's completed lesson totals, percentages, and last completed activity in the separate Admin page. **Cannot read journal entries or personal reflection content.**
- The Admin role is never granted by a public browser, email address claim, or user-editable profile. The role is assigned automatically by the protected database enrollment mapping when the approved email identity first signs in.
- New user accounts default to **student**. The admin dashboard displays only authorized records from the `admin_study_progress()` RPC.
- The study pages use `study_day_progress` with row-level security (RLS). Only the relevant signed-in account can read and write that person's records.
- **Accounts are created in Supabase Auth on first valid email sign-in or by Admin.** Kathy, CJ and Admin must sign in with their real email addresses, after which they can be matched to roles. The Admin role will activate automatically when its preapproved email identity signs in.

### Approved accounts and activation

A **private Supabase enrollment list**, not checked into this public repository, identifies three accounts:

- Kathy — Student
- CJ — Student
- Admin — Administrator

The authorized email identities are stored only in the database. The first successful email-link sign-in automatically creates the corresponding user profile with its preassigned role. **Nobody needs to run SQL manually to grant Admin privileges.** Someone using a different email address can neither access study progress nor claim an Admin role. Study completion and private journals remain owned by each signed-in user; the role-restricted reporting function only returns student completion counts.

Because Supabase Auth has not yet registered the three sign-ins, each user must enter their approved email on the [account page](https://ckcgoodnews-oss.github.io/Personal-Relationship/account/), receive a secure email link, and open it. **No passwords or invitation emails were sent by the repository publishing process.**

### Authentication URL configuration

In [Supabase Authentication → URL Configuration](https://supabase.com/dashboard/project/lyuyzfmfcsbjeizgmgvp/auth/url-configuration), use:

```text
https://ckcgoodnews-oss.github.io/Personal-Relationship/account/
```

as the site URL and redirect URL. Ensure the Email provider is enabled.


## Username/email and password accounts

The study account page now defaults to **email + password** sign-in. Email is the login username. Previously verified Kathy and Admin accounts can use their existing signed-in session or request one email link to set their own permanent password; CJ has not yet activated an account and can be created by Admin without sending an email.

The [Admin dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/admin/) offers a **Manage student accounts** panel. After Admin signs in, it can:

- Create a student with a display name and email address (without sending an email).
- Generate a **unique, cryptographically random temporary password**, displayed once for Admin to pass privately to the student.
- Issue a new temporary password for an existing student when they forget theirs.
- View approved account activation and forced-password-change status.

The [study account dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/account/) requires a student using a temporary password to set a new password before their progress and notes unlock. Passwords are managed by Supabase Auth, not stored in GitHub or the study database.

**Do not reuse a shared default password such as `pa$word01`.** A disclosed common password would compromise all student accounts, even if users were required to change it later. The server-generated password is always unique.

### Protected account management endpoint

Supabase Edge Function: `study-accounts` (requires a signed-in JWT). It verifies the user through Supabase Auth and applies database-backed Administrator checks on each create/reset/roster request. Privileged service credentials stay only in Supabase's function environment; never in public GitHub Pages source code. Only an approved Admin can manage student accounts; no one can create an Admin account through the website.

Password recovery is intentionally **administrator-mediated for students**, avoiding Supabase's restrictive email service. Admin can change their own password while authenticated. If the administrator loses access to every active session and cannot get a magic link, account recovery must be performed by the Supabase project owner; do not publish admin recovery secrets in GitHub.

## Recover a locked-out Administrator

The [Personal Study Dashboard](https://ckcgoodnews-oss.github.io/Personal-Relationship/account/) includes **Locked out? Reset Admin password**. Recovering Admin access does **not** require a working email sender.

1. Sign in to the [Supabase SQL Editor](https://supabase.com/dashboard/project/lyuyzfmfcsbjeizgmgvp/sql/new) as a project owner.
2. Execute **`select study_private.issue_admin_password_recovery();`**. Copy the 64-character output from the SQL result table. Do **not** paste the code into GitHub, public posts, or ChatGPT.
3. Open the Study Dashboard and select **Locked out? Reset Admin password**.
4. Paste the code and choose a permanent password of at least 12 characters containing uppercase, lowercase, a number, and a symbol. Confirm and save.
5. Sign in as Admin with the new password.

The code is valid **15 minutes**, **one use only**. Generating another code invalidates the previous code. The SQL Editor generator is accessible only to the privileged Postgres role, and it stores only a SHA-256 digest of the code. The account password is updated by the `study-admin-recovery` Supabase Edge Function, which uses the service role only on the server and requires proof of possession of a valid one-time code. The code is never embedded in GitHub source.

Do not try to reset an Admin password by editing `auth.users.encrypted_password` manually, and never put a Supabase secret key in website code.

## Local device notes and progress

The two 28-day apps include cloud synchronization when signed in. Older device-only entries may be imported by the account holder. Imported guides display a separate progress panel to mark their 7 lessons or the training guide's completion milestone; existing local guide preferences remain on that device unless manually transferred.

**Important:** GitHub Pages is a publicly accessible static host. Do not commit any passwords, service-role keys, private journals, or study-user email address lists to this repository. The shared configuration uses only a public Supabase publishable API key; database RLS and the secure Admin RPC enforce access boundaries.

## Project structure

```text
index.html                   Original 28-day friendship study
conscience-study.html        Original 28-day conscience study
hub/index.html               Central four-study library
account/index.html           Personal progress and email sign-in
admin/index.html             Role-restricted completion dashboard
studies/mother-study.html    Consolidated seven-day family study
studies/daily-study-guide.html  Consolidated self-paced training guide
shared/config.js             Public Supabase project configuration
shared/study-cloud.js        Shared authentication and syncing client
```

This is an independent Bible study tool, not an official website of Jehovah's Witnesses.
