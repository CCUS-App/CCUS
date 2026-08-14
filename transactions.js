import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase-config.js";

// =====================================================
// ELEMENT
// =====================================================

const transactionList =
  document.getElementById("transactionList");


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(timestamp) {

  if (
    timestamp &&
    typeof timestamp.toDate === "function"
  ) {

    return timestamp
      .toDate()
      .toLocaleString();

  }

  return "Date unavailable";

}


// =====================================================
// FORMAT AMOUNT
// =====================================================

function formatAmount(amount) {

  const number =
    Number(amount || 0);

  return (
    "ETB " +
    number.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


// =====================================================
// TRANSACTION TYPE
// =====================================================

function getTransactionType(data) {

  return (
    data.type ||
    data.transactionType ||
    data.category ||
    "Transaction"
  );

}


// =====================================================
// LOAD TRANSACTIONS
// =====================================================

async function loadTransactions(user) {

  if (!transactionList) {
    return;
  }


  transactionList.innerHTML = `
    <p>
      Loading transactions...
    </p>
  `;


  try {

    // =================================================
    // QUERY USER TRANSACTIONS
    // =================================================

    const transactionRef =
      collection(
        db,
        "transactions"
      );


    const transactionQuery =
      query(
        transactionRef,
        where(
          "userId",
          "==",
          user.uid
        )
      );


    const snapshot =
      await getDocs(
        transactionQuery
      );


    transactionList.innerHTML =
      "";


    // =================================================
    // NO TRANSACTIONS
    // =================================================

    if (snapshot.empty) {

      transactionList.innerHTML = `
        <div class="profile-card">

          <h3>
            🧾 No Transactions
          </h3>

          <p>
            You don't have any transactions yet.
          </p>

        </div>
      `;

      return;

    }


    // =================================================
    // CONVERT DATA TO ARRAY
    // =================================================

    const transactions = [];


    snapshot.forEach(
      (docSnapshot) => {

        transactions.push({

          id:
            docSnapshot.id,

          ...docSnapshot.data()

        });

      }
    );


    // =================================================
    // SORT NEWEST FIRST
    // =================================================

    transactions.sort(
      (a, b) => {

        const dateA =
          a.createdAt?.toDate
            ? a.createdAt.toDate().getTime()
            : 0;

        const dateB =
          b.createdAt?.toDate
            ? b.createdAt.toDate().getTime()
            : 0;

        return dateB - dateA;

      }
    );


    // =================================================
    // DISPLAY
    // =================================================

    transactions.forEach(
      (data) => {

        const card =
          document.createElement("div");


        card.className =
          "profile-card";


        const type =
          getTransactionType(data);


        const amount =
          Number(
            data.amount ||
            data.value ||
            0
          );


        const status =
          data.status ||
          "completed";


        const statusLower =
          String(status)
            .toLowerCase();


        let statusColor =
          "#777";


        if (
          statusLower === "approved" ||
          statusLower === "completed" ||
          statusLower === "success" ||
          statusLower === "successful"
        ) {

          statusColor =
            "#2e7d32";

        }


        if (
          statusLower === "pending"
        ) {

          statusColor =
            "#f9a825";

        }


        if (
          statusLower === "rejected" ||
          statusLower === "failed" ||
          statusLower === "cancelled"
        ) {

          statusColor =
            "#d32f2f";

        }


        card.innerHTML = `

          <h3>
            🧾 ${escapeHTML(type)}
          </h3>

          <p>
            <b>Amount:</b>
            ${formatAmount(amount)}
          </p>

          <p>
            <b>Status:</b>

            <span
              style="
                font-weight:bold;
                color:${statusColor};
              "
            >
              ${escapeHTML(status)}
            </span>

          </p>

          <p>
            <b>Date:</b>
            ${escapeHTML(
              formatDate(data.createdAt)
            )}
          </p>

          <p
            style="
              font-size:12px;
              color:#777;
              word-break:break-all;
            "
          >
            ID:
            ${escapeHTML(data.id)}
          </p>

        `;


        transactionList.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "LOAD TRANSACTIONS ERROR:",
      error
    );


    transactionList.innerHTML = `

      <div class="profile-card">

        <h3 style="color:#d32f2f;">
          ❌ Failed to load transactions
        </h3>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

  }

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
  auth,
  (user) => {

    if (!user) {

      if (transactionList) {

        transactionList.innerHTML = `

          <div class="profile-card">

            <h3>
              🔐 Login Required
            </h3>

            <p>
              Please login to view your transactions.
            </p>

            <button
              type="button"
              onclick="location.href='login.html'"
            >
              Login
            </button>

          </div>

        `;

      }

      return;

    }


    loadTransactions(user);

  }
);


// =====================================================
// GLOBAL FUNCTION
// =====================================================

window.loadTransactions =
  loadTransactions;


// =====================================================
// END
// =====================================================

console.log(
  "✅ CCUS transactions.js loaded successfully."
);
