// =====================================================
// CCUS APP.JS
// COMPLETE + FIXED VERSION
// =====================================================

import {
  auth,
  db
} from "./firebase-config.js";


// =====================================================
// FIREBASE AUTH
// =====================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
  runTransaction,
  increment
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
console.log("✅ CCUS APP.JS WORKING");
console.log("✅ Firebase Auth + Firestore imported successfully");
console.log("✅ Investment transaction system ready");
// HELPER
// =====================================================

function formatETB(value) {

  const number =
    Number(value || 0);

  return (
    "ETB " +
    number.toLocaleString()
  );

}


function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value;

  }

}


// =====================================================
// SIGNUP
// =====================================================

const signupBtn =
  document.getElementById("signupBtn");


if (signupBtn) {

  signupBtn.onclick =
    async () => {

      const name =
        document.getElementById("name")
          ?.value.trim() || "";

      const email =
        document.getElementById("email")
          ?.value.trim() || "";

      const password =
        document.getElementById("password")
          ?.value || "";

      const referral =
        document.getElementById("referral")
          ?.value.trim() || "";


      if (
        !name ||
        !email ||
        !password
      ) {

        alert(
          "Please fill all required fields."
        );

        return;
      }


      if (password.length < 6) {

        alert(
          "Password must be at least 6 characters."
        );

        return;
      }


      try {

        signupBtn.disabled = true;

        signupBtn.textContent =
          "Creating Account...";


        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );


        // Generate referral code
        const referralCode =
          "CCUS" +
          Math.floor(
            100000 +
            Math.random() * 900000
          );


        // Create user
        await setDoc(
          doc(
            db,
            "users",
            result.user.uid
          ),
          {

            name:
              name,

            email:
              email,

            role:
              "user",

            referralCode:
              referralCode,

            referralCodeUsed:
              referral,

            accountNumber:
              "",

            createdAt:
              serverTimestamp()

          }
        );


        // Create wallet
        await setDoc(
          doc(
            db,
            "wallets",
            result.user.uid
          ),
          {

            balance:
              0,

            deposit:
              0,

            income:
              0,

            yesterdayIncome:
              0,

            todayIncome:
              0,

            weekIncome:
              0,

            tasksDone:
              0,

            referralIncome:
              0

          }
        );


        alert(
          "Account created successfully."
        );


        window.location.href =
          "home.html";


      } catch (error) {

        console.error(
          "SIGNUP ERROR:",
          error
        );

        alert(
          "Signup failed: " +
          error.message
        );


      } finally {

        signupBtn.disabled = false;

        signupBtn.textContent =
          "Sign Up";

      }

    };

}


// =====================================================
// LOGIN
// =====================================================

const loginBtn =
  document.getElementById("loginBtn");


if (loginBtn) {

  loginBtn.onclick =
    async () => {

      const email =
        document.getElementById("loginEmail")
          ?.value.trim() || "";

      const password =
        document.getElementById("loginPassword")
          ?.value || "";


      if (
        !email ||
        !password
      ) {

        alert(
          "Please enter email and password."
        );

        return;
      }


      try {

        loginBtn.disabled = true;

        loginBtn.textContent =
          "Logging in...";


        const result =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );


        const userSnap =
          await getDoc(
            doc(
              db,
              "users",
              result.user.uid
            )
          );


        if (!userSnap.exists()) {

          alert(
            "Login successful, but user profile was not found."
          );

          return;
        }


        const userData =
          userSnap.data();


        if (
          userData.role === "admin"
        ) {

          window.location.href =
            "admin.html";

        } else {

          window.location.href =
            "home.html";

        }


      } catch (error) {

        console.error(
          "LOGIN ERROR:",
          error
        );

        alert(
          "Login failed: " +
          error.message
        );


      } finally {

        loginBtn.disabled = false;

        loginBtn.textContent =
          "Login";

      }

    };

}


// =====================================================
// REMEMBER EMAIL
// =====================================================

const savedEmail =
  localStorage.getItem(
    "ccusEmail"
  );


const loginEmailInput =
  document.getElementById(
    "loginEmail"
  );


if (
  savedEmail &&
  loginEmailInput
) {

  loginEmailInput.value =
    savedEmail;

}


const remember =
  document.getElementById(
    "remember"
  );


if (remember) {

  remember.addEventListener(
    "change",
    () => {

      if (
        remember.checked &&
        loginEmailInput
      ) {

        localStorage.setItem(
          "ccusEmail",
          loginEmailInput.value.trim()
        );

      } else {

        localStorage.removeItem(
          "ccusEmail"
        );

      }

    }
  );

}


// =====================================================
// FORGOT PASSWORD
// =====================================================

const resetBtn =
  document.getElementById(
    "resetBtn"
  );


if (resetBtn) {

  resetBtn.onclick =
    async () => {

      const email =
        document.getElementById(
          "resetEmail"
        )?.value.trim() || "";


      if (!email) {

        alert(
          "Please enter your email."
        );

        return;
      }


      try {

        resetBtn.disabled = true;

        resetBtn.textContent =
          "Sending...";


        await sendPasswordResetEmail(
          auth,
          email
        );


        alert(
          "Password reset link sent to your email."
        );


        window.location.href =
          "login.html";


      } catch (error) {

        console.error(
          "RESET ERROR:",
          error
        );

        alert(
          "Failed to send reset link: " +
          error.message
        );


      } finally {

        resetBtn.disabled = false;

        resetBtn.textContent =
          "Reset Password";

      }

    };

}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


if (logoutBtn) {

  logoutBtn.onclick =
    async () => {

      try {

        logoutBtn.disabled = true;

        logoutBtn.textContent =
          "Logging out...";


        await signOut(auth);


        window.location.href =
          "login.html";


      } catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );


        alert(
          "Logout failed: " +
          error.message
        );


        logoutBtn.disabled =
          false;

        logoutBtn.textContent =
          "Logout";

      }

    };

}


// =====================================================
// AUTO REFERRAL CODE
// =====================================================

const params =
  new URLSearchParams(
    window.location.search
  );


const refCode =
  params.get("ref");


const referralInput =
  document.getElementById(
    "referral"
  );


if (
  refCode &&
  referralInput
) {

  referralInput.value =
    refCode.trim();

}


// =====================================================
// REFERRAL CODE
// =====================================================

async function loadReferralCode(user) {

  const codeBox =
    document.getElementById(
      "myReferralCode"
    );


  if (
    !user ||
    !codeBox
  ) {

    return;

  }


  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnap =
      await getDoc(
        userRef
      );


    if (!userSnap.exists()) {

      return;

    }


    const data =
      userSnap.data();


    if (data.referralCode) {

      codeBox.textContent =
        data.referralCode;

      return;

    }


    const code =
      "CCUS" +
      Math.floor(
        100000 +
        Math.random() * 900000
      );


    await setDoc(
      userRef,
      {
        referralCode:
          code
      },
      {
        merge:
          true
      }
    );


    codeBox.textContent =
      code;


  } catch (error) {

    console.error(
      "REFERRAL ERROR:",
      error
    );


    codeBox.textContent =
      "Unable to load referral code.";

  }

}


