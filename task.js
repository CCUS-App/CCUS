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

const taskList = document.getElementById("taskList");

let currentUser = null;

window.taskWatchStatus = {};


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
// AUTH
// =====================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  currentUser = user;

  await loadTasks();

});


// =====================================================
// LOAD TASKS
// =====================================================

async function loadTasks() {

  if (!taskList) return;

  taskList.innerHTML = `
    <p>Loading daily tasks...</p>
  `;

  try {

    const snapshot = await getDocs(
      collection(db, "tasks")
    );

    taskList.innerHTML = "";

    let foundTask = false;

    snapshot.forEach((item) => {

      const task = item.data();
      const taskId = item.id;

      // Only active tasks
      if (task.active !== true) {
        return;
      }

      foundTask = true;

      const title =
        task.title || "Daily Task";

      const description =
        task.description ||
        "Complete this task and earn a reward.";

      const reward =
        Number(task.reward || 0);

      const requiredSeconds =
        Number(task.requiredWatchSeconds || 5);


      // =================================================
      // CARD
      // =================================================

      const card =
        document.createElement("div");

      card.className = "profile-card";

      card.id =
        `task-card-${taskId}`;


      // =================================================
      // TITLE
      // =================================================

      const titleElement =
        document.createElement("h3");

      titleElement.textContent =
        "🎯 " + title;

      card.appendChild(titleElement);


      // =================================================
      // DESCRIPTION
      // =================================================

      const descriptionElement =
        document.createElement("p");

      descriptionElement.textContent =
        description;

      card.appendChild(descriptionElement);


      // =================================================
      // REWARD
      // =================================================

      const rewardElement =
        document.createElement("p");

      rewardElement.innerHTML =
        `<b>🎁 Reward:</b> ETB ${reward.toLocaleString()}`;

      card.appendChild(rewardElement);


      // =================================================
      // REQUIRED TIME
      // =================================================

      const requiredElement =
        document.createElement("p");

      requiredElement.innerHTML =
        `<b>⏱️ Required:</b> ${requiredSeconds} seconds`;

      card.appendChild(requiredElement);


      // =================================================
      // VIDEO
      // =================================================

      if (task.videoUrl) {

        const video =
          document.createElement("video");

        video.id =
          `video-${taskId}`;

        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        video.src =
          task.videoUrl;

        card.appendChild(video);


        // =================================================
        // TIMER
        // =================================================

        const timer =
          document.createElement("p");

        timer.id =
          `timer-${taskId}`;

        timer.className =
          "task-status task-pending";

        timer.textContent =
          `Watched 0 / ${requiredSeconds} seconds`;

        card.appendChild(timer);


        // =================================================
        // CLAIM BUTTON
        // =================================================

        const claimButton =
          document.createElement("button");

        claimButton.id =
          `claim-${taskId}`;

        claimButton.type = "button";

        claimButton.disabled = true;

        claimButton.style.display = "none";

        claimButton.textContent =
          `🎁 Claim ETB ${reward.toLocaleString()}`;

        claimButton.addEventListener(
          "click",
          () => claimTask(taskId)
        );

        card.appendChild(claimButton);


        // Setup video
        setupVideoTracking(
          taskId,
          requiredSeconds,
          reward
        );

      } else {

        const noVideo =
          document.createElement("p");

        noVideo.className =
          "task-error";

        noVideo.textContent =
          "🎬 Video is not available yet.";

        card.appendChild(noVideo);

      }


      taskList.appendChild(card);

    });


    // =================================================
    // NO TASK
    // =================================================

    if (!foundTask) {

      taskList.innerHTML = `
        <div class="profile-card">

          <h3>🎯 No Daily Tasks</h3>

          <p>
            There are no active tasks available right now.
          </p>

        </div>
      `;

    }

  } catch (error) {

    console.error(
      "LOAD TASKS ERROR:",
      error
    );

    taskList.innerHTML = `
      <div class="profile-card">

        <h3 style="color:#d32f2f;">
          ❌ Failed to load tasks
        </h3>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>
    `;

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


  let maxWatched = 0;

  let lastAllowedTime = 0;


  // =================================================
  // TIME UPDATE
  // =================================================

  video.addEventListener(
    "timeupdate",
    () => {

      const currentTime =
        Math.floor(video.currentTime);


      if (currentTime > maxWatched) {
        maxWatched = currentTime;
      }


      if (maxWatched > requiredSeconds) {
        maxWatched = requiredSeconds;
      }


      window.taskWatchStatus[taskId] =
        maxWatched;


      if (timer) {

        timer.textContent =
          `Watched ${maxWatched} / ${requiredSeconds} seconds`;

      }


      if (
        video.currentTime <=
        lastAllowedTime + 1
      ) {

        lastAllowedTime =
          video.currentTime;

      }


      // =================================================
      // COMPLETED
      // =================================================

      if (
        maxWatched >=
        requiredSeconds
      ) {

        if (timer) {

          timer.textContent =
            `✓ Watched ${requiredSeconds} / ${requiredSeconds} seconds`;

          timer.className =
            "task-status task-success";

        }


        if (claimButton) {

          claimButton.disabled = false;

          claimButton.style.display =
            "block";

          claimButton.textContent =
            `🎁 Claim ETB ${reward.toLocaleString()}`;

        }

      }

    }
  );


  // =================================================
  // PREVENT SKIPPING
  // =================================================

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
// CLAIM TASK
// =====================================================

window.claimTask = async function(taskId) {

  if (!currentUser) {

    alert("Please login first.");

    return;

  }


  try {

    // =================================================
    // TASK
    // =================================================

    const taskRef =
      doc(
        db,
        "tasks",
        taskId
      );

    const taskSnap =
      await getDoc(taskRef);


    if (!taskSnap.exists()) {

      alert("Task not found.");

      return;

    }


    const task =
      taskSnap.data();


    if (task.active !== true) {

      alert("This task is not active.");

      return;

    }


    const reward =
      Number(task.reward || 0);


    if (reward <= 0) {

      alert("Invalid task reward.");

      return;

    }


    // =================================================
    // WATCH CHECK
    // =================================================

    const requiredSeconds =
      Number(
        task.requiredWatchSeconds || 5
      );

    const watched =
      Number(
        window.taskWatchStatus[taskId] || 0
      );


    if (watched < requiredSeconds) {

      alert(
        `Please watch ${requiredSeconds} seconds first.`
      );

      return;

    }


    // =================================================
    // DUPLICATE CHECK
    // =================================================

    const completionId =
      `${currentUser.uid}_${taskId}`;

    const completionRef =
      doc(
        db,
        "taskCompletions",
        completionId
      );

    const completionSnap =
      await getDoc(completionRef);


    if (completionSnap.exists()) {

      alert(
        "You have already completed this task."
      );

      return;

    }


    // =================================================
    // WALLET
    // =================================================

    const walletRef =
      doc(
        db,
        "wallets",
        currentUser.uid
      );

    const walletSnap =
      await getDoc(walletRef);


    if (!walletSnap.exists()) {

      await setDoc(
        walletRef,
        {
          balance: reward,
          deposit: 0,
          income: reward
        }
      );

    } else {

      await updateDoc(
        walletRef,
        {
          balance: increment(reward),
          income: increment(reward)
        }
      );

    }


    // =================================================
    // SAVE COMPLETION
    // =================================================

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


    // =================================================
    // BUTTON
    // =================================================

    const button =
      document.getElementById(
        `claim-${taskId}`
      );


    if (button) {

      button.disabled = true;

      button.textContent =
        "✓ Completed";

      button.style.display =
        "block";

    }


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
