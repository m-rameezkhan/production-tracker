const dailyContainer = document.getElementById('dailyReportContainer');
const fetchDailyBtn = document.getElementById('fetchDaily');

fetchDailyBtn.addEventListener('click', async () => {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;

  const data = await window.electronAPI.getProductionData({ from: fromDate, to: toDate });

  dailyContainer.innerHTML = '';

  data.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'report-card';

    const dateObj = new Date(row.Date);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-GB', options);

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
            <div>${row.Machine1_m}</div>
            <div>${row.Machine1_kg}</div>
          </div>
          <div class="totals-row unit2">
            <div>Unit 2 (L4 L5) Total</div>
            <div>${row.Machine2_m}</div>
            <div>${row.Machine2_kg}</div>
          </div>
          <div class="totals-row grand">
            <div>Grand Total</div>
            <div>${row.Grand_m}</div>
            <div>${row.Grand_kg}</div>
          </div>
        </div>
      </div>

      <button class="edit-btn btn">Edit</button>
    `;

    const editBtn = card.querySelector('.edit-btn');
    const inputs = card.querySelectorAll('input');

    const unit1Row = card.querySelector('.totals-row.unit1');
    const unit2Row = card.querySelector('.totals-row.unit2');
    const grandRow = card.querySelector('.totals-row.grand');

    editBtn.addEventListener('click', () => {
      if (editBtn.textContent === 'Edit') {
        // Enable editing with black border
        inputs.forEach(input => {
          input.removeAttribute('readonly');
          input.style.border = '1px solid black';
        });
        editBtn.textContent = 'Save';
      } else {
        // Gather new values
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

        // Recalculate totals
        const Machine1_m = L1_m + L2_m + L3_m;
        const Machine1_kg = L1_kg + L2_kg + L3_kg;
        const Machine2_m = L4_m + L5_m;
        const Machine2_kg = L4_kg + L5_kg;
        const Grand_m = Machine1_m + Machine2_m;
        const Grand_kg = Machine1_kg + Machine2_kg;

        // Update totals UI
        unit1Row.children[1].textContent = Machine1_m;
        unit1Row.children[2].textContent = Machine1_kg;
        unit2Row.children[1].textContent = Machine2_m;
        unit2Row.children[2].textContent = Machine2_kg;
        grandRow.children[1].textContent = Grand_m;
        grandRow.children[2].textContent = Grand_kg;

        // Save updated data
        const updatedData = {
          Date: row.Date,
          L1_m, L1_kg, L2_m, L2_kg, L3_m, L3_kg,
          L4_m, L4_kg, L5_m, L5_kg,
          Machine1_m, Machine1_kg, Machine2_m, Machine2_kg,
          Grand_m, Grand_kg
        };

        window.electronAPI.updateProduction(updatedData);

        // Lock inputs again & remove black border
        inputs.forEach(input => {
          input.setAttribute('readonly', true);
          input.style.border = '1px solid #bbb';
        });
        editBtn.textContent = 'Edit';
      }
    });

    dailyContainer.appendChild(card);
  });
});

document.getElementById('printDaily').addEventListener('click', () => {
  window.print();
});
