// Simple configuration for the API base URL.
// By default, this assumes the backend runs on http://localhost:5000.
const API_BASE_URL = "http://localhost:5000";

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const messagesEl = document.getElementById("messages");
const tokenContainer = document.getElementById("token-container");
const tokenOutput = document.getElementById("token-output");

const loginSubmitBtn = document.getElementById("login-submit");
const registerSubmitBtn = document.getElementById("register-submit");
const copyTokenBtn = document.getElementById("copy-token-btn");
const logoutBtn = document.getElementById("logout-btn");

// Password toggle buttons
const loginPasswordInput = document.getElementById("login-password");
const registerPasswordInput = document.getElementById("register-password");
const registerPasswordConfirmInput = document.getElementById("register-password-confirm");
const loginPasswordToggle = loginPasswordInput?.parentElement.querySelector(".toggle-password");
const registerPasswordToggle = registerPasswordInput?.parentElement.querySelector(".toggle-password");
const registerPasswordConfirmToggle = registerPasswordConfirmInput?.parentElement.querySelector(".toggle-password");

/**
 * Switch between login and register forms without reloading the page.
 */
function switchTab(target) {
  const isLogin = target === "login";

  tabLogin.classList.toggle("active", isLogin);
  tabRegister.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("active", isLogin);
  registerForm.classList.toggle("active", !isLogin);

  clearMessages();

  // Auto-focus first input when switching tabs for better UX
  setTimeout(() => {
    if (isLogin) {
      document.getElementById("login-email")?.focus();
    } else {
      document.getElementById("register-username")?.focus();
    }
  }, 100);
}

tabLogin.addEventListener("click", () => switchTab("login"));
tabRegister.addEventListener("click", () => switchTab("register"));

/**
 * Display a single message to the user.
 */
function showMessage(type, text) {
  messagesEl.classList.remove("hidden");
  messagesEl.innerHTML = "";

  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;

  messagesEl.appendChild(div);
}

function clearMessages() {
  messagesEl.classList.add("hidden");
  messagesEl.innerHTML = "";
}

/**
 * Basic client-side validation that mirrors the backend rules.
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 8;
}

/**
 * Add visual validation feedback to form fields.
 */
function setFieldValidation(inputElement, isValid) {
  if (isValid) {
    inputElement.classList.remove("invalid");
  } else {
    inputElement.classList.add("invalid");
  }
}

/**
 * Toggle password visibility.
 */
function setupPasswordToggle(toggleBtn, passwordInput) {
  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleBtn.textContent = isPassword ? "🙈" : "👁️";
  });
}

// Setup password visibility toggles
setupPasswordToggle(loginPasswordToggle, loginPasswordInput);
setupPasswordToggle(registerPasswordToggle, registerPasswordInput);
setupPasswordToggle(registerPasswordConfirmToggle, registerPasswordConfirmInput);

/**
 * Copy JWT token to clipboard.
 */
if (copyTokenBtn) {
  copyTokenBtn.addEventListener("click", async () => {
    const tokenText = tokenOutput.textContent.trim();
    if (!tokenText) return;

    try {
      await navigator.clipboard.writeText(tokenText);
      copyTokenBtn.textContent = "✓ Copied!";
      copyTokenBtn.classList.add("copied");
      setTimeout(() => {
        copyTokenBtn.textContent = "📋 Copy Token";
        copyTokenBtn.classList.remove("copied");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy token:", error);
      showMessage("error", "Failed to copy token to clipboard.");
    }
  });
}

/**
 * Handle logout - clear token and reset UI.
 */
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Clear the token
    tokenOutput.textContent = "";
    
    // Hide the token container
    tokenContainer.classList.add("hidden");
    
    // Clear any messages
    clearMessages();
    
    // Reset login form
    loginForm.reset();
    
    // Show success message
    showMessage("success", "You have been logged out successfully.");
    
    // Switch to login tab
    switchTab("login");
  });
}

