const state = {
  isLoggedIn: false,
  user: { name: 'Alex', fanScore: 100 },
  reservedTickets: [],
};

window.state = state;

const SCORE_STEP = 10;

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);


// 2. DOM ELEMENT SELECTORS
const authContainer = document.getElementById('auth-container');
const ticketsList = document.getElementById('tickets-list');

const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-status-icon');


// 3. NAVIGATION ROUTER
function navigateToPage(targetPageId) {
  const targetPage = document.getElementById(`page-${targetPageId}`);

  document.querySelectorAll('.page-view').forEach((page) => {
    page.classList.toggle('active-page', page === targetPage);
  });
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === targetPageId);
  });

  // Refresh My Tickets whenever the page is opened
  if (targetPageId === 'my-tickets') renderMyTickets();
}


// 4. UI RENDER FUNCTIONS
const OUTLINE_BUTTON_STYLE =
  'background: transparent; border: 1px solid var(--border-color); border-radius: 4px; cursor: pointer;';

const outlineButton = (id, label, style) =>
  `<button id="${id}" style="${OUTLINE_BUTTON_STYLE} ${style}">${label}</button>`;

const SCORE_BUTTON_STYLE = 'padding: 2px 6px; font-size: 0.75rem; color: var(--text-primary);';
const LOGOUT_BUTTON_STYLE =
  'padding: 4px 8px; font-size: 0.8rem; color: var(--text-secondary); margin-left: 4px;';

const loggedInTemplate = ({ user }) => `
  <div class="user-profile" style="display: flex; align-items: center; gap: 8px;">
    <span class="badge" id="user-score-badge">Fan Score: ${user.fanScore}</span>
    ${outlineButton('score-down-btn', `-${SCORE_STEP}`, SCORE_BUTTON_STYLE)}
    ${outlineButton('score-up-btn', `+${SCORE_STEP}`, SCORE_BUTTON_STYLE)}
    <span style="font-weight: 600; margin-left: 4px;">${escapeHtml(user.name)}</span>
    ${outlineButton('logout-btn', 'Logout', LOGOUT_BUTTON_STYLE)}
  </div>
`;

const loggedOutTemplate = () => `<button id="login-btn" class="btn">Login / Sign Up</button>`;

function renderAuthUI() {
  authContainer.innerHTML = state.isLoggedIn ? loggedInTemplate(state) : loggedOutTemplate();
}

const emptyTicketsTemplate = () => `
  <div class="empty-state">
    <span class="material-symbols-outlined" style="font-size: 48px; color: var(--text-muted);">confirmation_number</span>
    <p>You haven't reserved any tickets yet.</p>
    <a href="#" class="btn btn-secondary nav-link" data-page="home">Explore Drops</a>
  </div>
`;

const reservedTicketTemplate = ({ title, details, price }) => `
  <div class="event-card">
    <div class="badge">CONFIRMED RESERVATION</div>
    <h3>${escapeHtml(title)}</h3>
    <p class="event-details">${escapeHtml(details)}</p>
    <p class="price">${escapeHtml(price)}</p>
    <button class="btn btn-secondary" disabled>Reserved ✓</button>
  </div>
`;

function renderMyTickets() {
  if (!ticketsList) return;

  ticketsList.innerHTML = state.reservedTickets.length === 0
    ? emptyTicketsTemplate()
    : `<div class="events-grid">${state.reservedTickets.map(reservedTicketTemplate).join('')}</div>`;
}


// 5. AUTH & SCORE HANDLERS
function toggleAuth() {
  state.isLoggedIn = !state.isLoggedIn;
  renderAuthUI();
}

function updateScore(amount) {
  state.user.fanScore = Math.max(0, state.user.fanScore + amount);
  renderAuthUI();
}

// One listener for every auth-bar button; the bar is re-rendered, so it can't hold its own listeners.
const AUTH_ACTIONS = new Map([
  ['login-btn', toggleAuth],
  ['logout-btn', toggleAuth],
  ['score-up-btn', () => updateScore(SCORE_STEP)],
  ['score-down-btn', () => updateScore(-SCORE_STEP)],
]);

authContainer.addEventListener('click', ({ target }) => {
  AUTH_ACTIONS.get(target.closest('button')?.id)?.();
});


// 6. MODAL CONTROL HELPERS
function showModal({ title, message, icon, isSuccess = true }) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.textContent = icon;
  modalIcon.style.color = isSuccess ? 'var(--accent-primary)' : 'var(--accent-danger)';
  modalOverlay.classList.remove('hidden');
}

const closeModal = () => modalOverlay.classList.add('hidden');

// Close button, action button, or a click on the backdrop itself
modalOverlay.addEventListener('click', ({ target }) => {
  if (target === modalOverlay || target.closest('#modal-close-btn, #modal-action-btn')) {
    closeModal();
  }
});


// 7. TICKET RESERVATION LOGIC
function readEventCard(card) {
  const text = (selector) => card.querySelector(selector).textContent;

  return {
    title: text('h3'),
    details: text('.event-details'),
    // .price also holds a <small> note, so only its first text node is the price
    price: card.querySelector('.price').firstChild.textContent.trim(),
    requiredScore: parseInt(text('.badge').replace(/\D/g, ''), 10),
  };
}

function handleReservation(button) {
  if (!state.isLoggedIn) {
    showModal({
      title: 'Authentication Required',
      message: 'Please log in to your FanFirst account to participate in fair-access ticket drops.',
      icon: '🔒',
      isSuccess: false,
    });
    return;
  }

  const { title: eventTitle, details, price, requiredScore } =
    readEventCard(button.closest('.event-card'));
  const { fanScore } = state.user;

  // Kept as ">=" (not "<" with the branches swapped) so a missing score requirement (NaN) is denied
  if (fanScore >= requiredScore) {
    state.reservedTickets.push({ title: eventTitle, details, price });

    showModal({
      title: 'Ticket Reserved!',
      message: `Success! Your Fan Score of ${fanScore} meets the ${requiredScore}+ requirement for "${eventTitle}". Your face-value ticket has been reserved.`,
      icon: '🎉',
    });

    button.textContent = 'Reserved ✓';
    button.disabled = true;
  } else {
    showModal({
      title: 'Access Restricted',
      message: `"${eventTitle}" requires a minimum Fan Score of ${requiredScore}+. Your current Fan Score is ${fanScore}.`,
      icon: '🚫',
      isSuccess: false,
    });
  }
}


// 8. PAGE-WIDE CLICK DELEGATION (reserve buttons + navigation links)
document.addEventListener('click', (event) => {
  const reserveButton = event.target.closest('.reserve-btn');
  if (reserveButton) {
    handleReservation(reserveButton);
    return;
  }

  const page = event.target.closest('.nav-link')?.dataset.page;
  if (page) {
    event.preventDefault();
    navigateToPage(page);
  }
});


// INITIAL RENDER
renderAuthUI();
