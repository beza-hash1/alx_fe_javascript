let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// === STORAGE FUNCTIONS ===
function loadQuotesFromLocalStorage() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveQuotesToLocalStorage() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// === CATEGORY FUNCTIONS ===
function populateCategories() {
  const categorySelect = document.getElementById('categoryFilter');
  categorySelect.innerHTML = `<option value="all">All Categories</option>`; // reset

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Restore last selected category from localStorage
  const lastCat = localStorage.getItem('selectedCategory');
  if (lastCat) {
    categorySelect.value = lastCat;
  }
}

// === QUOTE FUNCTIONS ===
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

function addQuote() {
  const quoteText = document.getElementById('newQuoteText').value.trim();
  const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotesToLocalStorage();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
  } else {
    alert('Please fill in both fields.');
  }
}

// === FILTER FUNCTION ===
function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;

  // Save selected category to localStorage
  localStorage.setItem('selectedCategory', category);

  // Filter quotes and display first one
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

// === EXPORT/IMPORT ===
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
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format");
      }
    } catch (error) {
      alert("Error reading file");
    }
  };
  reader.readAsText(file);
}

// === EVENT LISTENERS ===
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importQuotesFile').addEventListener('change', importFromJsonFile);

// === INITIALIZATION ===
loadQuotesFromLocalStorage();
populateCategories();
filterQuotes(); // This will load based on restored category
loadLastViewedQuote();
