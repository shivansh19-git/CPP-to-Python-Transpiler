import './style.css'

const defaultCppCode = `#include <iostream>
using namespace std;

int main() {
    for(int x = 50; x < 100; x++) {
        cout << x << " Hello!" << endl;
    }
    return 0;
}`;

const app = document.querySelector('#app');

app.innerHTML = `
  <!-- Main Container -->
  <div class="h-screen flex flex-col bg-editor-bg text-white">

    <!-- Top Navigation Bar -->
    <header class="bg-editor-panel border-b border-editor-border px-6 py-3 flex items-center justify-between shadow-lg">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
          <h1 class="text-xl font-semibold">C++ <span class="text-blue-400">→</span> Python Transpiler</h1>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button class="p-2 hover:bg-gray-700 rounded transition-colors" title="Settings">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">

      <!-- Left Panel: C++ Input -->
      <div class="flex-1 flex flex-col bg-editor-panel rounded-lg shadow-2xl border border-editor-border overflow-hidden animate-fadeIn">
        <div class="bg-gray-800 px-4 py-2 border-b border-editor-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="ml-2 text-sm text-gray-400 font-mono">input.cpp</span>
          </div>
          <button id="clearCpp" class="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-gray-700 rounded">
            Clear
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4 relative">
          <textarea
            id="cppInput"
            class="code-editor w-full h-full bg-transparent text-gray-100 resize-none focus:outline-none"
            placeholder="Enter your C++ code here..."
            spellcheck="false"
          >${defaultCppCode}</textarea>
        </div>
      </div>

      <!-- Transpile Button (Vertical Center) -->
      <div class="flex items-center justify-center lg:flex-col gap-4">
        <button
          id="transpileBtn"
          class="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 glow-blue-hover flex items-center gap-2 group"
        >
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
          <span>Transpile</span>
        </button>
      </div>

      <!-- Right Panel: Python Output -->
      <div class="flex-1 flex flex-col bg-editor-panel rounded-lg shadow-2xl border border-editor-border overflow-hidden animate-fadeIn">
        <div class="bg-gray-800 px-4 py-2 border-b border-editor-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="ml-2 text-sm text-gray-400 font-mono">output.py</span>
          </div>
          <button id="copyOutput" class="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-gray-700 rounded flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <pre id="pythonOutput" class="code-editor text-gray-400 whitespace-pre-wrap">Python output will appear here...</pre>
        </div>
      </div>
    </div>

    <!-- Terminal/Console Output -->
    <div class="bg-editor-panel border-t border-editor-border px-4 py-3 h-32 overflow-auto">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-sm font-semibold text-gray-300">Console</span>
      </div>
      <div id="console" class="font-mono text-xs text-gray-400 space-y-1">
        <div class="text-green-400">Ready to transpile...</div>
      </div>
    </div>
  </div>
`;

// Get elements
const transpileBtn = document.getElementById('transpileBtn');
const cppInput = document.getElementById('cppInput');
const pythonOutput = document.getElementById('pythonOutput');
const consoleOutput = document.getElementById('console');
const clearCppBtn = document.getElementById('clearCpp');
const copyOutputBtn = document.getElementById('copyOutput');

// Console logger
function logToConsole(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colors = {
    info: 'text-gray-400',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400'
  };

  const logEntry = document.createElement('div');
  logEntry.className = colors[type];
  logEntry.textContent = `[${timestamp}] ${message}`;
  consoleOutput.appendChild(logEntry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Transpile function
async function transpile() {
  const cppCode = cppInput.value.trim();

  if (!cppCode) {
    logToConsole('Error: C++ input is empty', 'error');
    return;
  }

  logToConsole('Starting transpilation...', 'info');
  transpileBtn.disabled = true;
  transpileBtn.innerHTML = `
    <svg class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581
        m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
      </path>
    </svg>
    <span>Transpiling...</span>
  `;

  try {
    const response = await fetch("http://localhost:5000/transpile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: cppCode })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Transpilation failed");
    }

    pythonOutput.textContent = result.output;
    pythonOutput.classList.add("text-gray-100");
    logToConsole("Transpilation completed successfully!", "success");

  } catch (error) {
    logToConsole(`Error: ${error.message}`, 'error');
    pythonOutput.textContent = 'Error during transpilation. Check console for details.';
  } finally {
    transpileBtn.disabled = false;
    transpileBtn.innerHTML = `
      <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 7l5 5m0 0l-5 5m5-5H6">
        </path>
      </svg>
      <span>Transpile</span>
    `;
  }
}

// Event listeners
transpileBtn.addEventListener('click', transpile);

clearCppBtn.addEventListener('click', () => {
  cppInput.value = '';
  logToConsole('C++ input cleared', 'info');
});

copyOutputBtn.addEventListener('click', () => {
  const outputText = pythonOutput.textContent;
  navigator.clipboard.writeText(outputText).then(() => {
    logToConsole('Python output copied to clipboard', 'success');
    copyOutputBtn.innerHTML = `
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Copied!
    `;
    setTimeout(() => {
      copyOutputBtn.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        Copy
      `;
    }, 2000);
  });
});

// Handle Enter key with Ctrl/Cmd
cppInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    transpile();
  }
});

logToConsole('Application initialized', 'success');
