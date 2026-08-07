import { CHARTS, updateChartTheme } from '../charts/chartManager.js';
import { drawHeatmap } from '../views/outlets.js';

export function getTextColor() {
  return document.body.classList.contains('light-mode') ? '#2B2428' : '#FCF0D0';
}

export function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  document.getElementById('theme-icon').textContent = isLight ? '🌙' : '☀️';
  document.getElementById('theme-text').textContent = isLight ? 'Dark Mode' : 'Light Mode';
  const tc = isLight ? '#665c61' : '#a3979d';
  const gc = isLight ? 'rgba(43,36,40,.08)' : 'rgba(252,240,208,.06)';
  const tb = isLight ? '#F5E9C9' : '#362E33';
  const tbd = isLight ? '#DFD0AA' : '#43393F';
  const tt = isLight ? '#2B2428' : '#FCF0D0';

  updateChartTheme(isLight);

  Object.values(CHARTS).forEach(chart => {
    if (chart.options.scales) {
      ['x', 'y', 'y2'].forEach(ax => {
        if (chart.options.scales[ax]) {
          if (chart.options.scales[ax].ticks) chart.options.scales[ax].ticks.color = tc;
          if (chart.options.scales[ax].grid) chart.options.scales[ax].grid.color = gc;
        }
      });
    }
    if (chart.options.plugins?.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = tb;
      chart.options.plugins.tooltip.borderColor = tbd;
      chart.options.plugins.tooltip.titleColor = tt;
      chart.options.plugins.tooltip.bodyColor = tc;
    }
    if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = tt;
    chart.update('none');
  });
  drawHeatmap();
}

