// =====================================================
// CCUS ADMIN.JS
// FINAL COMPLETE VERSION
//
// FEATURES
// -----------------------------------------------------
// 1. Admin authentication
// 2. Users management
// 3. Deposit management
// 4. Deposit approval
// 5. Referral rewards Level 1-9
// 6. Multiple recharge amounts
// 7. Deposit account settings
// 8. Withdrawal management
// 9. Withdrawal approval
// 10. Withdrawal amount settings
// 11. Message management
// 12. Task management
// 13. Cloudinary video upload
// 14. Task active/inactive
// 15. Task delete
// =====================================================


import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  runTransaction,
  increment
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


// =====================================================
// ADMIN STATE
// =====================================================

let currentAdmin = null;
let adminVerified = false;


// =====================================================
// CLOUDINARY
// =====================================================

const CLOUDINARY_CLOUD_NAME = "oo8qbsjz";

const CLOUDINARY_UPLOAD_PRESET =
  "ccus_task_video_unsigned";


// =====================================================
// DEFAULT WITHDRAWAL AMOUNTS
// =====================================================

const DEFAULT_WITHDRAWAL_AMOUNTS = [
  250,
  2500,
  6000,
  10000,
  15000,
  20000,
  25000,
  30000,
  45000
];


// =====================================================
// DEFAULT RECHARGE AMOUNTS
// =====================================================

const DEFAULT_RECHARGE_AMOUNTS = [
  250,
  1100,
  4000,
  6000,
  10000,
  15000,
  20000,
  30000,
  40000
];


// =====================================================
// DEFAULT REFERRAL REWARDS
// LEVEL 1-9 ONLY
// REWARD ONLY
// =====================================================

const DEFAULT_REFERRAL_REWARDS = [
  {
    level: 1,
    reward: 25
  },
  {
    level: 2,
    reward: 250
  },
  {
    level: 3,
    reward: 600
  },
  {
    level: 4,
    reward: 1000
  },
  {
    level: 5,
    reward: 1500
  },
  {
    level: 6,
    reward: 2000
  },
  {
    level: 7,
    reward: 2500
  },
  {
    level: 8,
    reward: 3000
  },
  {
    level: 9,
    reward: 4000
  }
];


// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      console.log("NO ADMIN USER");

      window.location.replace("login.html");

      return;
    }


    if (adminVerified) {
      return;
    }


    try {

      console.log("LOGIN UID:", user.uid);


      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const userSnap =
        await getDoc(userRef);


      if (!userSnap.exists()) {

        alert("User document not found.");

        window.location.replace("home.html");

        return;
      }


      const data =
        userSnap.data();


      const role =
        String(
          data.role || ""
        )
          .trim()
          .toLowerCase();


      console.log("ROLE:", role);


      if (role !== "admin") {

        alert(
          "Access Denied. Role = " +
          (data.role || "undefined")
        );

        window.location.replace("home.html");

        return;
      }


      currentAdmin = user;

      adminVerified = true;


console.log("ADMIN ALLOWED");

await Promise.allSettled([

  loadUsers(),

  loadDeposits(),

  loadWithdrawals(),

  loadReferralSettings(),

  loadDepositSettings(),

  loadWithdrawalSettings(),

  loadAdminMessages(),

  loadAdminTasks(),

  loadInvestmentPlans()

]);

console.log(
  "ADMIN DASHBOARD READY"
);

    } catch (error) {

      console.error(
        "ADMIN SECURITY ERROR:",
        error
      );

      alert(
        "Admin security error: " +
        error.message
      );

    }

  }
);


// =====================================================
// ADMIN READY CHECK
// =====================================================

function ensureAdmin() {

  if (
    !currentAdmin ||
    !adminVerified
  ) {

    alert(
      "Admin authentication is not ready. Please wait."
    );

    return false;
  }

  return true;
}


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
// LOGOUT
// =====================================================

const adminLogout =
  document.getElementById("adminLogout");


if (adminLogout) {

  adminLogout.addEventListener(
    "click",
    async () => {

      try {

        adminLogout.disabled = true;

        adminLogout.textContent =
          "Logging out...";


        await signOut(auth);


        window.location.replace(
          "login.html"
        );


      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );


        adminLogout.disabled = false;

        adminLogout.textContent =
          "🚪 Logout";


        alert(error.message);

      }

    }
  );

}


// =====================================================
// LOAD USERS
// =====================================================

