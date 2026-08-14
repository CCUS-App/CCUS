import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

// =====================================================
// LOAD WALLET
// =====================================================

async function loadWallet(user) {

try {

const balanceElement =
  document.getElementById(
    "walletBalance"
  );

const depositElement =
  document.getElementById(
    "walletDeposit"
  );


if (!balanceElement) {
  return;
}


// =================================================
// GET WALLET DOCUMENT
// wallets/{userId}
// =================================================

const walletRef =
  doc(
    db,
    "wallets",
    user.uid
  );


const walletSnap =
  await getDoc(
    walletRef
  );


// =================================================
// WALLET DOES NOT EXIST
// =================================================

if (!walletSnap.exists()) {

  balanceElement.textContent =
    "ETB 0.00";


  if (depositElement) {

    depositElement.textContent =
      "ETB 0.00";

  }

  return;
}


// =================================================
// WALLET DATA
// =================================================

const wallet =
  walletSnap.data();


const balance =
  Number(
    wallet.balance || 0
  );


const deposit =
  Number(
    wallet.deposit || 0
  );


// =================================================
// MAIN BALANCE
// =================================================

balanceElement.textContent =
  "ETB " +
  balance.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );


// =================================================
// SEC. DEPOSIT
// =================================================

if (depositElement) {

  depositElement.textContent =
    "ETB " +
    deposit.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

}

} catch (error) {

console.error(
  "LOAD WALLET ERROR:",
  error
);


const balanceElement =
  document.getElementById(
    "walletBalance"
  );


const depositElement =
  document.getElementById(
    "walletDeposit"
  );


if (balanceElement) {

  balanceElement.textContent =
    "ETB 0.00";

}


if (depositElement) {

  depositElement.textContent =
    "ETB 0.00";

}

}

}

// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
auth,
async (user) => {

if (!user) {

  window.location.href =
    "login.html";

  return;
}


await loadWallet(user);

}
);