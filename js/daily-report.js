import { showToast, showConfirm } from "./toast.js"
const dailyContainer = document.getElementById('dailyReportContainer');
const fetchDailyBtn = document.getElementById('fetchDaily');

fetchDailyBtn.addEventListener('click', async () => {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;

  const data = await window.electronAPI.getProductionData({ from: fromDate, to: toDate });

  dailyContainer.innerHTML = '';

  if (!data || data.length === 0) {
    dailyContainer.innerHTML = `
      <div class="no-records">
        <i class="fas fa-exclamation-circle"></i> 
        No records found for the selected date range.
      </div>
    `;
    return;
  }

  // *** SORT DATA BY DATE BEFORE RENDERING ***
  data.sort((a, b) => new Date(a.Date) - new Date(b.Date));

  data.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'report-card';

    const dateObj = new Date(row.Date);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-GB', options);

    // Calculate totals here instead of using values from Excel
    const Machine1_m = (Number(row.L1_m) || 0) + (Number(row.L2_m) || 0) + (Number(row.L3_m) || 0);
    const Machine1_kg = (Number(row.L1_kg) || 0) + (Number(row.L2_kg) || 0) + (Number(row.L3_kg) || 0);
    const Machine2_m = (Number(row.L4_m) || 0) + (Number(row.L5_m) || 0);
    const Machine2_kg = (Number(row.L4_kg) || 0) + (Number(row.L5_kg) || 0);
    const Grand_m = Machine1_m + Machine2_m;
    const Grand_kg = Machine1_kg + Machine2_kg;

    card.innerHTML = `
      <div class="card-header">Date: ${formattedDate}</div>

      <div class="machine-wrapper">
        <div class="machine-box">
          <h4>UNIT 1</h4>
          <div class="form-header">
            <span></span>
            <span>Meter</span>
            <span>KGs</span>
          </div>
          <div class="form-row">
            <label>L1</label>
            <input type="text" value="${row.L1_m}" readonly>
            <input type="text" value="${row.L1_kg}" readonly>
          </div>
          <div class="form-row">
            <label>L2</label>
            <input type="text" value="${row.L2_m}" readonly>
            <input type="text" value="${row.L2_kg}" readonly>
          </div>
          <div class="form-row">
            <label>L3</label>
            <input type="text" value="${row.L3_m}" readonly>
            <input type="text" value="${row.L3_kg}" readonly>
          </div>
        </div>

        <div class="machine-box">
          <h4>UNIT 2</h4>
          <div class="form-header">
            <span></span>
            <span>Meter</span>
            <span>KGs</span>
          </div>
          <div class="form-row">
            <label>L4</label>
            <input type="text" value="${row.L4_m}" readonly>
            <input type="text" value="${row.L4_kg}" readonly>
          </div>
          <div class="form-row">
            <label>L5</label>
            <input type="text" value="${row.L5_m}" readonly>
            <input type="text" value="${row.L5_kg}" readonly>
          </div>
        </div>
      </div>

      <div class="totals-box">
        <h4>Totals</h4>
        <div class="totals-table">
          <div class="totals-row header">
            <div></div>
            <div>Meter</div>
            <div>KGs</div>
          </div>
          <div class="totals-row unit1">
            <div>Unit 1 (L1 L2 L3) Total</div>
            <div>${Machine1_m}</div>
            <div>${Machine1_kg}</div>
          </div>
          <div class="totals-row unit2">
            <div>Unit 2 (L4 L5) Total</div>
            <div>${Machine2_m}</div>
            <div>${Machine2_kg}</div>
          </div>
          <div class="totals-row grand">
            <div>Grand Total</div>
            <div>${Grand_m}</div>
            <div>${Grand_kg}</div>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="edit-btn btn">Edit</button>
        <button class="delete-btn btn danger">Delete</button>
      </div>
    `;

    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    const inputs = card.querySelectorAll('input');

    const unit1Row = card.querySelector('.totals-row.unit1');
    const unit2Row = card.querySelector('.totals-row.unit2');
    const grandRow = card.querySelector('.totals-row.grand');

    // === Edit/Save functionality ===
    editBtn.addEventListener('click', () => {
      if (editBtn.textContent === 'Edit') {
        inputs.forEach(input => {
          input.removeAttribute('readonly');
          input.style.border = '1px solid black';
        });
        editBtn.textContent = 'Save';
      } else {
        const L1_m = Number(inputs[0].value) || 0;
        const L1_kg = Number(inputs[1].value) || 0;
        const L2_m = Number(inputs[2].value) || 0;
        const L2_kg = Number(inputs[3].value) || 0;
        const L3_m = Number(inputs[4].value) || 0;
        const L3_kg = Number(inputs[5].value) || 0;
        const L4_m = Number(inputs[6].value) || 0;
        const L4_kg = Number(inputs[7].value) || 0;
        const L5_m = Number(inputs[8].value) || 0;
        const L5_kg = Number(inputs[9].value) || 0;

        const Machine1_m = L1_m + L2_m + L3_m;
        const Machine1_kg = L1_kg + L2_kg + L3_kg;
        const Machine2_m = L4_m + L5_m;
        const Machine2_kg = L4_kg + L5_kg;
        const Grand_m = Machine1_m + Machine2_m;
        const Grand_kg = Machine1_kg + Machine2_kg;

        unit1Row.children[1].textContent = Machine1_m;
        unit1Row.children[2].textContent = Machine1_kg;
        unit2Row.children[1].textContent = Machine2_m;
        unit2Row.children[2].textContent = Machine2_kg;
        grandRow.children[1].textContent = Grand_m;
        grandRow.children[2].textContent = Grand_kg;

        const updatedData = {
          Date: row.Date,
          L1_m, L1_kg, L2_m, L2_kg, L3_m, L3_kg,
          L4_m, L4_kg, L5_m, L5_kg,
          Machine1_m, Machine1_kg, Machine2_m, Machine2_kg,
          Grand_m, Grand_kg
        };

        window.electronAPI.updateProduction(updatedData);

        inputs.forEach(input => {
          input.setAttribute('readonly', true);
          input.style.border = '1px solid #bbb';
        });
        editBtn.textContent = 'Edit';
        showToast("Record Update uccessfully")
      }
    });

    // === Delete functionality ===
    deleteBtn.addEventListener('click', async () => {
      const confirmed = await showConfirm(`Are you sure you want to delete record for ${formattedDate}?`);
      if (confirmed) {
        const result = await window.electronAPI.deleteProduction(row.Date);
        if (result.success) {
          card.remove();
          if (dailyContainer.children.length === 0) {
            dailyContainer.innerHTML = `
          <div class="no-records">
            <i class="fas fa-exclamation-circle"></i> 
            No records found.
          </div>
        `;
          }
          showToast("Record deleted successfully", "success");
        } else {
          showToast("Failed to delete record: " + result.message, "error");
        }
      }
    });


    dailyContainer.appendChild(card);
  });
});



document.getElementById("printDaily").addEventListener("click", () => {
  window.electronAPI.printPage("dailyReportContainer");
});