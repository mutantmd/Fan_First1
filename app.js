document.addEventListener("DOMContentLoaded", () => {
  // 1. Event Data
  const events = [
    {
      id: 1,
      name: "Valorant Masters Watchparty",
      details: "Sat 17 Oct · 6:00 PM · Electronic City, Bengaluru",
      price: 499,
      tag: "Selling Fast"
    },
    {
      id: 2,
      name: "Midnight Electronic Sessions",
      details: "Sat 24 Oct · 9:00 PM · Indiranagar, Bengaluru",
      price: 1299,
      tag: "Popular"
    },
    {
      id: 3,
      name: "Open Air Sci-Fi Cinema Night",
      details: "Sun 1 Nov · 7:30 PM · Koramangala, Bengaluru",
      price: 699,
      tag: "New"
    },
    {
      id: 4,
      name: "Standup Comedy Cellar Special",
      details: "Fri 6 Nov · 8:00 PM · Church Street, Bengaluru",
      price: 899,
      tag: "Limited Passes"
    }
  ];

  const MIN = 1;
  const MAX = 50;

  // Track state
  const qty = Object.fromEntries(events.map(e => [e.id, 1]));
  const orders = [];
  let userSignedIn = false;

  // Currency Formatter
  const inr = n => "₹" + n.toLocaleString("en-IN");

  // DOM Reference Elements
  const grid = document.getElementById("events-grid");
  const ticketsBox = document.getElementById("tickets-container");

  // Order Modal
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  const modalClose = document.getElementById("modal-close");
  const modalView = document.getElementById("modal-view");

  // Auth Modal
  const authModal = document.getElementById("auth-modal");
  const openAuthBtn = document.getElementById("open-auth-btn");
  const authClose = document.getElementById("auth-close");
  const authForm = document.getElementById("auth-form");

  // 2. Render Events Grid
  function renderEvents() {
    if (!grid) return;

    grid.innerHTML = events.map(e => `
      <article class="event-card">
        <span class="badge">${e.tag}</span>
        <h3>${e.name}</h3>
        <p class="event-details">${e.details}</p>
        <p class="price">${inr(e.price)} <small>per ticket</small></p>

        <div class="qty-control" data-id="${e.id}">
          <button type="button" class="qty-btn" data-step="-10" title="-10 tickets" aria-label="Remove 10 tickets">−10</button>
          <button type="button" class="qty-btn" data-step="-1" title="-1 ticket" aria-label="Remove 1 ticket">−</button>
          <span class="qty-value" aria-live="polite">${qty[e.id]}</span>
          <button type="button" class="qty-btn" data-step="1" title="+1 ticket" aria-label="Add 1 ticket">+</button>
          <button type="button" class="qty-btn" data-step="10" title="+10 tickets" aria-label="Add 10 tickets">+10</button>
        </div>

        <button type="button" class="btn" data-buy="${e.id}">Get Tickets</button>
      </article>
    `).join("");

    events.forEach(syncControls);
  }

  // 3. Synchronize Quantity Controls State
  function syncControls(e) {
    const box = grid.querySelector(`.qty-control[data-id="${e.id}"]`);
    if (!box) return;

    const currentQty = qty[e.id];
    box.querySelector(".qty-value").textContent = currentQty;

    box.querySelectorAll(".qty-btn").forEach(btn => {
      const step = Number(btn.dataset.step);
      const nextValue = currentQty + step;
      btn.disabled = nextValue < MIN || nextValue > MAX;
    });
  }

  // 4. Render Purchased Tickets View
  function renderTickets() {
    if (!ticketsBox) return;

    if (!orders.length) {
      ticketsBox.innerHTML = `
        <div class="empty-state">
          <p>You haven't purchased any tickets yet.</p>
          <button type="button" class="btn btn-secondary" data-page="home">Browse Upcoming Events</button>
        </div>`;
      return;
    }

    ticketsBox.innerHTML = `
      <div class="events-grid">
        ${orders.map(o => `
          <article class="event-card">
            <span class="badge">Confirmed Pass</span>
            <h3>${o.name}</h3>
            <p class="event-details">${o.details}</p>
            <p class="price">${o.count} Pass${o.count > 1 ? "es" : ""} × ${inr(o.price)}</p>
            <p class="event-details"><strong>Total Paid:</strong> ${inr(o.count * o.price)}</p>
          </article>
        `).join("")}
      </div>`;
  }

  // 5. Page Routing Handler
  function showPage(pageName) {
    document.querySelectorAll(".page-view").forEach(p => {
      p.classList.toggle("active-page", p.id === "page-" + pageName);
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.page === pageName);
    });

    if (pageName === "tickets") {
      renderTickets();
    }
  }

  // 6. Interaction Event Handlers
  grid.addEventListener("click", ev => {
    const qtyBtn = ev.target.closest(".qty-btn");
    if (qtyBtn) {
      const card = qtyBtn.closest(".qty-control");
      const id = Number(card.dataset.id);
      const step = Number(qtyBtn.dataset.step);

      qty[id] = Math.min(MAX, Math.max(MIN, qty[id] + step));
      syncControls(events.find(e => e.id === id));
      return;
    }

    const buyBtn = ev.target.closest("[data-buy]");
    if (buyBtn) {
      const id = Number(buyBtn.dataset.buy);
      const eventObj = events.find(x => x.id === id);
      const count = qty[id];

      orders.push({ ...eventObj, count });

      modalText.textContent = `${count} ticket${count > 1 ? "s" : ""} confirmed for ${eventObj.name}. Total: ${inr(count * eventObj.price)}.`;
      modal.classList.remove("hidden");
    }
  });

  // Navigation Links
  document.addEventListener("click", ev => {
    const navItem = ev.target.closest("[data-page]");
    if (navItem) {
      ev.preventDefault();
      showPage(navItem.dataset.page);
    }
  });

  // Modal Closures
  const closeModal = targetModal => targetModal.classList.add("hidden");

  modalClose.addEventListener("click", () => closeModal(modal));
  modalView.addEventListener("click", () => {
    closeModal(modal);
    showPage("tickets");
  });

  // Auth Modal Triggers
  openAuthBtn.addEventListener("click", () => {
    if (userSignedIn) {
      userSignedIn = false;
      openAuthBtn.textContent = "Sign In";
      openAuthBtn.classList.remove("btn-secondary");
    } else {
      authModal.classList.remove("hidden");
    }
  });

  authClose.addEventListener("click", () => closeModal(authModal));

  authForm.addEventListener("submit", ev => {
    ev.preventDefault();
    userSignedIn = true;
    openAuthBtn.textContent = "Account";
    openAuthBtn.classList.add("btn-secondary");
    closeModal(authModal);
  });

  // Overlay & Escape Key listeners for all modals
  [modal, authModal].forEach(m => {
    m.addEventListener("click", ev => { if (ev.target === m) closeModal(m); });
  });

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape") {
      closeModal(modal);
      closeModal(authModal);
    }
  });

  // Initial Load
  renderEvents();
});
