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
4. **Database Password**: set during project creation (or rotate in **Settings → Database**)  
5. **Service Role Key**: **Settings → API → service_role** (server-side only; use in n8n)  
6. **Connection strings**: **Connect → (Prisma / psql)**

**Example `.env` values** (replace placeholders):

```env
# Prisma (server-based local dev recommended)
DATABASE_URL="postgresql://prisma.<PROJECT_REF>:<PRISMA_DB_PASSWORD>@<REGION>.pooler.supabase.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://prisma:<PRISMA_DB_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

> Tip: Create a dedicated DB user `prisma` in SQL editor if you prefer not to use `postgres`, then grant privileges on `public` schema.

---

## 5) Configure environment & install

1. Copy **`.env.example` → `.env`** and fill `DATABASE_URL` + `DIRECT_URL`  
2. Install deps:

```bash
pnpm install
# or npm i / yarn
```

3. Generate Prisma client & run migrations:

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

---

## 6) Run the Next.js UI

```bash
pnpm dev
```

- Open [http://localhost:3000](http://localhost:3000)  
- The page loads rows via Prisma: select `id, name, nodeCount` + related arrays, then maps to the table row type.  
- Columns render badges for array fields; table has search inputs for name + array columns.

---

## 7) Import & run the n8n workflow

1. Start n8n (Docker or binary)  
2. **Import** the provided workflow JSON (menu → Import from file)  
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

---

## 11) Extending

- Add `modelsUsed` to the UI by copying the `credentialsUsed` column and filter  
- Add download buttons for `workflowJson`  
- Add auth with NextAuth  
- Add server-side pagination for large datasets

---

## 12) Scripts

```bash
# dev
npm run dev

# prisma helpers
npx run prisma generate
npx prisma migrate dev
npx prisma studio
```

---

## 13) Environment summary

Create `.env`:

```env
DATABASE_URL="postgresql://prisma.<PROJECT_REF>:<PRISMA_DB_PASSWORD>@<REGION>.pooler.supabase.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://prisma:<PRISMA_DB_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"
```

In **n8n** credentials:
- **Supabase REST**: `https://<PROJECT-REF>.supabase.co/rest/v1` + `service_role` as Bearer  
- **Google Drive OAuth**: standard OAuth app (Client ID/Secret) and grant access to your folder

---

## 14) Import the example n8n workflow

Use `Get Meta from Workflows.json` in this repo. It has:
- Drive trigger  
- JSON extract & summarize  
- Supabase inserts  
- Loops for node types and credentials