/**
 * Handle registration with async/await and fetch.
 */
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const passwordConfirm = document.getElementById("register-password-confirm").value;

  const usernameInput = document.getElementById("register-username");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const passwordConfirmInput = document.getElementById("register-password-confirm");

  // Clear previous validation states
  setFieldValidation(usernameInput, true);
  setFieldValidation(emailInput, true);
  setFieldValidation(passwordInput, true);
  setFieldValidation(passwordConfirmInput, true);

  let hasErrors = false;

  if (!username || !email || !password || !passwordConfirm) {
    showMessage("error", "All fields are required.");
    if (!username) setFieldValidation(usernameInput, false);
    if (!email) setFieldValidation(emailInput, false);
    if (!password) setFieldValidation(passwordInput, false);
    if (!passwordConfirm) setFieldValidation(passwordConfirmInput, false);
    return;
  }

  if (!validateEmail(email)) {
    showMessage("error", "Please provide a valid email.");
    setFieldValidation(emailInput, false);
    hasErrors = true;
  }

  if (!validatePassword(password)) {
    showMessage("error", "Password must be at least 8 characters long.");
    setFieldValidation(passwordInput, false);
    hasErrors = true;
  }

  // Validate password match
  if (password !== passwordConfirm) {
    showMessage("error", "Passwords do not match. Please re-enter your password.");
    setFieldValidation(passwordInput, false);
    setFieldValidation(passwordConfirmInput, false);
    hasErrors = true;
  }

  if (hasErrors) return;

  registerSubmitBtn.disabled = true;
  registerSubmitBtn.classList.add("loading");
  registerSubmitBtn.textContent = "Creating account...";

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Prefer backend validation details when available.
      const backendMessage = data && typeof data.message === "string" ? data.message : "";
      const backendErrors =
        Array.isArray(data?.errors) && data.errors.length
          ? ` ${data.errors.join(" ")}`
          : "";
      const errorText =
        backendMessage || "Registration failed. Please try again.";

      showMessage("error", `${errorText}${backendErrors}`);
      return;
    }

    showMessage("success", data.message || "Registration successful.");

    registerForm.reset();
  } catch (error) {
    console.error("Registration error:", error);
    showMessage("error", "Network error. Please check the backend server.");
  } finally {
    registerSubmitBtn.disabled = false;
    registerSubmitBtn.classList.remove("loading");
    registerSubmitBtn.textContent = "Create Account";
  }
});

/**
 * Handle login with async/await and fetch, then display the JWT.
 */
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessages();

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Clear previous validation states
  setFieldValidation(emailInput, true);
  setFieldValidation(passwordInput, true);

  let hasErrors = false;

  if (!email || !password) {
    showMessage("error", "Both email and password are required.");
    if (!email) setFieldValidation(emailInput, false);
    if (!password) setFieldValidation(passwordInput, false);
    return;
  }

  if (!validateEmail(email)) {
    showMessage("error", "Please provide a valid email.");
    setFieldValidation(emailInput, false);
    hasErrors = true;
  }

  if (!validatePassword(password)) {
    showMessage("error", "Password must be at least 8 characters long.");
    setFieldValidation(passwordInput, false);
    hasErrors = true;
  }

  if (hasErrors) return;

  loginSubmitBtn.disabled = true;
  loginSubmitBtn.classList.add("loading");
  loginSubmitBtn.textContent = "Logging in...";

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const backendMessage = data && typeof data.message === "string" ? data.message : "";
      const backendErrors =
        Array.isArray(data?.errors) && data.errors.length
          ? ` ${data.errors.join(" ")}`
          : "";
      const errorText = backendMessage || "Login failed. Please try again.";

      showMessage("error", `${errorText}${backendErrors}`);
      tokenContainer.classList.add("hidden");
      tokenOutput.textContent = "";
      return;
    }

    showMessage("success", data.message || "Login successful.");

    if (data.token) {
      tokenOutput.textContent = data.token;
      tokenContainer.classList.remove("hidden");
    } else {
      tokenContainer.classList.add("hidden");
      tokenOutput.textContent = "";
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("error", "Network error. Please check the backend server.");
    tokenContainer.classList.add("hidden");
    tokenOutput.textContent = "";
  } finally {
    loginSubmitBtn.disabled = false;
    loginSubmitBtn.classList.remove("loading");
    loginSubmitBtn.textContent = "Log In";
  }
});

