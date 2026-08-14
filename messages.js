import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


async function loadMessages() {

  const messageList =
    document.getElementById("messageList");

  if (!messageList) return;

  try {

    const snap = await getDocs(
      collection(db, "announcements")
    );

    messageList.innerHTML = "";

    if (snap.empty) {

      messageList.innerHTML =
        "<p>No announcements available.</p>";

      return;
    }

    let count = 0;

    snap.forEach((docSnap) => {

      const data = docSnap.data();

      // active = true qofa
      if (data.active !== true) {
        return;
      }

      count++;

      const card =
        document.createElement("div");

      card.className = "profile-card";

      const title =
        document.createElement("h3");

      title.textContent =
        "📢 " +
        (data.title || "CCUS Message");

      const message =
        document.createElement("p");

      message.textContent =
        data.message || "";

      message.style.whiteSpace =
        "pre-wrap";

      card.appendChild(title);
      card.appendChild(message);

      if (data.createdAt) {

        const date =
          document.createElement("small");

        if (data.createdAt.toDate) {

          date.textContent =
            data.createdAt
              .toDate()
              .toLocaleString();

        }

        date.style.color = "#777";

        card.appendChild(date);
      }

      messageList.appendChild(card);

    });

    if (count === 0) {

      messageList.innerHTML =
        "<p>No active announcements available.</p>";

    }

  } catch (error) {

    console.error(
      "MESSAGE LOAD ERROR:",
      error
    );

    messageList.innerHTML = `
      <div class="profile-card">
        <p>❌ Message loading failed.</p>
        <p>${error.message}</p>
      </div>
    `;
  }
}


const backHomeBtn =
  document.getElementById("backHomeBtn");

if (backHomeBtn) {

  backHomeBtn.onclick = () => {

    window.location.href =
      "home.html";

  };

}


loadMessages();