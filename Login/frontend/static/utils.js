// utils.js
export function showToast(message, duration = 3000, onClick = null) {
  const toast = document.createElement("div");
  toast.className =
    "bg-gray-800 text-white px-4 py-2 rounded shadow-lg cursor-pointer mb-2";
  toast.textContent = message;

  if (onClick) toast.addEventListener("click", onClick);

  document.getElementById("toast-container").appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}