// =====================================================
// DEPOSIT
// =====================================================

const depositBtn =
  document.getElementById(
    "depositBtn"
  );


if (depositBtn) {

  depositBtn.onclick =
    async () => {

      const user =
        auth.currentUser;


      if (!user) {

        alert(
          "Please login first."
        );

        window.location.href =
          "login.html";

        return;

      }


      const amount =
        Number(
          document.getElementById(
            "depositAmount"
          )?.value || 0
        );


      const method =
        document.getElementById(
          "paymentMethod"
        )?.value || "";


      const senderName =
        document.getElementById(
          "senderName"
        )?.value.trim() || "";


      const transactionRef =
        document.getElementById(
          "transactionRef"
        )?.value.trim() || "";


      if (!method) {

        alert(
          "Please select payment method."
        );

        return;

      }


      if (
        !amount ||
        amount <= 0
      ) {

        alert(
          "Please select deposit amount."
        );

        return;

      }


      if (!senderName) {

        alert(
          "Please enter sender name."
        );

        return;

      }


      if (!transactionRef) {

        alert(
          "Please enter transaction reference."
        );

        return;

      }


      try {

        depositBtn.disabled = true;

        depositBtn.textContent =
          "Submitting...";


        await addDoc(
          collection(
            db,
            "deposits"
          ),
          {

            userId:
              user.uid,

            amount:
              amount,

            paymentMethod:
              method,

            method:
              method,

            senderName:
              senderName,

            transactionRef:
              transactionRef,

            status:
              "pending",

            createdAt:
              serverTimestamp()

          }
        );


        alert(
          "Deposit request submitted successfully."
        );


        window.location.href =
          "home.html";


      } catch (error) {

        console.error(
          "DEPOSIT ERROR:",
          error
        );


        alert(
          "Deposit failed: " +
          error.message
        );


      } finally {

        depositBtn.disabled = false;

        depositBtn.textContent =
          "Submit Deposit";

      }

    };

}


// =====================================================
// WITHDRAWAL
// =====================================================

const withdrawBtn =
  document.getElementById(
    "withdrawBtn"
  );


if (withdrawBtn) {

  withdrawBtn.onclick =
    async () => {

      const user =
        auth.currentUser;


      if (!user) {

        alert(
          "Please login first."
        );

        window.location.href =
          "login.html";

        return;

      }


      const amount =
        Number(
          document.getElementById(
            "withdrawAmount"
          )?.value || 0
        );


      const method =
        document.getElementById(
          "withdrawMethod"
        )?.value || "";


      if (
        !amount ||
        !method
      ) {

        alert(
          "Please select method and amount."
        );

        return;

      }


      if (amount <= 0) {

        alert(
          "Please select a valid withdrawal amount."
        );

        return;

      }


      try {

        withdrawBtn.disabled = true;

        withdrawBtn.textContent =
          "Submitting...";


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


        if (
          balance < amount
        ) {

          alert(
            "Insufficient balance. Your balance is ETB " +
            balance.toLocaleString()
          );

          return;

        }


        const settingsSnap =
          await getDoc(
            doc(
              db,
              "settings",
              "withdrawalSettings"
            )
          );


        if (
          settingsSnap.exists()
        ) {

          const settings =
            settingsSnap.data();


          const amounts =
            Array.isArray(
              settings.amounts
            )
              ? settings.amounts
              : [];


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


          if (
            validAmounts.length > 0 &&
            !validAmounts.includes(
              amount
            )
          ) {

            alert(
              "This withdrawal amount is not currently available."
            );

            return;

          }

        }


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


        alert(
          "Withdrawal request submitted successfully. Waiting for admin approval."
        );


        window.location.href =
          "wallet.html";


      } catch (error) {

        console.error(
          "WITHDRAWAL ERROR:",
          error
        );


        alert(
          "Withdrawal failed: " +
          error.message
        );


      } finally {

        withdrawBtn.disabled = false;

        withdrawBtn.textContent =
          "Withdraw";

      }

    };

}


// =====================================================
// LOAD WITHDRAWAL AMOUNTS
// =====================================================

async function loadWithdrawalAmounts() {

  const amountSelect =
    document.getElementById(
      "withdrawAmount"
    );


  if (!amountSelect) {

    return;

  }


  try {

    amountSelect.innerHTML =
      `
        <option value="">
          Loading amounts...
        </option>
      `;


    const settingsSnap =
      await getDoc(
        doc(
          db,
          "settings",
          "withdrawalSettings"
        )
      );


    if (!settingsSnap.exists()) {

      amountSelect.innerHTML =
        `
          <option value="">
            Withdrawal amounts unavailable
          </option>
        `;

      return;

    }


    const data =
      settingsSnap.data();


    const amounts =
      Array.isArray(
        data.amounts
      )
        ? data.amounts
        : [];


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


    const uniqueAmounts =
      [
        ...new Set(
          validAmounts
        )
      ];


    uniqueAmounts.sort(
      (a, b) =>
        a - b
    );


    if (
      uniqueAmounts.length === 0
    ) {

      amountSelect.innerHTML =
        `
          <option value="">
            No withdrawal amount configured
          </option>
        `;

      return;

    }


    amountSelect.innerHTML =
      `
        <option value="">
          Select Withdrawal Amount
        </option>
      `;


    uniqueAmounts.forEach(
      amount => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          String(amount);


        option.textContent =
          formatETB(amount);


        amountSelect.appendChild(
          option
        );

      }
    );


    console.log(
      "✅ WITHDRAWAL AMOUNTS:",
      uniqueAmounts
    );


  } catch (error) {

    console.error(
      "LOAD WITHDRAWAL AMOUNTS ERROR:",
      error
    );


    amountSelect.innerHTML =
      `
        <option value="">
          Failed to load amounts
        </option>
      `;

  }

}


loadWithdrawalAmounts();


// =====================================================
// LOAD DEPOSIT + RECHARGE SETTINGS
// =====================================================

