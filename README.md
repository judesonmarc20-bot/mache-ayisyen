# Mache Ayisyen — Platfòm Marketplace Multi-Vendor

Yon platfòm e-commerce **multi-vendor** konplè (tankou yon mini-Etsy/Shopify): plizyè
vandè ka kreye pwòp magazen yo, ajoute pwodwi, epi kliyan ka achte nan yon sèl sit.
Bati ak **JavaScript pura** (backend + frontend), yon baz done reyèl, e estriktire yon
fason pwofesyonèl pou ou ka **revann li** — swa kòm yon SaaS, swa kòm yon pwodwi konplè.

## 📦 Estrikti pwojè a

```
marketplace/
├── backend/          API la (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── models/        Aksè baz done a (User, Store, Product, Cart, Order...)
│   │   ├── controllers/   Lojik biznis pou chak resous
│   │   ├── routes/        Definisyon wout API yo (/api/...)
│   │   ├── middleware/    Otantifikasyon (JWT) ak kontwòl wòl (ADMIN/VENDOR/CUSTOMER)
│   │   ├── db.js          Koneksyon baz done a
│   │   └── seed.js        Done demo (kont + pwodwi egzanp)
│   └── sql/schema.sql     Estrikti tab yo (SQL brit, fasil pou li)
│
└── frontend/         Sit la (React + Vite + Tailwind CSS)
    └── src/
        ├── pages/          Chak paj (Home, Cart, Login, VendorDashboard, AdminDashboard...)
        ├── components/     Moso reyitilizab (Navbar, ProductCard...)
        ├── context/        Eta global (kilès ki konekte, sa ki nan panye a)
        └── api/client.js   Sèl kote ki pale ak backend la
```

## ⚠️ Sa ou bezwen enstale anvan

**Node.js vèsyon 22 oswa pi wo** (backend la itilize `node:sqlite`, modil ki
DEJA anndan Node.js — pa gen okenn konpilasyon C++ oswa zouti Windows apa ki
nesesè). Telechaje l sou https://nodejs.org (vèsyon "LTS"), epi verifye ak
`node --version` nan yon tèminal.

## 🚀 Kouri li lokalman

**1. Backend:**
```bash
cd backend
npm install
npm run seed     # ranpli baz done a ak kont/pwodwi demo
npm run dev       # kouri sou http://localhost:4000
```

**2. Frontend** (nan yon lòt tèminal):
```bash
cd frontend
npm install
npm run dev       # kouri sou http://localhost:5173
```

Louvri http://localhost:5173 nan navigatè ou.

### Kont demo yo (apre `npm run seed`)
| Wòl   | Email                     | Modpas       |
|-------|---------------------------|--------------|
| Admin | admin@marketplace.ht      | admin123     |
| Vandè | vandeur1@marketplace.ht   | vandeur123   |
| Vandè | vandeur2@marketplace.ht   | vandeur123   |
| Kliyan| kliyan@marketplace.ht     | kliyan123    |

**Done demo ki deja la**: koupon `SOLDE10` (10% rabè) ak `BYENVENI` (200 G rabè, min
1000 G); 5 zòn livrezon (Pòtoprens, Okap, Gonayiv, Okay, lòt vil); ak kèk evalyasyon.

## 🧩 Fonksyonalite ki deja bati

- **Otantifikasyon konplè**: enskripsyon, koneksyon, jeton JWT, modpas chifre (bcrypt)
- **3 wòl**: CUSTOMER (achtè), VENDOR (chak vandè gen pwòp magazen), ADMIN (jere tout platfòm lan)
- **Katalòg pwodwi**: chèche, filtre pa kategori, paj detay
- **Panye ak peman REYÈL ak MonCash**: kliyan an peye ak nimewo telefòn/PIN MonCash li
  DIRÈKTEMAN sou paj sekirize MonCash (nou pa janm wè/manyen enfòmasyon peman li).
  Estòk la redwi SÈLMAN apre nou verifye bò MonCash lan peman an reyèlman reyisi.
