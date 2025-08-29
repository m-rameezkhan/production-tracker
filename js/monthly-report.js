// js/monthly-report.js
document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("monthSelect");
  const fetchBtn = document.getElementById("fetchMonthly");
  const tbody = document.querySelector("#monthlyReportTable tbody");
  const printBtn = document.getElementById("printMonthly");

  if (monthSelect && !monthSelect.value) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    monthSelect.value = `${y}-${m}`;
  }

  fetchBtn.addEventListener("click", async () => {
    const month = monthSelect?.value;
    if (!month) {
      alert("Please select a month.");
      return;
    }

    try {
      const records = await window.electronAPI.getProductionData({ month });
      if (!Array.isArray(records) || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="no-data">No data found for ${month}</td></tr>`;
        return;
      }

      const byDate = {};
      records.forEach(r => {
        const d = (r.Date || "").slice(0, 10);
        if (!d) return;
        if (!byDate[d]) byDate[d] = { m1m: 0, m1kg: 0, m2m: 0, m2kg: 0 };

        const m1m = Number(r.Machine1_m ?? (Number(r.L1_m || 0) + Number(r.L2_m || 0) + Number(r.L3_m || 0))) || 0;
        const m1kg = Number(r.Machine1_kg ?? (Number(r.L1_kg || 0) + Number(r.L2_kg || 0) + Number(r.L3_kg || 0))) || 0;
        const m2m = Number(r.Machine2_m ?? (Number(r.L4_m || 0) + Number(r.L5_m || 0))) || 0;
        const m2kg = Number(r.Machine2_kg ?? (Number(r.L4_kg || 0) + Number(r.L5_kg || 0))) || 0;

        byDate[d].m1m += m1m;
        byDate[d].m1kg += m1kg;
        byDate[d].m2m += m2m;
        byDate[d].m2kg += m2kg;
      });

      tbody.innerHTML = "";
      let totalM1m = 0, totalM1kg = 0, totalM2m = 0, totalM2kg = 0;

      Object.keys(byDate).forEach(dateStr => {
        const d = byDate[dateStr];
        if (d.m1m === 0 && d.m1kg === 0 && d.m2m === 0 && d.m2kg === 0) return;

        const grandM = d.m1m + d.m2m;
        const grandKg = d.m1kg + d.m2kg;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${dateStr}</td>
          <td><input type="number" value="${d.m1m}" disabled></td>
          <td><input type="number" value="${d.m1kg}" disabled></td>
          <td><input type="number" value="${d.m2m}" disabled></td>
          <td><input type="number" value="${d.m2kg}" disabled></td>
          <td class="grand-m">${grandM}</td>
          <td class="grand-kg">${grandKg}</td>
          <td><button class="edit-btn btn">Edit</button></td>
        `;
        tbody.appendChild(tr);

        totalM1m += d.m1m;
        totalM1kg += d.m1kg;
        totalM2m += d.m2m;
        totalM2kg += d.m2kg;
      });

      if (tbody.children.length > 0) {
        const totalRow = document.createElement("tr");
        totalRow.classList.add("totals-row");
        totalRow.innerHTML = `
          <td><strong>Total</strong></td>
          <td><strong>${totalM1m}</strong></td>
          <td><strong>${totalM1kg}</strong></td>
          <td><strong>${totalM2m}</strong></td>
          <td><strong>${totalM2kg}</strong></td>
          <td><strong>${totalM1m + totalM2m}</strong></td>
          <td><strong>${totalM1kg + totalM2kg}</strong></td>
          <td></td>
        `;
        tbody.appendChild(totalRow);
      }

      // ===== Add Edit/Save Functionality =====
      tbody.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("tr");
          const inputs = row.querySelectorAll("input");

          if (btn.textContent === "Edit") {
            inputs.forEach(i => i.disabled = false);
            btn.textContent = "Save";
            row.classList.add("editing"); // highlight row
          } else {
            inputs.forEach(i => i.disabled = true);
            btn.textContent = "Edit";
            row.classList.remove("editing"); // remove highlight

            const date = row.children[0].textContent;
            const m1m = Number(inputs[0].value) || 0;
            const m1kg = Number(inputs[1].value) || 0;
            const m2m = Number(inputs[2].value) || 0;
            const m2kg = Number(inputs[3].value) || 0;

            row.querySelector(".grand-m").textContent = m1m + m2m;
            row.querySelector(".grand-kg").textContent = m1kg + m2kg;

            // Save back to Excel
            await window.electronAPI.updateProduction({
              Date: date,
              Machine1_m: m1m,
              Machine1_kg: m1kg,
              Machine2_m: m2m,
              Machine2_kg: m2kg,
              Grand_m: m1m + m2m,
              Grand_kg: m1kg + m2kg
            });

            fetchBtn.click(); // Refresh after save
          }
        });
      });


    } catch (err) {
      console.error("Error fetching monthly report:", err);
      tbody.innerHTML = `<tr><td colspan="8" class="no-data">Failed to load data.</td></tr>`;
    }
  });

  printBtn.addEventListener("click", () => window.print());
});
