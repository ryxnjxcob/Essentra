const token = localStorage.getItem("access_token");

// Create menu dynamically
const contextMenu = document.createElement("div");
contextMenu.id = "contextMenu";
contextMenu.className =
  "hidden fixed bg-white border border-gray-300 rounded-md shadow-lg text-sm w-48 z-50";
contextMenu.innerHTML = `
  <ul>
    <li id="summarizeOption" class="px-4 py-2 hover:bg-gray-100 cursor-pointer">🧠 AI Summarize</li>
    <li id="deleteOption" class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">🗑️ Delete</li>
  </ul>
`;
document.body.appendChild(contextMenu);

let currentNote = null;

export function attachContextMenu(noteEl, deleteNoteFunc) {
  noteEl.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    currentNote = noteEl;

    // Position menu
    contextMenu.style.top = e.pageY + "px";
    contextMenu.style.left = e.pageX + "px";
    contextMenu.classList.remove("hidden");
  });

  document.getElementById("deleteOption").onclick = () => {
    if (currentNote) {
      deleteNoteFunc(currentNote);
      contextMenu.classList.add("hidden");
    }
  };

  document.getElementById("summarizeOption").onclick = async () => {
    if (!currentNote) return;
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      alert("Please select text to summarize inside the note.");
      return;
    }

    contextMenu.classList.add("hidden");
    const summary = await summarizeText(selection);
    currentNote.textContent = currentNote.textContent.replace(
      selection,
      summary,
    );

    if (typeof updateNoteText === "function") {
      updateNoteText(currentNote);
    }
  };

  // Hide menu on click elsewhere
  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.classList.add("hidden");
    }
  });
}

async function summarizeText(text) {
  try {
    const res = await fetch("/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.summary || "No summary returned.";
  } catch (err) {
    console.error(err);
    return "Failed to summarize text.";
  }
}
