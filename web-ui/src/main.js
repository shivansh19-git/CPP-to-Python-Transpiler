import './style.css'

const defaultCppCode = `#include <iostream>
using namespace std;

int main() {
    cout << " Hello!";
    int i;
    cin >> i;
    cout << i;
    return 0;
}`;

// ── Elements ──
const transpileBtn    = document.getElementById('transpileBtn');
const cppInput        = document.getElementById('cppInput');
const pythonOutput    = document.getElementById('pythonOutput');
const consoleOutput   = document.getElementById('console');
const clearCppBtn     = document.getElementById('clearCpp');
const copyOutputBtn   = document.getElementById('copyOutput');
const downloadBtn     = document.getElementById('downloadBtn');
const lineNumbers     = document.getElementById('lineNumbers');
const cppLineCount    = document.getElementById('cppLineCount');
const pythonLineCount = document.getElementById('pythonLineCount');
const historyList     = document.getElementById('historyList');
const historyEmpty    = document.getElementById('historyEmpty');
const clearHistoryBtn = document.getElementById('clearHistory');
const searchInput     = document.getElementById('searchInput');
const searchResults   = document.getElementById('searchResults');
const fontSizeSlider  = document.getElementById('fontSizeSlider');
const fontSizeLabel   = document.getElementById('fontSizeLabel');
const wordWrapToggle  = document.getElementById('wordWrapToggle');
const maxHistorySelect= document.getElementById('maxHistorySelect');
const statusIndicator = document.getElementById('statusIndicator');
const sidebarExplorer = document.getElementById('sidebarExplorer');
const sidebarSearch   = document.getElementById('sidebarSearch');
const sidebarSettings = document.getElementById('sidebarSettings');
const sidePanel       = document.getElementById('sidePanel');
const panelHistory    = document.getElementById('panelHistory');
const panelSearch     = document.getElementById('panelSearch');
const panelSettings   = document.getElementById('panelSettings');
const themeToggle     = document.getElementById('themeToggle');
const themeIcon       = document.getElementById('themeIcon');

// ── State ──
const HISTORY_KEY = 'transpiler_history';
const THEME_KEY   = 'transpiler_theme';
let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
let wordWrap = false;
let activeSidebar = 'explorer';
let typewriterTimer = null;

// ── Theme ──
const moonSVG = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
const sunSVG  = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>`;

function applyTheme(isLight) {
  if (isLight) {
    document.body.classList.add('light');
    themeIcon.innerHTML = sunSVG;
  } else {
    document.body.classList.remove('light');
    themeIcon.innerHTML = moonSVG;
  }
  localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
}

applyTheme(localStorage.getItem(THEME_KEY) === 'light');
themeToggle.addEventListener('click', () => applyTheme(!document.body.classList.contains('light')));

// ── Typewriter Animation ──
function typewriterAnimate(text) {
  pythonOutput.textContent = '';
  pythonOutput.classList.remove('typing-cursor');
  if (typewriterTimer) clearInterval(typewriterTimer);

  let i = 0;
  const speed = Math.max(4, Math.min(18, Math.floor(2500 / text.length)));

  pythonOutput.classList.add('typing-cursor');
  typewriterTimer = setInterval(() => {
    if (i < text.length) {
      pythonOutput.textContent += text[i];
      pythonOutput.scrollTop = pythonOutput.scrollHeight;
      i++;
    } else {
      clearInterval(typewriterTimer);
      pythonOutput.classList.remove('typing-cursor');
      pythonOutput.style.color = 'var(--text-primary)';
    }
  }, speed);
}

// ── Init ──
cppInput.value = defaultCppCode;
updateLineNumbers();
updateLineCount();
renderHistory();

// ── Sidebar ──
function switchSidebar(name) {
  [sidebarExplorer, sidebarSearch, sidebarSettings].forEach(b => b.classList.remove('active'));
  [panelHistory, panelSearch, panelSettings].forEach(p => p.classList.add('hidden'));

  if (activeSidebar === name) {
    sidePanel.style.width = '0px';
    sidePanel.style.minWidth = '0px';
    activeSidebar = null;
    return;
  }

  activeSidebar = name;
  sidePanel.style.width = '220px';
  sidePanel.style.minWidth = '220px';

  if (name === 'explorer') { sidebarExplorer.classList.add('active'); panelHistory.classList.remove('hidden'); }
  else if (name === 'search')   { sidebarSearch.classList.add('active');   panelSearch.classList.remove('hidden'); }
  else if (name === 'settings') { sidebarSettings.classList.add('active'); panelSettings.classList.remove('hidden'); }
}

sidebarExplorer.addEventListener('click', () => switchSidebar('explorer'));
sidebarSearch.addEventListener('click',   () => switchSidebar('search'));
sidebarSettings.addEventListener('click', () => switchSidebar('settings'));

// ── Line Numbers ──
function updateLineNumbers() {
  const lines = cppInput.value.split('\n').length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
}

function updateLineCount() {
  const lines = cppInput.value.split('\n').length;
  const chars = cppInput.value.length;
  cppLineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}, ${chars} chars`;
}

