import { showToast, showConfirm } from "./toast.js"
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

  const numberInputs = document.querySelectorAll("input[type=number]");
  numberInputs.forEach(input => input.addEventListener("input", calculateTotals));

  const form = document.getElementById("productionForm");
  if (form) form.addEventListener("submit", handleFormSubmit);

  // Optional: calculate totals if fields prefilled
  calculateTotals();
});

function calculateTotals() {
  const ids = ["L1_m","L1_kg","L2_m","L2_kg","L3_m","L3_kg","L4_m","L4_kg","L5_m","L5_kg"];
  const values = ids.reduce((acc, id) => ({ ...acc, [id]: Number(document.getElementById(id)?.value) || 0 }), {});

  const Machine1_m = values.L1_m + values.L2_m + values.L3_m;
  const Machine1_kg = values.L1_kg + values.L2_kg + values.L3_kg;
  const Machine2_m = values.L4_m + values.L5_m;
  const Machine2_kg = values.L4_kg + values.L5_kg;
  const Grand_m = Machine1_m + Machine2_m;
  const Grand_kg = Machine1_kg + Machine2_kg;

  document.getElementById("m1_total").textContent = `${Machine1_m} m / ${Machine1_kg} kg`;
  document.getElementById("m2_total").textContent = `${Machine2_m} m / ${Machine2_kg} kg`;
  document.getElementById("grand_total").textContent = `${Grand_m} m / ${Grand_kg} kg`;
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const ids = ["L1_m","L1_kg","L2_m","L2_kg","L3_m","L3_kg","L4_m","L4_kg","L5_m","L5_kg"];
  const values = ids.reduce((acc, id) => ({ ...acc, [id]: Number(document.getElementById(id)?.value) || 0 }), {});

  const formData = {
    Date: document.getElementById("date")?.value || new Date().toISOString().split("T")[0],
    ...values,
    Machine1_m: values.L1_m + values.L2_m + values.L3_m,
    Machine1_kg: values.L1_kg + values.L2_kg + values.L3_kg,
    Machine2_m: values.L4_m + values.L5_m,
    Machine2_kg: values.L4_kg + values.L5_kg,
  };
  formData.Grand_m = formData.Machine1_m + formData.Machine2_m;
  formData.Grand_kg = formData.Machine1_kg + formData.Machine2_kg;

  // Send to Electron main process
  if (window.electronAPI?.saveProduction) {
    window.electronAPI.saveProduction(formData);
    showToast("Production saved ✅");
  } else {
    console.log("Electron API not available. Data:", formData);
  }

  // Reset form & totals
  e.target.reset();
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  calculateTotals();
  document.getElementById("L1_m")?.focus();
}