async function loadDepositAndRechargeSettings() {

  const accountNameInput =
    document.getElementById(
      "accountName"
    );


  const accountNumberInput =
    document.getElementById(
      "accountNumber"
    );


  const accountSettingsStatus =
    document.getElementById(
      "accountSettingsStatus"
    );


  const rechargeInfo =
    document.getElementById(
      "rechargeInfo"
    );


  const depositAmount =
    document.getElementById(
      "depositAmount"
    );


  if (
    !accountNameInput &&
    !accountNumberInput &&
    !rechargeInfo &&
    !depositAmount
  ) {

    return;

  }


  try {

    // -----------------------------------------------
    // DEPOSIT SETTINGS
    // -----------------------------------------------

    const depositSettingsSnap =
      await getDoc(
        doc(
          db,
          "settings",
          "depositSettings"
        )
      );


    let depositData =
      {};


    if (
      depositSettingsSnap.exists()
    ) {

      depositData =
        depositSettingsSnap.data();

    }


    const accountName =
      String(
        depositData.accountName || ""
      ).trim();


    const accountNumber =
      String(
        depositData.accountNumber || ""
      ).trim();


    if (accountNameInput) {

      accountNameInput.value =
        accountName;

      accountNameInput.placeholder =
        accountName ||
        "Account name not configured";

    }


    if (accountNumberInput) {

      accountNumberInput.value =
        accountNumber;

      accountNumberInput.placeholder =
        accountNumber ||
        "Account number not configured";

    }


    if (accountSettingsStatus) {

      accountSettingsStatus.textContent =
        accountName &&
        accountNumber
          ? "✅ Deposit account information loaded."
          : "⚠️ Deposit account information is incomplete.";

    }


    // -----------------------------------------------
    // FIND RECHARGE AMOUNT
    // -----------------------------------------------

    let rechargeAmount =
      Number(
        depositData.rechargeAmount || 0
      );


    if (
      !Number.isFinite(rechargeAmount) ||
      rechargeAmount <= 0
    ) {

      const snap =
        await getDoc(
          doc(
            db,
            "settings",
            "rechargeSettings"
          )
        );


      if (snap.exists()) {

        const data =
          snap.data();


        rechargeAmount =
          Number(
            data.amount ||
            data.rechargeAmount ||
            data.value ||
            0
          );

      }

    }


    if (
      !Number.isFinite(rechargeAmount) ||
      rechargeAmount <= 0
    ) {

      const snap =
        await getDoc(
          doc(
            db,
            "settings",
            "rechargeAmount"
          )
        );


      if (snap.exists()) {

        const data =
          snap.data();


        rechargeAmount =
          Number(
            data.amount ||
            data.rechargeAmount ||
            data.value ||
            0
          );

      }

    }


    if (
      !Number.isFinite(rechargeAmount) ||
      rechargeAmount <= 0
    ) {

      const snap =
        await getDoc(
          doc(
            db,
            "settings",
            "appSettings"
          )
        );


      if (snap.exists()) {

        const data =
          snap.data();


        rechargeAmount =
          Number(
            data.rechargeAmount ||
            data.recharge ||
            data.amount ||
            0
          );

      }

    }


    if (
      !Number.isFinite(rechargeAmount) ||
      rechargeAmount <= 0
    ) {

      if (rechargeInfo) {

        rechargeInfo.textContent =
          "⚠️ Recharge amount is not configured by Admin.";

      }


      if (depositAmount) {

        depositAmount.innerHTML =
          `
            <option value="">
              Amount not available
            </option>
          `;

      }

      return;

    }


    if (rechargeInfo) {

      rechargeInfo.textContent =
        "Minimum recharge amount: " +
        formatETB(rechargeAmount);

    }


    if (depositAmount) {

      depositAmount.innerHTML =
        "";


      const option =
        document.createElement(
          "option"
        );


      option.value =
        String(rechargeAmount);


      option.textContent =
        formatETB(rechargeAmount);


      depositAmount.appendChild(
        option
      );


      depositAmount.value =
        String(rechargeAmount);

    }


  } catch (error) {

    console.error(
      "DEPOSIT SETTINGS ERROR:",
      error
    );


    if (accountSettingsStatus) {

      accountSettingsStatus.textContent =
        "❌ Unable to load deposit settings.";

    }


    if (rechargeInfo) {

      rechargeInfo.textContent =
        "❌ Unable to load recharge amount.";

    }

  }

}


loadDepositAndRechargeSettings();


// =====================================================
// PROFILE DATA
// =====================================================
//
// profile.html IDs supported:
//
// profileName
// profileEmail
// profileBalance
// profileDeposit
// profileYesterday
// profileToday
// profileIncome
// profileWeek
// profileTasksDone
// profileReferral
//
// =====================================================

async function loadProfileData(user) {

  if (!user) {

    return;

  }


  try {

    console.log(
      "🔄 Loading profile data..."
    );


    // =================================================
    // USER
    // =================================================

    const userSnap =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );


    // =================================================
    // WALLET
    // =================================================

    const walletSnap =
      await getDoc(
        doc(
          db,
          "wallets",
          user.uid
        )
      );


    const userData =
      userSnap.exists()
        ? userSnap.data()
        : {};


    const wallet =
      walletSnap.exists()
        ? walletSnap.data()
        : {};


    // =================================================
    // PROFILE NAME
    // =================================================

    setText(
      "profileName",
      userData.name ||
      "User"
    );


    // =================================================
    // PROFILE EMAIL
    // =================================================

    setText(
      "profileEmail",
      userData.email ||
      user.email ||
      ""
    );


    // =================================================
    // MAIN BALANCE
    // =================================================

    const balance =
      Number(
        wallet.balance || 0
      );


    setText(
      "profileBalance",
      formatETB(balance)
    );


    // =================================================
    // SECURITY DEPOSIT
    // =================================================

    const deposit =
      Number(
        wallet.deposit || 0
      );


    setText(
      "profileDeposit",
      formatETB(deposit)
    );


    // =================================================
    // TOTAL PROFIT / INCOME
    // =================================================

    const income =
      Number(
        wallet.income ||
        wallet.totalIncome ||
        wallet.profit ||
        0
      );


    setText(
      "profileIncome",
      formatETB(income)
    );


    // =================================================
    // YESTERDAY
    // =================================================

    const yesterday =
      Number(
        wallet.yesterdayIncome ||
        wallet.yesterday ||
        userData.yesterdayIncome ||
        0
      );


    setText(
      "profileYesterday",
      formatETB(yesterday)
    );


    // =================================================
    // TODAY
    // =================================================

    const today =
      Number(
        wallet.todayIncome ||
        wallet.today ||
        userData.todayIncome ||
        0
      );


    setText(
      "profileToday",
      formatETB(today)
    );


    // =================================================
    // THIS WEEK
    // =================================================

    const week =
      Number(
        wallet.weekIncome ||
        wallet.thisWeek ||
        userData.weekIncome ||
        0
      );


    setText(
      "profileWeek",
      formatETB(week)
    );


    // =================================================
    // TASKS DONE
    // =================================================

    const tasksDone =
      Number(
        wallet.tasksDone ??
        userData.tasksDone ??
        0
      );


    setText(
      "profileTasksDone",
      tasksDone.toLocaleString()
    );


    // =================================================
    // REFERRAL INCOME
    // =================================================

    const referralIncome =
      Number(
        wallet.referralIncome ||
        wallet.referral ||
        userData.referralIncome ||
        0
      );


    setText(
      "profileReferral",
      formatETB(referralIncome)
    );


    // =================================================
    // HOME BALANCE
    // =================================================

    setText(
      "balance",
      formatETB(balance)
    );


    // =================================================
    // WALLET PAGE BALANCE
    // =================================================

    setText(
      "walletBalance",
      formatETB(balance)
    );


    // =================================================
    // SECURITY DEPOSIT
    // =================================================

    setText(
      "securityDeposit",
      formatETB(deposit)
    );


    // =================================================
    // PROFILE BALANCE
    // =================================================

    setText(
      "profileBalance",
      formatETB(balance)
    );


    // =================================================
    // PROFILE DEPOSIT
    // =================================================

    setText(
      "profileDeposit",
      formatETB(deposit)
    );


    // =================================================
    // PROFILE INCOME
    // =================================================

    setText(
      "profileIncome",
      formatETB(income)
    );


    // =================================================
    // WELCOME USER
    // =================================================

    const welcomeUser =
      document.getElementById(
        "welcomeUser"
      );


    if (welcomeUser) {

      welcomeUser.textContent =
        "Welcome " +
        (
          userData.name ||
          "User"
        );

    }


    console.log(
      "✅ PROFILE DATA LOADED:",
      {
        name:
          userData.name,

        email:
          userData.email,

        balance:
          balance,

        deposit:
          deposit,

        income:
          income,

        yesterday:
          yesterday,

        today:
          today,

        week:
          week,

        tasksDone:
          tasksDone,

        referral:
          referralIncome

      }
    );


  } catch (error) {

    console.error(
      "❌ PROFILE DATA ERROR:",
      error
    );


    setText(
      "profileName",
      "Unable to load"
    );


    setText(
      "profileEmail",
      user.email || ""
    );

  }

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      console.log(
        "ℹ️ No logged-in user."
      );

      return;

    }


    console.log(
      "👤 AUTH USER:",
      user.uid
    );


    // Profile
    await loadProfileData(
      user
    );


    // Referral
    await loadReferralCode(
      user
    );

  }
);


