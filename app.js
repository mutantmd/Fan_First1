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
      <div class="user-profile" style="display: flex; align-items: center; gap: 12px;">
        <span class="badge">Fan Score: ${state.user.fanScore}</span>
        <span style="font-weight: 600;">${state.user.name}</span>
        <button id="logout-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">Logout</button>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', toggleAuth);
  } else {
    authContainer.innerHTML = `
      <button id="login-btn">Login / Sign Up</button>
    `;

    document.getElementById('login-btn').addEventListener('click', toggleAuth);
  }
}

// 4. AUTH TOGGLE HANDLER
function toggleAuth() {
  state.isLoggedIn = !state.isLoggedIn;
  renderAuthUI();
}

loginBtn.addEventListener('click', toggleAuth);

// 5. MODAL CONTROL HELPERS
function showModal(title, message, iconSymbol, isSuccess = true) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.textContent = iconSymbol;

  if (isSuccess) {
    modalIcon.style.color = "var(--accent-green)";
  } else {
    modalIcon.style.color = "#ef4444";
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

// 6. TICKET RESERVATION LOGIC (NO ALERTS)
function handleReservation(event) {
  if (!state.isLoggedIn) {
    showModal(
      "Authentication Required",
      "Please log in to your FanFirst account to participate in fair-access ticket drops.",
      "🔒",
      false
    );
    return;
  }

  const card = event.target.closest('.event-card');
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
  } else {
    showModal(
      "Access Restricted",
      `"${eventTitle}" requires a minimum Fan Score of ${requiredScore}+. Your current Fan Score is ${state.user.fanScore}.`,
      "🚫",
      false
    );
  }
}

reserveBtns.forEach(button => {
  button.addEventListener('click', handleReservation);
});
