import './style.css'

const defaultCppCode = `#include <iostream>
using namespace std;

int main() {
    for(int x = 50; x < 100; x++) {
        cout << x << " Hello!" << endl;
    }
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

// Sidebar buttons
const sidebarExplorer = document.getElementById('sidebarExplorer');
const sidebarSearch   = document.getElementById('sidebarSearch');
const sidebarSettings = document.getElementById('sidebarSettings');
const sidePanel       = document.getElementById('sidePanel');
const panelHistory    = document.getElementById('panelHistory');
const panelSearch     = document.getElementById('panelSearch');
const panelSettings   = document.getElementById('panelSettings');

// ── State ──
const HISTORY_KEY = 'transpiler_history';
let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
let wordWrap = false;
let activeSidebar = 'explorer';

// ── Init ──
cppInput.value = defaultCppCode;
updateLineNumbers();
updateLineCount();
renderHistory();

// ── Sidebar Logic ──
function switchSidebar(name) {
  [sidebarExplorer, sidebarSearch, sidebarSettings].forEach(b => b.classList.remove('active'));
  [panelHistory, panelSearch, panelSettings].forEach(p => p.classList.add('hidden'));

  if (activeSidebar === name) {
    // toggle closed
    sidePanel.style.width = '0px';
    sidePanel.style.minWidth = '0px';
    activeSidebar = null;
    return;
  }

  activeSidebar = name;
  sidePanel.style.width = '220px';
  sidePanel.style.minWidth = '220px';

  if (name === 'explorer') {
    sidebarExplorer.classList.add('active');
    panelHistory.classList.remove('hidden');
  } else if (name === 'search') {
    sidebarSearch.classList.add('active');
    panelSearch.classList.remove('hidden');
  } else if (name === 'settings') {
    sidebarSettings.classList.add('active');
    panelSettings.classList.remove('hidden');
  }
}

sidebarExplorer.addEventListener('click', () => switchSidebar('explorer'));
sidebarSearch.addEventListener('click',   () => switchSidebar('search'));
sidebarSettings.addEventListener('click', () => switchSidebar('settings'));

// ── Line Numbers ──
function updateLineNumbers() {
  const lines = cppInput.value.split('\n').length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
    `<div>${i + 1}</div>`
  ).join('');
}

function updateLineCount() {
  const lines = cppInput.value.split('\n').length;
  const chars = cppInput.value.length;
  cppLineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}, ${chars} chars`;
}

cppInput.addEventListener('input', () => {
  updateLineNumbers();
  updateLineCount();
});

cppInput.addEventListener('scroll', () => {
  lineNumbers.scrollTop = cppInput.scrollTop;
});

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

  if (filtered.length === 0) {
    if (historyEmpty) historyEmpty.style.display = 'block';
    const existing = historyList.querySelectorAll('.history-item');
    existing.forEach(e => e.remove());
    return;
  }

  if (historyEmpty) historyEmpty.style.display = 'none';

  // Remove old items
  historyList.querySelectorAll('.history-item').forEach(e => e.remove());

  filtered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item animate-slideIn';
    item.innerHTML = `
      <div class="text-xs text-gray-300 font-mono truncate mb-1">${escapeHtml(entry.preview)}...</div>
      <div class="text-xs text-gray-600 mb-1.5">${entry.timestamp}</div>
      <div class="flex gap-1">
        <button class="load-btn text-xs bg-blue-900 hover:bg-blue-700 text-blue-300 px-2 py-0.5 rounded transition-colors" data-id="${entry.id}">Load</button>
        <button class="copy-btn text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-0.5 rounded transition-colors" data-id="${entry.id}">Copy</button>
        <button class="delete-btn text-xs bg-gray-800 hover:bg-red-900 text-gray-500 hover:text-red-400 px-2 py-0.5 rounded transition-colors ml-auto" data-id="${entry.id}">✕</button>
      </div>
    `;
    historyList.appendChild(item);
  });

  // Button events
  historyList.querySelectorAll('.load-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(h => h.id === parseInt(btn.dataset.id));
      if (entry) {
        cppInput.value = entry.cppCode;
        pythonOutput.textContent = entry.pythonCode;
        pythonOutput.classList.add('text-gray-100');
        updateLineNumbers();
        updateLineCount();
        logToConsole(`Loaded snippet from ${entry.timestamp}`, 'info');
      }
    });
  });

  historyList.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = history.find(h => h.id === parseInt(btn.dataset.id));
      if (entry) {
        navigator.clipboard.writeText(entry.cppCode);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
        logToConsole('Snippet copied to clipboard', 'success');
      }
    });
  });

  historyList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      history = history.filter(h => h.id !== parseInt(btn.dataset.id));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      renderHistory(filter);
      logToConsole('Snippet removed from history', 'warning');
    });
  });
}

