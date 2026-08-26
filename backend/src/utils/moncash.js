// =========================================================================
// moncash.js — Kliyan pou pale ak API MonCash (Digicel) — peman mobil Ayiti
// =========================================================================
// Dokimantasyon ofisyèl:
// sandbox.moncashbutton.digicelgroup.com/Moncash-business/resources/doc/RestAPI_MonCash_doc.pdf
//
// Fliy la an 3 etap:
//  1. getAccessToken() — jwenn yon jeton (li ekspire vit, ~59 segond,
//     kidonk nou toujou mande yon nouvo anvan chak apèl -- pa gen "cache").
//  2. createPayment() — kreye yon peman, MonCash voye yon "payment token"
//     nou sèvi pou konstwi lyen redireksyon an (kote kliyan an antre
//     nimewo telefòn + kòd PIN li DIRÈKTEMAN sou sit MonCash, pa sou sit nou).
//  3. retrieveOrderPayment() — verifye si yon peman fini ak siksè.
//
// Nou itilize `fetch` global la (deja anndan Node.js depi vèsyon 18+) --
// pa gen okenn pakè HTTP apa pou enstale.
// =========================================================================

const MODE = process.env.MONCASH_MODE === 'live' ? 'live' : 'sandbox';

const API_BASE =
  MODE === 'live'
    ? 'https://moncashbutton.digicelgroup.com/Api'
    : 'https://sandbox.moncashbutton.digicelgroup.com/Api';

const GATEWAY_BASE =
  MODE === 'live'
    ? 'https://moncashbutton.digicelgroup.com/Moncash-middleware'
    : 'https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware';

async function getAccessToken() {
  const clientId = process.env.MONCASH_CLIENT_ID;
  const clientSecret = process.env.MONCASH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'MONCASH_CLIENT_ID ak MONCASH_CLIENT_SECRET pa konfigire nan backend/.env — ' +
        'ale jwenn yo sou https://moncashbutton.digicelgroup.com (kont "MonCash Business").'
    );
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'scope=read,write&grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`MonCash pa bay yon jeton koneksyon (HTTP ${res.status}).`);
  }
  const data = await res.json();
  return data.access_token;
}

// Kreye yon peman. `moncashOrderId` se yon idantifyan NIMERIK nou envante
// (diferan de UUID kòmand nou an) paske MonCash mande yon "orderId" pou
// chak tantativ peman.
async function createPayment({ amount, moncashOrderId }) {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/v1/CreatePayment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ amount, orderId: moncashOrderId }),
  });

  const data = await res.json().catch(() => ({}));
  const paymentToken = data?.payment_token?.token;
  if (!res.ok || !paymentToken) {
    throw new Error(data?.message || "MonCash pa t' ka kreye peman an. Eseye ankò.");
  }

  return {
    token: paymentToken,
    redirectUrl: `${GATEWAY_BASE}/Payment/Redirect?token=${paymentToken}`,
  };
}

// Verifye estati yon peman apre kliyan an fin (oswa panse l fin) peye.
async function retrieveOrderPayment(moncashOrderId) {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/v1/RetrieveOrderPayment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ orderId: moncashOrderId }),
  });

  const data = await res.json().catch(() => ({}));
  const payment = data?.payment;
  if (!res.ok || !payment) {
    return { success: false };
  }

  return {
    success: payment.message === 'successful',
    reference: payment.reference,
    transactionId: payment.transaction_id,
    cost: payment.cost,
    payer: payment.payer,
    message: payment.message,
  };
}

module.exports = { getAccessToken, createPayment, retrieveOrderPayment, MODE };
