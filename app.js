// 1. APPLICATION STATE
const state = {
  isLoggedIn: false,
  user: {
    name: "Alex",
    fanScore: 100
  },
  reservedTickets: []
};

window.state = state;

// 2. DOM ELEMENT SELECTORS
const authContainer = document.getElementById('auth-container');
const reserveBtns = document.querySelectorAll('.reserve-btn');
const ticketsList = document.getElementById('tickets-list');

// MODAL DOM ELEMENTS
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalActionBtn = document.getElementById('modal-action-btn');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-status-icon');

// 3. NAVIGATION ROUTER
function navigateToPage(targetPageId) {
  const pageViews = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.nav-link');

  // Hide all page views
  pageViews.forEach(page => page.classList.remove('active-page'));

  // Show target page view
  const targetPage = document.getElementById(`page-${targetPageId}`);
  if (targetPage) {
    targetPage.classList.add('active-page');
  }

  // Update active state on navigation links
  navLinks.forEach(link => {
    if (link.dataset.page === targetPageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Refresh My Tickets if navigating to that page
  if (targetPageId === 'my-tickets') {
    renderMyTickets();
  }
}

// Event Delegation for Navigation Links
document.addEventListener('click', (e) => {
  const navLink = e.target.closest('.nav-link');
  if (navLink && navLink.dataset.page) {
    e.preventDefault();
    navigateToPage(navLink.dataset.page);
  }
});

// 4. UI RENDER FUNCTIONS
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

function renderMyTickets() {
  if (!ticketsList) return;

  if (state.reservedTickets.length === 0) {
    ticketsList.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined" style="font-size: 48px; color: var(--text-muted);">confirmation_number</span>
        <p>You haven't reserved any tickets yet.</p>
        <a href="#" class="btn btn-secondary nav-link" data-page="home">Explore Drops</a>
      </div>
    `;
  } else {
    ticketsList.innerHTML = `
      <div class="events-grid">
        ${state.reservedTickets.map(ticket => `
          <div class="event-card">
            <div class="badge">CONFIRMED RESERVATION</div>
            <h3>${ticket.title}</h3>
            <p class="event-details">${ticket.details}</p>
            <p class="price">${ticket.price}</p>
            <button class="btn btn-secondary" disabled>Reserved ✓</button>
          </div>
        `).join('')}
      </div>
    `;
  }
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

// 6. MODAL CONTROL HELPERS
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

// 7. TICKET RESERVATION LOGIC
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
  const eventDetails = card.querySelector('.event-details').textContent;
  const price = card.querySelector('.price').childNodes[0].textContent.trim();
  const badgeText = card.querySelector('.badge').textContent;
  const requiredScore = parseInt(badgeText.replace(/[^0-9]/g, ''), 10);

  if (state.user.fanScore >= requiredScore) {
    state.reservedTickets.push({
      title: eventTitle,
      details: eventDetails,
      price: price
    });

    showModal(
      "Ticket Reserved!",
      `Success! Your Fan Score of ${state.user.fanScore} meets the ${requiredScore}+ requirement for "${eventTitle}". Your face-value ticket has been reserved.`,
      "🎉",
      true
    );

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

reserveBtns.forEach(button => {
  button.addEventListener('click', handleReservation);
});

// INITIAL RENDER
renderAuthUI();