// =====================================================
// LOAD ACTIVE HOME TASKS
// =====================================================

async function loadHomeTasks() {

  const taskBox =
    document.getElementById(
      "homeTasks"
    );


  if (!taskBox) {

    return;

  }


  try {

    taskBox.innerHTML =
      "<p>Loading tasks...</p>";


    const snap =
      await getDocs(
        collection(
          db,
          "tasks"
        )
      );


    taskBox.innerHTML =
      "";


    const activeTasks =
      [];


    snap.forEach(
      item => {

        const task =
          item.data();


        if (
          task.active === true
        ) {

          activeTasks.push(
            {
              id:
                item.id,

              ...task

            }
          );

        }

      }
    );


    if (
      activeTasks.length === 0
    ) {

      taskBox.innerHTML =
        "<p>No tasks available.</p>";

      return;

    }


    activeTasks.forEach(
      task => {

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "feature-card";


        const title =
          document.createElement(
            "h3"
          );


        title.textContent =
          task.title ||
          "Task";


        const description =
          document.createElement(
            "p"
          );


        description.textContent =
          task.description ||
          "";


        const reward =
          document.createElement(
            "p"
          );


        reward.textContent =
          "Reward: " +
          formatETB(
            task.reward || 0
          );


        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.textContent =
          "Complete Task";


        button.addEventListener(
          "click",
          () => {

            window.location.href =
              "tasks.html";

          }
        );


        card.appendChild(
          title
        );

        card.appendChild(
          description
        );

        card.appendChild(
          reward
        );

        card.appendChild(
          button
        );


        taskBox.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "HOME TASK ERROR:",
      error
    );


    taskBox.innerHTML =
      `
        <p style="color:#d32f2f;">
          Unable to load tasks.
        </p>
      `;

  }

}


loadHomeTasks();


// =====================================================
// COPY REFERRAL CODE
// =====================================================

const copyReferralBtn =
  document.getElementById(
    "copyReferralBtn"
  );


if (copyReferralBtn) {

  copyReferralBtn.addEventListener(
    "click",
    async () => {

      const code =
        document.getElementById(
          "myReferralCode"
        )?.textContent.trim() || "";


      if (!code) {

        alert(
          "Referral code is not available."
        );

        return;

      }


      try {

        await navigator.clipboard.writeText(
          code
        );


        copyReferralBtn.textContent =
          "✅ Copied!";


        setTimeout(
          () => {

            copyReferralBtn.textContent =
              "📋 Copy";

          },
          2000
        );


      } catch (error) {

        console.error(
          "COPY REFERRAL ERROR:",
          error
        );


        alert(
          "Unable to copy referral code."
        );

      }

    }
  );

}


// =====================================================
// APP READY
// =====================================================

console.log(
  "✅ CCUS APP.JS loaded successfully."
);
// =====================================================
// PERSONAL INFORMATION
// =====================================================

const saveInfoBtn =
  document.getElementById("saveInfoBtn");

if (saveInfoBtn) {

  // LOAD EXISTING PERSONAL INFORMATION
  onAuthStateChanged(auth, async (user) => {

    if (!user) {

      window.location.href = "login.html";

      return;
    }

    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );

      const userSnap =
        await getDoc(userRef);

      if (userSnap.exists()) {

        const data =
          userSnap.data();

        const infoName =
          document.getElementById("infoName");

        const infoEmail =
          document.getElementById("infoEmail");

        const infoAccount =
          document.getElementById("infoAccount");

        if (infoName) {
          infoName.value =
            data.name || "";
        }

        if (infoEmail) {
          infoEmail.value =
            data.email || user.email || "";
        }

        if (infoAccount) {
          infoAccount.value =
            data.accountNumber || "";
        }

      }

    } catch (error) {

      console.error(
        "LOAD PERSONAL INFORMATION ERROR:",
        error
      );

      alert(
        "Unable to load personal information."
      );

    }

  });


  // SAVE PERSONAL INFORMATION
  saveInfoBtn.onclick =
    async () => {

      const user =
        auth.currentUser;

      if (!user) {

        alert(
          "Please login first."
        );

        window.location.href =
          "login.html";

        return;
      }


      const name =
        document
          .getElementById("infoName")
          ?.value
          .trim() || "";


      const email =
        document
          .getElementById("infoEmail")
          ?.value
          .trim() || "";


      const accountNumber =
        document
          .getElementById("infoAccount")
          ?.value
          .trim() || "";


      // VALIDATION

      if (!name) {

        alert(
          "Please enter your name."
        );

        return;
      }


      if (!email) {

        alert(
          "Please enter your email."
        );

        return;
      }


      if (!accountNumber) {

        alert(
          "Please enter your account number."
        );

        return;
      }


      try {

        saveInfoBtn.disabled =
          true;

        saveInfoBtn.textContent =
          "Saving...";


        // FIRESTORE
        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            name:
              name,

            email:
              email,

            accountNumber:
              accountNumber,

            updatedAt:
              serverTimestamp()

          },
          {
            merge: true
          }
        );


        alert(
          "✅ Personal information saved successfully."
        );


      } catch (error) {

        console.error(
          "SAVE PERSONAL INFORMATION ERROR:",
          error
        );

        alert(
          "❌ Save failed: " +
          error.message
        );


      } finally {

        saveInfoBtn.disabled =
          false;

        saveInfoBtn.textContent =
          "Save Information";

      }

    };

}
// =====================================================
// INVITE FRIENDS
// =====================================================

