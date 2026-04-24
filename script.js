// ---------- Static homepage / cards / tips ----------

const servicesData = [
  {
    title: "Heart Disease Prediction",
    desc: "Evaluate cardiovascular risk with cholesterol, ECG, and lifestyle markers.",
  },
  {
    title: "Diabetes Check",
    desc: "Assess glucose trends, BMI, insulin, and pedigree factors to classify risk.",
  },
  {
    title: "Blood Pressure Check",
    desc: "Log systolic/diastolic values plus habits to pinpoint hypertension stages.",
  },
  {
    title: "BMI & Body Composition",
    desc: "Monitor weight trends with contextual coaching and habit reminders.",
  },
  {
    title: "Cholesterol Profile",
    desc: "Track HDL, LDL, triglycerides and receive actionable nutrition tips.",
  },
  {
    title: "Liver Function",
    desc: "Spot liver stress early through ILPD markers and probability insights.",
  },
];

const timelineFeed = [
  { test: "Kidney Function", region: "Pune, IN", movement: "+42%", status: "Spike" },
  { test: "Heart Disease", region: "Doha, QA", movement: "+18%", status: "Trending" },
  { test: "Diabetes Panel", region: "Bengaluru, IN", movement: "-9%", status: "Stabilizing" },
  { test: "Thyroid Function", region: "Singapore", movement: "+22%", status: "Rising" },
];

const healthTips = [
  "Hydrate before every fasting test for accurate readings.",
  "Pair every report with 10 minutes of reflection to plan next steps.",
  "Consistency beats intensity—track metrics weekly instead of sporadically.",
  "Sleep quality changes most blood biomarker trends. Target 7+ hours.",
  "Share your dashboard with a clinician to co-create lifestyle nudges.",
];

// Backend API base URL
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://suswastha.onrender.com";

const USERS_KEY = "suswastha_users";
const REPORTS_KEY = "suswastha_reports";
const OTP_STORE_KEY = "suswastha_pending_otps";

// Theme key for dark/light mode
const THEME_KEY = "suswastha_theme";

// ---------- Helpers ----------

function getCurrentUserEmail() {
  return localStorage.getItem("suswastha_email") || null;
}

function setCurrentUserEmail(email) {
  localStorage.setItem("suswastha_email", email);
}

