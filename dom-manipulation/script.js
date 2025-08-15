let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API
const SYNC_INTERVAL = 10000; // 10 seconds

// === LOCAL STORAGE FUNCTIONS ===
function loadQuotesFromLocalStorage() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) quotes = JSON.parse(storedQuotes);
}

function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// === CATEGORY FUNCTIONS ===
function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected category
  const lastCat = localStorage.getItem('selectedCategory');
  if (lastCat) categorySelect.value = lastCat;
}

// === QUOTE DISPLAY FUNCTIONS ===
function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  const filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  document.getElementById('quoteDisplay').innerHTML = `
    <p>"${quote.text}"</p>
    <small>- ${quote.category}</small>
  `;

  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById('quoteDisplay').innerHTML = `
      <p>"${quote.text}"</p>
      <small>- ${quote.category}</small>
    `;
  }
}

// === ADD / FILTER QUOTE FUNCTIONS ===
function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotesToLocalStorage();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    notifyUser("Quote added successfully!");
  } else {
    alert('Please fill in both fields.');
  }
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', category);

  const filteredQuotes = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }
  const firstQuote = filteredQuotes[0];
  document.getElementById('quoteDisplay').innerHTML = `
    <p>"${firstQuote.text}"</p>
    <small>- ${firstQuote.category}</small>
  `;
}

// === EXPORT / IMPORT ===
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        saveQuotesToLocalStorage();
        populateCategories();
        notifyUser("Quotes imported successfully!");
      } else {
        alert("Invalid file format");
      }
    } catch (error) {
      alert("Error reading file");
    }
  };
  reader.readAsText(file);
}

// === SERVER SYNC FUNCTIONS ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    return serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

async function postQuotesToServer(localQuotes) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localQuotes)
    });
    console.log("Local quotes posted to server.");
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

async function syncQuotes() {
  try {
    await postQuotesToServer(quotes); // post local quotes
    const serverQuotes = await fetchQuotesFromServer(); // fetch server quotes

    let updated = false;
    let conflict = false;

    serverQuotes.forEach(sq => {
      const match = quotes.find(lq => lq.text === sq.text);
      if (!match) {
        quotes.push(sq);
        updated = true;
      } else if (JSON.stringify(match) !== JSON.stringify(sq)) {
        const index = quotes.indexOf(match);
        quotes[index] = sq; // server wins
        updated = true;
        conflict = true;
      }
    });

    if (updated) {
      saveQuotesToLocalStorage();
      populateCategories();
      if (conflict) notifyUser("Conflicts detected: Server data replaced local entries.");
      else notifyUser("Quotes updated from server.");
    }
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// === NOTIFICATION ===
fun