async function loadUsers() {

  const userList =
    document.getElementById("userList");


  if (!userList) return;


  try {

    userList.innerHTML =
      "<p>Loading users...</p>";


    const snap =
      await getDocs(
        collection(db, "users")
      );


    userList.innerHTML = "";


    if (snap.empty) {

      userList.innerHTML =
        "<p>No users found.</p>";

      return;
    }


    snap.forEach((item) => {

      const data =
        item.data();


      const card =
        document.createElement("div");


      card.className =
        "profile-card";


      card.innerHTML = `

        <p>
          <b>Name:</b>
          ${escapeHTML(data.name || "")}
        </p>

        <p>
          <b>Email:</b>
          ${escapeHTML(data.email || "")}
        </p>

        <p>
          <b>Role:</b>
          ${escapeHTML(data.role || "user")}
        </p>

        <p>
          <b>Referral Code:</b>
          ${escapeHTML(data.referralCode || "")}
        </p>

        <p>
          <b>User ID:</b>
          ${escapeHTML(item.id)}
        </p>

      `;


      userList.appendChild(card);

    });


  } catch (error) {

    console.error(
      "LOAD USERS ERROR:",
      error
    );


    userList.innerHTML = `
      <p style="color:#d32f2f;">
        ❌ Failed to load users.
        <br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


// =====================================================
// LOAD DEPOSITS
// =====================================================

async function loadDeposits() {

  const depositList =
    document.getElementById("depositList");


  if (!depositList) return;


  try {

    depositList.innerHTML =
      "<p>Loading deposits...</p>";


    const snap =
      await getDocs(
        collection(db, "deposits")
      );


    depositList.innerHTML = "";


    if (snap.empty) {

      depositList.innerHTML =
        "<p>No deposit requests.</p>";

      return;
    }


    snap.forEach((item) => {

      const data =
        item.data();


      const method =
        data.method ||
        data.paymentMethod ||
        "";


      const status =
        String(
          data.status || "pending"
        );


      const card =
        document.createElement("div");


      card.className =
        "profile-card";


      card.innerHTML = `

        <p>
          <b>User ID:</b>
          ${escapeHTML(data.userId || "")}
        </p>

        <p>
          <b>Name:</b>
          ${escapeHTML(
            data.senderName ||
            data.name ||
            ""
          )}
        </p>

        <p>
          <b>Amount:</b>
          ETB ${Number(
            data.amount || 0
          ).toLocaleString()}
        </p>

        <p>
          <b>Payment Method:</b>
          ${escapeHTML(method)}
        </p>

        <p>
          <b>Transaction Ref:</b>
          ${escapeHTML(
            data.transactionRef || ""
          )}
        </p>

        <p>
          <b>Status:</b>
          ${escapeHTML(status)}
        </p>

      `;


      if (
        status.toLowerCase() === "pending"
      ) {

        const approveBtn =
          document.createElement("button");


        approveBtn.type = "button";

        approveBtn.textContent =
          "✅ Approve Deposit";


        approveBtn.addEventListener(
          "click",
          async () => {

            approveBtn.disabled = true;

            approveBtn.textContent =
              "Processing...";


            await approveDeposit(
              item.id
            );

          }
        );


        card.appendChild(
          approveBtn
        );

      }


      depositList.appendChild(card);

    });


  } catch (error) {

    console.error(
      "LOAD DEPOSITS ERROR:",
      error
    );


    depositList.innerHTML = `
      <p style="color:#d32f2f;">
        ❌ Failed to load deposits.
        <br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


// =====================================================
// APPROVE DEPOSIT
// =====================================================

async function approveDeposit(
  depositId
) {

  if (!ensureAdmin()) return;


  try {

    const result =
      await runTransaction(
        db,
        async (transaction) => {

          const depositRef =
            doc(
              db,
              "deposits",
              depositId
            );


          const depositSnap =
            await transaction.get(
              depositRef
            );


          if (!depositSnap.exists()) {

            throw new Error(
              "Deposit not found."
            );
          }


          const depositData =
            depositSnap.data();


          const status =
            String(
              depositData.status ||
              "pending"
            ).toLowerCase();


          if (status !== "pending") {

            return {
              alreadyProcessed: true
            };

          }


          const userId =
            depositData.userId;


          const amount =
            Number(
              depositData.amount || 0
            );


          if (
            !userId ||
            !Number.isFinite(amount) ||
            amount <= 0
          ) {

            throw new Error(
              "Invalid deposit data."
            );

          }


          const walletRef =
            doc(
              db,
              "wallets",
              userId
            );


          const walletSnap =
            await transaction.get(
              walletRef
            );


          if (walletSnap.exists()) {

            transaction.update(
              walletRef,
              {
                balance:
                  increment(amount),

                deposit:
                  increment(amount)
              }
            );

          } else {

            transaction.set(
              walletRef,
              {
                balance: amount,
                deposit: amount,
                income: 0
              }
            );

          }


          transaction.update(
            depositRef,
            {
              status: "Successful",

              approvedAt:
                serverTimestamp(),

              approvedBy:
                currentAdmin.uid
            }
          );


          return {
            alreadyProcessed: false,
            userId,
            amount
          };

        }
      );


    if (result.alreadyProcessed) {

      alert(
        "This deposit was already processed."
      );

      await loadDeposits();

      return;
    }


    await giveReferralReward(
      result.userId,
      result.amount,
      depositId
    );


    alert(
      "✅ Deposit Approved Successfully."
    );


    await loadDeposits();


  } catch (error) {

    console.error(
      "APPROVE DEPOSIT ERROR:",
      error
    );


    alert(
      "Failed to approve deposit:\n\n" +
      error.message
    );


    await loadDeposits();

  }

}


window.approveDeposit =
  approveDeposit;


// =====================================================
// GIVE REFERRAL REWARD
//
// LEVEL 1-9 ONLY
// REWARD ONLY
// NO minimumDeposit
// =====================================================

async function giveReferralReward(
  userId,
  depositAmount,
  depositId = ""
) {

  try {

    const settingsSnap =
      await getDoc(
        doc(
          db,
          "settings",
          "referralSettings"
        )
      );


    let levels =
      DEFAULT_REFERRAL_REWARDS;


    if (settingsSnap.exists()) {

      const settings =
        settingsSnap.data();


      if (
        Array.isArray(settings.levels) &&
        settings.levels.length > 0
      ) {

        levels =
          settings.levels
            .filter(
              item =>
                Number(item.level) >= 1 &&
                Number(item.level) <= 9
            )
            .map(item => ({
              level:
                Number(item.level),

              reward:
                Number(item.reward || 0)
            }));

      }

    }


    const usersSnap =
      await getDocs(
        collection(db, "users")
      );


    const users = [];


    usersSnap.forEach((item) => {

      users.push({
        id: item.id,
        data: item.data()
      });

    });


    let currentUserId =
      userId;


    for (
      let levelNumber = 1;
      levelNumber <= 9;
      levelNumber++
    ) {

      const currentUser =
        users.find(
          u =>
            u.id ===
            currentUserId
        );


      if (!currentUser) {
        break;
      }


      const usedCode =
        currentUser.data.referralCodeUsed;


      if (!usedCode) {
        break;
      }


      const referrer =
        users.find(
          u =>
            String(
              u.data.referralCode || ""
            ) ===
            String(usedCode)
        );


      if (!referrer) {
        break;
      }


      const referrerId =
        referrer.id;


      const levelSettings =
        levels.find(
          item =>
            Number(item.level) ===
            levelNumber
        );


      if (!levelSettings) {

        currentUserId =
          referrerId;

        continue;
      }


      const reward =
        Number(
          levelSettings.reward || 0
        );


      if (
        !Number.isFinite(reward) ||
        reward <= 0
      ) {

        currentUserId =
          referrerId;

        continue;
      }


      const rewardId =
        `${depositId}_level_${levelNumber}`;


      const rewardRef =
        doc(
          db,
          "referralRewards",
          rewardId
        );


      const walletRef =
        doc(
          db,
          "wallets",
          referrerId
        );


      await runTransaction(
        db,
        async (transaction) => {

          const rewardSnap =
            await transaction.get(
              rewardRef
            );


          if (rewardSnap.exists()) {
            return;
          }


          const walletSnap =
            await transaction.get(
              walletRef
            );


          if (walletSnap.exists()) {

            transaction.update(
              walletRef,
              {
                balance:
                  increment(reward),

                income:
                  increment(reward)
              }
            );

          } else {

            transaction.set(
              walletRef,
              {
                balance: reward,
                deposit: 0,
                income: reward
              }
            );

          }


          transaction.set(
            rewardRef,
            {
              depositId,
              userId,
              referrerId,
              level: levelNumber,
              depositAmount,
              reward,
              createdAt:
                serverTimestamp()
            }
          );

        }
      );


      currentUserId =
        referrerId;

    }


  } catch (error) {

    console.error(
      "REFERRAL REWARD ERROR:",
      error
    );

  }

}


// =====================================================
// RECHARGE AMOUNT HELPERS
// =====================================================

function getRechargeAmountInputs() {

  const list =
    document.getElementById(
      "rechargeAmountList"
    );


  if (!list) return [];


  return Array.from(
    list.querySelectorAll(
      "input[data-recharge-input]"
    )
  );

}


// =====================================================
// RENDER RECHARGE AMOUNTS
// =====================================================

function renderRechargeAmounts(
  amounts = []
) {

  const list =
    document.getElementById(
      "rechargeAmountList"
    );


  if (!list) return;


  list.innerHTML = "";


  const cleanAmounts =
    Array.isArray(amounts)
      ? amounts
          .map(Number)
          .filter(
            amount =>
              Number.isFinite(amount) &&
              amount > 0
          )
      : [];


  if (cleanAmounts.length === 0) {

    addRechargeAmountRow();

    return;
  }


  cleanAmounts.forEach(
    amount => {

      addRechargeAmountRow(
        amount
      );

    }
  );

}


// =====================================================
// ADD RECHARGE AMOUNT ROW
// =====================================================

function addRechargeAmountRow(
  value = ""
) {

  const list =
    document.getElementById(
      "rechargeAmountList"
    );


  if (!list) return;


  const row =
    document.createElement("div");


  row.className =
    "recharge-amount-row";


  row.style.cssText = `
    display:flex;
    gap:8px;
    align-items:center;
    margin-top:8px;
  `;


  row.innerHTML = `

    <input
      type="number"
      min="1"
      step="1"
      data-recharge-input
      value="${escapeHTML(value)}"
      placeholder="Recharge Amount"
      style="
        flex:1;
        width:100%;
        box-sizing:border-box;
        padding:10px;
        border:1px solid #ccc;
        border-radius:8px;
      "
    >

    <button
      type="button"
      class="remove-recharge-btn"
      style="
        width:42px;
        padding:10px 5px;
        border:none;
        border-radius:8px;
        cursor:pointer;
        background:#e53935;
        color:#fff;
      "
    >
      ✕
    </button>

  `;


  const removeBtn =
    row.querySelector(
      ".remove-recharge-btn"
    );


  removeBtn.addEventListener(
    "click",
    () => {

      row.remove();


      if (
        getRechargeAmountInputs()
          .length === 0
      ) {

        addRechargeAmountRow();

      }

    }
  );


  list.appendChild(row);

}


// =====================================================
// ADD RECHARGE BUTTON
// =====================================================

const addRechargeAmountBtn =
  document.getElementById(
    "addRechargeAmountBtn"
  );


if (addRechargeAmountBtn) {

  addRechargeAmountBtn.addEventListener(
    "click",
    () => {

      addRechargeAmountRow();

    }
  );

}


// =====================================================
// LOAD REFERRAL + RECHARGE SETTINGS
//
// FIRESTORE:
// settings/referralSettings
//
// Fields:
// rechargeAmounts: [250,1100,...]
// levels: [
//   {level:1,reward:25},
//   ...
//   {level:9,reward:4000}
// ]
// =====================================================

async function loadReferralSettings() {

  const status =
    document.getElementById(
      "referralSaveStatus"
    );


  try {

    const settingsRef =
      doc(
        db,
        "settings",
        "referralSettings"
      );


    const snap =
      await getDoc(settingsRef);


    let rechargeAmounts =
      DEFAULT_RECHARGE_AMOUNTS;


    let levels =
      DEFAULT_REFERRAL_REWARDS;


    if (snap.exists()) {

      const data =
        snap.data();


      if (
        Array.isArray(
          data.rechargeAmounts
        )
      ) {

        rechargeAmounts =
          data.rechargeAmounts;

      } else if (
        Number.isFinite(
          Number(data.rechargeAmount)
        ) &&
        Number(data.rechargeAmount) > 0
      ) {

        rechargeAmounts = [
          Number(data.rechargeAmount)
        ];

      }


      if (
        Array.isArray(data.levels)
      ) {

        levels =
          data.levels;

      }

    }


    // ===============================================
    // RENDER RECHARGE AMOUNTS
    // ===============================================

    renderRechargeAmounts(
      rechargeAmounts
    );


    // ===============================================
    // LOAD LEVEL 1-9 REWARD
    // ===============================================

    for (
      let level = 1;
      level <= 9;
      level++
    ) {

      const levelData =
        levels.find(
          item =>
            Number(item.level) ===
            level
        );


      const rewardInput =
        document.getElementById(
          `level${level}Reward`
        );


      if (rewardInput) {

        const defaultLevel =
          DEFAULT_REFERRAL_REWARDS.find(
            item =>
              item.level === level
          );


        rewardInput.value =
          Number(
            levelData?.reward ??
            defaultLevel?.reward ??
            0
          );

      }


      // =============================================
      // OLD MINIMUM DEPOSIT INPUTS
      //
      // They are ignored intentionally.
      // Referral reward is based on LEVEL ONLY.
      // =============================================

      const oldDepositInput =
        document.getElementById(
          `level${level}Deposit`
        );


      if (oldDepositInput) {

        oldDepositInput.value = "";

        oldDepositInput.disabled = true;

        oldDepositInput.placeholder =
          "Not used - Reward only";

      }

    }


    if (status) {

      status.textContent =
        "✅ Recharge and Level 1–9 referral settings loaded.";

      status.className =
        "success-text";

    }


  } catch (error) {

    console.error(
      "LOAD REFERRAL SETTINGS ERROR:",
      error
    );


    renderRechargeAmounts(
      DEFAULT_RECHARGE_AMOUNTS
    );


    for (
      let level = 1;
      level <= 9;
      level++
    ) {

      const defaultLevel =
        DEFAULT_REFERRAL_REWARDS.find(
          item =>
            item.level === level
        );


      const rewardInput =
        document.getElementById(
          `level${level}Reward`
        );


      if (rewardInput) {

        rewardInput.value =
          defaultLevel?.reward || 0;

      }

    }


    if (status) {

      status.textContent =
        "❌ Failed to load referral settings.";

      status.className =
        "error-text";

    }

  }

}


window.loadReferralSettings =
  loadReferralSettings;


// =====================================================
// SAVE RECHARGE + REFERRAL SETTINGS
// =====================================================

const saveReferralSettings =
  document.getElementById(
    "saveReferralSettings"
  );


if (saveReferralSettings) {

  saveReferralSettings.addEventListener(
    "click",
    async () => {

      if (!ensureAdmin()) {
        return;
      }


      const status =
        document.getElementById(
          "referralSaveStatus"
        );


      try {

        saveReferralSettings.disabled =
          true;


        saveReferralSettings.textContent =
          "Saving...";


        if (status) {

          status.textContent =
            "Saving recharge and referral settings...";

          status.className = "";

        }


        // ===========================================
        // GET RECHARGE AMOUNTS
        // ===========================================

        const rechargeInputs =
          getRechargeAmountInputs();


        const rechargeAmounts = [];


        rechargeInputs.forEach(
          input => {

            const value =
              Number(input.value);


            if (
              Number.isFinite(value) &&
              value > 0
            ) {

              rechargeAmounts.push(
                value
              );

            }

          }
        );


        // ===========================================
        // REMOVE DUPLICATES
        // ===========================================

        const uniqueRechargeAmounts =
          [
            ...new Set(
              rechargeAmounts
            )
          ];


        // ===========================================
        // IMPORTANT VALIDATION
        // ===========================================

        if (
          uniqueRechargeAmounts.length ===
          0
        ) {

          alert(
            "Please add at least one Recharge amount."
          );


          if (status) {

            status.textContent =
              "⚠️ Please add at least one Recharge amount.";

            status.className =
              "error-text";

          }


          return;
        }


        // ===========================================
        // GET LEVEL 1-9 REWARDS
        // ===========================================

        const levels = [];


        for (
          let level = 1;
          level <= 9;
          level++
        ) {

          const rewardInput =
            document.getElementById(
              `level${level}Reward`
            );


          const reward =
            Number(
              rewardInput?.value
            );


          if (
            !Number.isFinite(reward) ||
            reward < 0
          ) {

            alert(
              `Please enter a valid reward for Level ${level}.`
            );


            rewardInput?.focus();


            return;
          }


          levels.push({

            level:
              level,

            reward:
              reward

          });

        }


        // ===========================================
        // FIRESTORE
        // ===========================================

        const settingsRef =
          doc(
            db,
            "settings",
            "referralSettings"
          );


        await setDoc(
          settingsRef,
          {

            rechargeAmounts:
              uniqueRechargeAmounts,

            // Backward compatibility:
            // first recharge amount
            rechargeAmount:
              uniqueRechargeAmounts[0],

            levels:
              levels,

            updatedAt:
              serverTimestamp(),

            updatedBy:
              currentAdmin.uid

          },
          {
            merge: true
          }
        );


        // ===========================================
        // ALSO SAVE DEPOSIT SETTING
        //
        // This keeps old deposit.html working.
        // ===========================================

        const depositSettingsRef =
          doc(
            db,
            "settings",
            "depositSettings"
          );


        await setDoc(
          depositSettingsRef,
          {

            rechargeAmounts:
              uniqueRechargeAmounts,

            rechargeAmount:
              uniqueRechargeAmounts[0],

            updatedAt:
              serverTimestamp(),

            updatedBy:
              currentAdmin.uid

          },
          {
            merge: true
          }
        );


        if (status) {

          status.textContent =
            "✅ Recharge amounts and Level 1–9 referral rewards saved successfully.";

          status.className =
            "success-text";

        }


        alert(
          "✅ Recharge + Level 1–9 Referral Settings Saved Successfully!"
        );


        await loadReferralSettings();


      } catch (error) {

        console.error(
          "SAVE REFERRAL SETTINGS ERROR:",
          error
        );


        if (status) {

          status.textContent =
            "❌ Failed to save referral settings.";

          status.className =
            "error-text";

        }


        alert(
          "Failed to save settings:\n\n" +
          error.message
        );


      } finally {

        saveReferralSettings.disabled =
          false;


        saveReferralSettings.textContent =
          "💾 Save / Update Recharge & Referral Settings";

      }

    }
  );

}


// =====================================================
// LOAD DEPOSIT ACCOUNT SETTINGS
//
// FIRESTORE:
// settings/depositSettings
//
// Fields:
// accountName
// accountNumber
// rechargeAmounts
// rechargeAmount
// =====================================================

async function loadDepositSettings() {

  const accountNameInput =
    document.getElementById(
      "accountName"
    );


  const accountNumberInput =
    document.getElementById(
      "accountNumber"
    );


  const status =
    document.getElementById(
      "depositSettingsStatus"
    );


  if (
    !accountNameInput &&
    !accountNumberInput
  ) {

    return;

  }


  try {

    const settingsRef =
      doc(
        db,
        "settings",
        "depositSettings"
      );


    const snap =
      await getDoc(settingsRef);


    if (!snap.exists()) {

      if (accountNameInput) {
        accountNameInput.value = "";
      }


      if (accountNumberInput) {
        accountNumberInput.value = "";
      }


      if (status) {

        status.textContent =
          "ℹ️ No deposit account settings found.";

      }


      return;
    }


    const data =
      snap.data();


    if (accountNameInput) {

      accountNameInput.value =
        String(
          data.accountName ?? ""
        );

    }


    if (accountNumberInput) {

      accountNumberInput.value =
        String(
          data.accountNumber ?? ""
        );

    }


    if (status) {

      status.textContent =
        "✅ Deposit account settings loaded.";

      status.className =
        "success-text";

    }


  } catch (error) {

    console.error(
      "LOAD DEPOSIT SETTINGS ERROR:",
      error
    );


    if (status) {

      status.textContent =
        "❌ Failed to load deposit settings.";

      status.className =
        "error-text";

    }

  }

}


// =====================================================
// SAVE DEPOSIT ACCOUNT SETTINGS
// =====================================================

const saveDepositSettings =
  document.getElementById(
    "saveDepositSettings"
  );


if (saveDepositSettings) {

  saveDepositSettings.addEventListener(
    "click",
    async () => {

      if (!ensureAdmin()) {
        return;
      }


      const accountNameInput =
        document.getElementById(
          "accountName"
        );


      const accountNumberInput =
        document.getElementById(
          "accountNumber"
        );


      const status =
        document.getElementById(
          "depositSettingsStatus"
        );


      const accountName =
        accountNameInput?.value
          ?.trim() || "";


      const accountNumber =
        accountNumberInput?.value
          ?.trim() || "";


      if (!accountName) {

        alert(
          "Please enter Account Name."
        );

        accountNameInput?.focus();

        return;
      }


      if (!accountNumber) {

        alert(
          "Please enter Account Number."
        );

        accountNumberInput?.focus();

        return;
      }


      try {

        saveDepositSettings.disabled =
          true;


        saveDepositSettings.textContent =
          "Saving...";


        const settingsRef =
          doc(
            db,
            "settings",
            "depositSettings"
          );


        await setDoc(
          settingsRef,
          {

            accountName:
              accountName,

            accountNumber:
              accountNumber,

            updatedAt:
              serverTimestamp(),

            updatedBy:
              currentAdmin.uid

          },
          {
            merge: true
          }
        );


        if (status) {

          status.textContent =
            "✅ Deposit account settings saved.";

          status.className =
            "success-text";

        }


        alert(
          "✅ Deposit account settings saved successfully!"
        );


        await loadDepositSettings();


      } catch (error) {

        console.error(
          "SAVE DEPOSIT SETTINGS ERROR:",
          error
        );


        if (status) {

          status.textContent =
            "❌ Failed to save deposit account settings.";

          status.className =
            "error-text";

        }


        alert(
          "Failed to save deposit settings:\n\n" +
          error.message
        );


      } finally {

        saveDepositSettings.disabled =
          false;


        saveDepositSettings.textContent =
          "💾 Save Deposit Settings";

      }

    }
  );

}


window.loadDepositSettings =
  loadDepositSettings;


// =====================================================
// LOAD WITHDRAWAL SETTINGS
//
// FIRESTORE:
// settings/withdrawalSettings
//
// Field:
// amounts: [250,2500,...]
// =====================================================

async function loadWithdrawalSettings() {

  const status =
    document.getElementById(
      "withdrawalSettingsStatus"
    );


  try {

    const snap =
      await getDoc(
        doc(
          db,
          "settings",
          "withdrawalSettings"
        )
      );


    let amounts =
      DEFAULT_WITHDRAWAL_AMOUNTS;


    if (snap.exists()) {

      const data =
        snap.data();


      if (
        Array.isArray(data.amounts) &&
        data.amounts.length > 0
      ) {

        amounts =
          data.amounts;

      }

    }


    for (
      let i = 1;
      i <= 9;
      i++
    ) {

      const input =
        document.getElementById(
          `withdrawalAmount${i}`
        );


      if (input) {

        input.value =
          Number(
            amounts[i - 1] ??
            ""
          );

      }

    }


    if (status) {

      status.textContent =
        "✅ Withdrawal settings loaded.";

      status.className =
        "success-text";

    }


  } catch (error) {

    console.error(
      "LOAD WITHDRAWAL SETTINGS ERROR:",
      error
    );


    if (status) {

      status.textContent =
        "❌ Failed to load withdrawal settings.";

      status.className =
        "error-text";

    }

  }

}


window.loadWithdrawalSettings =
  loadWithdrawalSettings;


// =====================================================
// SAVE WITHDRAWAL SETTINGS
// =====================================================

const saveWithdrawalSettings =
  document.getElementById(
    "saveWithdrawalSettings"
  );


if (saveWithdrawalSettings) {

  saveWithdrawalSettings.addEventListener(
    "click",
    async () => {

      if (!ensureAdmin()) {
        return;
      }


      const status =
        document.getElementById(
          "withdrawalSettingsStatus"
        );


      try {

        saveWithdrawalSettings.disabled =
          true;


        saveWithdrawalSettings.textContent =
          "Saving...";


        const amounts = [];


        for (
          let i = 1;
          i <= 9;
          i++
        ) {

          const input =
            document.getElementById(
              `withdrawalAmount${i}`
            );


          const value =
            Number(
              input?.value
            );


          if (
            !Number.isFinite(value) ||
            value <= 0
          ) {

            alert(
              `Please enter a valid Withdrawal Amount ${i}.`
            );


            input?.focus();

            return;

          }


          amounts.push(value);

        }


        const uniqueAmounts =
          [
            ...new Set(amounts)
          ];


        if (
          uniqueAmounts.length === 0
        ) {

          alert(
            "Please add at least one withdrawal amount."
          );

          return;
        }


        await setDoc(
          doc(
            db,
            "settings",
            "withdrawalSettings"
          ),
          {

            amounts:
              uniqueAmounts,

            updatedAt:
              serverTimestamp(),

            updatedBy:
              currentAdmin.uid

          },
          {
            merge: true
          }
        );


        if (status) {

          status.textContent =
            "✅ Withdrawal settings saved successfully.";

          status.className =
            "success-text";

        }


        alert(
          "✅ Withdrawal settings saved successfully!"
        );


        await loadWithdrawalSettings();


      } catch (error) {

        console.error(
          "SAVE WITHDRAWAL SETTINGS ERROR:",
          error
        );


        if (status) {

          status.textContent =
            "❌ Failed to save withdrawal settings.";

          status.className =
            "error-text";

        }


        alert(
          "Failed to save withdrawal settings:\n\n" +
          error.message
        );


      } finally {

        saveWithdrawalSettings.disabled =
          false;


        saveWithdrawalSettings.textContent =
          "💾 Save / Update Withdrawal Settings";

      }

    }
  );

}


// =====================================================
// LOAD WITHDRAWALS
// =====================================================

async function loadWithdrawals() {

  const withdrawalList =
    document.getElementById(
      "withdrawalList"
    );


  if (!withdrawalList) return;


  try {

    withdrawalList.innerHTML =
      "<p>Loading withdrawals...</p>";


    const snap =
      await getDocs(
        collection(
          db,
          "withdrawals"
        )
      );


    withdrawalList.innerHTML = "";


    if (snap.empty) {

      withdrawalList.innerHTML =
        "<p>No withdrawal requests.</p>";

      return;
    }


    snap.forEach((item) => {

      const data =
        item.data();


      const status =
        String(
          data.status ||
          "pending"
        );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "profile-card";


      card.innerHTML = `

        <p>
          <b>User ID:</b>
          ${escapeHTML(data.userId || "")}
        </p>

        <p>
          <b>Amount:</b>
          ETB ${Number(
            data.amount || 0
          ).toLocaleString()}
        </p>

        <p>
          <b>Method:</b>
          ${escapeHTML(
            data.method || ""
          )}
        </p>

        <p>
          <b>Status:</b>
          ${escapeHTML(status)}
        </p>

      `;


      if (
        status.toLowerCase() ===
        "pending"
      ) {

        const approveBtn =
          document.createElement(
            "button"
          );


        approveBtn.type =
          "button";


        approveBtn.textContent =
          "✅ Approve Withdrawal";


        approveBtn.addEventListener(
          "click",
          async () => {

            approveBtn.disabled =
              true;

            approveBtn.textContent =
              "Processing...";


            await approveWithdrawal(
              item.id
            );

          }
        );


        card.appendChild(
          approveBtn
        );

      }


      withdrawalList.appendChild(
        card
      );

    });


  } catch (error) {

    console.error(
      "LOAD WITHDRAWALS ERROR:",
      error
    );


    withdrawalList.innerHTML = `
      <p style="color:#d32f2f;">
        ❌ Failed to load withdrawals.
        <br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


// =====================================================
// APPROVE WITHDRAWAL
// =====================================================

async function approveWithdrawal(
  withdrawId
) {

  if (!ensureAdmin()) return;


  try {

    const result =
      await runTransaction(
        db,
        async (transaction) => {

          const withdrawRef =
            doc(
              db,
              "withdrawals",
              withdrawId
            );


          const withdrawSnap =
            await transaction.get(
              withdrawRef
            );


          if (!withdrawSnap.exists()) {

            throw new Error(
              "Withdrawal not found."
            );
          }


          const withdrawData =
            withdrawSnap.data();


          const status =
            String(
              withdrawData.status ||
              "pending"
            ).toLowerCase();


          if (status !== "pending") {

            return {
              alreadyProcessed: true
            };

          }


          const userId =
            withdrawData.userId;


          const amount =
            Number(
              withdrawData.amount || 0
            );


          if (
            !userId ||
            !Number.isFinite(amount) ||
            amount <= 0
          ) {

            throw new Error(
              "Invalid withdrawal data."
            );

          }


          const walletRef =
            doc(
              db,
              "wallets",
              userId
            );


          const walletSnap =
            await transaction.get(
              walletRef
            );


          if (!walletSnap.exists()) {

            throw new Error(
              "User wallet not found."
            );

          }


          const walletData =
            walletSnap.data();


          const balance =
            Number(
              walletData.balance || 0
            );


          if (balance < amount) {

            throw new Error(
              "Insufficient balance. Current balance: ETB " +
              balance.toLocaleString()
            );

          }


          transaction.update(
            walletRef,
            {
              balance:
                increment(-amount)
            }
          );


          transaction.update(
            withdrawRef,
            {
              status:
                "Successful",

              approvedAt:
                serverTimestamp(),

              approvedBy:
                currentAdmin.uid
            }
          );


          return {
            alreadyProcessed: false
          };

        }
      );


    if (
      result.alreadyProcessed
    ) {

      alert(
        "This withdrawal was already processed."
      );

    } else {

      alert(
        "✅ Withdrawal Approved Successfully."
      );

    }


    await loadWithdrawals();


  } catch (error) {

    console.error(
      "APPROVE WITHDRAWAL ERROR:",
      error
    );


    alert(
      "Failed to approve withdrawal:\n\n" +
      error.message
    );


    await loadWithdrawals();

  }

}


window.approveWithdrawal =
  approveWithdrawal;


// =====================================================
// LOAD ADMIN MESSAGES
// =====================================================

async function loadAdminMessages() {

  const list =
    document.getElementById(
      "adminMessageList"
    );


  if (!list) return;


  try {

    list.innerHTML =
      "<p>Loading messages...</p>";


    const snap =
      await getDocs(
        collection(
          db,
          "messages"
        )
      );


    list.innerHTML = "";


    if (snap.empty) {

      list.innerHTML =
        "<p>No published messages.</p>";

      return;
    }


    snap.forEach((item) => {

      const data =
        item.data();


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "message-admin-card";


      card.innerHTML = `

        <h3>
          ${escapeHTML(
            data.title || "Message"
          )}
        </h3>

        <p>
          ${escapeHTML(
            data.text || ""
          ).replace(
            /\n/g,
            "<br>"
          )}
        </p>

        <p>
          <b>Status:</b>
          ${data.active
            ? "Active"
            : "Inactive"}
        </p>

        <button
          type="button"
          class="toggle-message-btn"
        >
          ${data.active
            ? "⏸️ Deactivate"
            : "▶️ Activate"}
        </button>

        <button
          type="button"
          class="delete-message-btn"
          style="
            background:#e53935;
            color:#fff;
            border:none;
          "
        >
          🗑️ Delete
        </button>

      `;


      const toggleBtn =
        card.querySelector(
          ".toggle-message-btn"
        );


      toggleBtn.addEventListener(
        "click",
        async () => {

          try {

            toggleBtn.disabled =
              true;


            await updateDoc(
              doc(
                db,
                "messages",
                item.id
              ),
              {
                active:
                  !Boolean(
                    data.active
                  ),

                updatedAt:
                  serverTimestamp(),

                updatedBy:
                  currentAdmin.uid
              }
            );


            await loadAdminMessages();


          } catch (error) {

            console.error(
              "TOGGLE MESSAGE ERROR:",
              error
            );


            alert(
              error.message
            );


            toggleBtn.disabled =
              false;

          }

        }
      );


      const deleteBtn =
        card.querySelector(
          ".delete-message-btn"
        );


      deleteBtn.addEventListener(
        "click",
        async () => {

          const confirmed =
            confirm(
              "Delete this message?"
            );


          if (!confirmed) {
            return;
          }


          try {

            deleteBtn.disabled =
              true;


            await deleteDoc(
              doc(
                db,
                "messages",
                item.id
              )
            );


            await loadAdminMessages();


          } catch (error) {

            console.error(
              "DELETE MESSAGE ERROR:",
              error
            );


            alert(
              error.message
            );


            deleteBtn.disabled =
              false;

          }

        }
      );


      list.appendChild(card);

    });


  } catch (error) {

    console.error(
      "LOAD ADMIN MESSAGES ERROR:",
      error
    );


    list.innerHTML = `
      <p style="color:#d32f2f;">
        ❌ Failed to load messages.
        <br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


// =====================================================
// PUBLISH MESSAGE
// =====================================================

const publishMessageBtn =
  document.getElementById(
    "publishMessageBtn"
  );


if (publishMessageBtn) {

  publishMessageBtn.addEventListener(
    "click",
    async () => {

      if (!ensureAdmin()) {
        return;
      }


      const titleInput =
        document.getElementById(
          "messageTitle"
        );


      const textInput =
        document.getElementById(
          "messageText"
        );


      const activeInput =
        document.getElementById(
          "messageActive"
        );


      const status =
        document.getElementById(
          "messageStatus"
        );


      const title =
        titleInput?.value
          ?.trim() || "";


      const text =
        textInput?.value
          ?.trim() || "";


      const active =
        activeInput?.checked ??
        true;


      if (!title) {

        alert(
          "Please enter Message Title."
        );

        titleInput?.focus();

        return;
      }


      if (!text) {

        alert(
          "Please write your message."
        );

        textInput?.focus();

        return;
      }


      try {

        publishMessageBtn.disabled =
          true;


        publishMessageBtn.textContent =
          "Publishing...";


        if (status) {

          status.textContent =
            "Publishing message...";

        }


        await addDoc(
          collection(
            db,
            "messages"
          ),
          {

            title:
              title,

            text:
              text,

            active:
              active,

            createdAt:
              serverTimestamp(),

            createdBy:
              currentAdmin.uid

          }
        );


        titleInput.value =
          "";

        textInput.value =
          "";

        if (activeInput) {
          activeInput.checked =
            true;
        }


        if (status) {

          status.textContent =
            "✅ Message published successfully.";

          status.className =
            "success-text";

        }


        alert(
          "✅ Message published successfully!"
        );


        await loadAdminMessages();


      } catch (error) {

        console.error(
          "PUBLISH MESSAGE ERROR:",
          error
        );


        if (status) {

          status.textContent =
            "❌ Failed to publish message.";

          status.className =
            "error-text";

        }


        alert(
          "Failed to publish message:\n\n" +
          error.message
        );


      } finally {

        publishMessageBtn.disabled =
          false;


        publishMessageBtn.textContent =
          "📢 Publish Message";

      }

    }
  );

}


// =====================================================
// LOAD ADMIN TASKS
// =====================================================

async function loadAdminTasks() {

  const taskList =
    document.getElementById(
      "adminTaskList"
    );


  if (!taskList) return;


  try {

    taskList.innerHTML =
      "<p>Loading tasks...</p>";


    const snap =
      await getDocs(
        collection(
          db,
          "tasks"
        )
      );


    taskList.innerHTML =
      "";


    if (snap.empty) {

      taskList.innerHTML =
        "<p>No tasks found.</p>";

      return;
    }


    snap.forEach((item) => {

      const data =
        item.data();


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "admin-task-card";


      const title =
        escapeHTML(
          data.title ||
          "Untitled Task"
        );


      const description =
        escapeHTML(
          data.description ||
          ""
        );


      const reward =
        Number(
          data.reward || 0
        );


      const watchSeconds =
        Number(
          data.watchSeconds ||
          data.requiredWatchSeconds ||
          5
        );


      const active =
        Boolean(
          data.active
        );


      const videoUrl =
        String(
          data.videoUrl ||
          data.video ||
          ""
        );


      card.innerHTML = `

        ${
          videoUrl
            ? `
              <video
                src="${escapeHTML(videoUrl)}"
                controls
                playsinline
                preload="metadata"
              ></video>
            `
            : `
              <div
                style="
                  height:130px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  background:#f1f1f1;
                  border-radius:9px;
                  font-size:12px;
                  color:#777;
                "
              >
                🎬 No Video
              </div>
            `
        }

        <h3>
          ${title}
        </h3>

        <p>
          ${description}
        </p>

        <p>
          <b>Reward:</b>
          ETB ${reward.toLocaleString()}
        </p>

        <p>
          <b>Watch:</b>
          ${watchSeconds} seconds
        </p>

        <p>
          <b>Status:</b>
          ${
            active
              ? "🟢 Active"
              : "🔴 Inactive"
          }
        </p>

        <button
          type="button"
          class="toggle-task-btn"
        >
          ${
            active
              ? "⏸️ Deactivate"
              : "▶️ Activate"
          }
        </button>

        <button
          type="button"
          class="delete-task-btn"
        >
          🗑️ Delete Task
        </button>

      `;


      const toggleBtn =
        card.querySelector(
          ".toggle-task-btn"
        );


      toggleBtn.addEventListener(
        "click",
        async () => {

          try {

            toggleBtn.disabled =
              true;


            await updateDoc(
              doc(
                db,
                "tasks",
                item.id
              ),
              {

                active:
                  !active,

                updatedAt:
                  serverTimestamp(),

                updatedBy:
                  currentAdmin.uid

              }
            );


            await loadAdminTasks();


          } catch (error) {

            console.error(
              "TOGGLE TASK ERROR:",
              error
            );


            alert(
              error.message
            );


            toggleBtn.disabled =
              false;

          }

        }
      );


      const deleteBtn =
        card.querySelector(
          ".delete-task-btn"
        );


      deleteBtn.addEventListener(
        "click",
        async () => {

          const confirmed =
            confirm(
              "Are you sure you want to delete this task?"
            );


          if (!confirmed) {
            return;
          }


          try {

            deleteBtn.disabled =
              true;


            await deleteDoc(
              doc(
                db,
                "tasks",
                item.id
              )
            );


            await loadAdminTasks();


          } catch (error) {

            console.error(
              "DELETE TASK ERROR:",
              error
            );


            alert(
              "Failed to delete task:\n\n" +
              error.message
            );


            deleteBtn.disabled =
              false;

          }

        }
      );


      taskList.appendChild(
        card
      );

    });


  } catch (error) {

    console.error(
      "LOAD ADMIN TASKS ERROR:",
      error
    );


    taskList.innerHTML = `
      <p style="color:#d32f2f;">
        ❌ Failed to load tasks.
        <br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


// =====================================================
// VIDEO PREVIEW
// =====================================================

const taskVideoFile =
  document.getElementById(
    "taskVideoFile"
  );


const videoPreview =
  document.getElementById(
    "videoPreview"
  );


const videoUploadStatus =
  document.getElementById(
    "videoUploadStatus"
  );


if (taskVideoFile) {

  taskVideoFile.addEventListener(
    "change",
    () => {

      const file =
        taskVideoFile.files?.[0];


      if (!file) {

        if (videoPreview) {

          videoPreview.style.display =
            "none";

          videoPreview.removeAttribute(
            "src"
          );

        }


        if (videoUploadStatus) {

          videoUploadStatus.textContent =
            "📱 Select a video from your Gallery.";

        }


        return;
      }


      if (
        !file.type.startsWith(
          "video/"
        )
      ) {

        alert(
          "Please select a video file."
        );


        taskVideoFile.value =
          "";


        return;
      }


      const maxSize =
        100 * 1024 * 1024;


      if (file.size > maxSize) {

        alert(
          "Video is too large. Maximum size is 100 MB."
        );


        taskVideoFile.value =
          "";


        return;
      }


      const objectUrl =
        URL.createObjectURL(file);


      if (videoPreview) {

        videoPreview.src =
          objectUrl;

        videoPreview.style.display =
          "block";

      }


      if (videoUploadStatus) {

        videoUploadStatus.textContent =
          "✅ Video selected: " +
          file.name;

      }

    }
  );

}


// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

async function uploadVideoToCloudinary(
  file
) {

  if (!file) {

    throw new Error(
      "Please select a video."
    );

  }


  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      CLOUDINARY_CLOUD_NAME
    )}/video/upload`;


  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );


  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );


  const response =
    await fetch(
      uploadUrl,
      {
        method: "POST",
        body: formData
      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();


    throw new Error(
      "Cloudinary upload failed: " +
      errorText
    );

  }


  const data =
    await response.json();


  if (!data.secure_url) {

    throw new Error(
      "Cloudinary did not return a video URL."
    );

  }


  return data.secure_url;

}


// =====================================================
// CREATE TASK
// =====================================================

const createTaskBtn =
  document.getElementById(
    "createTaskBtn"
  );


if (createTaskBtn) {

  createTaskBtn.addEventListener(
    "click",
    async () => {

      if (!ensureAdmin()) {
        return;
      }


      const titleInput =
        document.getElementById(
          "taskTitle"
        );


      const descriptionInput =
        document.getElementById(
          "taskDescription"
        );


      const rewardInput =
        document.getElementById(
          "taskReward"
        );


      const watchInput =
        document.getElementById(
          "taskWatchSeconds"
        );


      const activeInput =
        document.getElementById(
          "taskActive"
        );


      const videoFileInput =
        document.getElementById(
          "taskVideoFile"
        );


      const videoUrlInput =
        document.getElementById(
          "taskVideoUrl"
        );


      const message =
        document.getElementById(
          "taskMessage"
        );


      const title =
        titleInput?.value
          ?.trim() || "";


      const description =
        descriptionInput?.value
          ?.trim() || "";


      const reward =
        Number(
          rewardInput?.value
        );


      const watchSeconds =
        Number(
          watchInput?.value ||
          5
        );


      const active =
        activeInput?.checked ??
        true;


      const file =
        videoFileInput?.files?.[0];


      if (!title) {

        alert(
          "Please enter Task Title."
        );

        titleInput?.focus();

        return;
      }


      if (
        !Number.isFinite(reward) ||
        reward <= 0
      ) {

        alert(
          "Please enter a valid Task Reward."
        );

        rewardInput?.focus();

        return;
      }


      if (
        !Number.isFinite(watchSeconds) ||
        watchSeconds < 5 ||
        watchSeconds > 60
      ) {

        alert(
          "Watch time must be between 5 and 60 seconds."
        );

        watchInput?.focus();

        return;
      }


      if (!file) {

        alert(
          "Please select a task video."
        );

        videoFileInput?.focus();

        return;
      }


      try {

        createTaskBtn.disabled =
          true;


        createTaskBtn.textContent =
          "Uploading Video...";


        if (message) {

          message.textContent =
            "☁️ Uploading video to Cloudinary...";

          message.className = "";

        }


        const videoUrl =
          await uploadVideoToCloudinary(
            file
          );


        if (videoUrlInput) {

          videoUrlInput.value =
            videoUrl;

        }


        if (message) {

          message.textContent =
            "Saving task...";

        }


        await addDoc(
          collection(
            db,
            "tasks"
          ),
          {

            title:
              title,

            description:
              description,

            videoUrl:
              videoUrl,

            reward:
              reward,

            watchSeconds:
              watchSeconds,

            requiredWatchSeconds:
              watchSeconds,

            active:
              active,

            createdAt:
              serverTimestamp(),

            createdBy:
              currentAdmin.uid

          }
        );


        titleInput.value =
          "";

        descriptionInput.value =
          "";

        rewardInput.value =
          "";

        watchInput.value =
          "5";


        if (videoFileInput) {
          videoFileInput.value =
            "";
        }


        if (videoUrlInput) {
          videoUrlInput.value =
            "";
        }


        if (videoPreview) {

          videoPreview.pause();

          videoPreview.removeAttribute(
            "src"
          );

          videoPreview.load();

          videoPreview.style.display =
            "none";

        }


        if (videoUploadStatus) {

          videoUploadStatus.textContent =
            "📱 Select a video from your Gallery.";

        }


        if (message) {

          message.textContent =
            "✅ Task created successfully.";

          message.className =
            "success-text";

        }


        alert(
          "✅ Task created successfully!"
        );


        await loadAdminTasks();


      } catch (error) {

        console.error(
          "CREATE TASK ERROR:",
          error
        );


        if (message) {

          message.textContent =
            "❌ Failed to create task.";

          message.className =
            "error-text";

        }


        alert(
          "Failed to create task:\n\n" +
          error.message
        );


      } finally {

        createTaskBtn.disabled =
          false;


        createTaskBtn.textContent =
          "Create Task";

      }

    }
  );

}


// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.loadUsers =
  loadUsers;

window.loadDeposits =
  loadDeposits;

window.loadWithdrawals =
  loadWithdrawals;

window.loadAdminMessages =
  loadAdminMessages;

window.loadAdminTasks =
  loadAdminTasks;

window.addRechargeAmountRow =
  addRechargeAmountRow;

window.uploadVideoToCloudinary =
  uploadVideoToCloudinary;


// =====================================================
// INVESTMENT PLANS MANAGER
// ADD + EDIT + UPDATE + DELETE + ACTIVE/INACTIVE
// FIRESTORE:
// investmentPlans/{AUTO_ID}
// =====================================================

async function loadInvestmentPlans() {

  const plansBox =
    document.getElementById(
      "adminInvestmentPlans"
    );

  if (!plansBox) return;

  plansBox.innerHTML =
    "<p>Loading investment plans...</p>";

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "investmentPlans"
        )
      );

    plansBox.innerHTML = "";

    if (snapshot.empty) {

      plansBox.innerHTML = `
        <div class="profile-card">
          <p>No investment plans available.</p>
        </div>
      `;

      return;
    }

    snapshot.forEach((item) => {

      const plan =
        item.data();

      const planId =
        item.id;

      const name =
        plan.name ||
        "Investment Plan";

      const amount =
        Number(
          plan.amount || 0
        );

      const dailyProfit =
        Number(
          plan.dailyProfit || 0
        );

      const duration =
        Number(
          plan.duration || 0
        );

      const active =
        plan.active === true;

      const card =
        document.createElement("div");

      card.className =
        "profile-card";

      card.innerHTML = `

        <h3>
          📈 ${escapeHTML(name)}
        </h3>

        <p>
          <b>Investment Amount:</b>
          ETB ${amount.toLocaleString()}
        </p>

        <p>
          <b>Daily Profit:</b>
          ETB ${dailyProfit.toLocaleString()}
        </p>

        <p>
          <b>Duration:</b>
          ${duration} Days
        </p>

        <p>
          <b>Status:</b>

          <span
            style="
              font-weight:bold;
              color:${active ? "#2e7d32" : "#d32f2f"};
            "
          >
            ${active ? "ACTIVE" : "INACTIVE"}
          </span>
        </p>

        <p
          style="
            font-size:12px;
            color:#777;
            word-break:break-all;
          "
        >
          ID: ${escapeHTML(planId)}
        </p>

        <button
          type="button"
          class="edit-investment-btn"
          data-id="${escapeHTML(planId)}"
        >
          ✏️ Edit
        </button>

        <button
          type="button"
          class="toggle-investment-btn"
          data-id="${escapeHTML(planId)}"
        >
          ${
            active
              ? "⛔ Make Inactive"
              : "✅ Make Active"
          }
        </button>

        <button
          type="button"
          class="delete-investment-btn"
          data-id="${escapeHTML(planId)}"
        >
          🗑️ Delete
        </button>

      `;

      plansBox.appendChild(card);

    });


    // =================================================
    // EDIT BUTTONS
    // =================================================

    plansBox
      .querySelectorAll(
        ".edit-investment-btn"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            editInvestmentPlan(
              button.dataset.id
            );

          }
        );

      });


    // =================================================
    // ACTIVE / INACTIVE BUTTONS
    // =================================================

    plansBox
      .querySelectorAll(
        ".toggle-investment-btn"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            toggleInvestmentPlan(
              button.dataset.id
            );

          }
        );

      });


    // =================================================
    // DELETE BUTTONS
    // =================================================

    plansBox
      .querySelectorAll(
        ".delete-investment-btn"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            deleteInvestmentPlan(
              button.dataset.id
            );

          }
        );

      });


  } catch (error) {

    console.error(
      "LOAD INVESTMENT PLANS ERROR:",
      error
    );

    plansBox.innerHTML = `
      <div class="profile-card">

        <p style="color:#d32f2f;">

          ❌ Failed to load investment plans.

          <br><br>

          ${escapeHTML(error.message)}

        </p>

      </div>
    `;

  }

}


