const monthlyContainer = document.getElementById('monthlyReportContainer');
const fetchMonthlyBtn = document.getElementById('fetchMonthly');
const tableBody = document.querySelector('#monthlyReportTable tbody');

fetchMonthlyBtn.addEventListener('click', async () => {
  const month = document.getElementById('monthSelect').value;

  // MOCK DATA: Replace this with your Electron API call
  // const data = await window.electronAPI.getMonthlyData({ month });
  const data = [];
  const daysInMonth = new Date(month.split('-')[0], month.split('-')[1], 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    data.push({
      Date: `${month}-${i.toString().padStart(2, '0')}`,
      Machine1_m: Math.floor(Math.random() * 100),
      Machine1_kg: Math.floor(Math.random() * 50),
      Machine2_m: Math.floor(Math.random() * 80),
      Machine2_kg: Math.floor(Math.random() * 40),
      Grand_m: 0, // Will calculate below
      Grand_kg: 0
    });
  }

  // Compute grand totals
  data.forEach(row => {
    row.Grand_m = row.Machine1_m + row.Machine2_m;
    row.Grand_kg = row.Machine1_kg + row.Machine2_kg;
  });

  // Render table
  tableBody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.Date}</td>
      <td>${row.Machine1_m}</td>
      <td>${row.Machine1_kg}</td>
      <td>${row.Machine2_m}</td>
      <td>${row.Machine2_kg}</td>
      <td>${row.Grand_m}</td>
      <td>${row.Grand_kg}</td>
    `;
    tableBody.appendChild(tr);
  });
});

// Print button
document.getElementById('printMonthly').addEventListener('click', () => {
  window.print();
});
