/**
 * Authentication management for Virtual Lab
 */

// Domain restrictions
const ALLOWED_DOMAINS = ['@gprec.ac.in', '@gmail.com'];

/**
 * Get base path for auth links based on current location
 */
function getAuthPath() {
    const currentPath = window.location.pathname;
    // If we are in experiments or simulation, go up to root
    if (currentPath.includes('/experiments/') || currentPath.includes('/simulation')) {
        return '../';
    }
    // If we are in the main subfolder, return empty (it handles itself)
    // but if we want it to go to root, we could return '../'
    if (currentPath.includes('/main/')) {
        return '';
    }
    return '';
}

/**
 * Validate email domain
 */
function validateEmailDomain(email) {
    return ALLOWED_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
}

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = '👁️';
    } else {
        input.type = 'password';
        icon.innerText = '👁️‍🗨️';
    }
}

/**
 * Handle Signup
 */
function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const emailError = document.getElementById('signupEmailError');
    const passwordError = document.getElementById('signupPassError');
    const confirmError = document.getElementById('confirmPassError');

    // Reset errors
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmError.style.display = 'none';

    let isValid = true;

    if (!validateEmailDomain(email)) {
        emailError.style.display = 'block';
        isValid = false;
    }

    if (!validatePasswordStrength(password)) {
        passwordError.style.display = 'block';
        isValid = false;
    }

    if (password !== confirmPassword) {
        confirmError.style.display = 'block';
        isValid = false;
    }

    if (!isValid) return;

    // Check if user exists
    const users = JSON.parse(localStorage.getItem('lab_users') || '{}');
    if (users[email]) {
        emailError.innerText = "Email already registered. Please login.";
        emailError.style.display = 'block';
        return;
    }

    // Save user
    users[email] = {
        name: name,
        password: password
    };
    localStorage.setItem('lab_users', JSON.stringify(users));

    // Show success and switch to login
    const successMsg = document.getElementById('successMsg');
    if (successMsg) {
        successMsg.innerText = "Account created successfully! You can now login.";
        successMsg.style.display = 'block';

        setTimeout(() => {
            if (typeof toggleForm === 'function') {
                toggleForm('login');
                document.getElementById('loginEmail').value = email;
                successMsg.style.display = 'none';
            }
        }, 2000);
    }
}

/**
 * Handle Login
 */
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const emailError = document.getElementById('loginEmailError');
    const passwordError = document.getElementById('loginPassError');

    if (emailError) emailError.style.display = 'none';
    if (passwordError) passwordError.style.display = 'none';

    if (!validateEmailDomain(email)) {
        if (emailError) emailError.style.display = 'block';
        return;
    }

    const users = JSON.parse(localStorage.getItem('lab_users') || '{}');
    const user = users[email];

    if (!user) {
        if (emailError) {
            emailError.innerText = "User not found. Please sign up.";
            emailError.style.display = 'block';
        }
        return;
    }

    if (user.password !== password) {
        if (passwordError) passwordError.style.display = 'block';
        return;
    }

    // Log user in
    localStorage.setItem('lab_logged_in_user', JSON.stringify({
        email: email,
        name: user.name || 'User'
    }));

    // Redirect to home
    window.location.href = 'index.html';
}

/**
 * Handle Logout
 */
function logout() {
    localStorage.removeItem('lab_logged_in_user');
    const authPath = getAuthPath();
    window.location.href = authPath + 'index.html';
}

/**
 * Toggle Profile Dropdown
 */
function toggleDropdown(event) {
    event.stopPropagation();
    const profile = document.getElementById('userProfile');
    if (profile) profile.classList.toggle('active');
}

/**
 * Update UI based on auth state
 */
function updateAuthStateUI() {
    const user = JSON.parse(localStorage.getItem('lab_logged_in_user'));
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;

    const authPath = getAuthPath();
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    const isExperimentPage = currentPath.includes('/experiments/') || currentPath.includes('/simulation');

    // Redirect logic
    if (isExperimentPage && !user) {
        alert("Please sign in first to access the experiments.");
        window.location.href = authPath + 'login.html';
        return;
    }

    if (user) {
        const displayName = user.name || user.email;
        const initial = displayName.charAt(0).toUpperCase();
        navAuth.innerHTML = `
            <div class="user-profile" id="userProfile" onclick="toggleDropdown(event)" style="display: flex !important;">
                <div class="user-avatar" title="${user.email}">${initial}</div>
                <div class="dropdown-menu">
                    <div class="dropdown-header">
                        <span>Welcome,</span>
                        <strong>${displayName}</strong>
                        <small style="display: block; font-size: 10px; color: #aaa; margin-top: 5px;">${user.email}</small>
                    </div>
                    <a href="${authPath}profile.html" class="dropdown-item">👤 My Profile</a>
                    <a href="${authPath}progress.html" class="dropdown-item">📊 My Progress</a>
                    <div class="dropdown-divider"></div>
                    <a href="javascript:void(0)" class="dropdown-item" onclick="logout()"> Logout</a>
                </div>
            </div>
        `;

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const profile = document.getElementById('userProfile');
            if (profile) profile.classList.remove('active');
        });
    } else if (!isLoginPage) {
        navAuth.innerHTML = `
            <a href="${authPath}login.html?mode=login" class="auth-btn login-btn">Login</a>
            <a href="${authPath}login.html?mode=signup" class="auth-btn signup-btn">Sign Up</a>
        `;
    }
}

// Global execution
document.addEventListener('DOMContentLoaded', updateAuthStateUI);
