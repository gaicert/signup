// ===== 設定（★ 部署前請修改）=====
// Apps Script 部署後取得的網頁應用程式網址（結尾是 /exec）
const API_URL = 'https://script.google.com/macros/s/AKfycbxD7n5yNyn7T2Y8-ALHUMFQx_ZVrWkLNLRU3DPULSvp4KXmrmceeEm-E5-ekLmTA4sH/exec';

const CENTER_NAME = '公務AI共通核心能力認證服務中心';
const CENTER_URL = 'https://gaic.csf.org.tw/gaic';
const ASK = '請聯繫公務AI認證服務中心';

// ===== 共用工具 =====
async function api(action, data) {
  let res;
  try {
    // 用 text/plain 送出，避免 Apps Script 不支援的 CORS 預檢請求
    res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: action }, data || {})) });
  } catch (e) {
    throw Object.assign(new Error('網路連線失敗，請稍後再試。'), { code: 'network' });
  }
  let j;
  try { j = await res.json(); } catch (e) { throw Object.assign(new Error('系統回應異常，請稍後再試。'), { code: 'bad_response' }); }
  if (!j.ok) throw Object.assign(new Error(j.message || '發生錯誤，請稍後再試。'), { code: j.code || '' });
  return j;
}
const $ = (s) => document.querySelector(s);
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function fmt(s) { return s ? String(s).replace('T', ' ').slice(0, 16).replace(/-/g, '/') : '—'; }
function fmtDay(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return `${s.replace(/-/g, '/')}（${'日一二三四五六'[new Date(y, m - 1, d).getDay()]}）`;
}
function validNid(id) {
  if (!/^[A-Z][12]\d{8}$/.test(id)) return false;
  const n = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'.indexOf(id[0]) + 10;
  let sum = Math.floor(n / 10) + (n % 10) * 9;
  for (let i = 1; i <= 8; i++) sum += Number(id[i]) * (9 - i);
  sum += Number(id[9]);
  return sum % 10 === 0;
}
const CONTACT_HTML = `<a href="${CENTER_URL}" target="_blank" rel="noopener">${CENTER_NAME}</a>`;
function stateCard(cls, tag, title, body) {
  return `<section class="card state"><span class="pill ${cls}">${esc(tag)}</span><h1 class="state-title">${esc(title)}</h1><p class="muted" style="margin:0;max-width:420px">${esc(body)}</p><p class="small" style="margin:4px 0 0">${CONTACT_HTML}</p></section>`;
}
function showErr(el, msg) {
  const lines = String(msg).split('\n');
  el.innerHTML = lines.length > 1 ? `請修正以下問題：<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : esc(msg);
  el.hidden = false;
  el.scrollIntoView({ block: 'nearest' });
}