async function loadInviteFriends() {

  const inviteLink =
    document.getElementById("inviteLink");

  const copyLinkBtn =
    document.getElementById("copyLinkBtn");

  const shareLinkBtn =
    document.getElementById("shareLinkBtn");

  const referralCodeBox =
    document.getElementById("inviteReferralCode");

  const referralCountBox =
    document.getElementById("myReferralCount");

  const referralIncomeBox =
    document.getElementById("myReferralIncome");


  // -----------------------------------------------
  // PAGE CHECK
  // -----------------------------------------------

  if (
    !inviteLink &&
    !copyLinkBtn &&
    !shareLinkBtn &&
    !referralCodeBox &&
    !referralCountBox
  ) {

    return;

  }


  // -----------------------------------------------
  // CHECK LOGIN
  // -----------------------------------------------

  const user =
    auth.currentUser;


  if (!user) {

    if (inviteLink) {

      inviteLink.value =
        "Please login first.";

    }

    return;

  }


  try {

    // ---------------------------------------------
    // GET USER DOCUMENT
    // ---------------------------------------------

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnap =
      await getDoc(
        userRef
      );


    if (!userSnap.exists()) {

      console.error(
        "User document not found."
      );

      return;

    }


    const userData =
      userSnap.data();


    // ---------------------------------------------
    // GET REFERRAL CODE
    // ---------------------------------------------

    let referralCode =
      String(
        userData.referralCode || ""
      ).trim();


    // ---------------------------------------------
    // CREATE REFERRAL CODE IF MISSING
    // ---------------------------------------------

    if (!referralCode) {

      referralCode =
        "CCUS" +
        Math.floor(
          100000 +
          Math.random() * 900000
        );


      await setDoc(
        userRef,
        {
          referralCode:
            referralCode
        },
        {
          merge: true
        }
      );

    }


    // ---------------------------------------------
    // SHOW REFERRAL CODE
    // ---------------------------------------------

    if (referralCodeBox) {

      referralCodeBox.textContent =
        referralCode;

    }


    // ---------------------------------------------
    // CREATE INVITE LINK
    // ---------------------------------------------

    const currentUrl =
      window.location.href
        .split("?")[0]
        .split("#")[0];


    const inviteUrl =
      currentUrl +
      "?ref=" +
      encodeURIComponent(
        referralCode
      );


    if (inviteLink) {

      inviteLink.value =
        inviteUrl;

    }


    // ---------------------------------------------
    // COUNT REFERRALS
    // ---------------------------------------------

    const usersSnap =
      await getDocs(
        collection(
          db,
          "users"
        )
      );


    let referralCount =
      0;


    usersSnap.forEach(
      (userDoc) => {

        const data =
          userDoc.data();


        const usedCode =
          String(
            data.referralCodeUsed || ""
          ).trim();


        if (
          usedCode ===
          referralCode
        ) {

          referralCount++;

        }

      }
    );


    // ---------------------------------------------
    // SHOW REFERRAL COUNT
    // ---------------------------------------------

    if (referralCountBox) {

      referralCountBox.textContent =
        referralCount;

    }


    // ---------------------------------------------
    // REFERRAL INCOME
    // ---------------------------------------------

    const referralIncome =
      Number(
        userData.referralIncome || 0
      );


    if (referralIncomeBox) {

      referralIncomeBox.textContent =
        "ETB " +
        referralIncome.toLocaleString();

    }


    // ---------------------------------------------
    // COPY LINK
    // ---------------------------------------------

    if (copyLinkBtn) {

      copyLinkBtn.onclick =
        async () => {

          try {

            await navigator.clipboard.writeText(
              inviteUrl
            );


            copyLinkBtn.textContent =
              "✅ Link Copied!";


            setTimeout(
              () => {

                copyLinkBtn.textContent =
                  "📋 Copy Link";

              },
              2000
            );


          } catch (error) {

            console.error(
              "COPY LINK ERROR:",
              error
            );


            // Fallback

            if (inviteLink) {

              inviteLink.select();

              document.execCommand(
                "copy"
              );

              copyLinkBtn.textContent =
                "✅ Link Copied!";

            }

          }

        };

    }


    // ---------------------------------------------
    // SHARE LINK
    // ---------------------------------------------

    if (shareLinkBtn) {

      shareLinkBtn.onclick =
        async () => {

          try {

            if (
              navigator.share
            ) {

              await navigator.share({

                title:
                  "Join CCUS",

                text:
                  "Join CCUS using my referral link.",

                url:
                  inviteUrl

              });

            } else {

              await navigator.clipboard.writeText(
                inviteUrl
              );


              alert(
                "Invite link copied. You can now share it."
              );

            }

          } catch (error) {

            console.log(
              "Share cancelled or unavailable."
            );

          }

        };

    }


    console.log(
      "✅ INVITE SYSTEM LOADED:",
      {
        referralCode,
        inviteUrl,
        referralCount
      }
    );


  } catch (error) {

    console.error(
      "INVITE ERROR:",
      error
    );


    if (inviteLink) {

      inviteLink.value =
        "Unable to load invite link.";

    }

    if (referralCodeBox) {

      referralCodeBox.textContent =
        "Unable to load";

    }

  }

}


// =====================================================
// START INVITE SYSTEM
// =====================================================

onAuthStateChanged(
  auth,
  (user) => {

    if (user) {

      loadInviteFriends();

    }

  }
);
// =====================================================
// TRANSACTION BILLS
// =====================================================

