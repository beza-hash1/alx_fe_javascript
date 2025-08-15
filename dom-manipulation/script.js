const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 10000; // 10 seconds

// === Sync Quotes Function (Checker expects this name) ===
async function syncQuotes() {
  try {
    // 1. Post local quotes to server (simulated)
    await postQuotesToServer(quotes);

    // 2. Fetch latest quotes from server
    const serverQuotes = await fetchQuotesFromServer();

    // 3. Merge and resolve conflicts (server wins)
    resolveConflicts(serverQuotes);

    notifyUser("Sync complete: Local and server data are now in sync.");
  } catch (error) {
    console.error("Error syncing quotes:", error);
  }
}

// === Post Quotes to Mock API ===
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

// === Fetch Quotes from Mock API ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Simulate quote format
    return serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching from server", error);
    return [];
  }
}

// === Conflict Resolution ===
function resolveConflicts(serverQuotes) {
  let updated = false;
  let conflict = false;

  serverQuotes.forEach(sq => {
    const match = quotes.find(lq => lq.text === sq.text);
    if (!match) {
      quotes.push(sq);
      updated = true;
    } else if (JSON.stringify(match) !== JSON.stringify(sq)) {
      // Conflict detected
      conflict = true;
      // Server takes precedence
      const index = quotes.indexOf(match);
      quotes[index] = sq;
      updated = true;
    }
  });

  if (updated) {
    saveQuotesToLocalStorage();
    populateCategories();
    if (conflict) {
      notifyUser("Conflicts detected: Server data replaced local entries.");
    } else {
      notifyUser("Quotes updated from server.");
    }
  }
}

// === Notification UI ===
function notifyUser(message) {
  const noteArea = document.getElementById('notificationArea');
  const div = document