cppInput.addEventListener('input', () => { updateLineNumbers(); updateLineCount(); });
cppInput.addEventListener('scroll', () => { lineNumbers.scrollTop = cppInput.scrollTop; });

// ── History ──
function saveHistory(cppCode, pythonCode) {
  const maxItems = parseInt(maxHistorySelect.value);
  const entry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    cppCode,
    pythonCode,
    preview: cppCode.trim().split('\n')[0].slice(0, 40)
  };
  history.unshift(entry);
  if (history.length > maxItems) history = history.slice(0, maxItems);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory(filter = '') {
  const filtered = filter
    ? history.filter(h => h.cppCode.toLowerCase().includes(filter.toLowerCase()))
    : history;

  historyList.querySelectorAll('.history-item').forEach(e => e.remove());

  if (filtered.length === 0) {
    if (historyEmpty) historyEmpty.style.display = 'block';
    return;
  }
  if (historyEmpty) historyEmpty.style.display = 'none';

  filtered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item animate-slideIn';
    item.innerHTML = `
      <div class="text-xs font-mono truncate mb-1 v-text">${escapeHtml(entry.preview)}...</div>
      <div class="text-xs v-muted mb-1.5">${entry.timestamp}</div>
      <div class="flex gap-1">
        <button class="load-btn text-xs px-2 py-0.5 rounded transition-colors" style="background:rgba(37,99,235,0.15);color:var(--accent)" data-id="${entry.id}">Load</button>
        <button class="copy-btn text-xs px-2 py-0.5 rounded transition-colors" style="background:var(--bg-hover);color:var(--text-muted)" data-id="${entry.id}">Copy</button>
        <button class="delete-btn text-xs px-2 py-0.5 rounded transition-colors ml-auto" style="background:var(--bg-hover);color:var(--text-faint)" data-id="${entry.id}">✕</button>
      </div>
    `;
    historyList.appendChild(item);
  });

  historyList.querySelectorAll('.load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(h => h.id === parseInt(btn.dataset.id));
      if (entry) {
        cppInput.value = entry.cppCode;
        pythonOutput.textContent = entry.pythonCode;
        pythonOutput.style.color = 'var(--text-primary)';
        updateLineNumbers(); updateLineCount();
        logToConsole(`Loaded snippet from ${entry.timestamp}`, 'info');
      }
    });
  });

  historyList.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(h => h.id === parseInt(btn.dataset.id));
      if (entry) { navigator.clipboard.writeText(entry.cppCode); btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); }
    });
  });

  historyList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      history = history.filter(h => h.id !== parseInt(btn.dataset.id));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      renderHistory(filter);
    });
  });
}

clearHistoryBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  logToConsole('History cleared', 'warning');
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) { searchResults.innerHTML = '<p class="text-xs v-muted px-4 py-4">Type to search...</p>'; return; }
  const filtered = history.filter(h => h.cppCode.toLowerCase().includes(q.toLowerCase()));
  searchResults.innerHTML = filtered.length === 0
    ? '<p class="text-xs v-muted px-4 py-4">No results found.</p>'
    : '';
  filtered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="text-xs font-mono truncate mb-1 v-text">${escapeHtml(entry.preview)}...</div>
      <div class="text-xs v-muted mb-1.5">${entry.timestamp}</div>
      <div class="flex gap-1">
        <button class="load-btn text-xs px-2 py-0.5 rounded" style="background:rgba(37,99,235,0.15);color:var(--accent)" data-id="${entry.id}">Load</button>
        <button class="copy-btn text-xs px-2 py-0.5 rounded" style="background:var(--bg-hover);color:var(--text-muted)" data-id="${entry.id}">Copy</button>
      </div>`;
    searchResults.appendChild(item);
  });
  searchResults.querySelectorAll('.load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(h => h.id === parseInt(btn.dataset.id));
      if (entry) { cppInput.value = entry.cppCode; updateLineNumbers(); updateLineCount(); switchSidebar('explorer'); }
    });
  });
  searchResults.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(h => h.id === parseInt(btn.dataset.id));
      if (entry) navigator.clipboard.writeText(entry.cppCode);
    });
  });
});

// ── Settings ──
fontSizeSlider.addEventListener('input', () => {
  const size = fontSizeSlider.value;
  fontSizeLabel.textContent = `${size}px`;
  document.querySelectorAll('.code-editor').forEach(el => el.style.fontSize = `${size}px`);
});

wordWrapToggle.addEventListener('click', () => {
  wordWrap = !wordWrap;
  wordWrapToggle.textContent = wordWrap ? 'On' : 'Off';
  cppInput.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
  pythonOutput.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
});

// ── Console Logger ──
function logToConsole(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = { info:'var(--text-muted)', success:'#22c55e', error:'#ef4444', warning:'#f59e0b' };
  const icons  = { info:'›', success:'✓', error:'✗', warning:'⚠' };
  const logEntry = document.createElement('div');
  logEntry.className = 'flex gap-2';
  logEntry.style.color = colors[type];
  logEntry.innerHTML = `<span style="opacity:0.5">${timestamp}</span><span>${icons[type]}</span><span>${escapeHtml(message)}</span>`;
  consoleOutput.appendChild(logEntry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function setStatus(text, color) {
  statusIndicator.style.color = color;
  statusIndicator.innerHTML = `<span class="w-1.5 h-1.5 rounded-full inline-block" style="background:${color}"></span> ${text}`;
}

// ── Transpile ──
async function transpile() {
  const cppCode = cppInput.value.trim();
  if (!cppCode) { logToConsole('C++ input is empty', 'error'); return; }

  logToConsole('Starting transpilation...', 'info');
  setStatus('Transpiling...', '#f59e0b');
  transpileBtn.disabled = true;
  transpileBtn.innerHTML = `
    <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
    <span class="text-xs font-semibold" style="writing-mode:vertical-rl;letter-spacing:0.12em;">WORKING</span>
  `;

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/transpile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cppCode })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Transpilation failed');

    const lines = result.output.split('\n').length;
    pythonLineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;

    // Typewriter animation!
    typewriterAnimate(result.output);

    saveHistory(cppInput.value, result.output);
    logToConsole(`Transpilation successful — ${lines} lines generated`, 'success');
    setStatus('Ready', '#22c55e');

  } catch (error) {
    logToConsole(`Error: ${error.message}`, 'error');
    pythonOutput.textContent = `# Error during transpilation\n# ${error.message}`;
    pythonOutput.style.color = '#ef4444';
    setStatus('Error', '#ef4444');
    setTimeout(() => setStatus('Ready', '#22c55e'), 3000);
  } finally {
    transpileBtn.disabled = false;
    transpileBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
      </svg>
      <span class="text-xs font-semibold" style="writing-mode:vertical-rl;letter-spacing:0.12em;">TRANSPILE</span>
    `;
  }
}

// ── Events ──
transpileBtn.addEventListener('click', transpile);

clearCppBtn.addEventListener('click', () => {
  cppInput.value = '';
  updateLineNumbers(); updateLineCount();
  logToConsole('Editor cleared', 'info');
});

copyOutputBtn.addEventListener('click', () => {
  const text = pythonOutput.textContent;
  if (!text || text === 'Python output will appear here...') { logToConsole('Nothing to copy yet', 'warning'); return; }
  navigator.clipboard.writeText(text).then(() => {
    logToConsole('Python output copied to clipboard', 'success');
    copyOutputBtn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Copied!`;
    setTimeout(() => {
      copyOutputBtn.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy`;
    }, 2000);
  });
});

downloadBtn.addEventListener('click', () => {
  const text = pythonOutput.textContent;
  if (!text || text === 'Python output will appear here...') { logToConsole('Nothing to download yet', 'warning'); return; }
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'output.py'; a.click();
  URL.revokeObjectURL(url);
  logToConsole('Downloaded output.py', 'success');
});

cppInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); transpile(); }
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = cppInput.selectionStart, end = cppInput.selectionEnd;
    cppInput.value = cppInput.value.substring(0, s) + '    ' + cppInput.value.substring(end);
    cppInput.selectionStart = cppInput.selectionEnd = s + 4;
    updateLineNumbers();
  }
});

// ── Utils ──
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

logToConsole('Application initialized', 'success');
