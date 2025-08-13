# N8N → Supabase → Next.js (Workflows Explorer)

A minimal Next.js app that lists your n8n workflow JSONs (uploaded to Google Drive → parsed in n8n → saved to Supabase) with search, sort, and filters. Array fields like **nodeTypes** and **credentialsUsed** render as badges in the table UI.

---

## 1) What’s in this repo?

- **Next.js UI**  
  - Server component loads rows from Supabase via Prisma and feeds them into a Shadcn-powered DataTable (search on workflow name + array filters).
- **n8n workflow (JSON)**  
  - A ready workflow that:
    1. Watches a Google Drive folder for `.json` files  
    2. Extracts meta (workflowName, nodeTypes, credentialsUsed, nodeCount)  
    3. Inserts a `Workflow` row in Supabase, then loops each nodeType/credential to upsert and link them.

---

## 2) Architecture

```
Google Drive (JSON) ➜ n8n
   - Trigger: Drive folder watch
   - Extract JSON + summarize meta
   - Insert Workflow
   - Loop nodeTypes / credentialsUsed: upsert + link
            ↓
        Supabase (Postgres)
            ↓
     Next.js + Prisma
   - /app/.../page.tsx queries Workflow (+ related tables)
   - columns.tsx renders badges; data-table.tsx handles filters/pagination
```

---

## 3) Prerequisites

- **Node.js** 18+ (LTS)  
- **pnpm**, **npm**, or **yarn**  
- **Supabase** project (Postgres DB)  
- **n8n** (Docker or local) with:
  - Google Drive OAuth credential (to watch folder + download files)
  - Supabase REST credentials (Service Role) to write rows

---

## 4) Create a Supabase project & get credentials

1. **Create account/project**: [app.supabase.com](https://app.supabase.com) → New Project  
2. **Project REF**: visible in the project URL `https://<PROJECT-REF>.supabase.co`  
3. **Region**: shown under **Settings → General**  
4. **Create User, Permissions and Password**: Run the below sql query with your own password instead of "custom_password" in SQL Editor tab in the project 

```sql
-- Create custom user
create user "prisma" with password 'custom_password' bypassrls createdb;

-- extend prisma's privileges to postgres (necessary to view changes in Dashboard)
grant "prisma" to "postgres";

-- Grant it necessary permissions over the relevant schemas (public)
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;

```

5. **Service Role Key**: **Settings → API → service_role** (server-side only; use in n8n)
6. **Connection strings**: Rename .env.example to .env in root folder and get those variables by clicking on connect in the navbar of the project. DATABASE_URL environment variable needs to be taken from Transaction pooler and DIRECT_URL needs to be take from Session Pooler.

**Example `.env` values** (replace placeholders):

```env
# Prisma (server-based local dev recommended)
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PRISMA_DB_PASSWORD>@<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<PROJECT_REF>:<PRISMA_DB_PASSWORD>@<REGION>.pooler.supabase.com:5432/postgres"
```

---

## 5) Configure environment & install

1. Copy **`.env.example` → `.env`** and fill `DATABASE_URL` + `DIRECT_URL`  
2. Install deps:

```bash
npm install
# or npm i / yarn
```

3. Generate Prisma client & run migrations:

```bash
npm prisma generate
npm prisma migrate dev
```

---

## 6) Run the Next.js UI

```bash
npm dev
```

- Open [http://localhost:3000](http://localhost:3000)  

---

## 7) Import & run the n8n workflow

1. Start n8n (Docker or binary)  
2. **Import** the provided workflows JSON provided in app/lib in the repo
3. Set up **Google Drive OAuth** credential and point the **Drive Trigger** to your folder of workflow JSONs  
4. Set up **Supabase** credential (use **Service Role Key** for server-side writes)  
5. Workflow steps:
   - Extract JSON to `data`  
   - Code node builds `workflowName`, `workflowId`, `nodeCount`, `nodeTypes`, `credentialsUsed`  
   - Create Workflow row in Supabase  
   - Loop nodeTypes / credentialsUsed → upsert + link to workflow

Once running, dropping an n8n workflow JSON into your Google Drive folder will insert a new `Workflow` row in Supabase and make it appear in the UI.

---

## 8) Files to look at (UI)

- `page.tsx` – fetches from Prisma & renders table  
- `columns.tsx` – defines columns, badge renderers, array filter function  
- `data-table.tsx` – DataTable component, search inputs for name/arrays, sorting, pagination

---

## 9) Schema & expectations

- `Workflow`: `id`, `name`, `workflowId`, `nodeCount`, `workflowJson`, timestamps  
- `NodeType`, `CredentialUsed` (and optionally `ModelUsed`) lookup tables with `name @unique`  
- Join tables for linking `Workflow` ↔ `NodeType` / `CredentialUsed`

---

## 10) Troubleshooting

- **P1001**: can’t reach server → check host, sslmode, paused project  
- **P1000**: auth failed → check username/password format (`user.<PROJECT_REF>` for pooled)  
- **UI empty**: check that n8n inserted a Workflow row in Supabase  
- **Duplicates**: ensure unique constraints on lookup + composite PK on join tables

## 11) Deployment to Vercel

- **Add the Environment Variables**: DATABASE_URL & DIRECT_URL
- **Change Build Command before deploying in vercel import tab**:

```bash
npx prisma migrate dev && npx prisma generate && npm run build 
```