// ✅ NEW: store full profile (name, email, dob)
function getCurrentUserProfile() {
  const raw = localStorage.getItem("suswastha_profile");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCurrentUserProfile(profile) {
  localStorage.setItem("suswastha_profile", JSON.stringify(profile));
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

function validPassword(password) {
  return /^(?=.*\d).{6,}$/.test(password || "");
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getReports() {
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getReportsForEmail(email) {
  return getReports().filter((report) => report.email === email);
}

function getOtpStore() {
  try {
    return JSON.parse(localStorage.getItem(OTP_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setOtpStore(store) {
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
}

// ---------- Scroll animations ----------

function setupScrollAnimations() {
  const elements = document.querySelectorAll("[data-animate]");
  if (!elements.length) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
  } else {
    elements.forEach((el) => el.classList.add("visible"));
  }
}

// ---------- Dark mode ----------

function applyTheme(theme) {
  const body = document.body;
  if (theme === "dark") body.classList.add("dark");
  else body.classList.remove("dark");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  let theme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(theme);
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = document.body.classList.contains("dark") ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
}

// ---------- Ask SuSwastha widget ----------

function setupAskWidget() {
  const toggleBtn = document.getElementById("ask-toggle");
  const closeBtn = document.getElementById("ask-close");
  const panel = document.getElementById("ask-panel");
  const form = document.getElementById("ask-form");
  const input = document.getElementById("ask-input");
  const messages = document.getElementById("ask-messages");

  if (!toggleBtn || !panel || !form || !input || !messages) return;

  const openPanel = () => panel.classList.add("open");
  const closePanel = () => panel.classList.remove("open");

  toggleBtn.addEventListener("click", () =>
    panel.classList.contains("open") ? closePanel() : openPanel()
  );
  if (closeBtn) closeBtn.addEventListener("click", closePanel);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const userDiv = document.createElement("div");
    userDiv.className = "msg msg-user";
    userDiv.textContent = text;
    messages.appendChild(userDiv);

    const botDiv = document.createElement("div");
    botDiv.className = "msg msg-bot";
    botDiv.textContent =
      "Thanks for your question! SuSwastha can help you run screenings and generate reports. " +
      "For personal medical advice or emergencies, please consult a doctor or hospital.";
    messages.appendChild(botDiv);

    messages.scrollTop = messages.scrollHeight;
    input.value = "";
  });
}

// ---------- MAIN INIT ----------

document.addEventListener("DOMContentLoaded", () => {
  const yearTarget = document.getElementById("year");
  if (yearTarget) yearTarget.textContent = new Date().getFullYear();

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Simple forms
  document.querySelectorAll("[data-simple-submit]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Thanks! Our care team will respond shortly.");
      form.reset();
    });
  });

  // Home page cards
  const servicesGrid = document.getElementById("services-grid");
  if (servicesGrid) {
    servicesGrid.innerHTML = servicesData
      .map(
        (s) => `<article class="service-card"><h3>${s.title}</h3><p>${s.desc}</p></article>`
      )
      .join("");
  }

  // Timeline
  const timelineTarget = document.getElementById("timeline-feed");
  if (timelineTarget) {
    timelineTarget.innerHTML = timelineFeed
      .map(
        (e) => `
        <div class="timeline-item">
          <div class="timeline-meta">
            <h4>${e.test}</h4>
            <p class="muted">${e.region}</p>
          </div>
          <span class="pill">${e.status} · ${e.movement}</span>
        </div>`
      )
      .join("");
  }

  // Health tips
  const tipTarget = document.getElementById("health-tip");
  const shuffleTipBtn = document.getElementById("shuffle-tip");
  if (tipTarget && shuffleTipBtn) {
    shuffleTipBtn.addEventListener("click", () => {
      tipTarget.textContent = healthTips[Math.floor(Math.random() * healthTips.length)];
    });
  }

  // ✅ Auto-fill report email with logged-in email
  const reportEmailInput = document.querySelector('#report-generator input[name="email"]');
  if (reportEmailInput) {
    const loggedEmail = getCurrentUserEmail();
    if (loggedEmail) reportEmailInput.value = loggedEmail;
  }

  setupScrollAnimations();
  initTheme();
  setupAskWidget();
  setupTestPrediction();
  setupAuthForms();
  setupDashboardReports();
});

// ---------- TEST PREDICTION (ALL MODULE PAGES) ----------

function setupTestPrediction() {
  const form = document.querySelector(".test-form");
  const outputBox = document.querySelector(".output-box");
  if (!form || !outputBox) return;

  let pathname = window.location.pathname;
  if (pathname.includes("/")) {
    pathname = pathname.split("/").pop();
  }

  let testType = null;

  if (pathname.includes("diabetes")) testType = "diabetes";
  else if (pathname.includes("cholesterol")) testType = "cholesterol";
  else if (pathname.includes("kidney")) testType = "kidney";
  else if (pathname.includes("liver")) testType = "liver";
  else if (pathname.includes("heart")) testType = "heart";
  else if (pathname.includes("blood-pressure")) testType = "blood_pressure";
  else if (pathname.includes("thyroid")) testType = "thyroid";

  if (!testType) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let email = getCurrentUserEmail();
    if (!email) {
      email = prompt("Enter your email to save and send the report:");
      if (!email) {
        alert("Email is required to run prediction.");
        return;
      }
      setCurrentUserEmail(email);
    }

    const inputs = Array.from(form.querySelectorAll("input"));
    const selects = Array.from(form.querySelectorAll("select"));

    const getNumber = (idx, fallback = 0) => {
      const el = inputs[idx];
      if (!el) return fallback;
      const v = parseFloat(el.value);
      return isNaN(v) ? fallback : v;
    };

    const getSelectIndex = (idx) => {
      const el = selects[idx];
      if (!el) return 0;
      return el.selectedIndex;
    };

    let payload = null;

    switch (testType) {
      case "diabetes":
        payload = {
          glucose: getNumber(0),
          blood_pressure: getNumber(1),
          skin_thickness: getNumber(2),
          bmi: getNumber(3),
          age: getNumber(4),
          insulin: getNumber(5),
          pedigree: getNumber(6),
          email,
        };
        break;

      case "cholesterol":
        payload = {
          total_cholesterol: getNumber(0),
          hdl: getNumber(1),
          ldl: getNumber(2),
          triglycerides: getNumber(3),
          age: getNumber(4),
          bmi: getNumber(5),
          blood_pressure: getNumber(6),
          smoking_status: getSelectIndex(0),
          family_history: getSelectIndex(1),
          email,
        };
        break;

      case "kidney":
        payload = {
          age: getNumber(0),
          blood_pressure: getNumber(1),
          specific_gravity: getNumber(2),
          albumin: getNumber(3),
          sugar: getNumber(4),
          blood_glucose_random: getNumber(5),
          blood_urea: getNumber(6),
          serum_creatinine: getNumber(7),
          sodium: getNumber(8),
          potassium: getNumber(9),
          hemoglobin: getNumber(10),
          packed_cell_volume: getNumber(11),
          white_blood_cell_count: getNumber(12),
          red_blood_cell_count: getNumber(13),
          email,
        };
        break;

      case "liver": {
        const genderIndex = getSelectIndex(0);
        payload = {
          age: getNumber(0),
          gender: genderIndex,
          total_bilirubin: getNumber(1),
          direct_bilirubin: getNumber(2),
          alkaline_phosphatase: getNumber(3),
          alt: getNumber(4),
          ast: getNumber(5),
          total_proteins: getNumber(6),
          albumin: getNumber(7),
          ag_ratio: getNumber(8),
          email,
        };
        break;
      }

      case "heart": {
        const sexIndex = getSelectIndex(0);
        const chestPainIndex = getSelectIndex(1);
        const fbsIndex = getSelectIndex(2);
        const restecgIndex = getSelectIndex(3);
        const exangIndex = getSelectIndex(4);
        const slopeIndex = getSelectIndex(5);
        const thalIndex = getSelectIndex(6);

        payload = {
          age: getNumber(0),
          sex: sexIndex,
          cp: chestPainIndex,
          trestbps: getNumber(2),
          chol: getNumber(3),
          fbs: fbsIndex,
          restecg: restecgIndex,
          thalach: getNumber(4),
          exang: exangIndex,
          oldpeak: getNumber(5),
          slope: slopeIndex,
          ca: getNumber(6),
          thal: thalIndex,
          email,
        };
        break;
      }

      case "blood_pressure": {
        const stressIndex = getSelectIndex(0);
        const activityIndex = getSelectIndex(1);
        payload = {
          systolic: getNumber(0),
          diastolic: getNumber(1),
          age: getNumber(2),
          weight: getNumber(3),
          height: getNumber(4),
          stress_level: stressIndex,
          activity_level: activityIndex,
          email,
        };
        break;
      }

      case "thyroid": {
        const sexIndex = getSelectIndex(0);
        const medIndex = getSelectIndex(1);
        const pregIndex = getSelectIndex(2);
        const goitreIndex = getSelectIndex(3);
        payload = {
          age: getNumber(0),
          sex: sexIndex,
          tsh: getNumber(1),
          t3: getNumber(2),
          t4: getNumber(3),
          free_t4_index: getNumber(4),
          free_t3_index: getNumber(5),
          medication_status: medIndex,
          pregnancy_status: pregIndex,
          goitre_status: goitreIndex,
          email,
        };
        break;
      }

      default:
        alert("Unknown test type.");
        return;
    }

    try {
      outputBox.innerHTML = "<p>Running prediction...</p>";
      outputBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

      const controller = new AbortController();
      const timeoutMs = 20000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${API_BASE}/api/predict/${testType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const rawText = await response.text();
      if (!response.ok) {
        console.error(rawText);
        outputBox.innerHTML = `
          <h3>Prediction failed</h3>
          <p>Server error (${response.status}). Check console for details.</p>
        `;
        return;
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Response was not JSON:", rawText);
        outputBox.innerHTML = `
          <h3>Prediction failed</h3>
          <p>Invalid response from server. Check console.</p>
        `;
        return;
      }

      const labelText = data.label || data.status || "N/A";
      const riskNum = Number(data.risk_score);
      const riskScore = Number.isFinite(riskNum) ? riskNum.toFixed(1) : null;

      let pdfLinkHtml = "";
      if (data.pdf_url) {
        pdfLinkHtml = `
          <p>
            <a href="${API_BASE}${data.pdf_url}" target="_blank" class="btn primary">
              Download PDF Report
            </a>
          </p>`;
      }

      outputBox.innerHTML = `
        <h3>Prediction result</h3>
        <p><strong>Status:</strong> ${labelText}</p>
        ${riskScore != null ? `<p><strong>Risk Score:</strong> ${riskScore}%</p>` : ""}
        ${data.message ? `<p>${data.message}</p>` : ""}
        ${pdfLinkHtml}
      `;
      outputBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      console.error(err);
      if (err?.name === "AbortError") {
        outputBox.innerHTML = `
          <h3>Prediction timed out</h3>
          <p>
            The server took too long to respond (>${timeoutMs / 1000}s).
            If you're running locally, make sure the backend is running at <code>${API_BASE}</code>.
          </p>
        `;
        return;
      }
      outputBox.innerHTML = `
        <h3>Prediction failed</h3>
        <p>${err.message || "Could not connect to the server. Make sure the backend (FastAPI) is running."}</p>
      `;
    }
  });
}

