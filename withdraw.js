import { auth, db } from "./firebase-config.js";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


// =====================================================
// WITHDRAWAL
// =====================================================

const withdrawBtn =
  document.getElementById("withdrawBtn");

const withdrawMethod =
  document.getElementById("withdrawMethod");

const withdrawAmount =
  document.getElementById("withdrawAmount");


// =====================================================
// SUBMIT WITHDRAWAL
// =====================================================

if (withdrawBtn) {

  withdrawBtn.onclick = async () => {

    const user =
      auth.currentUser;


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!user) {

      alert(
        "Please login first."
      );

      window.location.href =
        "login.html";

      return;
    }


    // =================================================
    // GET VALUES
    // =================================================

    const method =
      withdrawMethod?.value || "";

    const amount =
      Number(
        withdrawAmount?.value || 0
      );


    // =================================================
    // METHOD VALIDATION
    // =================================================

    if (!method) {

      alert(
        "Please select withdrawal method."
      );

      return;
    }


    // =================================================
    // AMOUNT VALIDATION
    // =================================================

    if (!amount || amount <= 0) {

      alert(
        "Please select withdrawal amount."
      );

      return;
    }


    try {

      withdrawBtn.disabled =
        true;

      withdrawBtn.textContent =
        "Processing...";


      // =================================================
      // LOAD ADMIN WITHDRAWAL SETTINGS
      // FIRESTORE:
      // settings / withdrawalSettings
      // =================================================

      const settingsRef =
        doc(
          db,
          "settings",
          "withdrawalSettings"
        );


      const settingsSnap =
        await getDoc(
          settingsRef
        );


      if (!settingsSnap.exists()) {

        alert(
          "Withdrawal amounts are not configured by Admin."
        );

        return;
      }


      const settings =
        settingsSnap.data();


      // =================================================
      // GET AMOUNTS ARRAY
      // =================================================

      const amounts =
        Array.isArray(
          settings.amounts
        )
          ? settings.amounts
          : [];


      // =================================================
      // CLEAN AMOUNTS
      // =================================================

      const validAmounts =
        amounts
          .map(
            value =>
              Number(value)
          )
          .filter(
            value =>
              Number.isFinite(value) &&
              value > 0
          );


      // =================================================
      // CHECK WHETHER SELECTED AMOUNT
      // IS ALLOWED BY ADMIN
      // =================================================

      const amountAllowed =
        validAmounts.includes(
          amount
        );


      if (!amountAllowed) {

        alert(
          "This withdrawal amount is not currently available."
        );

        return;
      }


      // =================================================
      // GET USER WALLET
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


      if (!walletSnap.exists()) {

        alert(
          "Wallet not found."
        );

        return;
      }


      const wallet =
        walletSnap.data();


      const balance =
        Number(
          wallet.balance || 0
        );


      // =================================================
      // CHECK BALANCE
      // =================================================

      if (
        balance < amount
      ) {

        alert(
          "Insufficient balance.\n\n" +
          "Your balance: ETB " +
          balance.toLocaleString() +
          "\n" +
          "Withdrawal: ETB " +
          amount.toLocaleString()
        );

        return;
      }


      // =================================================
      // CREATE PENDING WITHDRAWAL
      // =================================================

      await addDoc(
        collection(
          db,
          "withdrawals"
        ),
        {

          userId:
            user.uid,

          amount:
            amount,

          method:
            method,

          status:
            "pending",

          createdAt:
            serverTimestamp()

        }
      );


      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Withdrawal request submitted successfully.\n\n" +
        "Waiting for admin approval."
      );


      window.location.href =
        "home.html";


    } catch (error) {

      console.error(
        "WITHDRAWAL ERROR:",
        error
      );


      alert(
        "Failed to submit withdrawal:\n\n" +
        error.message
      );


    } finally {

      withdrawBtn.disabled =
        false;

      withdrawBtn.textContent =
        "Confirm Withdrawal";

    }

  };

}