// =====================================================
// SAVE INVESTMENT PLAN
// CREATE OR UPDATE
// =====================================================

async function saveInvestmentPlan() {

  if (!ensureAdmin()) {
    return;
  }

  const idInput =
    document.getElementById(
      "investmentPlanId"
    );

  const nameInput =
    document.getElementById(
      "investmentPlanName"
    );

  const amountInput =
    document.getElementById(
      "investmentPlanAmount"
    );

  const profitInput =
    document.getElementById(
      "investmentPlanProfit"
    );

  const durationInput =
    document.getElementById(
      "investmentPlanDuration"
    );

  const activeInput =
    document.getElementById(
      "investmentPlanActive"
    );

  if (
    !nameInput ||
    !amountInput ||
    !profitInput ||
    !durationInput ||
    !activeInput
  ) {

    alert(
      "Investment Plan form not found."
    );

    return;
  }

  const planId =
    idInput?.value.trim() || "";

  const name =
    nameInput.value.trim();

  const amount =
    Number(
      amountInput.value
    );

  const dailyProfit =
    Number(
      profitInput.value
    );

  const duration =
    Number(
      durationInput.value
    );

  const active =
    activeInput.checked;


  // =================================================
  // VALIDATION
  // =================================================

  if (!name) {

    alert(
      "Please enter Plan Name."
    );

    nameInput.focus();

    return;
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    alert(
      "Please enter a valid Investment Amount."
    );

    amountInput.focus();

    return;
  }

  if (
    !Number.isFinite(dailyProfit) ||
    dailyProfit < 0
  ) {

    alert(
      "Please enter a valid Daily Profit."
    );

    profitInput.focus();

    return;
  }

  if (
    !Number.isFinite(duration) ||
    duration <= 0
  ) {

    alert(
      "Please enter a valid Duration."
    );

    durationInput.focus();

    return;
  }

  const button =
    document.getElementById(
      "saveInvestmentPlanBtn"
    );

  try {

    if (button) {

      button.disabled = true;

      button.textContent =
        planId
          ? "Updating..."
          : "Saving...";

    }

    const planData = {

      name:
        name,

      amount:
        amount,

      dailyProfit:
        dailyProfit,

      duration:
        duration,

      active:
        active,

      updatedAt:
        serverTimestamp(),

      updatedBy:
        currentAdmin.uid

    };


    // =================================================
    // UPDATE
    // =================================================

    if (planId) {

      await updateDoc(
        doc(
          db,
          "investmentPlans",
          planId
        ),
        planData
      );

      alert(
        "✅ Investment Plan updated successfully."
      );

    }


    // =================================================
    // CREATE
    // =================================================

    else {

      await addDoc(
        collection(
          db,
          "investmentPlans"
        ),
        {

          ...planData,

          createdAt:
            serverTimestamp(),

          createdBy:
            currentAdmin.uid

        }
      );

      alert(
        "✅ Investment Plan saved successfully."
      );

    }

    clearInvestmentPlanForm();

    await loadInvestmentPlans();


  } catch (error) {

    console.error(
      "SAVE INVESTMENT PLAN ERROR:",
      error
    );

    alert(
      "❌ Investment Plan save failed:\n\n" +
      error.message
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "💾 Save Investment Plan";

    }

  }

}


