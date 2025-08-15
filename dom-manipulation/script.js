let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 10000; // 10 seconds

// --- LOCAL STORAGE ---
function loadQuotesFromLocalStorage() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
}
function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// --- CATEGORY ---
function populateCategories() {
  const sel = document.getElementById('categoryFilter');
  sel.innerHTML = `<option value="all">All Categories</option>`;
  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
  const lastCat = localStorage.getItem('selectedCategory');
  if (lastCat) sel.value = lastCat;
}

// --- QUOTE DISPLAY ---
function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  if (!filtered.length) {
    document.getElementById('quoteDisplay').innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById('quoteDisplay').innerHTML = `<p>"${quote.text}"</p><small>- ${quote.category}</small>`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}
function loadLastViewedQuote() {
  const last = sessionStorage.getItem('lastQuote');
  if (last) {
    const q = JSON.parse(last);
    document.getElementById('quoteDisplay').innerHTML = `<p>"${q.text}"</p><small>- ${q.category}</small>`;
  }
}

// --- ADD / FILTER ---
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const cat = document.getElementById('newQuoteCategory').value.trim();
  if (text && cat) {
    quotes.push({ text, category: cat });
    saveQuotesToLocalStorage();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    notifyUser("Quote added successfully!", "update");
  } else alert("Fill both fields.");
}
function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', category);
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  if (!filtered.length) {
    document.getElementById('quoteDisplay').innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }
  const firstQuote = filtered[0];
  document.getElementById('quoteDisplay').innerHTML = `<p>"${firstQuote.text}"</p><small>- ${firstQuote.category}</small>`;
}

// --- EXPORT / IMPORT ---
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}
function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      if (Array.isArray(imported)) {
        quotes = imported;
        saveQuotesToLocalStorage();
        populateCategories();
        notifyUser("Quotes imported successfully!", "update");
      } else alert("Invalid file format");
    } catch {
      alert("Error reading file");
    }
  };
  reader.readAsText(file);
}

// --- SERVER SYNC ---
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }));
  } catch (err) { console.error(err); return []; }
}

async function postQuotesToServer(localQuotes) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localQuotes)
    });
  } catch (err) { console.error(err); }
}

async function syncQuotes() {
  try {
    await postQuotesToServer(quotes);
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false, conflict = false;

    serverQuotes.forEach(sq => {
      const match = quotes.find(lq => lq.text === sq.text);
      if (!match) { quotes.push(sq); updated = true; }
      else if (JSON.stringify(match) !== JSON.stringify(sq)) {
        const idx = quotes.indexOf(match);
        quotes[idx] = sq; updated = true; conflict = true;
      }
    });

    if (updated) {
      saveQuotesToLocalStorage();
      populateCategories();
      if (conflict) notifyUser("Conflicts detected: Server data replaced local entries.", "conflict");
      else notifyUser("Quotes updated from server.", "update");
    }
  } catch (err) { console.error(err); }
}

// --- NOTIFICATIONS ---
function notifyUser(msg, type = "update") {
  const area = document.getElementById("notificationArea");
  const note = document.createElement("div");
  note.className = `notification ${type}`;
  note.textContent = msg;
  area.appendChild(note);
  setTimeout(() => {
    note.style.opacity = '0';
    setTimeout(() => note.remove(), 300);
  }, 8000);
}

// --- EVENT LISTENERS ---
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importQuotesFile').addEventListener('change', importFromJsonFile);

// --- INIT ---
loadQuotesFromLocalStorage();
populateCategories();
filterQuotes();
loadLastViewedQuote();
setInterval(syncQuotes, SYNC_INTERVAL); // periodic server check