// ---------- AUTH (signup/login) ----------

function setupAuthForms() {
  // Signup
  const signupForm = document.querySelector("form#signup-form");
  if (signupForm) {
    const signupError = document.getElementById("signup-error");
    const sendSignupOtpBtn = document.getElementById("send-signup-otp");
    const setSignupError = (message, ok = false) => {
      if (!signupError) return;
      signupError.textContent = message || "";
      signupError.style.color = ok ? "#0c8a43" : "#d93025";
    };

    if (sendSignupOtpBtn) {
      sendSignupOtpBtn.addEventListener("click", () => {
        const formData = new FormData(signupForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");
        const dob = String(formData.get("dob") || "");

        if (!name || !dob) return setSignupError("Name and date of birth are required.");
        if (!validEmail(email)) return setSignupError("Enter a valid email address.");
        if (!validPassword(password)) {
          return setSignupError("Password must be at least 6 chars and include a number.");
        }
        const existingUser = getUsers().find((user) => user.email === email);
        if (existingUser) return setSignupError("Email already exists. Please login.");

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpStore = getOtpStore();
        otpStore[email] = {
          otp,
          purpose: "signup",
          expiresAt: Date.now() + 5 * 60 * 1000,
          payload: { name, email, password, dob },
        };
        setOtpStore(otpStore);
        console.log(`[SuSwastha OTP][SIGNUP] ${email}: ${otp}`);
        setSignupError("OTP generated (check browser console).", true);
      });
    }

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(signupForm);
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const otp = String(formData.get("otp") || "").trim();

      if (!validEmail(email)) return setSignupError("Enter a valid email address.");
      if (!/^\d{6}$/.test(otp)) return setSignupError("Enter a valid 6-digit OTP.");
      const otpStore = getOtpStore();
      const pending = otpStore[email];
      if (!pending || pending.purpose !== "signup") return setSignupError("Request OTP first.");
      if (pending.expiresAt < Date.now()) return setSignupError("OTP expired. Request a new OTP.");
      if (pending.otp !== otp) return setSignupError("Invalid OTP.");

      const users = getUsers();
      if (users.some((user) => user.email === email)) {
        return setSignupError("Email already exists. Please login.");
      }

      const newUser = {
        name: pending.payload.name,
        email,
        password: pending.payload.password,
        dob: pending.payload.dob,
        role: email.includes("admin") ? "admin" : "user",
      };
      users.push(newUser);
      setUsers(users);
      delete otpStore[email];
      setOtpStore(otpStore);

      setCurrentUserEmail(email);
      setCurrentUserProfile({ name: newUser.name, email, dob: newUser.dob });

      if (typeof window.loginUser === "function") {
        window.loginUser(newUser);
        return;
      }
      window.location.href = "dashboard.html";
    });
  }

  // Login
  const loginForm = document.querySelector("form#login-form");
  if (loginForm) {
    const loginError = document.getElementById("login-error");
    const sendLoginOtpBtn = document.getElementById("send-login-otp");
    const setLoginError = (message, ok = false) => {
      if (!loginError) return;
      loginError.textContent = message || "";
      loginError.style.color = ok ? "#0c8a43" : "#d93025";
    };

    if (sendLoginOtpBtn) {
      sendLoginOtpBtn.addEventListener("click", () => {
        const formData = new FormData(loginForm);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");
        if (!validEmail(email)) return setLoginError("Enter a valid email address.");
        if (!password) return setLoginError("Password is required.");
        const user = getUsers().find((entry) => entry.email === email);
        if (!user) return setLoginError("Account not found. Please sign up first.");
        if (user.password !== password) return setLoginError("Incorrect password.");

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpStore = getOtpStore();
        otpStore[email] = {
          otp,
          purpose: "login",
          expiresAt: Date.now() + 5 * 60 * 1000,
        };
        setOtpStore(otpStore);
        console.log(`[SuSwastha OTP][LOGIN] ${email}: ${otp}`);
        setLoginError("OTP generated (check browser console).", true);
      });
    }

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim().toLowerCase();
      const otp = String(formData.get("otp") || "").trim();

      if (!validEmail(email)) return setLoginError("Enter a valid email address.");
      if (!/^\d{6}$/.test(otp)) return setLoginError("Enter a valid 6-digit OTP.");

      const otpStore = getOtpStore();
      const pending = otpStore[email];
      if (!pending || pending.purpose !== "login") return setLoginError("Request OTP first.");
      if (pending.expiresAt < Date.now()) return setLoginError("OTP expired. Request a new OTP.");
      if (pending.otp !== otp) return setLoginError("Invalid OTP.");

      const user = getUsers().find((entry) => entry.email === email);
      if (!user) return setLoginError("Account not found.");

      delete otpStore[email];
      setOtpStore(otpStore);
      setCurrentUserEmail(email);
      setCurrentUserProfile({ name: user.name || "", dob: user.dob || "", email });

      if (typeof window.loginUser === "function") {
        window.loginUser(user);
        return;
      }
      window.location.href = "dashboard.html";
    });
  }
}

