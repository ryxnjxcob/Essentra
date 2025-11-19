// ws.js
import { showToast } from "/static/utils.js";

let notifications = [];

// =========================================================
//  WebSocket Notifications
// =========================================================
export function initWebSocket(userId) {
  if (!userId) return;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${protocol}://${window.location.host}/ws/notifications/${userId}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => console.log("WS connected:", wsUrl);
  ws.onerror = (e) => console.error("WS error:", e);
  ws.onclose = () => console.log("WS closed");

  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error("Invalid JSON from WS:", event.data);
      return;
    }

    console.log("WS MESSAGE:", data);

    // Access Request (Owner receives)
    if (data.type === "access_request") {
      addNotification(data);
      showToast(
        `${data.requester_name} requested access to "${data.board_title}"`,
        4000,
      );

      // 🔥 IMPORTANT: show modal when owner gets request
      showAccessRequestModal(data);
    }

    // Access Response (Requester receives)
    if (data.type === "access_response") {
      showToast(
        `Your request to join "${data.board_title}" was ${data.approved ? "approved" : "rejected"}`,
        4000,
      );

      // 🔥 Refresh boards automatically for child user
      if (typeof loadBoards === "function") {
        loadBoards();
      }
    }
  };
}

// =========================================================
// Notifications Panel Logic
// =========================================================
const notifBtn = document.getElementById("notification-btn");
const notifPanel = document.getElementById("notification-panel");
const notifList = document.getElementById("notification-list");
const notifCount = document.getElementById("notification-count");
const container = document.getElementById("notification-container");

// open/close panel
notifBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  notifPanel.classList.toggle("hidden");
});

// close panel when clicking outside
document.addEventListener("click", (e) => {
  if (!container.contains(e.target)) {
    notifPanel.classList.add("hidden");
  }
});

function addNotification(n) {
  notifications.push(n);
  renderNotifications();
}

function renderNotifications() {
  notifList.innerHTML = "";

  notifications.forEach((n) => {
    const li = document.createElement("li");
    li.classList = "p-3";
    li.innerHTML = `
            <div class="mb-2">
                <strong>${n.requester_name}</strong> requested access to <em>${n.board_title}</em>
            </div>
            <div class="flex gap-2">
                <button class="approve-btn bg-blue-600 text-white px-2 py-1 rounded" data-id="${n.request_id}">Approve</button>
                <button class="reject-btn bg-red-600 text-white px-2 py-1 rounded" data-id="${n.request_id}">Reject</button>
            </div>
        `;
    notifList.appendChild(li);
  });

  notifCount.textContent = notifications.length;
  notifCount.classList.toggle("hidden", notifications.length === 0);

  document
    .querySelectorAll(".approve-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => respondAccess(btn.dataset.id, true)),
    );
  document
    .querySelectorAll(".reject-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => respondAccess(btn.dataset.id, false)),
    );
}

async function respondAccess(id, approved) {
  const res = await fetch(`/boards/collaboration/${id}/respond`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approve: approved }),
  });

  if (res.ok) {
    notifications = notifications.filter((n) => n.request_id != id);
    renderNotifications();
  }
}
