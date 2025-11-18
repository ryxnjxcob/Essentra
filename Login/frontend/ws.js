// ws.js
import { showToast } from "/static/utils.js";

let notifications = [];

// -----------------------------
// WebSocket
// -----------------------------
export function initWebSocket(userId) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(
    `${protocol}://${window.location.host}/ws/notifications/${userId}`,
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "access_request") {
      addNotification(data);
      showToast(
        `${data.requester_name} requested access to "${data.board_title}"`,
        4000,
      );
    }

    if (data.type === "access_response") {
      showToast(
        `Your request to board "${data.board_title}" was ${data.approved ? "approved" : "rejected"}`,
        4000,
      );
    }
  };

  ws.onopen = () => console.log("✅ WebSocket connected");
  ws.onclose = () => console.log("⚠️ WebSocket disconnected");
}

// -----------------------------
// Access Request Modal
// -----------------------------
const accessModalOverlay = document.getElementById(
  "access-request-modal-overlay",
);
const accessRequestText = document.getElementById("access-request-text");
const approveRequestBtn = document.getElementById("approve-request");
const rejectRequestBtn = document.getElementById("reject-request");
const closeAccessModalBtn = document.getElementById("close-access-modal");

let currentRequestId = null;

export function showAccessRequestModal(data) {
  currentRequestId = data.request_id;
  accessRequestText.textContent = `${data.requester_name} wants access to "${data.board_title}"`;
  accessModalOverlay.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeAccessRequestModal() {
  accessModalOverlay.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  currentRequestId = null;
}

approveRequestBtn.addEventListener("click", () =>
  respondAccess(currentRequestId, true),
);
rejectRequestBtn.addEventListener("click", () =>
  respondAccess(currentRequestId, false),
);
closeAccessModalBtn.addEventListener("click", closeAccessRequestModal);

document.addEventListener("keydown", (e) => {
  if (!accessModalOverlay.classList.contains("hidden") && e.key === "Escape") {
    closeAccessRequestModal();
  }
});

// -----------------------------
// Notifications Tab
// -----------------------------
const notifBtn = document.getElementById("notification-btn");
const notifPanel = document.getElementById("notification-panel");
const notifList = document.getElementById("notification-list");
const notifCount = document.getElementById("notification-count");

notifBtn.addEventListener("click", () => notifPanel.classList.toggle("hidden"));

function addNotification(data) {
  notifications.push(data);
  renderNotifications();
}

function renderNotifications() {
  notifList.innerHTML = "";
  notifications.forEach((notif) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${notif.requester_name}</strong> requested access to <em>${notif.board_title}</em></div>
      <div class="notification-actions flex gap-2 mt-1">
        <button class="approve-btn px-2 py-1 bg-blue-600 text-white rounded" data-id="${notif.request_id}">Approve</button>
        <button class="reject-btn px-2 py-1 bg-red-600 text-white rounded" data-id="${notif.request_id}">Reject</button>
      </div>
    `;
    notifList.appendChild(li);
  });

  notifCount.textContent = notifications.length;
  notifCount.classList.toggle("hidden", notifications.length === 0);

  // Attach buttons
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

// -----------------------------
// Respond to access
// -----------------------------
async function respondAccess(requestId, approved) {
  if (!requestId) return;
  try {
    const res = await fetch(`/boards/collaboration/${requestId}/respond`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve: approved }),
    });
    if (!res.ok) throw new Error("Failed to send response");

    // Remove notification after response
    const index = notifications.findIndex((n) => n.request_id == requestId);
    if (index !== -1) notifications.splice(index, 1);
    renderNotifications();
  } catch (err) {
    showToast(err.message, 4000);
  } finally {
    closeAccessRequestModal();
  }
}
addNotification({
  requester_name: "Test User",
  board_title: "Demo Board",
  request_id: 123,
});
