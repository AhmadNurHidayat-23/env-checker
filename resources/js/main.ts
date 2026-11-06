import './style.css'; import './theme';
import { checkEnv, type Report } from './env'; import { download, readFile, message } from './io';
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let report: Report | null = null;
function status(text: string) { el('status').hidden = false; el('status').textContent = text; }
function render() {
  const container = el('result'); container.replaceChildren(); if (!report) return;
  el('count').textContent = report.exampleKeys + ' KEY TEMPLATE / ' + report.envKeys + ' KEY ENV';
  const rows = report.findings.filter(f => !el<HTMLSelectElement>('filter').value || f.severity === el<HTMLSelectElement>('filter').value);
  if (!rows.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = report.findings.length ? 'Tidak ada temuan pada filter ini.' : 'Tidak ada temuan pada pemeriksaan yang didukung. Koneksi layanan belum diuji.'; container.append(p); return; }
  const table = document.createElement('table'), head = document.createElement('thead'), tr = document.createElement('tr');
  ['Key / Baris', 'Temuan', 'Rekomendasi'].forEach(text => { const th = document.createElement('th'); th.textContent = text; tr.append(th); }); head.append(tr); table.append(head);
  const body = document.createElement('tbody');
  for (const f of rows) { const row = document.createElement('tr'); [ (f.key || '(key tidak valid)') + ' · ' + f.source + (f.line ? ':' + f.line : ''), f.kind + ' · ' + (f.severity === 'error' ? 'Perbaiki' : 'Tinjau'), f.advice ].forEach(text => { const td = document.createElement('td'); td.textContent = text; row.append(td); }); body.append(row); } table.append(body); container.append(table);
}
el('check').addEventListener('click', async () => {
  const button = el<HTMLButtonElement>('check'); button.disabled = true;
  report = null; el<HTMLButtonElement>('export').disabled = true; el('result').replaceChildren();
  try { const a = el<HTMLInputElement>('example').files?.[0], b = el<HTMLInputElement>('env').files?.[0]; report = checkEnv(await readFile(a), await readFile(b)); render(); el<HTMLButtonElement>('export').disabled = false; status(report.findings.length + ' temuan. Nilai konfigurasi tidak disertakan pada hasil.'); }
  catch (e) { status(message(e)); }
  finally { el<HTMLInputElement>('example').value = ''; el<HTMLInputElement>('env').value = ''; button.disabled = false; }
});
el('filter').addEventListener('change', render);
el('export').addEventListener('click', () => { if (report) download('env-report.json', JSON.stringify(report, null, 2), 'application/json'); });
el('clear').addEventListener('click', () => { report = null; el('result').replaceChildren(); el('count').textContent = 'BELUM DIPERIKSA'; el<HTMLInputElement>('example').value = ''; el<HTMLInputElement>('env').value = ''; el<HTMLButtonElement>('export').disabled = true; status('Hasil dan pilihan file dibersihkan.'); });