async function loadTransactions() {

  const transactionList =
    document.getElementById("transactionList");

  if (!transactionList) {
    return;
  }

  const user =
    auth.currentUser;

  if (!user) {

    transactionList.innerHTML = `
      <p>Please login first.</p>
    `;

    return;
  }

  try {

    transactionList.innerHTML = `
      <p>Loading transactions...</p>
    `;


    // =================================================
    // DEPOSITS
    // =================================================

    const depositQuery =
      query(
        collection(db, "deposits"),
        where("userId", "==", user.uid)
      );


    const depositSnap =
      await getDocs(depositQuery);


    const transactions = [];


    depositSnap.forEach(
      (item) => {

        const data =
          item.data();

        transactions.push({

          id:
            item.id,

          type:
            "Deposit",

          amount:
            Number(data.amount || 0),

          method:
            data.paymentMethod ||
            data.method ||
            "Unknown",

          status:
            data.status ||
            "pending",

          reference:
            data.transactionRef ||
            "-",

          createdAt:
            data.createdAt || null

        });

      }
    );


    // =================================================
    // WITHDRAWALS
    // =================================================

    const withdrawalQuery =
      query(
        collection(db, "withdrawals"),
        where("userId", "==", user.uid)
      );


    const withdrawalSnap =
      await getDocs(
        withdrawalQuery
      );


    withdrawalSnap.forEach(
      (item) => {

        const data =
          item.data();

        transactions.push({

          id:
            item.id,

          type:
            "Withdrawal",

          amount:
            Number(data.amount || 0),

          method:
            data.method ||
            "Unknown",

          status:
            data.status ||
            "pending",

          reference:
            data.transactionRef ||
            "-",

          createdAt:
            data.createdAt || null

        });

      }
    );


    // =================================================
    // SORT NEWEST FIRST
    // =================================================

    transactions.sort(
      (a, b) => {

        const dateA =
          a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : 0;

        const dateB =
          b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : 0;

        return dateB - dateA;

      }
    );


    // =================================================
    // NO TRANSACTIONS
    // =================================================

    if (
      transactions.length === 0
    ) {

      transactionList.innerHTML = `
        <div class="profile-card">

          <h3>🧾 No Transactions</h3>

          <p>
            You don't have any deposit or withdrawal
            transactions yet.
          </p>

        </div>
      `;

      return;
    }


    // =================================================
    // DISPLAY
    // =================================================

    transactionList.innerHTML = "";


    transactions.forEach(
      (transaction) => {

        const card =
          document.createElement("div");


        card.className =
          "profile-card";


        const status =
          String(
            transaction.status
          ).toLowerCase();


        let statusIcon =
          "⏳";


        if (
          status === "approved" ||
          status === "completed"
        ) {

          statusIcon =
            "✅";

        }


        if (
          status === "rejected" ||
          status === "cancelled"
        ) {

          statusIcon =
            "❌";

        }


        const date =
          transaction.createdAt?.toDate
            ? transaction.createdAt
                .toDate()
                .toLocaleString()
            : "Date unavailable";


        const amount =
          "ETB " +
          transaction.amount.toLocaleString();


        const amountSign =
          transaction.type ===
          "Deposit"
            ? "+"
            : "-";


        card.innerHTML = `

          <h3>
            ${
              transaction.type === "Deposit"
                ? "💰"
                : "💸"
            }

            ${transaction.type}

          </h3>

          <p>
            <b>
              Amount:
            </b>

            ${amountSign}
            ${amount}
          </p>

          <p>
            <b>
              Method:
            </b>

            ${transaction.method}
          </p>

          <p>
            <b>
              Status:
            </b>

            ${statusIcon}
            ${transaction.status}
          </p>

          <p>
            <b>
              Reference:
            </b>

            ${transaction.reference}
          </p>

          <p>
            <b>
              Date:
            </b>

            ${date}
          </p>

        `;


        transactionList.appendChild(
          card
        );

      }
    );


    console.log(
      "✅ TRANSACTIONS LOADED:",
      transactions.length
    );


  } catch (error) {

    console.error(
      "TRANSACTION ERROR:",
      error
    );


    transactionList.innerHTML = `

      <div class="profile-card">

        <h3>❌ Error</h3>

        <p>
          Unable to load transactions.
        </p>

      </div>

    `;

  }

}


// =====================================================
// START TRANSACTIONS
// =====================================================

onAuthStateChanged(
  auth,
  (user) => {

    if (user) {

      loadTransactions();

    }

  }
);

// =====================================================
// CCUS INVESTMENT SYSTEM
// Profit is paid ONCE when investment duration ends
// =====================================================


// =====================================================
// LOAD INVESTMENT PLANS
// =====================================================

async function loadInvestmentPlans() {

  const plansBox =
    document.getElementById("investmentPlans");

  if (!plansBox) return;

  try {

    plansBox.innerHTML = `
      <div class="profile-card">
        <p>Loading investment plans...</p>
      </div>
    `;

    const snapshot = await getDocs(
      collection(db, "investmentPlans")
    );

    plansBox.innerHTML = "";

    let activePlans = 0;

    snapshot.forEach((item) => {

      const plan = item.data();

      if (plan.active !== true) return;

      activePlans++;

      const amount =
        Number(plan.amount || 0);

      const dailyProfit =
        Number(plan.dailyProfit || 0);

      const duration =
        Number(plan.duration || 0);

      const totalProfit =
        dailyProfit * duration;

      const totalReturn =
        amount + totalProfit;

      const card =
        document.createElement("div");

      card.className = "profile-card";

      card.innerHTML = `

        <h3>
          📈 ${plan.name || "Investment Plan"}
        </h3>

        <p>
          Investment Amount:
          <b>
            ETB ${amount.toLocaleString()}
          </b>
        </p>

        <p>
          Daily Profit:
          <b>
            ETB ${dailyProfit.toLocaleString()}
          </b>
        </p>

        <p>
          Duration:
          <b>
            ${duration} Days
          </b>
        </p>

        <p>
          Total Profit:
          <b>
            ETB ${totalProfit.toLocaleString()}
          </b>
        </p>

        <p>
          Total Return:
          <b>
            ETB ${totalReturn.toLocaleString()}
          </b>
        </p>

        <button
          type="button"
          class="investBtn"
          data-id="${item.id}">
          🚀 Invest Now
        </button>

      `;

      plansBox.appendChild(card);

    });


    if (activePlans === 0) {

      plansBox.innerHTML = `
        <div class="profile-card">
          <p>No investment plans available.</p>
        </div>
      `;

      return;
    }


    document
      .querySelectorAll(".investBtn")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            startInvestment(
              button.dataset.id
            );

          }
        );

      });


  } catch (error) {

    console.error(
      "INVESTMENT PLANS ERROR:",
      error
    );

    plansBox.innerHTML = `
      <div class="profile-card">

        <p style="color:red;">
          Unable to load investment plans.
        </p>

      </div>
    `;
  }
}



// =====================================================
// START INVESTMENT
// =====================================================

