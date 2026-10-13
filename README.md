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
- **No accounts are pre-created.** Kathy, CJ and Admin must sign in with their real email addresses, after which they can be matched to roles. The Admin role will activate automatically when its preapproved email identity signs in.

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