- **Peman ak Kat (Stripe)** pou dyaspora a: chwa ant MonCash ak kat kredi/debi.
  Kliyan an antre kat li DIRÈKTEMAN sou paj sekirize Stripe (nou pa janm wè li).
- **Evalyasyon ak Kòmantè (⭐ 1-5 zetwal)**: sèlman moun ki achte yon pwodwi ka
  evalye l. Mwayèn zetwal la parèt sou kat pwodwi ak paj detay.
- **Wishlist (❤️ pwodwi favori)**: kliyan sove pwodwi pou achte pi ta, ak yon paj "Favori mwen".
- **Koupon ak Rabè**: admin/vandè kreye kòd rabè (pousantaj oswa montan fiks, ak
  minimòm kòmand ak limit itilizasyon). Kliyan antre kòd la nan panye.
- **Frè livrezon pa zòn**: admin defini zòn (Pòtoprens, Okap, elat.) ak frè yo;
  kliyan chwazi zòn li nan panye epi frè a ajoute nan total la.
- **Chat Vandè-Kliyan**: yon ti mesajri anndan sit la (bouton "Poze yon kesyon"
  sou chak pwodwi) ak notifikasyon mesaj ki poko li.
- **Dashboard vandè**: kreye/modifye/efase pwodwi, wè kòmand pa yo, jere koupon magazen yo.
- **Dashboard admin**: estatistik platfòm lan, jere magazen/itilizatè/kòmand, koupon
  platfòm, ak zòn livrezon.
- **API REST konplè**, byen òganize (models → controllers → routes)

## 💳 Konfigire peman MonCash

Sit la deja entegre ak API MonCash (Digicel) pou peman mobil reyèl. Pou l fonksyone,
ou bezwen kle API pa ou:

1. Ale sou https://moncashbutton.digicelgroup.com epi kreye yon kont **"MonCash Business"**
   (gen yon anviwonman **sandbox** gratis pou teste anvan ou pran lajan reyèl).
2. Nan dashboard biznis ou a, jwenn `Client ID` ak `Client Secret` ou.
3. Louvri `backend/.env` epi ranpli:
   ```
   MONCASH_MODE=sandbox
   MONCASH_CLIENT_ID=kle_client_id_ou
   MONCASH_CLIENT_SECRET=kle_client_secret_ou
   ```
4. **Enpòtan**: nan menm dashboard MonCash Business la, konfigire "Return URL" (lyen
   retou) pou l pwente sou `http://localhost:5173/payment/return` pandan w ap teste
   lokalman, oswa sou `https://tondomèn.com/payment/return` yon fwa sit la anliy.
5. Lè ou pare pou pran lajan reyèl (pa sèlman teste), chanje `MONCASH_MODE=live` epi
   ranplase kle sandbox yo ak kle pwodiksyon MonCash ba ou.

**Kòman fliy la mache**: kliyan an klike "Peye ak MonCash" → nou kreye yon kòmand
(estati `PENDING`) → nou rele API MonCash pou kreye yon peman → navigatè a redirije
sou paj MonCash lan (kote kliyan antre telefòn+PIN li, LWEN sit nou an) → MonCash
voye kliyan an tounen sou `/payment/return` → nou verifye DIRÈKTEMAN ak MonCash si
peman an reyisi anvan nou make kòmand lan `PAID` epi redwi estòk la. Si kliyan an
fèmen paj MonCash la san l pa fini, kòmand lan rete `PENDING` epi li ka klike
"Peye kounye a" ankò nan paj "Kòmand mwen".

## 💳 Konfigire peman ak Kat (Stripe) — opsyonèl, pou dyaspora a

Pou aksepte kat kredi/debi (itil pou Ayisyen aletranje k ap achte pou fanmi yo):