async function startInvestment(planId) {

  const user = auth.currentUser;

  if (!user) {

    alert("Please login first.");

    window.location.href =
      "login.html";

    return;
  }


  try {

    // =================================================
    // GET INVESTMENT PLAN
    // =================================================

    const planRef =
      doc(
        db,
        "investmentPlans",
        planId
      );

    const planSnap =
      await getDoc(planRef);


    if (!planSnap.exists()) {

      alert(
        "Investment plan not found."
      );

      return;
    }


    const plan =
      planSnap.data();


    if (plan.active !== true) {

      alert(
        "This investment plan is not active."
      );

      return;
    }


    // =================================================
    // PLAN VALUES
    // =================================================

    const amount =
      Number(plan.amount || 0);

    const dailyProfit =
      Number(plan.dailyProfit || 0);

    const duration =
      Number(plan.duration || 0);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      alert(
        "Invalid investment amount."
      );

      return;
    }


    if (
      !Number.isFinite(dailyProfit) ||
      dailyProfit < 0
    ) {

      alert(
        "Invalid daily profit."
      );

      return;
    }


    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {

      alert(
        "Invalid investment duration."
      );

      return;
    }


    // =================================================
    // CALCULATE PROFIT
    // =================================================

    const totalProfit =
      dailyProfit * duration;

    const totalReturn =
      amount + totalProfit;


    // =================================================
    // CONFIRM INVESTMENT
    // =================================================

    const confirmed =
      confirm(

        "Investment Plan\n\n" +

        "Amount: ETB " +
        amount.toLocaleString() +

        "\nDuration: " +
        duration +
        " Days" +

        "\nDaily Profit: ETB " +
        dailyProfit.toLocaleString() +

        "\nTotal Profit: ETB " +
        totalProfit.toLocaleString() +

        "\nTotal Return: ETB " +
        totalReturn.toLocaleString() +

        "\n\nDo you want to invest?"

      );


    if (!confirmed) {
      return;
    }


    // =================================================
    // WALLET
    // =================================================

    const walletRef =
      doc(
        db,
        "wallets",
        user.uid
      );


    // =================================================
    // INVESTMENT AUTO ID
    // =================================================

    const investmentRef =
      doc(
        collection(
          db,
          "investments"
        )
      );


    // =================================================
    // DATES
    // =================================================

    // JavaScript Date
    // Firestore automatically stores these as Timestamp

    const startDate =
      new Date();


    const endDate =
      new Date(
        startDate.getTime() +
        (
          duration *
          24 *
          60 *
          60 *
          1000
        )
      );


    // =================================================
    // FIRESTORE TRANSACTION
    // =================================================

    await runTransaction(
      db,
      async (transaction) => {

        // ---------------------------------------------
        // GET WALLET
        // ---------------------------------------------

        const walletSnap =
          await transaction.get(
            walletRef
          );


        if (!walletSnap.exists()) {

          throw new Error(
            "Wallet not found."
          );

        }


        const wallet =
          walletSnap.data();


        const balance =
          Number(
            wallet.balance || 0
          );


        // ---------------------------------------------
        // CHECK BALANCE
        // ---------------------------------------------

        if (
          !Number.isFinite(balance)
        ) {

          throw new Error(
            "Invalid wallet balance."
          );

        }


        if (
          balance < amount
        ) {

          throw new Error(

            "Insufficient balance.\n\n" +

            "Required: ETB " +
            amount.toLocaleString() +

            "\nCurrent Balance: ETB " +
            balance.toLocaleString()

          );

        }


        // ---------------------------------------------
        // CREATE INVESTMENT
        // ---------------------------------------------

        transaction.set(
          investmentRef,
          {

            userId:
              user.uid,

            planId:
              planId,

            planName:
              plan.name ||
              "Investment Plan",

            amount:
              amount,

            dailyProfit:
              dailyProfit,

            duration:
              duration,

            totalProfit:
              totalProfit,

            totalReturn:
              totalReturn,

            // IMPORTANT
            // These become Firestore Timestamp

            startDate:
              startDate,

            endDate:
              endDate,

            status:
              "active",

            completed:
              false,

            // Server timestamp
            createdAt:
              serverTimestamp()

          }
        );


        // ---------------------------------------------
        // REMOVE MONEY FROM WALLET
        // ---------------------------------------------

        transaction.update(
          walletRef,
          {

            balance:
              balance - amount

          }
        );

      }
    );


    // =================================================
    // SUCCESS
    // =================================================

    alert(

      "✅ Investment started successfully!\n\n" +

      "Investment: ETB " +
      amount.toLocaleString() +

      "\nDuration: " +
      duration +
      " Days" +

      "\nTotal Profit: ETB " +
      totalProfit.toLocaleString() +

      "\nTotal Return: ETB " +
      totalReturn.toLocaleString() +

      "\n\nYour profit will be paid when the investment ends."

    );


    await loadMyInvestments();

    await loadProfileData(user);


  } catch (error) {

    console.error(
      "START INVESTMENT ERROR:",
      error
    );

    alert(
      "Investment failed:\n\n" +
      error.message
    );

  }
}



// =====================================================
// COMPLETE EXPIRED INVESTMENTS
// =====================================================
// Investment is completed ONLY after endDate.
// Amount + profit is returned to wallet ONCE.
// =====================================================

async function completeExpiredInvestments() {

  const user =
    auth.currentUser;

  if (!user) return;


  try {

    // =================================================
    // GET ACTIVE INVESTMENTS
    // =================================================

    const investmentQuery =
      query(
        collection(
          db,
          "investments"
        ),

        where(
          "userId",
          "==",
          user.uid
        ),

        where(
          "status",
          "==",
          "active"
        )
      );


    const snapshot =
      await getDocs(
        investmentQuery
      );


    if (snapshot.empty) {
      return;
    }


    const now =
      new Date();


    // =================================================
    // CHECK EACH INVESTMENT
    // =================================================

    for (
      const item of snapshot.docs
    ) {

      const investment =
        item.data();


      // -----------------------------------------------
      // CHECK COMPLETED
      // -----------------------------------------------

      if (
        investment.completed === true
      ) {

        continue;

      }


      // -----------------------------------------------
      // GET END DATE
      // -----------------------------------------------

      let endDate = null;


      if (
        investment.endDate &&
        typeof investment.endDate.toDate ===
          "function"
      ) {

        endDate =
          investment.endDate.toDate();

      }

      else if (
        investment.endDate instanceof Date
      ) {

        endDate =
          investment.endDate;

      }

      else if (
        investment.endDate
      ) {

        endDate =
          new Date(
            investment.endDate
          );

      }


      if (!endDate) {
        continue;
      }


      // -----------------------------------------------
      // NOT EXPIRED
      // -----------------------------------------------

      if (
        now < endDate
      ) {

        continue;

      }


      // =================================================
      // REFERENCES
      // =================================================

      const investmentRef =
        doc(
          db,
          "investments",
          item.id
        );


      const walletRef =
        doc(
          db,
          "wallets",
          user.uid
        );


      // =================================================
      // TRANSACTION
      // =================================================

      await runTransaction(
        db,
        async (transaction) => {

          // -------------------------------------------
          // READ INVESTMENT
          // -------------------------------------------

          const freshInvestmentSnap =
            await transaction.get(
              investmentRef
            );


          // -------------------------------------------
          // READ WALLET
          // -------------------------------------------

          const freshWalletSnap =
            await transaction.get(
              walletRef
            );


          if (
            !freshInvestmentSnap.exists()
          ) {

            return;

          }


          if (
            !freshWalletSnap.exists()
          ) {

            throw new Error(
              "Wallet not found."
            );

          }


          const freshInvestment =
            freshInvestmentSnap.data();


          // -------------------------------------------
          // PREVENT DOUBLE PAYMENT
          // -------------------------------------------

          if (
            freshInvestment.completed === true ||
            freshInvestment.status !== "active"
          ) {

            return;

          }


          // -------------------------------------------
          // VALUES
          // -------------------------------------------

          const investmentAmount =
            Number(
              freshInvestment.amount || 0
            );


          const profit =
            Number(
              freshInvestment.totalProfit || 0
            );


          const totalReturn =
            Number(
              freshInvestment.totalReturn ||
              (
                investmentAmount +
                profit
              )
            );


          if (
            !Number.isFinite(totalReturn) ||
            totalReturn <= 0
          ) {

            throw new Error(
              "Invalid investment return."
            );

          }


          const wallet =
            freshWalletSnap.data();


          const currentBalance =
            Number(
              wallet.balance || 0
            );


          // -------------------------------------------
          // RETURN MONEY + PROFIT
          // -------------------------------------------

          transaction.update(
            walletRef,
            {

              balance:
                currentBalance +
                totalReturn,

              income:
                Number(
                  wallet.income || 0
                ) +
                profit

            }
          );


          // -------------------------------------------
          // COMPLETE INVESTMENT
          // -------------------------------------------

          transaction.update(
            investmentRef,
            {

              status:
                "completed",

              completed:
                true,

              completedAt:
                serverTimestamp(),

              paidAmount:
                totalReturn

            }
          );

        }
      );

    }


  } catch (error) {

    console.error(
      "COMPLETE INVESTMENT ERROR:",
      error
    );

  }

}