clearHistoryBtn.addEventListener('click', () => {
  history = [];
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  logToConsole('History cleared', 'warning');
});

// Search
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  if (!q) {
    searchResults.innerHTML = '<p class="text-xs text-gray-600 px-4 py-4">Type to search...</p>';
    return;
  }
  const filtered = history.filter(h =>
    h.cppCode.toLowerCase().includes(q.toLowerCase())
  );
  if (filtered.length === 0) {
    searchResults.innerHTML = '<p class="text-xs text-gray-600 px-4 py-4">No results found.</p>';
    return;
  }
  searchResults.innerHTML = '';
  filtered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="text-xs text-gray-300 font-mono truncate mb-1">${escapeHtml(entry.preview)}...</div>
      <div class="text-xs text-gray-600 mb-1.5">${entry.timestamp}</div>
      <div class="flex gap-1">
        <button class="load-btn text-xs bg-blue-900 hover:bg-blue-700 text-blue-300 px-2 py-0.5 rounded" data-id="${entry.id}">Load</button>
        <button class="copy-btn text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-0.5 rounded" data-id="${entry.id}">Copy</button>
      </div>
    `;
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
  wordWrapToggle.classList.toggle('border-blue-500', wordWrap);
  cppInput.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
  pythonOutput.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
});

// ── Console Logger ──
function logToConsole(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info:    'text-gray-400',
    success: 'text-green-400',
    error:   'text-red-400',
    warning: 'text-yellow-400'
  };
  const icons = { info: '›', success: '✓', error: '✗', warning: '⚠' };
  const logEntry = document.createElement('div');
  logEntry.className = `flex gap-2 ${colors[type]}`;
  logEntry.innerHTML = `<span class="opacity-50">${timestamp}</span><span>${icons[type]}</span><span>${escapeHtml(message)}</span>`;
  consoleOutput.appendChild(logEntry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function setStatus(text, color) {
  statusIndicator.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-${color}-400 inline-block"></span> ${text}`;
  statusIndicator.className = `text-xs text-${color}-400 flex items-center gap-1.5`;
}

// ── Transpile ──
async function transpile() {
  const cppCode = cppInput.value.trim();
  if (!cppCode) { logToConsole('C++ input is empty', 'error'); return; }

  logToConsole('Starting transpilation...', 'info');
  setStatus('Transpiling...', 'yellow');
  transpileBtn.disabled = true;
  transpileBtn.innerHTML = `
    <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
    <span class="text-xs font-semibold" style="writing-mode:vertical-rl; letter-spacing:0.12em;">WORKING</span>
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

    pythonOutput.textContent = result.output;
    pythonOutput.classList.remove('text-gray-500');
    pythonOutput.classList.add('text-gray-100');

    const lines = result.output.split('\n').length;
    pythonLineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;

    saveHistory(cppInput.value, result.output);
    logToConsole(`Transpilation successful — ${lines} lines generated`, 'success');
    setStatus('Ready', 'green');

  } catch (error) {
    logToConsole(`Error: ${error.message}`, 'error');
    pythonOutput.textContent = `# Error during transpilation\n# ${error.message}`;
    setStatus('Error', 'red');
    setTimeout(() => setStatus('Ready', 'green'), 3000);
  } finally {
    transpileBtn.disabled = false;
    transpileBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
      </svg>
      <span class="text-xs font-semibold" style="writing-mode:vertical-rl; letter-spacing:0.12em;">TRANSPILE</span>
    `;
  }
}

// ── Button Events ──
transpileBtn.addEventListener('click', transpile);

clearCppBtn.addEventListener('click', () => {
  cppInput.value = '';
  updateLineNumbers();
  updateLineCount();
  logToConsole('Editor cleared', 'info');
});

copyOutputBtn.addEventListener('click', () => {
  const text = pythonOutput.textContent;
  if (!text || text === 'Python output will appear here...') {
    logToConsole('Nothing to copy yet', 'warning');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    logToConsole('Python output copied to clipboard', 'success');
    copyOutputBtn.innerHTML = `
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg> Copied!`;
    setTimeout(() => {
      copyOutputBtn.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg> Copy`;
    }, 2000);
  });
});

downloadBtn.addEventListener('click', () => {
  const text = pythonOutput.textContent;
  if (!text || text === 'Python output will appear here...') {
    logToConsole('Nothing to download yet', 'warning');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.py';
  a.click();
  URL.revokeObjectURL(url);
  logToConsole('Downloaded output.py', 'success');
});

cppInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    transpile();
  }
  // Tab key inserts spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = cppInput.selectionStart;
    const end = cppInput.selectionEnd;
    cppInput.value = cppInput.value.substring(0, start) + '    ' + cppInput.value.substring(end);
    cppInput.selectionStart = cppInput.selectionEnd = start + 4;
    updateLineNumbers();
  }
});

// ── Utils ──
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

logToConsole('Application initialized', 'success');