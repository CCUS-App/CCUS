import { db } from "./firebase-config.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


async function loadHomeMessage() {

  const messageBox =
    document.getElementById("homeMessage");

  if (!messageBox) return;

  try {

    const snap = await getDocs(
      collection(db, "announcements")
    );

    let latestMessage = null;

    snap.forEach((docSnap) => {

      const data = docSnap.data();

      if (data.active !== true) {
        return;
      }

      latestMessage = data;

    });

    if (!latestMessage) {

      messageBox.textContent =
        "No announcements available.";

      return;
    }

    messageBox.textContent =
      latestMessage.message ||
      "No message available.";

  } catch (error) {

    console.error(
      "HOME MESSAGE ERROR:",
      error
    );

    messageBox.textContent =
      "Unable to load message.";

  }

}


loadHomeMessage();