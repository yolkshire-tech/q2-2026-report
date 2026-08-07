// Generic sortable-table and CSV-export helpers.

export function sortTable(tableId, colIndex) {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  const tbody = tbl.querySelector('tbody') || tbl;
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => r.querySelectorAll('th').length === 0);
  if (rows.length === 0) return;

  const ths = tbl.querySelectorAll('th');
  const th = ths[colIndex];
  if (!th) return;

  const currentDir = th.getAttribute('data-sort-dir') === 'asc' ? 'desc' : 'asc';
  ths.forEach(t => {
    t.removeAttribute('data-sort-dir');
    t.classList.remove('sort-asc', 'sort-desc');
  });
  th.setAttribute('data-sort-dir', currentDir);
  th.classList.add(currentDir === 'asc' ? 'sort-asc' : 'sort-desc');

  const parseVal = (str) => {
    if (!str) return 0;
    let s = str.trim();
    if (s === '—' || s === 'N/A' || s === 'New') return -Infinity;
    let numStr = s.replace(/[₹,%\s]/g, '');
    if (numStr.endsWith('Cr')) return parseFloat(numStr.replace('Cr', '')) * 1e7;
    if (numStr.endsWith('L')) return parseFloat(numStr.replace('L', '')) * 1e5;
    if (numStr.endsWith('k')) return parseFloat(numStr.replace('k', '')) * 1e3;
    const n = parseFloat(numStr);
    return isNaN(n) ? s.toLowerCase() : n;
  };

  rows.sort((a, b) => {
    const cellA = a.children[colIndex] ? a.children[colIndex].textContent : '';
    const cellB = b.children[colIndex] ? b.children[colIndex].textContent : '';
    const valA = parseVal(cellA);
    const valB = parseVal(cellB);
    if (typeof valA === 'number' && typeof valB === 'number') {
      return currentDir === 'asc' ? valA - valB : valB - valA;
    }
    return currentDir === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  rows.forEach(r => tbody.appendChild(r));
}

// CSV Data Export Engine

export function exportTableToCSV(tableId, filename = 'yolkshire_analytics_export.csv') {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  const rows = Array.from(tbl.querySelectorAll('tr'));
  const csvLines = rows.map(row => {
    const cols = Array.from(row.querySelectorAll('th, td'));
    return cols.map(c => {
      let text = c.textContent.trim().replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvLines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// What-If Profitability Simulator

