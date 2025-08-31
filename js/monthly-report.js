import { showToast, showConfirm } from "./toast.js";

document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("monthSelect");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const fetchBtn = document.getElementById("fetchMonthly");
  const tbody = document.querySelector("#monthlyReportTable tbody");
  const printBtn = document.getElementById("printMonthly");

  const monthPicker = document.querySelector(".month-picker");
  const rangePicker = document.querySelector(".range-picker");
  const dateOptions = document.querySelectorAll('input[name="dateOption"]');

  // Auto-select current month if not chosen
  if (monthSelect && !monthSelect.value) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    monthSelect.value = `${y}-${m}`;
  }

  // Toggle month / range / all inputs
  dateOptions.forEach(radio => {
    radio.addEventListener("change", () => {
      switch (radio.value) {
        case "month":
          monthPicker.style.display = "flex";
          rangePicker.style.display = "none";
          break;
        case "range":
          monthPicker.style.display = "none";
          rangePicker.style.display = "flex";
          break;
        case "all":
          monthPicker.style.display = "none";
          rangePicker.style.display = "none";
          break;
      }
    });
  });

  fetchBtn.addEventListener("click", async () => {
    let selectedOption = document.querySelector('input[name="dateOption"]:checked')?.value;
    let params = {};

    if (selectedOption === "month") {
      const month = monthSelect.value;
      if (!month) {
        showToast("Please select a month.", "error");
        return;
      }
      params.month = month;
    } else if (selectedOption === "range") {
      const from = fromDate.value;
      const to = toDate.value;
      if (!from || !to) {
        showToast("Please select both From and To dates.", "error");
        return;
      }
      if (from > to) {
        showToast("From date cannot be after To date.", "error");
        return;
      }
      params.from = from;
      params.to = to;
    }
    // if "all" is selected, params stay empty

    try {
      const records = await window.electronAPI.getProductionData(params);
      if (!Array.isArray(records) || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" class="no-data">No data found.</td></tr>`;
        return;
      }

      // *** SORT RECORDS BY DATE BEFORE RENDERING ***
      records.sort((a, b) => new Date(a.Date) - new Date(b.Date));

      // Existing table rendering logic remains unchanged
      tbody.innerHTML = "";
      let total = {
        L1_m: 0, L2_m: 0, L3_m: 0,
        L1_kg: 0, L2_kg: 0, L3_kg: 0,
        L4_m: 0, L5_m: 0,
        L4_kg: 0, L5_kg: 0
      };

      records.forEach(r => {
        const dateStr = (r.Date || "").slice(0, 10);
        if (!dateStr) return;

        const row = {
          L1_m: Number(r.L1_m || 0),
          L2_m: Number(r.L2_m || 0),
          L3_m: Number(r.L3_m || 0),
          L1_kg: Number(r.L1_kg || 0),
          L2_kg: Number(r.L2_kg || 0),
          L3_kg: Number(r.L3_kg || 0),
          L4_m: Number(r.L4_m || 0),
          L5_m: Number(r.L5_m || 0),
          L4_kg: Number(r.L4_kg || 0),
          L5_kg: Number(r.L5_kg || 0),
        };

        const grandM = row.L1_m + row.L2_m + row.L3_m + row.L4_m + row.L5_m;
        const grandKg = row.L1_kg + row.L2_kg + row.L3_kg + row.L4_kg + row.L5_kg;

        const tr = document.createElement("tr");
        tr.innerHTML = `
  <td>${dateStr}</td>
  <td><input type="number" value="${row.L1_m}" disabled></td>
  <td><input type="number" value="${row.L2_m}" disabled></td>
  <td><input type="number" value="${row.L3_m}" disabled></td>
  <td><input type="number" value="${row.L1_kg}" disabled></td>
  <td><input type="number" value="${row.L2_kg}" disabled></td>
  <td><input type="number" value="${row.L3_kg}" disabled></td>
  <td><input type="number" value="${row.L4_m}" disabled></td>
  <td><input type="number" value="${row.L5_m}" disabled></td>
  <td><input type="number" value="${row.L4_kg}" disabled></td>
  <td><input type="number" value="${row.L5_kg}" disabled></td>
  <td class="grand-m">${grandM}</td>
  <td class="grand-kg">${grandKg}</td>
  <td class="action-cell">
    <button class="edit-btn btn">Edit</button>
    <button class="delete-btn btn">Delete</button>
  </td>
`;
        tbody.appendChild(tr);

        Object.keys(total).forEach(k => total[k] += row[k]);
      });

      // Totals row
      if (tbody.children.length > 0) {
        const totalRow = document.createElement("tr");
        totalRow.classList.add("totals-row");
        totalRow.innerHTML = `
          <td><strong>Total</strong></td>
          <td><strong>${total.L1_m}</strong></td>
          <td><strong>${total.L2_m}</strong></td>
          <td><strong>${total.L3_m}</strong></td>
          <td><strong>${total.L1_kg}</strong></td>
          <td><strong>${total.L2_kg}</strong></td>
          <td><strong>${total.L3_kg}</strong></td>
          <td><strong>${total.L4_m}</strong></td>
          <td><strong>${total.L5_m}</strong></td>
          <td><strong>${total.L4_kg}</strong></td>
          <td><strong>${total.L5_kg}</strong></td>
          <td><strong>${total.L1_m + total.L2_m + total.L3_m + total.L4_m + total.L5_m}</strong></td>
          <td><strong>${total.L1_kg + total.L2_kg + total.L3_kg + total.L4_kg + total.L5_kg}</strong></td>
          <td class="action"></td>
        `;
        tbody.appendChild(totalRow);
      }

      // Edit/Save functionality
      tbody.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("tr");
          const inputs = row.querySelectorAll("input");

          if (btn.textContent === "Edit") {
            inputs.forEach(i => i.disabled = false);
            btn.textContent = "Save";
            row.classList.add("editing");
          } else {
            inputs.forEach(i => i.disabled = true);
            btn.textContent = "Edit";
            row.classList.remove("editing");

            const date = row.children[0].textContent;
            const updated = {
              Date: date,
              L1_m: Number(inputs[0].value) || 0,
              L2_m: Number(inputs[1].value) || 0,
              L3_m: Number(inputs[2].value) || 0,
              L1_kg: Number(inputs[3].value) || 0,
              L2_kg: Number(inputs[4].value) || 0,
              L3_kg: Number(inputs[5].value) || 0,
              L4_m: Number(inputs[6].value) || 0,
              L5_m: Number(inputs[7].value) || 0,
              L4_kg: Number(inputs[8].value) || 0,
              L5_kg: Number(inputs[9].value) || 0,
            };

            row.querySelector(".grand-m").textContent =
              updated.L1_m + updated.L2_m + updated.L3_m + updated.L4_m + updated.L5_m;
            row.querySelector(".grand-kg").textContent =
              updated.L1_kg + updated.L2_kg + updated.L3_kg + updated.L4_kg + updated.L5_kg;

            await window.electronAPI.updateProduction(updated);
            fetchBtn.click(); // refresh after save
            showToast("Records Update Successsfully")
          }
        });
      });

      // Delete functionality
      tbody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("tr");
          const date = row.children[0].textContent;

          const confirmed = await showConfirm(`Delete record for ${date}?`);
          if (confirmed) {
            const result = await window.electronAPI.deleteProduction(date); // <-- implement in preload
            if (result.success) {
              showToast(`Record for ${date} deleted successfully`, "success");
              fetchBtn.click(); // refresh after delete
            } else {
              showToast(`Failed to delete record: ${result.message}`, "error");
            }
          }
        });
      });


    } catch (err) {
      console.error("Error fetching monthly report:", err);
      tbody.innerHTML = `<tr><td colspan="14" class="no-data">Failed to load data.</td></tr>`;
    }
  });

  printBtn.addEventListener("click", () => {
    window.electronAPI.printPage("monthlyReportContainer");
  });
});
