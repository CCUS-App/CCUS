import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


// =====================================================
// GLOBAL
// =====================================================

const taskList =
  document.getElementById("taskList");

let currentUser = null;

window.taskWatchStatus = {};


// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace(
        "login.html"
      );

      return;
    }

    currentUser = user;

    await loadTasks();

  }
);


// =====================================================
// LOAD ACTIVE TASKS
// =====================================================

async function loadTasks() {

  if (!taskList) return;

  try {

    const snap =
      await getDocs(
        collection(
          db,
          "tasks"
        )
      );

    taskList.innerHTML = "";

    let foundTask = false;


    snap.forEach(
      (item) => {

        const task =
          item.data();


        // =============================================
        // ONLY ACTIVE TASKS
        // =============================================

        if (
          task.active !== true
        ) {

          return;

        }


        foundTask = true;


        const watchSeconds =
          Number(
            task.requiredWatchSeconds || 5
          );


        const reward =
          Number(
            task.reward || 0
          );


        // =============================================
        // TASK CARD
        // =============================================

        const card =
          document.createElement(
            "div"
          );

        card.className =
          "profile-card";

        card.id =
          `task-card-${item.id}`;

        card.style.cssText = `
          padding:12px;
          margin-bottom:12px;
          border-radius:12px;
        `;


        // =============================================
        // VIDEO
        // =============================================

        if (task.videoUrl) {

          const video =
            document.createElement(
              "video"
            );

          video.id =
            `video-${item.id}`;

          video.controls =
            true;

          video.playsInline =
            true;

          video.preload =
            "metadata";

          video.src =
            task.videoUrl;

          video.style.cssText = `
            display:block;
            width:100%;
            max-width:420px;
            aspect-ratio:4/3;
            object-fit:cover;
            margin:0 auto;
            border-radius:10px;
            background:#000;
          `;

          card.appendChild(
            video
          );


          // =========================================
          // WATCHED TEXT
          // =========================================

          const watchText =
            document.createElement(
              "p"
            );

          watchText.id =
            `timer-${item.id}`;

          watchText.textContent =
            "Watched 0 seconds";

          watchText.style.cssText = `
            margin:8px 0 0 0;
            font-size:13px;
            font-weight:bold;
          `;

          card.appendChild(
            watchText
          );


          // =========================================
          // CLAIM REWARD BUTTON
          // =========================================

          const claimButton =
            document.createElement(
              "button"
            );

          claimButton.id =
            `claim-${item.id}`;

          claimButton.type =
            "button";

          claimButton.disabled =
            true;

          claimButton.textContent =
            `🎁 Claim Reward ${reward.toLocaleString()}`;

          claimButton.style.cssText = `
            display:none;
            width:100%;
            margin-top:7px;
            padding:10px;
            border:none;
            border-radius:9px;
            background:#2e7d32;
            color:#fff;
            font-weight:bold;
            cursor:pointer;
          `;

          claimButton.addEventListener(
            "click",
            () =>
              claimTask(
                item.id
              )
          );

          card.appendChild(
            claimButton
          );


          // =========================================
          // SETUP VIDEO TRACKING
          // =========================================

          setTimeout(
            () => {

              setupVideoTracking(
                item.id,
                watchSeconds,
                reward
              );

            },
            0
          );


        } else {

          // =========================================
          // NO VIDEO
          // =========================================

          const noVideo =
            document.createElement(
              "p"
            );

          noVideo.textContent =
            "Video will be available soon.";

          noVideo.style.cssText = `
            font-size:13px;
            color:#777;
          `;

          card.appendChild(
            noVideo
          );

        }


        taskList.appendChild(
          card
        );

      }
    );


    // =============================================
    // NO TASK
    // =============================================

    if (!foundTask) {

      taskList.innerHTML =
        "<p>No active tasks available.</p>";

    }


  } catch (error) {

    console.error(
      "LOAD TASKS ERROR:",
      error
    );

    taskList.innerHTML =
      "<p>Failed to load tasks.</p>";

  }

}


// =====================================================
// VIDEO TRACKING
// =====================================================

