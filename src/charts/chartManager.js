import Chart from 'chart.js/auto';

export const CHARTS = {};

export function fmt(v) {
  if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr';
  if (v >= 1e5) return '₹' + (v / 1e5).toFixed(2) + 'L';
  if (v >= 1e3) return '₹' + (v / 1e3).toFixed(1) + 'k';
  return '₹' + v.toLocaleString('en-IN');
}

export function fmtN(v) {
  return v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : v.toString();
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '231,186,68';
}

export function mkChart(id, type, labels, datasets, options = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  if (CHARTS[id]) CHARTS[id].destroy();

  const cfg = {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#362E33',
          borderColor: '#43393F',
          borderWidth: 1,
          titleColor: '#FCF0D0',
          bodyColor: '#a3979d',
          titleFont: { family: 'Poppins', size: 11 },
          bodyFont: { family: 'Raleway', size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label || 'Value'}: ${typeof ctx.raw === 'number' && ctx.raw > 999 ? fmt(ctx.raw) : ctx.raw}`
          }
        }
      },
      scales: options.scales || {},
      ...options
    }
  };

  if (options.extra) Object.assign(cfg.options, options.extra);
  const c = new Chart(canvas, cfg);
  CHARTS[id] = c;
  return c;
}

export function updateChart(id, labels, datasets) {
  const c = CHARTS[id];
  if (!c) return;
  c.data.labels = labels;
  c.data.datasets = datasets;
  c.update('active');
}
