(function () {
  "use strict";

  const form = document.getElementById("regForm");
  const steps = Array.from(document.querySelectorAll(".form-step"));
  const stepItems = Array.from(document.querySelectorAll(".step-item"));
  const stepperFill = document.getElementById("stepperFill");
  const btnBack = document.getElementById("btnBack");
  const btnNext = document.getElementById("btnNext");
  const btnSubmit = document.getElementById("btnSubmit");
  const regSuccess = document.getElementById("regSuccess");
  const TOTAL_STEPS = steps.length;
  let current = 1;

  /* ---------------- helpers ---------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function setError(group, message) {
    if (!group) return;
    group.classList.add("has-error");
    group.classList.remove("is-valid");
    const p = group.querySelector(".field-error");
    if (p) p.textContent = message;
  }

  function clearError(group) {
    if (!group) return;
    group.classList.remove("has-error");
    group.classList.add("is-valid");
    const p = group.querySelector(".field-error");
    if (p) p.textContent = "";
  }

  function closestGroup(el) {
    return el.closest(".input-group");
  }

  /* ---------------- validators ---------------- */
  const validators = {
    fullName: (v) => (/^[a-zA-Z\s.'-]{3,60}$/.test(v.trim()) ? "" : "Enter your full name as on ID proof"),
    dob: (v) => {
      if (!v) return "Date of birth is required";
      const age = (new Date().getTime() - new Date(v).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return "You must be 18 or older to register";
      if (age > 100) return "Please check the date entered";
      return "";
    },
    mobile: (v) => (/^[6-9]\d{9}$/.test(v.trim()) ? "" : "Enter a valid 10-digit mobile number"),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address"),
    pan: (v) => (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.trim().toUpperCase()) ? "" : "Format should be ABCDE1234F"),
    aadhaar: (v) => (/^\d{4}\s?\d{4}\s?\d{4}$/.test(v.trim()) ? "" : "Enter a valid 12-digit Aadhaar number"),
    address: (v) => (v.trim().length >= 8 ? "" : "Enter your full address"),
    city: (v) => (v.trim().length >= 2 ? "" : "Enter a valid city"),
    state: (v) => (v ? "" : "Select your state"),
    pincode: (v) => (/^\d{6}$/.test(v.trim()) ? "" : "Enter a valid 6-digit pincode"),
    occupation: (v) => (v ? "" : "Select your occupation"),
    nomineeName: (v) => (/^[a-zA-Z\s.'-]{3,60}$/.test(v.trim()) ? "" : "Enter nominee's full name"),
    nomineeRelation: (v) => (v ? "" : "Select relationship"),
    loginEmail: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address"),
    password: (v) => {
      if (v.length < 8) return "Use at least 8 characters";
      if (!/\d/.test(v)) return "Include at least one number";
      if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(v)) return "Include at least one symbol";
      return "";
    },
  };

  function validateField(input) {
    const group = closestGroup(input);
    const name = input.name;
    if (validators[name]) {
      const msg = validators[name](input.value);
      if (msg) {
        setError(group, msg);
        return false;
      }
      clearError(group);
      return true;
    }
    return true;
  }

  /* live formatting */
  const panInput = document.getElementById("pan");
  if (panInput) panInput.addEventListener("input", () => { panInput.value = panInput.value.toUpperCase().slice(0, 10); });

  const aadhaarInput = document.getElementById("aadhaar");
  if (aadhaarInput) {
    aadhaarInput.addEventListener("input", () => {
      let digits = aadhaarInput.value.replace(/\D/g, "").slice(0, 12);
      aadhaarInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    });
  }

  ["mobile", "pincode"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => { el.value = el.value.replace(/\D/g, "").slice(0, id === "mobile" ? 10 : 6); });
  });

  /* keep login email in sync with step-1 email until user edits it */
  const emailInput = document.getElementById("email");
  const loginEmailInput = document.getElementById("loginEmail");
  let loginEmailTouched = false;
  if (loginEmailInput) {
    loginEmailInput.addEventListener("input", () => { loginEmailTouched = true; });
  }
  if (emailInput && loginEmailInput) {
    emailInput.addEventListener("input", () => {
      if (!loginEmailTouched) loginEmailInput.value = emailInput.value;
    });
  }

  /* ---------------- password strength ---------------- */
  const pwInput = document.getElementById("password");
  const pwStrengthBar = document.querySelector(".pw-strength");
  if (pwInput && pwStrengthBar) {
    pwInput.addEventListener("input", () => {
      const v = pwInput.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/\d/.test(v)) score++;
      if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(v)) score++;
      if (v.length >= 12 && /[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      pwStrengthBar.classList.remove("weak", "medium", "strong");
      if (v.length === 0) return;
      if (score <= 1) pwStrengthBar.classList.add("weak");
      else if (score <= 2) pwStrengthBar.classList.add("medium");
      else pwStrengthBar.classList.add("strong");
    });
  }

  /* password visibility toggles */
  $$(".pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const show = target.type === "password";
      target.type = show ? "text" : "password";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  /* confirm password match */
  const confirmInput = document.getElementById("confirmPassword");
  function checkPasswordsMatch() {
    if (!pwInput || !confirmInput || !confirmInput.value) return true;
    const group = closestGroup(confirmInput);
    if (pwInput.value !== confirmInput.value) {
      setError(group, "Passwords do not match");
      return false;
    }
    clearError(group);
    return true;
  }
  if (confirmInput) confirmInput.addEventListener("input", checkPasswordsMatch);

  /* ---------------- plan cards ---------------- */
  const planGrid = document.querySelector(".plan-grid");
  const planError = document.getElementById("planError");

  $$(".plan-card").forEach((card) => {
    const check = card.querySelector(".plan-check");
    const tierBtns = $$(".tier-btn", card);
    tierBtns.forEach((btn, idx) => {
      if (idx === 1) btn.classList.add("is-selected"); // default: Standard
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        tierBtns.forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
      });
    });
    check.addEventListener("change", () => {
      if (check.checked) {
        planGrid.classList.remove("has-error");
        planError.textContent = "";
      }
    });
  });

  function getSelectedPlans() {
    return $$(".plan-check:checked").map((c) => {
      const card = c.closest(".plan-card");
      const tierEl = card.querySelector(".tier-btn.is-selected");
      return { plan: c.value, tier: tierEl ? tierEl.dataset.tier : "Standard" };
    });
  }

  function validatePlans() {
    if (getSelectedPlans().length === 0) {
      planGrid.classList.add("has-error");
      planError.textContent = "Select at least one plan to continue";
      return false;
    }
    planGrid.classList.remove("has-error");
    planError.textContent = "";
    return true;
  }

  /* ---------------- radio group (gender) ---------------- */
  function validateGender() {
    const group = document.querySelector('input[name="gender"]').closest(".input-group");
    const checked = document.querySelector('input[name="gender"]:checked');
    if (!checked) {
      setError(group, "Select an option");
      return false;
    }
    clearError(group);
    return true;
  }

  /* ---------------- checkbox consent ---------------- */
  function validateCheckbox(id, message) {
    const el = document.getElementById(id);
    const group = el.closest(".checkbox-row").parentElement.querySelector(".field-error") ||
                  el.closest(".checkbox-row").nextElementSibling;
    if (!el.checked) {
      if (group) { group.style.display = "block"; group.textContent = message; }
      return false;
    }
    if (group) { group.style.display = "none"; group.textContent = ""; }
    return true;
  }

  /* ---------------- step validation ---------------- */
  function validateStep(stepNum) {
    let valid = true;
    const stepEl = steps[stepNum - 1];

    if (stepNum === 1) {
      ["fullName", "dob", "mobile", "email"].forEach((name) => {
        const el = stepEl.querySelector(`[name="${name}"]`);
        if (!validateField(el)) valid = false;
      });
      if (!validateGender()) valid = false;
    }

    if (stepNum === 2) {
      ["pan", "aadhaar", "address", "city", "state", "pincode", "occupation"].forEach((name) => {
        const el = stepEl.querySelector(`[name="${name}"]`);
        if (!validateField(el)) valid = false;
      });
    }

    if (stepNum === 3) {
      if (!validatePlans()) valid = false;
      ["nomineeName", "nomineeRelation"].forEach((name) => {
        const el = stepEl.querySelector(`[name="${name}"]`);
        if (!validateField(el)) valid = false;
      });
    }

    if (stepNum === 4) {
      const le = stepEl.querySelector('[name="loginEmail"]');
      if (!validateField(le)) valid = false;
      if (!validateField(pwInput)) valid = false;
      if (!checkPasswordsMatch()) valid = false;
      if (!confirmInput.value) { setError(closestGroup(confirmInput), "Confirm your password"); valid = false; }
      if (!validateCheckbox("consentTerms", "You must accept the Terms & Privacy Policy")) valid = false;
      if (!validateCheckbox("consentKyc", "KYC authorisation is required to proceed")) valid = false;
    }

    return valid;
  }

  /* ---------------- navigation ---------------- */
  function goToStep(n) {
    steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
    stepItems.forEach((item) => {
      const num = Number(item.dataset.step);
      item.classList.toggle("is-active", num === n);
      item.classList.toggle("is-complete", num < n);
    });
    stepperFill.style.width = `${((n - 1) / (TOTAL_STEPS - 1)) * 100}%`;
    btnBack.disabled = n === 1;
    btnNext.hidden = n === TOTAL_STEPS;
    btnSubmit.hidden = n !== TOTAL_STEPS;
    current = n;
    document.querySelector(".reg-card").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  btnNext.addEventListener("click", () => {
    if (!validateStep(current)) {
      const firstError = steps[current - 1].querySelector(".has-error, .plan-grid.has-error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (current < TOTAL_STEPS) goToStep(current + 1);
  });

  btnBack.addEventListener("click", () => {
    if (current > 1) goToStep(current - 1);
  });

  /* live-clear errors as user types */
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="password"], select')) {
      validateField(t);
    }
  });

  /* ---------------- submit ---------------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const data = new FormData(form);
    const plans = getSelectedPlans();
    const refNumber = "IA-" + Math.floor(100000 + Math.random() * 900000);
    const firstName = (data.get("fullName") || "").trim().split(" ")[0] || "there";

    document.getElementById("successName").textContent = firstName;
    document.getElementById("refNumber").textContent = refNumber;

    const summary = document.getElementById("successSummary");
    summary.innerHTML = plans
      .map((p) => `<span class="success-tag">${p.plan} · ${p.tier}</span>`)
      .join("");

    form.closest(".reg-card").hidden = true;
    document.querySelector(".stepper").hidden = true;
    document.querySelector(".reg-intro").hidden = true;
    regSuccess.hidden = false;
    regSuccess.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* init */
  goToStep(1);
})();
