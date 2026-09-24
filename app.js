// 1. APPLICATION STATE
const state = {
  isLoggedIn: false,
  user: {
    name: "Alex",
    fanScore: 100
  }
};

window.state = state;

// 2. DOM ELEMENT SELECTORS
const authContainer = document.getElementById('auth-container');
const loginBtn = document.getElementById('login-btn');
const reserveBtns = document.querySelectorAll('.reserve-btn');

// MODAL DOM ELEMENTS
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalActionBtn = document.getElementById('modal-action-btn');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-status-icon');

// 3. UI RENDER FUNCTION
function renderAuthUI() {
  if (state.isLoggedIn) {
    authContainer.innerHTML = `
      <div class="user-profile" style="display: flex; align-items: center; gap: 8px;">
        <span class="badge" id="user-score-badge">Fan Score: ${state.user.fanScore}</span>
        <button id="score-down-btn" style="padding: 2px 6px; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--border-color); background: transparent; color: white; cursor: pointer;">-10</button>
        <button id="score-up-btn" style="padding: 2px 6px; font-size: 0.75rem; border-radius: 4px; border: 1px solid var(--border-color); background: transparent; color: white; cursor: pointer;">+10</button>
        <span style="font-weight: 600; margin-left: 4px;">${state.user.name}</span>
        <button id="logout-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 4px; cursor: pointer;">Logout</button>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', toggleAuth);
    document.getElementById('score-up-btn').addEventListener('click', () => updateScore(10));
    document.getElementById('score-down-btn').addEventListener('click', () => updateScore(-10));
  } else {
    authContainer.innerHTML = `
      <button id="login-btn" class="btn">Login / Sign Up</button>
    `;

    document.getElementById('login-btn').addEventListener('click', toggleAuth);
  }
}

// 4. AUTH & SCORE HANDLERS
function toggleAuth() {
  state.isLoggedIn = !state.isLoggedIn;
  renderAuthUI();
}

function updateScore(amount) {
  state.user.fanScore = Math.max(0, state.user.fanScore + amount);
  renderAuthUI();
}

loginBtn?.addEventListener('click', toggleAuth);

// 5. MODAL CONTROL HELPERS
function showModal(title, message, iconSymbol, isSuccess = true) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.textContent = iconSymbol;

  if (isSuccess) {
    modalIcon.style.color = "var(--accent-primary)";
  } else {
    modalIcon.style.color = "var(--accent-danger)";
  }

  modalOverlay.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

modalCloseBtn.addEventListener('click', closeModal);
modalActionBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// 6. TICKET RESERVATION LOGIC
function handleReservation(event) {
  const targetBtn = event.target;

  if (!state.isLoggedIn) {
    showModal(
      "Authentication Required",
      "Please log in to your FanFirst account to participate in fair-access ticket drops.",
      "🔒",
      false
    );
    return;
  }

  const card = targetBtn.closest('.event-card');
  const eventTitle = card.querySelector('h3').textContent;
  const badgeText = card.querySelector('.badge').textContent;
  const requiredScore = parseInt(badgeText.replace(/[^0-9]/g, ''), 10);

  if (state.user.fanScore >= requiredScore) {
    showModal(
      "Ticket Reserved!",
      `Success! Your Fan Score of ${state.user.fanScore} meets the ${requiredScore}+ requirement for "${eventTitle}". Your face-value ticket has been reserved.`,
      "🎉",
      true
    );

    // LOCK BUTTON STATE (Styling handled cleanly by CSS disabled state)
    targetBtn.textContent = "Reserved ✓";
    targetBtn.disabled = true;
  } else {
    showModal(
      "Access Restricted",
      `"${eventTitle}" requires a minimum Fan Score of ${requiredScore}+. Your current Fan Score is ${state.user.fanScore}.`,
      "🚫",
      false
    );
  }
}

// Attach event listeners to all reserve buttons
reserveBtns.forEach(button => {
  button.addEventListener('click', handleReservation);
});
