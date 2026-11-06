export interface Finding { source: string; key: string | null; line: number | null; severity: 'error' | 'warning'; kind: string; advice: string }
interface Entry { value: string; line: number; quoted: boolean }
interface Parsed { entries: Map<string, Entry>; findings: Finding[] }
function parse(text: string, source: string): Parsed {
  const entries = new Map<string, Entry>(), findings: Finding[] = [];
  const issue = (line: number, key: string | null, kind: string, advice: string) => findings.push({ source, line, key, kind, advice, severity: 'error' });
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].trim(); if (!text || text.startsWith('#')) continue;
    const match = text.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]{0,127})\s*=\s*(.*)$/);
    if (!match) { issue(i + 1, null, 'format', 'Gunakan KEY=nilai dengan nama key yang valid. Isi baris sengaja tidak ditampilkan.'); continue; }
    const [, key, initial] = match; let value = initial, quoted = false; const line = i + 1;
    if (initial.startsWith('"') || initial.startsWith("'")) {
      quoted = true; const quote = initial[0]; let end = -1, escaped = false;
      let raw = initial.slice(1);
      for (;;) {
        escaped = false;
        for (let p = 0; p < raw.length; p++) { if (quote === '"' && raw[p] === '\\' && !escaped) { escaped = true; continue; } if (raw[p] === quote && !escaped) { end = p; break; } escaped = false; }
        if (end >= 0 || i >= lines.length - 1) break;
        raw += '\n' + lines[++i];
      }
      if (end < 0) { issue(line, key, 'kutip', 'Tutup nilai dengan jenis tanda kutip yang sama.'); continue; }
      if (raw.slice(end + 1).trim() && !raw.slice(end + 1).trim().startsWith('#')) { issue(line, key, 'format', 'Hapus karakter setelah penutup kutip atau gunakan komentar.'); continue; }
      value = raw.slice(0, end);
    } else {
      value = value.replace(/(?:^|\s+)#.*$/, '').trimEnd();
      if (/\s/.test(value)) issue(line, key, 'format', 'Gunakan tanda kutip untuk nilai yang mengandung spasi.');
    }
    if (entries.has(key)) issue(line, key, 'duplikat', 'Sisakan satu deklarasi key; periksa baris ' + entries.get(key)!.line + ' dan ' + line + '.');
    entries.set(key, { value, line, quoted });
  }
  return { entries, findings };
}
export interface Report { exampleKeys: number; envKeys: number; findings: Finding[]; includesValues: false }
export function checkEnv(example: string, env: string): Report {
  if (example.length > 1000000 || env.length > 1000000) throw new Error('Batas setiap file 1 MB.');
  const a = parse(example, '.env.example'), b = parse(env, '.env');
  const findings = [...a.findings, ...b.findings];
  for (const key of a.entries.keys()) if (!b.entries.has(key)) findings.push({ source: '.env', key, line: null, severity: 'error', kind: 'hilang', advice: 'Tambahkan key ini menggunakan nilai dari lingkungan Anda.' });
  for (const [key, item] of b.entries) {
    const { value, line, quoted } = item;
    const warn = (kind: string, advice: string, severity: 'error' | 'warning' = 'warning') => findings.push({ source: '.env', key, line, kind, advice, severity });
    if (value === '' || (!quoted && /^(null|\(null\)|empty|\(empty\))$/i.test(value))) warn('kosong', 'Isi nilai jika key dibutuhkan. Nilai kosong dapat disengaja untuk konfigurasi opsional.');
    if (/^(DB_PORT|MAIL_PORT|REDIS_PORT|MEMCACHED_PORT|APP_PORT)$/.test(key) && value && (!/^\d+$/.test(value) || +value < 1 || +value > 65535)) warn('port', 'Gunakan port berupa angka 1–65535.', 'error');
    if (key === 'APP_DEBUG' && !/^(true|false|\(true\)|\(false\))$/i.test(value)) warn('boolean', 'Gunakan true atau false untuk APP_DEBUG.', 'error');
    if (key === 'APP_URL' && value && !value.includes('$' + '{')) { try { const u = new URL(value); if (!['http:', 'https:'].includes(u.protocol)) throw new Error(); } catch { warn('url', 'Gunakan URL HTTP/HTTPS lengkap untuk APP_URL.', 'error'); } }
    for (const match of value.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)) if (!b.entries.has(match[1])) warn('referensi', 'Referensi key ' + match[1] + ' tidak ditemukan di file. Pastikan tersedia di environment sistem bila disengaja.');
  }
  return { exampleKeys: a.entries.size, envKeys: b.entries.size, findings, includesValues: false };
}