// ---------- Dashboard (load user reports + fill profile) ----------

function setupDashboardReports() {
  if (!window.location.pathname.includes("dashboard.html")) return;
  const tbody = document.querySelector("#reports table tbody");
  if (!tbody) return;

  const email = getCurrentUserEmail();

  // If not logged in, show message and stop
  if (!email) {
    tbody.innerHTML = `
      <tr><td colspan="4">Please <a href="login.html">login</a> to see your reports.</td></tr>
    `;
    const greetingEl = document.getElementById("dashboard-greeting");
    const subtitleEl = document.getElementById("dashboard-subtitle");
    if (greetingEl) greetingEl.textContent = "Hello, Guest";
    if (subtitleEl) subtitleEl.textContent = "Please login to view your dashboard.";
    return;
  }

  // ✅ Fill basic profile info from localStorage
  const profile = getCurrentUserProfile();
  const greetingEl = document.getElementById("dashboard-greeting");
  const subtitleEl = document.getElementById("dashboard-subtitle");
  const nameEl = document.getElementById("dashboard-name");
  const emailEl = document.getElementById("dashboard-email");
  const dobEl = document.getElementById("dashboard-dob");

  if (greetingEl) greetingEl.textContent = `Hello, ${profile?.name || email}`;
  if (subtitleEl) subtitleEl.textContent = `Logged in as ${email}`;
  if (nameEl) nameEl.textContent = `Name: ${profile?.name || "-"}`;
  if (emailEl) emailEl.textContent = `Email: ${email}`;
  if (dobEl) dobEl.textContent = `Date of Birth: ${profile?.dob || "-"}`;

  // Elements for cards
  const savedCountEl = document.getElementById("dashboard-saved-count");
  const savedBadgeEl = document.getElementById("dashboard-saved-badge");
  const lastTestEl = document.getElementById("dashboard-last-test");
  const lastStatusEl = document.getElementById("dashboard-last-status");

  const data = getReportsForEmail(email).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No reports found yet.</td></tr>`;
    if (savedCountEl) savedCountEl.textContent = "0 total reports";
    if (savedBadgeEl) savedBadgeEl.textContent = "No reports yet";
    if (lastTestEl) lastTestEl.textContent = "Last test: -";
    if (lastStatusEl) lastStatusEl.textContent = "Status: -";
    return;
  }

  if (savedCountEl) savedCountEl.textContent = `${data.length} total reports`;
  if (savedBadgeEl) savedBadgeEl.textContent = "Updated just now";

  const latest = data[0];
  if (lastTestEl) lastTestEl.textContent = `Last test: ${latest.date || "-"}`;
  if (lastStatusEl) lastStatusEl.textContent = `Status: ${latest.result || "-"}`;

  tbody.innerHTML = data
    .map(
      (row) => `
      <tr>
        <td>${row.test || row.test_type || "-"}</td>
        <td>${row.date || "-"}</td>
        <td><span class="badge">${row.result || row.label || "-"}</span></td>
        <td>-</td>
      </tr>`
    )
    .join("");
}
