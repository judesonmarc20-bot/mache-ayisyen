# 🚀 Gid pou mete Mache Ayisyen anliy (gratis)

Gid sa a ap montre ou etap-pa-etap kijan pou mete sit la sou entènèt **gratis**,
pou nenpòt moun ka vizite l. N ap itilize twa zouti gratis:

- **GitHub** — pou estoke kòd la (kote Render ap li l).
- **Neon** — baz done PostgreSQL gratis (done yo rete pou toutan).
- **Render** — kote sit la ap kouri.

> ⏱️ Sa pran anviwon 20-30 minit premye fwa. Ou pa bezwen konnen pwogramasyon.
> Tout bagay fèt nan navigatè ou (klike, kopye, kole).

---

## Etap 1 — Mete kòd la sou GitHub

1. Kreye yon kont gratis sou https://github.com (si ou pa genyen).
2. Klike sou bouton **"New"** (oswa **"+"** anwo adwat -> "New repository").
3. Bay li yon non (egz. `mache-ayisyen`), kite l **Public** oswa **Private**,
   epi klike **"Create repository"**.
4. Kounye a, ou bezwen voye dosye pwojè a (sa ki nan zip la) sou repo sa a.
   Fason ki pi fasil san kòmand:
   - Sou paj repo a, klike **"uploading an existing file"**.
   - Trennen (glise) TOUT dosye pwojè a (backend, frontend, render.yaml,
     README.md, elat.) — **men PA dosye `node_modules` yo** si yo la.
   - Klike **"Commit changes"**.

   > 💡 Si ou konfòtab ak Git nan tèminal, ou ka fè `git init`, `git add .`,
   > `git commit`, epi `git push` — men fason "upload" anwo a mache byen tou.

---

## Etap 2 — Kreye baz done a sou Neon

1. Ale sou https://neon.com epi kreye yon kont gratis (ou ka itilize kont
   GitHub ou). **Pa gen kat kredi ki nesesè.**
2. Klike **"Create project"** (oswa "New project").
3. Bay pwojè a yon non (egz. `mache-ayisyen`), chwazi yon rejyon ki pre ou
   (egz. US East), epi kreye l.
4. Apre sa, Neon ap montre ou yon **"Connection string"** — se yon liy ki
   kòmanse ak `postgresql://...`. **Kopye l** (gen yon bouton kopye).
   Egzanp fòm li:
   ```
   postgresql://neondb_owner:XXXX@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Kenbe l yon kote — n ap bezwen l nan Etap 3.

---

## Etap 3 — Deplwaye sou Render

1. Ale sou https://render.com epi kreye yon kont gratis (itilize kont GitHub
   ou pou senp). **Pa gen kat kredi ki nesesè pou plan gratis la.**
2. Klike **"New +"** anwo adwat -> **"Blueprint"**.
3. Render ap mande ou konekte GitHub — otorize l, epi chwazi repo
   `mache-ayisyen` ou fèk kreye a.
4. Render ap li fichye `render.yaml` la otomatikman epi montre ou sèvis
   `mache-ayisyen` la. Klike **"Apply"** (oswa "Create").
5. Render ap mande ou ranpli kèk **"Environment Variable"**. Men sa pou mete:
   - **`DATABASE_URL`** → kole "Connection string" Neon ou a (soti Etap 2).
   - **`FRONTEND_URL`** → kite l vid pou kounye a (n ap ranpli l nan Etap 4).
   - Lòt yo (MonCash, Stripe) → kite yo vid pou kounye a.
   - **AJOUTE youn nouvo**: `SEED_ON_START` = `true`
     (sa ap ranpli baz done a ak done demo + kont admin sou premye demaraj).
6. Klike **"Apply"** / **"Deploy"**. Render ap kòmanse bati sit la — sa pran
   5-10 minit premye fwa. Ou ka gade "Logs" pandan l ap travay.
7. Lè l fini, Render ap ba ou yon **URL piblik** tankou:
   ```
   https://mache-ayisyen.onrender.com
   ```
   Louvri l — sit ou a anliy! 🎉

---

## Etap 4 — Ranpli FRONTEND_URL (enpòtan pou peman)

1. Kopye URL piblik Render ba ou a (egz. `https://mache-ayisyen.onrender.com`).
2. Sou Render, ale nan sèvis ou a -> **"Environment"**.
3. Jwenn `FRONTEND_URL` epi mete URL sa a ladan l.
4. Retire `SEED_ON_START` (oswa mete l `false`) pou baz done a pa re-ranpli
   chak fwa. Klike **"Save changes"** — Render ap redeplwaye otomatikman.

---

## ✅ Fini!

Sit ou a anliy kounye a. Ou ka konekte ak kont demo yo:

| Wòl   | Email                   | Modpas     |
|-------|-------------------------|------------|
| Admin | admin@marketplace.ht    | admin123   |
| Vandè | vandeur1@marketplace.ht | vandeur123 |
| Kliyan| kliyan@marketplace.ht   | kliyan123  |

> ⚠️ **Enpòtan pou sekirite**: chanje modpas admin sa a byen vit (oswa kreye
> yon nouvo kont admin), paske modpas demo yo piblik nan gid sa a.

---

## Kèk bagay pou konnen

- **Sit la "dòmi"**: sou plan gratis Render, si pèsonn pa vizite sit la pandan
  15 minit, li "dòmi". Premye vizit apre sa pran ~30 segond pou l reveye. Se
  nòmal — ou ka peye yon ti kras ($7/mwa) pita pou retire sa.
- **Ajoute fonksyonalite pita**: chak fwa ou vle chanje yon bagay, ou mete
  ajou kòd la sou GitHub, epi Render redeplwaye otomatikman. Done ki nan Neon
  yo PA pèdi. (Gade "Ajoute lòt bagay" pi ba a.)
- **Peman reyèl**: pou aktive MonCash/Stripe, ranpli kle yo nan "Environment"
  Render (gade README.md pou detay), epi konfigire "Return URL" MonCash ou a
  sou `https://ton-url.onrender.com/payment/return`.

## Ajoute lòt bagay san kraze sit la

1. Fè chanjman nan kòd la (oswa mande m fè yo).
2. Mete kòd ki chanje a sou GitHub (menm repo a).
3. Render wè chanjman an epi redeplwaye otomatikman.
4. Nouvo tab baz done yo kreye pou kont yo; done ki la deja PA pèdi.

Se konsa ou ka kontinye bati sou sit la pandan l ap kouri, san danje.
