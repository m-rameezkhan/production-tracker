function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto remove after animation ends
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Reusable Confirm Modal
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const msg = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");

    msg.textContent = message;
    modal.style.display = "flex";

    // Cleanup old listeners before adding new ones
    yesBtn.onclick = () => {
      modal.style.display = "none";
      resolve(true);
    };
    noBtn.onclick = () => {
      modal.style.display = "none";
      resolve(false);
    };
  });
}

export {showToast, showConfirm}