function setupVideoTracking(
  taskId,
  requiredSeconds,
  reward
) {

  const video =
    document.getElementById(
      `video-${taskId}`
    );

  const timer =
    document.getElementById(
      `timer-${taskId}`
    );

  const claimButton =
    document.getElementById(
      `claim-${taskId}`
    );

  if (!video) return;


  let maxWatched =
    0;

  let lastAllowedTime =
    0;


  // ===================================================
  // TIME UPDATE
  // ===================================================

  video.addEventListener(
    "timeupdate",
    () => {

      const currentTime =
        Math.floor(
          video.currentTime
        );


      // ===============================================
      // PREVENT COUNTER FROM GOING BACK
      // ===============================================

      if (
        currentTime >
        maxWatched
      ) {

        maxWatched =
          currentTime;

      }


      // ===============================================
      // MAXIMUM REQUIRED TIME
      // ===============================================

      if (
        maxWatched >
        requiredSeconds
      ) {

        maxWatched =
          requiredSeconds;

      }


      window.taskWatchStatus[
        taskId
      ] =
        maxWatched;


      // ===============================================
      // UPDATE WATCHED TEXT
      // ===============================================

      if (timer) {

        timer.textContent =
          `Watched ${maxWatched} seconds`;

      }


      // ===============================================
      // SAVE ALLOWED POSITION
      // ===============================================

      if (
        video.currentTime <=
        lastAllowedTime + 1
      ) {

        lastAllowedTime =
          video.currentTime;

      }


      // ===============================================
      // 5 SECONDS COMPLETED
      // ===============================================

      if (
        maxWatched >=
        requiredSeconds
      ) {

        if (timer) {

          timer.textContent =
            `Watched ${requiredSeconds} seconds`;

          timer.style.color =
            "#2e7d32";

        }


        if (claimButton) {

          claimButton.disabled =
            false;

          claimButton.style.display =
            "block";

          claimButton.textContent =
            `🎁 Claim Reward ${reward.toLocaleString()}`;

          claimButton.style.background =
            "#2e7d32";

          claimButton.style.color =
            "#fff";

        }

      }

    }
  );


  // ===================================================
  // PREVENT EARLY SKIPPING
  // ===================================================

  video.addEventListener(
    "seeking",
    () => {

      if (
        video.currentTime >
        lastAllowedTime + 1
      ) {

        video.currentTime =
          lastAllowedTime;

      }

    }
  );

}


// =====================================================
// CLAIM REWARD
// =====================================================

window.claimTask =
  async function (taskId) {

    if (!currentUser) {

      alert(
        "Please login first."
      );

      return;
    }


    try {

      // ===============================================
      // GET TASK
      // ===============================================

      const taskRef =
        doc(
          db,
          "tasks",
          taskId
        );

      const taskSnap =
        await getDoc(
          taskRef
        );


      if (!taskSnap.exists()) {

        alert(
          "Task not found."
        );

        return;

      }


      const task =
        taskSnap.data();


      // ===============================================
      // ACTIVE CHECK
      // ===============================================

      if (
        task.active !== true
      ) {

        alert(
          "This task is not active."
        );

        return;

      }


      // ===============================================
      // REWARD
      // ===============================================

      const reward =
        Number(
          task.reward || 0
        );


      if (
        reward <= 0
      ) {

        alert(
          "Invalid task reward."
        );

        return;

      }


      // ===============================================
      // DUPLICATE CHECK
      // ===============================================

      const completionId =
        `${currentUser.uid}_${taskId}`;


      const completionRef =
        doc(
          db,
          "taskCompletions",
          completionId
        );


      const completionSnap =
        await getDoc(
          completionRef
        );


      if (
        completionSnap.exists()
      ) {

        alert(
          "You have already completed this task."
        );

        return;

      }


      // ===============================================
      // VIDEO CHECK
      // ===============================================

      if (!task.videoUrl) {

        alert(
          "Video is not available yet."
        );

        return;

      }


      // ===============================================
      // WATCH CHECK
      // ===============================================

      const requiredSeconds =
        Number(
          task.requiredWatchSeconds || 5
        );


      const watched =
        Number(
          window.taskWatchStatus?.[
            taskId
          ] || 0
        );


      if (
        watched <
        requiredSeconds
      ) {

        alert(
          `Please watch ${requiredSeconds} seconds first.`
        );

        return;

      }


      // ===============================================
      // WALLET
      // ===============================================

      const walletRef =
        doc(
          db,
          "wallets",
          currentUser.uid
        );


      const walletSnap =
        await getDoc(
          walletRef
        );


      // ===============================================
      // ADD REWARD
      // ===============================================

      if (
        !walletSnap.exists()
      ) {

        await setDoc(
          walletRef,
          {

            balance:
              reward,

            deposit:
              0,

            income:
              reward

          }
        );

      } else {

        await updateDoc(
          walletRef,
          {

            balance:
              increment(
                reward
              ),

            income:
              increment(
                reward
              )

          }
        );

      }


      // ===============================================
      // SAVE COMPLETION
      // ===============================================

      await setDoc(
        completionRef,
        {

          userId:
            currentUser.uid,

          taskId:
            taskId,

          reward:
            reward,

          completedAt:
            serverTimestamp()

        }
      );


      // ===============================================
      // UPDATE BUTTON
      // ===============================================

      const button =
        document.getElementById(
          `claim-${taskId}`
        );


      if (button) {

        button.disabled =
          true;

        button.style.display =
          "block";

        button.textContent =
          "✓ Completed";

        button.style.background =
          "#777";

      }


      // ===============================================
      // SUCCESS
      // ===============================================

      alert(
        `Task completed successfully! ETB ${reward.toLocaleString()} added to your Main Balance.`
      );


    } catch (error) {

      console.error(
        "CLAIM TASK ERROR:",
        error
      );

      alert(
        "Failed to claim reward: " +
        error.message
      );

    }

  };