// =====================================================
// LOAD MY INVESTMENTS
// =====================================================

async function loadMyInvestments() {

  const investmentsBox =
    document.getElementById(
      "myInvestments"
    );


  if (!investmentsBox) {
    return;
  }


  const user =
    auth.currentUser;


  if (!user) {

    investmentsBox.innerHTML = `
      <div class="profile-card">
        <p>Please login first.</p>
      </div>
    `;

    return;
  }


  try {

    investmentsBox.innerHTML = `
      <div class="profile-card">
        <p>Loading your investments...</p>
      </div>
    `;


    const investmentQuery =
      query(
        collection(
          db,
          "investments"
        ),

        where(
          "userId",
          "==",
          user.uid
        )
      );


    const snapshot =
      await getDocs(
        investmentQuery
      );


    investmentsBox.innerHTML =
      "";


    if (snapshot.empty) {

      investmentsBox.innerHTML = `
        <div class="profile-card">
          <p>
            You have no investments yet.
          </p>
        </div>
      `;

      return;
    }


    snapshot.forEach(
      (item) => {

        const investment =
          item.data();


        // ---------------------------------------------
        // VALUES
        // ---------------------------------------------

        const amount =
          Number(
            investment.amount || 0
          );


        const dailyProfit =
          Number(
            investment.dailyProfit || 0
          );


        const duration =
          Number(
            investment.duration || 0
          );


        const totalProfit =
          Number(
            investment.totalProfit ??
            (
              dailyProfit *
              duration
            )
          );


        const totalReturn =
          Number(
            investment.totalReturn ??
            (
              amount +
              totalProfit
            )
          );


        // ---------------------------------------------
        // START DATE
        // ---------------------------------------------

        let startDate =
          "Not available";


        if (
          investment.startDate &&
          typeof investment.startDate.toDate ===
            "function"
        ) {

          startDate =
            investment.startDate
              .toDate()
              .toLocaleString();

        }


        // ---------------------------------------------
        // END DATE
        // ---------------------------------------------

        let endDate =
          "Not available";


        if (
          investment.endDate &&
          typeof investment.endDate.toDate ===
            "function"
        ) {

          endDate =
            investment.endDate
              .toDate()
              .toLocaleString();

        }


        // ---------------------------------------------
        // CREATED DATE
        // ---------------------------------------------

        let createdDate =
          "Not available";


        if (
          investment.createdAt &&
          typeof investment.createdAt.toDate ===
            "function"
        ) {

          createdDate =
            investment.createdAt
              .toDate()
              .toLocaleString();

        }


        // ---------------------------------------------
        // STATUS
        // ---------------------------------------------

        const status =
          investment.completed === true
            ? "✅ Completed"
            : "⏳ Active";


        // ---------------------------------------------
        // CARD
        // ---------------------------------------------

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "profile-card";


        card.innerHTML = `

          <h3>
            📊 ${
              investment.planName ||
              "Investment"
            }
          </h3>

          <p>
            Investment:
            <b>
              ETB ${amount.toLocaleString()}
            </b>
          </p>

          <p>
            Daily Profit:
            <b>
              ETB ${dailyProfit.toLocaleString()}
            </b>
          </p>

          <p>
            Duration:
            <b>
              ${duration} Days
            </b>
          </p>

          <p>
            Total Profit:
            <b>
              ETB ${totalProfit.toLocaleString()}
            </b>
          </p>

          <p>
            Total Return:
            <b>
              ETB ${totalReturn.toLocaleString()}
            </b>
          </p>

          <p>
            Start Date:
            <b>
              ${startDate}
            </b>
          </p>

          <p>
            End Date:
            <b>
              ${endDate}
            </b>
          </p>

          <p>
            Created:
            <b>
              ${createdDate}
            </b>
          </p>

          <p>
            Status:
            <b>
              ${status}
            </b>
          </p>

        `;


        investmentsBox.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "MY INVESTMENTS ERROR:",
      error
    );


    investmentsBox.innerHTML = `
      <div class="profile-card">

        <p style="color:red;">
          Unable to load investments.
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
  async (user) => {

    if (!user) {
      return;
    }


    console.log(
      "Logged in user:",
      user.uid
    );


    // -----------------------------------------------
    // FIRST: COMPLETE EXPIRED INVESTMENTS
    // -----------------------------------------------

    await completeExpiredInvestments();


    // -----------------------------------------------
    // LOAD PLANS
    // -----------------------------------------------

    await loadInvestmentPlans();


    // -----------------------------------------------
    // LOAD USER INVESTMENTS
    // -----------------------------------------------

    await loadMyInvestments();


    // -----------------------------------------------
    // LOAD PROFILE
    // -----------------------------------------------

    if (
      typeof loadProfileData ===
      "function"
    ) {

      await loadProfileData(user);

    }

  }
);


console.log(
  "✅ CCUS INVESTMENT SYSTEM READY"
);