// =====================================================
// EDIT INVESTMENT PLAN
// =====================================================

async function editInvestmentPlan(
  planId
) {

  if (!ensureAdmin()) {
    return;
  }

  try {

    const planRef =
      doc(
        db,
        "investmentPlans",
        planId
      );

    const snapshot =
      await getDoc(planRef);

    if (!snapshot.exists()) {

      alert(
        "Investment Plan not found."
      );

      await loadInvestmentPlans();

      return;
    }

    const plan =
      snapshot.data();

    const id =
      document.getElementById(
        "investmentPlanId"
      );

    const name =
      document.getElementById(
        "investmentPlanName"
      );

    const amount =
      document.getElementById(
        "investmentPlanAmount"
      );

    const profit =
      document.getElementById(
        "investmentPlanProfit"
      );

    const duration =
      document.getElementById(
        "investmentPlanDuration"
      );

    const active =
      document.getElementById(
        "investmentPlanActive"
      );

    if (
      !id ||
      !name ||
      !amount ||
      !profit ||
      !duration ||
      !active
    ) {

      alert(
        "Investment Plan form not found."
      );

      return;
    }

    id.value =
      planId;

    name.value =
      plan.name || "";

    amount.value =
      Number(
        plan.amount || 0
      );

    profit.value =
      Number(
        plan.dailyProfit || 0
      );

    duration.value =
      Number(
        plan.duration || 0
      );

    active.checked =
      plan.active === true;


    const saveButton =
      document.getElementById(
        "saveInvestmentPlanBtn"
      );

    if (saveButton) {

      saveButton.textContent =
        "💾 Update Investment Plan";

    }


    const cancelButton =
      document.getElementById(
        "cancelInvestmentEditBtn"
      );

    if (cancelButton) {

      cancelButton.style.display =
        "block";

    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {

    console.error(
      "EDIT INVESTMENT PLAN ERROR:",
      error
    );

    alert(
      "❌ Failed to edit Investment Plan:\n\n" +
      error.message
    );

  }

}


// =====================================================
// DELETE INVESTMENT PLAN
// =====================================================

async function deleteInvestmentPlan(
  planId
) {

  if (!ensureAdmin()) {
    return;
  }

  const confirmed =
    confirm(
      "Are you sure you want to delete this Investment Plan?"
    );

  if (!confirmed) {
    return;
  }

  try {

    await deleteDoc(
      doc(
        db,
        "investmentPlans",
        planId
      )
    );

    alert(
      "🗑️ Investment Plan deleted successfully."
    );

    clearInvestmentPlanForm();

    await loadInvestmentPlans();

  } catch (error) {

    console.error(
      "DELETE INVESTMENT PLAN ERROR:",
      error
    );

    alert(
      "❌ Failed to delete Investment Plan:\n\n" +
      error.message
    );

  }

}


// =====================================================
// ACTIVE / INACTIVE
// =====================================================

async function toggleInvestmentPlan(
  planId
) {

  if (!ensureAdmin()) {
    return;
  }

  try {

    const planRef =
      doc(
        db,
        "investmentPlans",
        planId
      );

    const snapshot =
      await getDoc(planRef);

    if (!snapshot.exists()) {

      alert(
        "Investment Plan not found."
      );

      return;
    }

    const currentActive =
      snapshot.data().active === true;

    await updateDoc(
      planRef,
      {

        active:
          !currentActive,

        updatedAt:
          serverTimestamp(),

        updatedBy:
          currentAdmin.uid

      }
    );

    alert(
      !currentActive
        ? "✅ Investment Plan is now ACTIVE."
        : "⛔ Investment Plan is now INACTIVE."
    );

    await loadInvestmentPlans();

  } catch (error) {

    console.error(
      "TOGGLE INVESTMENT PLAN ERROR:",
      error
    );

    alert(
      "❌ Failed to change Investment Plan status:\n\n" +
      error.message
    );

  }

}


// =====================================================
// CLEAR INVESTMENT FORM
// =====================================================

function clearInvestmentPlanForm() {

  const id =
    document.getElementById(
      "investmentPlanId"
    );

  const name =
    document.getElementById(
      "investmentPlanName"
    );

  const amount =
    document.getElementById(
      "investmentPlanAmount"
    );

  const profit =
    document.getElementById(
      "investmentPlanProfit"
    );

  const duration =
    document.getElementById(
      "investmentPlanDuration"
    );

  const active =
    document.getElementById(
      "investmentPlanActive"
    );

  const cancel =
    document.getElementById(
      "cancelInvestmentEditBtn"
    );

  const save =
    document.getElementById(
      "saveInvestmentPlanBtn"
    );

  if (id) {
    id.value = "";
  }

  if (name) {
    name.value = "";
  }

  if (amount) {
    amount.value = "";
  }

  if (profit) {
    profit.value = "";
  }

  if (duration) {
    duration.value = "";
  }

  if (active) {
    active.checked = true;
  }

  if (cancel) {

    cancel.style.display =
      "none";

  }

  if (save) {

    save.textContent =
      "💾 Save Investment Plan";

  }

}


// =====================================================
// INVESTMENT EVENT LISTENERS
// =====================================================

const saveInvestmentPlanBtn =
  document.getElementById(
    "saveInvestmentPlanBtn"
  );

if (saveInvestmentPlanBtn) {

  saveInvestmentPlanBtn.addEventListener(
    "click",
    saveInvestmentPlan
  );

}


const cancelInvestmentEditBtn =
  document.getElementById(
    "cancelInvestmentEditBtn"
  );

if (cancelInvestmentEditBtn) {

  cancelInvestmentEditBtn.addEventListener(
    "click",
    clearInvestmentPlanForm
  );

}

// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.loadInvestmentPlans =
  loadInvestmentPlans;

window.saveInvestmentPlan =
  saveInvestmentPlan;

window.editInvestmentPlan =
  editInvestmentPlan;

window.deleteInvestmentPlan =
  deleteInvestmentPlan;

window.toggleInvestmentPlan =
  toggleInvestmentPlan;

window.clearInvestmentPlanForm =
  clearInvestmentPlanForm;


// =====================================================
// LOAD ALL ADMIN DATA
// =====================================================

async function loadAllAdminData() {

  if (!adminVerified) {

    console.warn(
      "⏳ Admin is not verified yet."
    );

    return;
  }


  console.log(
    "🔐 Admin verified. Loading all admin data..."
  );


  const results =
    await Promise.allSettled([

      loadUsers(),

      loadDeposits(),

      loadWithdrawals(),

      loadReferralSettings(),

      loadDepositSettings(),

      loadWithdrawalSettings(),

      loadAdminMessages(),

      loadAdminTasks(),

      loadInvestmentPlans()

    ]);


  results.forEach(
    (result, index) => {

      if (
        result.status === "rejected"
      ) {

        console.error(
          "❌ Admin loader failed:",
          index,
          result.reason
        );

      }

    }
  );


  console.log(
    "✅ All admin data loading completed."
  );

}


// =====================================================
// GLOBAL ADMIN DATA LOADER
// =====================================================

window.loadAllAdminData =
  loadAllAdminData;


// =====================================================
// END
// =====================================================

console.log(
  "✅ CCUS admin.js loaded successfully."
);