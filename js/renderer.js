// ✅ Prefill current date
window.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    dateInput.value = today;
  }
});

function calculateTotals() {
  const L1_m = Number(document.getElementById('L1_m').value) || 0;
  const L1_kg = Number(document.getElementById('L1_kg').value) || 0;
  const L2_m = Number(document.getElementById('L2_m').value) || 0;
  const L2_kg = Number(document.getElementById('L2_kg').value) || 0;
  const L3_m = Number(document.getElementById('L3_m').value) || 0;
  const L3_kg = Number(document.getElementById('L3_kg').value) || 0;
  const L4_m = Number(document.getElementById('L4_m').value) || 0;
  const L4_kg = Number(document.getElementById('L4_kg').value) || 0;
  const L5_m = Number(document.getElementById('L5_m').value) || 0;
  const L5_kg = Number(document.getElementById('L5_kg').value) || 0;

  // Totals
  const Machine1_m = L1_m + L2_m + L3_m;
  const Machine1_kg = L1_kg + L2_kg + L3_kg;
  const Machine2_m = L4_m + L5_m;
  const Machine2_kg = L4_kg + L5_kg;
  const Grand_m = Machine1_m + Machine2_m;
  const Grand_kg = Machine1_kg + Machine2_kg;

  // Update HTML
  document.getElementById('m1_total').textContent = `${Machine1_m} m / ${Machine1_kg} kg`;
  document.getElementById('m2_total').textContent = `${Machine2_m} m / ${Machine2_kg} kg`;
  document.getElementById('grand_total').textContent = `${Grand_m} m / ${Grand_kg} kg`;
}

// ✅ Trigger calculation after every key press
document.querySelectorAll("input[type=number]").forEach(input => {
  input.addEventListener("input", calculateTotals);
});

// ✅ Inline success message instead of alert
function showSuccessMessage(message) {
  let msgBox = document.getElementById("successMessage");
  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "successMessage";
    msgBox.style.position = "fixed";
    msgBox.style.top = "20px";
    msgBox.style.right = "20px";
    msgBox.style.background = "#4CAF50";
    msgBox.style.color = "white";
    msgBox.style.padding = "10px 20px";
    msgBox.style.borderRadius = "6px";
    msgBox.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.2)";
    msgBox.style.fontSize = "14px";
    document.body.appendChild(msgBox);
  }
  msgBox.textContent = message;
  msgBox.style.display = "block";

  setTimeout(() => {
    msgBox.style.display = "none";
  }, 2000);
}

// ✅ Save Form
document.getElementById('productionForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = {
    Date: document.getElementById('date').value,
    L1_m: Number(document.getElementById('L1_m').value) || 0,
    L1_kg: Number(document.getElementById('L1_kg').value) || 0,
    L2_m: Number(document.getElementById('L2_m').value) || 0,
    L2_kg: Number(document.getElementById('L2_kg').value) || 0,
    L3_m: Number(document.getElementById('L3_m').value) || 0,
    L3_kg: Number(document.getElementById('L3_kg').value) || 0,
    L4_m: Number(document.getElementById('L4_m').value) || 0,
    L4_kg: Number(document.getElementById('L4_kg').value) || 0,
    L5_m: Number(document.getElementById('L5_m').value) || 0,
    L5_kg: Number(document.getElementById('L5_kg').value) || 0,
  };

  // Auto totals for saving
  formData.Machine1_m = formData.L1_m + formData.L2_m + formData.L3_m;
  formData.Machine1_kg = formData.L1_kg + formData.L2_kg + formData.L3_kg;
  formData.Machine2_m = formData.L4_m + formData.L5_m;
  formData.Machine2_kg = formData.L4_kg + formData.L5_kg;
  formData.Grand_m = formData.Machine1_m + formData.Machine2_m;
  formData.Grand_kg = formData.Machine1_kg + formData.Machine2_kg;

  // Send data to main
  window.electronAPI.saveProduction(formData);

  // ✅ Use non-blocking success message
  showSuccessMessage("Production saved to Excel ✅");

  // ✅ Reset form safely
  this.reset();

  // ✅ Restore today's date
  const today = new Date().toISOString().split("T")[0];
  document.getElementById('date').value = today;

  // ✅ Reset totals display
  calculateTotals();

  // ✅ Refocus first input for smooth entry
  document.getElementById("L1_m").focus();
});

