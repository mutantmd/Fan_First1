// 1. APPLICATION STATE
const state = {
  isLoggedIn: false,
  user: {
    name: "Alex",
    fanScore: 100 // Try changing this value later to test gating!
  }
};

// 2. DOM ELEMENT SELECTORS
const authContainer = document.getElementById('auth-container');
const loginBtn = document.getElementById('login-btn');
const reserveBtns = document.querySelectorAll('.reserve-btn');
window.state = state;
console.log("App initialized. Current user score:", state.user.fanScore);
// 3. UI RENDER FUNCTION
function renderAuthUI() {
  if (state.isLoggedIn) {
    authContainer.innerHTML = `
      <div class="user-profile" style="display: flex; align-items: center; gap: 12px;">
        <span class="badge">Fan Score: ${state.user.fanScore}</span>
        <span style="font-weight: 600;">${state.user.name}</span>
        <button id="logout-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Logout</button>
      </div>
    `;

    // Attach listener to the newly created logout button
    document.getElementById('logout-btn').addEventListener('click', toggleAuth);
  } else {
    authContainer.innerHTML = `
      <button id="login-btn">Login / Sign Up</button>
    `;

    // Attach listener to the newly created login button
    document.getElementById('login-btn').addEventListener('click', toggleAuth);
  }
}

// 4. AUTH TOGGLE HANDLER
function toggleAuth() {
  state.isLoggedIn = !state.isLoggedIn;
  renderAuthUI();
}

// Initial Event Listener for Login
loginBtn.addEventListener('click', toggleAuth);
// 5. TICKET RESERVATION GATING LOGIC
function handleReservation(event) {
  // Check if user is logged in first
  if (!state.isLoggedIn) {
    alert("Please log in to participate in fair ticket drops!");
    return;
  }

  // Get the event card element
  const card = event.target.closest('.event-card');
  const eventTitle = card.querySelector('h3').textContent;

  // Extract required score from badge text (e.g., "Req. Fan Score: 80+" -> 80)
  const badgeText = card.querySelector('.badge').textContent;
  const requiredScore = parseInt(badgeText.replace(/[^0-9]/g, ''), 10);

  // Compare user score vs required score
  if (state.user.fanScore >= requiredScore) {
    alert(`Success! Your Fan Score of ${state.user.fanScore} qualifies you for "${eventTitle}". Ticket reserved at face value!`);
  } else {
    alert(`Access Denied: "${eventTitle}" requires a Fan Score of ${requiredScore}+. Your current score is ${state.user.fanScore}.`);
  }
}

// Attach event listeners to all reserve buttons
reserveBtns.forEach(button => {
  button.addEventListener('click', handleReservation);
});