1. Kreye yon kont sou https://stripe.com epi jwenn `Secret key` ou sou
   https://dashboard.stripe.com/apikeys (gen yon mòd **test** gratis — kle test yo
   kòmanse ak `sk_test_...`).
2. Louvri `backend/.env` epi ranpli:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_CURRENCY=usd
   GOURDES_PER_USD=132      # ajiste selon to chanj la
   FRONTEND_URL=http://localhost:5173
   ```
3. Paske Stripe pa toujou sipòte Goud (HTG), nou konvèti total la an Dola (USD)
   ak to `GOURDES_PER_USD` la. Ajiste to a selon mache a.

Si ou kite `STRIPE_SECRET_KEY` vid, opsyon "Kat" la ap parèt men l ap bay yon mesaj
erè klè — MonCash ap toujou disponib.

## 🚀 Deplwaye anliy (gratis)

Pwojè a **deja pare pou deplwaman**. Gade **`DEPLOYMENT.md`** pou yon gid konplè
etap-pa-etap (an Kreyòl) pou mete sit la anliy gratis ak **Render** (kote sit la
kouri) + **Neon** (baz done PostgreSQL gratis). Genyen yon fichye `render.yaml`
ki otomatize preparasyon an.

An pwodiksyon, backend la **sèvi frontend la tou** (yon sèl sèvis), kidonk pa gen
CORS ni de URL apa pou jere.

## 🗄️ Sou baz done a (SQLite + PostgreSQL otomatik)

Pwojè a mache ak **TOUDE** baz done yo, san chanjman kòd — li chwazi selon varyab
`DATABASE_URL`:

- **Lokalman (devlopman)**: si `DATABASE_URL` vid oswa pa yon URL Postgres, li
  itilize **SQLite** atravè `node:sqlite` (deja anndan Node.js 22+). Pa gen anyen
  pou enstale ni konpile — tout done nan yon sèl fichye (`backend/dev.db`).
- **Pwodiksyon (Render/Neon)**: si `DATABASE_URL` se yon URL `postgresql://...`,
  li itilize **PostgreSQL** otomatikman.

Kouch la nan `src/db.js` bay yon sèl API (`db.query/get/run/tx`) ki mache pou
toude. `sql/schema.sql` ekri nan yon sou-ansanm SQL ki pòtab (mache nan toude).
Kidonk ou pa bezwen fè anyen espesyal — jis mete `DATABASE_URL` Postgres ou a
an pwodiksyon.

## 💰 Fason ou ka revann pwojè sa a

1. **SaaS multi-tenant**: chaje yon abònman mansyèl bay chak vandè ki vle gen yon
   magazen sou platfòm ou an (egzanp: 500-2000 goud/mwa pa magazen).
2. **Komisyon sou chak vant**: pran yon pousantaj (5-15%) sou chak kòmand ki fèt
   — ajoute sa nan `Order.checkout()` nan `backend/src/models/Order.js`.
3. **Vann kòd sous la konplètman**: rebranding (chanje non, koulè, logo) epi
   vann li bay yon biznis ki vle pwòp platfòm pa yo (yon sèl fwa, pri fiks).
4. **Louvri li kòm yon tèmplèt/boilerplate**: vann li sou yon maketplace kòd
   (tankou CodeCanyon, Gumroad) bay lòt devlopè.

## 🔒 Anvan ou deplwaye an pwodiksyon

- Chanje `JWT_SECRET` nan `backend/.env` pou yon valè long e aleyatwa
- Pase sou PostgreSQL (gade seksyon anwo a)
- Pase `MONCASH_MODE` sou `live` epi mete vrè kle pwodiksyon MonCash yo (pa kle sandbox)
- Mete "Return URL" MonCash la sou vrè domèn pwodiksyon ou a (pa localhost)
- Ajoute validasyon done pi solid (egzanp ak `zod` oswa `joi`) sou wout yo
- Ajoute teste otomatik (Jest/Vitest) pou fonksyonalite kle yo
