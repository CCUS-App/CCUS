import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyC1s6S-DPQbQC3TOKuM8GwF9eDgXxGYL_w",

  authDomain:
    "ccus-e216d.firebaseapp.com",

  databaseURL:
    "https://ccus-e216d-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "ccus-e216d",

  storageBucket:
    "ccus-e216d.firebasestorage.app",

  messagingSenderId:
    "35130962919",

  appId:
    "1:35130962919:web:2ce2067060a42c2969c342",

  measurementId:
    "G-HSZR6TLRF5"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
  initializeApp(firebaseConfig);


// =====================================================
// FIREBASE AUTH
// =====================================================

export const auth =
  getAuth(app);


// =====================================================
// FIRESTORE DATABASE
// =====================================================

export const db =
  getFirestore(app);