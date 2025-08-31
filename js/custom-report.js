// custom-report.js
import { showToast, showConfirm } from "./toast.js"
const showReportBtn = document.getElementById("generateReport");
const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");

showReportBtn.addEventListener("click", async () => {
  const fromDate = fromDateInput.value;
  const toDate = toDateInput.value;

  if (!fromDate || !toDate) {
    showToast("Please select both From and To dates.", "error")
    return;
  }

  // Fetch production data from main
  const data = await window.electronAPI.getProductionData({ from: fromDate, to: toDate });

  // Initialize sums
  let L1_m = 0, L1_kg = 0,
      L2_m = 0, L2_kg = 0,
      L3_m = 0, L3_kg = 0,
      L4_m = 0, L4_kg = 0,
      L5_m = 0, L5_kg = 0;

  // Sum values across the date range
  data.forEach(row => {
    L1_m += Number(row.L1_m) || 0;
    L1_kg += Number(row.L1_kg) || 0;
    L2_m += Number(row.L2_m) || 0;
    L2_kg += Number(row.L2_kg) || 0;
    L3_m += Number(row.L3_m) || 0;
    L3_kg += Number(row.L3_kg) || 0;
    L4_m += Number(row.L4_m) || 0;
    L4_kg += Number(row.L4_kg) || 0;
    L5_m += Number(row.L5_m) || 0;
    L5_kg += Number(row.L5_kg) || 0;
  });

  // Totals
  const Unit1_m = L1_m + L2_m + L3_m;
  const Unit1_kg = L1_kg + L2_kg + L3_kg;
  const Unit2_m = L4_m + L5_m;
  const Unit2_kg = L4_kg + L5_kg;
  const Grand_m = Unit1_m + Unit2_m;
  const Grand_kg = Unit1_kg + Unit2_kg;

  // Update DOM values
  const dataDiv = document.querySelector(".data");

  // Machine values
  const meterCells = dataDiv.querySelectorAll(".production-data-meter .p-data-m");
  const kgCells = dataDiv.querySelectorAll(".production-data-kg .p-data-kg");

  meterCells[0].textContent = L1_m;
  meterCells[1].textContent = L2_m;
  meterCells[2].textContent = L3_m;
  meterCells[3].textContent = L4_m;
  meterCells[4].textContent = L5_m;

  kgCells[0].textContent = L1_kg;
  kgCells[1].textContent = L2_kg;
  kgCells[2].textContent = L3_kg;
  kgCells[3].textContent = L4_kg;
  kgCells[4].textContent = L5_kg;

  // Totals row
  dataDiv.querySelector(".p-m-t").textContent = Grand_m;
  dataDiv.querySelector(".p-kg-t").textContent = Grand_kg;
  dataDiv.querySelector(".u1-m-t").textContent = Unit1_m;
  dataDiv.querySelector(".u1-kg-t").textContent = Unit1_kg;
  dataDiv.querySelector(".u2-m-t").textContent = Unit2_m;
  dataDiv.querySelector(".u2-kg-t").textContent = Unit2_kg;

  // Add date range label
  document.querySelector(".report-date-range").textContent = 
    `Report From: ${fromDate} To: ${toDate}`;
});

// Print button
document.getElementById("printReport").addEventListener("click", () => {
  window.electronAPI.printPage("report-section");
});

