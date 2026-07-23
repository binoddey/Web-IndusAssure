(function () {
  "use strict";

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll(".reveal-up");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ============ PROTECTION SCORE RING + COUNTERS ============ */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || "0");
    const prefix = el.dataset.prefix || "";
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateRing(ringEl) {
    const target = parseFloat(ringEl.dataset.target || "0");
    const numEl = document.getElementById("ringNum");
    ringEl.classList.remove("skeleton");
    let current = 0;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(target * eased);
      ringEl.style.setProperty("--pct", current);
      if (numEl) numEl.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains("counter")) {
          animateCounter(entry.target);
        } else if (entry.target.id === "protectionRing") {
          animateRing(entry.target);
        } else if (entry.target.classList.contains("progress-fill")) {
          const pct = entry.target.dataset.target || "0";
          entry.target.style.width = pct + "%";
        }
        statsObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll(".counter").forEach((el) => statsObserver.observe(el));
  const ring = document.getElementById("protectionRing");
  if (ring) statsObserver.observe(ring);
  document.querySelectorAll(".progress-fill").forEach((el) => statsObserver.observe(el));

  /* ============ SIDEBAR TOGGLE (mobile) ============ */
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  let scrim = document.querySelector(".scrim");
  if (!scrim) {
    scrim = document.createElement("div");
    scrim.className = "scrim";
    document.body.appendChild(scrim);
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    scrim.classList.remove("open");
    sidebarToggle.setAttribute("aria-expanded", "false");
  }
  function openSidebar() {
    sidebar.classList.add("open");
    scrim.classList.add("open");
    sidebarToggle.setAttribute("aria-expanded", "true");
  }
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  scrim.addEventListener("click", closeSidebar);

  /* ============ NAV ACTIVE STATE (sidebar + bottom nav) ============ */
  const sideLinks = document.querySelectorAll(".side-link, .bn-link");
  const sections = Array.from(document.querySelectorAll(".section-block, #dashboard"));

  sideLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeSidebar();
      const key = link.dataset.nav;
      sideLinks.forEach((l) => {
        if (l.dataset.nav === key) l.classList.add("is-active");
        else l.classList.remove("is-active");
      });
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          sideLinks.forEach((l) => {
            l.classList.toggle("is-active", l.dataset.nav === id);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((sec) => sec.id && sectionObserver.observe(sec));

  /* ============ NOTIFICATIONS PANEL ============ */
  const notifBtn = document.getElementById("notifBtn");
  const notifPanel = document.getElementById("notifPanel");
  const markAllRead = document.getElementById("markAllRead");

  function toggleNotif(force) {
    const open = force !== undefined ? force : !notifPanel.classList.contains("open");
    notifPanel.classList.toggle("open", open);
    notifBtn.setAttribute("aria-expanded", String(open));
  }
  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNotif();
  });
  document.addEventListener("click", (e) => {
    if (!notifPanel.contains(e.target) && e.target !== notifBtn) toggleNotif(false);
  });
  markAllRead.addEventListener("click", () => {
    document.querySelectorAll(".notif-item.unread").forEach((n) => n.classList.remove("unread"));
    document.querySelector(".notif-dot").style.display = "none";
  });

  const settingsBtn = document.getElementById("settingsBtn");
  settingsBtn.addEventListener("click", () => {
    window.location.hash = "#settings-section";
    showToast("Opening Settings…");
  });

  /* ============ POLICY EXPAND / COLLAPSE ============ */
  document.querySelectorAll(".policy-expand").forEach((btn) => {
    btn.addEventListener("click", () => {
      const details = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      details.classList.toggle("open", !expanded);
    });
  });

  /* ============ TOAST ============ */
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  document.querySelectorAll("[data-toast]").forEach((el) => {
    el.addEventListener("click", () => showToast(el.dataset.toast));
  });

  const emergencyHandler = () =>
    showToast("Connecting you to Emergency Assistance — a specialist will call within 2 minutes.");
  document.getElementById("emergencyBtn").addEventListener("click", emergencyHandler);
  const emergencyBtn2 = document.getElementById("emergencyBtn2");
  if (emergencyBtn2) emergencyBtn2.addEventListener("click", emergencyHandler);

  /* ============ MODALS ============ */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  const modalContent = {
    buyInsurance: () => `
      <h2>Buy Insurance</h2>
      <p>Tell us what you'd like to protect and we'll match you with the right plan.</p>
      <div class="modal-field">
        <label for="mBuyType">Insurance Type</label>
        <select id="mBuyType">
          <option>Health</option><option>Motor</option><option>Travel</option><option>Home</option><option>Life / Term</option>
        </select>
      </div>
      <div class="modal-field">
        <label for="mBuyCover">Desired Coverage (₹)</label>
        <input type="text" id="mBuyCover" placeholder="e.g. 10,00,000">
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Get Quotes</button>
      </div>`,
    fileClaim: () => `
      <h2>File a Claim</h2>
      <p>Select the policy you're claiming against — our AI Claims Assistant will guide the rest.</p>
      <div class="modal-field">
        <label for="mClaimPolicy">Policy</label>
        <select id="mClaimPolicy">
          <option>IndusHealth Secure+ — IA-HLT-88231</option>
          <option>IndusDrive Comprehensive — IA-MTR-40217</option>
          <option>IndusGo Worldwide — IA-TRV-11309</option>
          <option>IndusHome Shield — IA-HOM-77042</option>
        </select>
      </div>
      <div class="modal-field">
        <label for="mClaimDesc">What happened?</label>
        <input type="text" id="mClaimDesc" placeholder="Briefly describe the incident">
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Start Claim</button>
      </div>`,
    viewPolicy: (data) => `
      <h2>${data.policy || "Policy Details"}</h2>
      <p>Full policy documents, coverage terms, and nominee details are available in your Documents vault.</p>
      <div class="modal-field"><label>Status</label><input type="text" value="Active" disabled></div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="modalPrimaryAction" style="flex:1">Download Policy PDF</button>
        <button class="btn btn-outline" id="modalCloseAction" style="flex:1">Close</button>
      </div>`,
    renewPolicy: (data) => `
      <h2>Renew ${data.policy || "Policy"}</h2>
      <p>Your renewal premium has been calculated based on your latest no-claim bonus.</p>
      <div class="modal-field"><label>Renewal Premium</label><input type="text" value="₹8,120 / year" disabled></div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Pay & Renew</button>
      </div>`,
    improveScore: () => `
      <h2>Improve My Score</h2>
      <p>These actions will have the biggest impact on your Protection Score:</p>
      <div class="modal-field">
        <label>1. Add Term Insurance</label>
        <label>2. Top up Home Contents cover</label>
        <label>3. Add a Family Floater for parents</label>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Start with Term Insurance</button>
      </div>`,
    closeGap: (data) => `
      <h2>Close Gap: ${data.gap || "Coverage Gap"}</h2>
      <p>Our AI recommends the following plan to close this protection gap quickly.</p>
      <div class="modal-field"><label>Recommended Cover</label><input type="text" value="Based on your profile" disabled></div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">View Recommended Plan</button>
      </div>`,
    uploadDocs: () => `
      <h2>Upload Documents</h2>
      <p>Drag and drop files, or choose from your device. Accepted: PDF, JPG, PNG (max 10MB).</p>
      <div class="upload-zone">
        <p>📄 Drop files here or click to browse</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Upload</button>
      </div>`,
    comparePolicies: () => `
      <h2>Compare Policies</h2>
      <p>Choose up to 3 policies to compare side-by-side on coverage, premium, and exclusions.</p>
      <div class="modal-field">
        <label for="mCompare1">Policy A</label>
        <select id="mCompare1"><option>IndusHealth Secure+</option><option>IndusHealth Basic</option></select>
      </div>
      <div class="modal-field">
        <label for="mCompare2">Policy B</label>
        <select id="mCompare2"><option>IndusHealth Premium</option><option>IndusHealth Elite</option></select>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Compare</button>
      </div>`,
    contactAdvisor: () => `
      <h2>Contact Advisor</h2>
      <p>Your dedicated advisor typically responds within 30 minutes on business days.</p>
      <div class="modal-field">
        <label for="mAdvisorMsg">Message</label>
        <input type="text" id="mAdvisorMsg" placeholder="How can we help?">
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" id="modalPrimaryAction" style="flex:1">Send Message</button>
      </div>`,
  };

  function openModal(key, data) {
    const builder = modalContent[key];
    if (!builder) return;
    modalBody.innerHTML = builder(data || {});
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    const primary = document.getElementById("modalPrimaryAction");
    if (primary) {
      primary.addEventListener("click", () => {
        closeModal();
        showToast("Done — we'll take it from here.");
      });
    }
    const closeAction = document.getElementById("modalCloseAction");
    if (closeAction) closeAction.addEventListener("click", closeModal);
  }
  function closeModal() {
    modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-modal]").forEach((el) => {
    el.addEventListener("click", () => {
      openModal(el.dataset.modal, { policy: el.dataset.policy, gap: el.dataset.gap });
    });
  });
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      toggleNotif(false);
    }
  });

  /* ============ AI COPILOT CHAT ============ */
  const copilotForm = document.getElementById("copilotForm");
  const copilotInput = document.getElementById("copilotInput");
  const copilotChat = document.getElementById("copilotChat");

  const botReplies = [
    "Based on your current policies, that looks covered — but let me double check your exclusions and get back with specifics.",
    "Good question. I'd recommend adding a rider for that — want me to fetch a quote?",
    "You're partially covered for this. I can suggest a top-up that closes the gap for a small premium increase.",
  ];

  function appendMessage(text, from) {
    const wrap = document.createElement("div");
    wrap.className = "chat-msg " + from;
    wrap.innerHTML =
      from === "bot"
        ? `<span class="chat-avatar" aria-hidden="true">✦</span><div class="chat-bubble"><p></p></div>`
        : `<div class="chat-bubble"><p></p></div>`;
    wrap.querySelector("p").textContent = text;
    copilotChat.appendChild(wrap);
    copilotChat.scrollTop = copilotChat.scrollHeight;
  }

  if (copilotForm) {
    copilotForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = copilotInput.value.trim();
      if (!value) return;
      appendMessage(value, "user");
      copilotInput.value = "";
      setTimeout(() => {
        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        appendMessage(reply, "bot");
      }, 600);
    });
  }

  document.querySelectorAll(".chip-btn").forEach((btn) => {
    if (btn.dataset.toast) {
      btn.addEventListener("click", () => showToast(btn.dataset.toast));
    }
  });

  /* ============ DARK MODE TOGGLE ============ */
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    darkToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode", darkToggle.checked);
    });
  }

  /* ============ TOPBAR SHADOW ON SCROLL ============ */
  const topbar = document.getElementById("topbar");
  const mainEl = document.getElementById("main");
  mainEl.addEventListener("scroll", () => {
    topbar.style.boxShadow = mainEl.scrollTop > 4 ? "var(--shadow-sm)" : "none";
  });
})();
