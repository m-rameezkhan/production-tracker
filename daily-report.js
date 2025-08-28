const dailyContainer = document.getElementById('dailyReportContainer');
const fetchDailyBtn = document.getElementById('fetchDaily');

fetchDailyBtn.addEventListener('click', async () => {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;

  const data = await window.electronAPI.getProductionData({ fromDate, toDate });

  dailyContainer.innerHTML = '';

  data.forEach(row => {
    const card = document.createElement('div');
    card.className = 'report-card';

    card.innerHTML = `
      <h1>Date: ${row.Date}</h1>
      <fieldset>
        <legend>Machine 1 (L1, L2, L3)</legend>
        <div class="form-row">
          <label>L1:</label>
          <input type="number" value="${row.L1_m}" readonly>
          <input type="number" value="${row.L1_kg}" readonly>
        </div>
        <div class="form-row">
          <label>L2:</label>
          <input type="number" value="${row.L2_m}" readonly>
          <input type="number" value="${row.L2_kg}" readonly>
        </div>
        <div class="form-row">
          <label>L3:</label>
          <input type="number" value="${row.L3_m}" readonly>
          <input type="number" value="${row.L3_kg}" readonly>
        </div>
      </fieldset>

      <fieldset>
        <legend>Machine 2 (L4, L5)</legend>
        <div class="form-row">
          <label>L4:</label>
          <input type="number" value="${row.L4_m}" readonly>
          <input type="number" value="${row.L4_kg}" readonly>
        </div>
        <div class="form-row">
          <label>L5:</label>
          <input type="number" value="${row.L5_m}" readonly>
          <input type="number" value="${row.L5_kg}" readonly>
        </div>
      </fieldset>

      <fieldset>
        <legend>Totals</legend>
        <div class="totals">
          <p>Machine 1 Total: ${row.Machine1_m} m / ${row.Machine1_kg} kg</p>
          <p>Machine 2 Total: ${row.Machine2_m} m / ${row.Machine2_kg} kg</p>
          <p class="grand">Grand Total: ${row.Grand_m} m / ${row.Grand_kg} kg</p>
        </div>
      </fieldset>
    `;
    dailyContainer.appendChild(card);
  });
});

document.getElementById('printDaily').addEventListener('click', () => {
  window.print();
});
