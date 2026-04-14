// PWA Install
let deferredPrompt;
const installBanner = document.getElementById('installBanner');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Don't show if already dismissed
    if (!localStorage.getItem('installDismissed')) {
        installBanner.classList.add('show');
    }
});

async function installApp() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('App installed');
    }
    
    deferredPrompt = null;
    installBanner.classList.remove('show');
}

function dismissInstall() {
    localStorage.setItem('installDismissed', 'true');
    installBanner.classList.remove('show');
}

function installAppFromButton() {
    if (!deferredPrompt) {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            showCustomAlert('✓ App is already installed! You can find it on your home screen or app menu.');
        } else {
            showCustomAlert('❌ Installation is not available on this device or browser.<br><br>Try using:<br>• Chrome on Android<br>• Safari on iOS<br>• Edge on Windows');
        }
        return;
    }
    
    // Call the existing installApp function
    installApp();
}

// ── Landing Page Functions ────────────────────────────────
function showLandingPage() {
    document.getElementById('landingPage').classList.remove('hidden');
    // Auto-detect OS
    detectAndSelectOS();
    // Load reviews if Backside is configured
    if (bsIsConfigured()) {
        loadReviewsOnLandingPage();
    }
}

function hideLandingPage() {
    document.getElementById('landingPage').classList.add('hidden');
}

function detectAndSelectOS() {
    const ua = navigator.userAgent;
    const selector = document.getElementById('osSelector');
    if (!selector) return;

    let os = '';
    if (/android/i.test(ua)) os = 'android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macos';
    else if (/windows|win32/i.test(ua)) os = 'windows';
    else if (/linux/i.test(ua)) os = 'linux';

    if (os) {
        selector.value = os;
        updateInstallInstructions(os);
    }
}

function updateInstallInstructions(os) {
    const instructionsDiv = document.getElementById('installInstructions');
    if (!instructionsDiv) return;

    // Hide all instructions
    const allInstructions = [
        'androidInstructions', 'iosInstructions', 'macosInstructions',
        'windowsInstructions', 'linuxInstructions'
    ];
    allInstructions.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show selected
    if (os) {
        const el = document.getElementById(os + 'Instructions');
        if (el) el.style.display = 'block';
        instructionsDiv.style.display = 'block';
    } else {
        instructionsDiv.style.display = 'none';
    }
}

function triggerInstallPrompt() {
    if (!deferredPrompt) {
        showCustomAlert('Installation not available on this device/browser. Try Chrome on Android, Safari on iOS, or Edge on Windows.');
        return;
    }
    installApp();
}

function showLegalModal(type) {
    const content = {
        terms: {
            title: 'Terms of Service',
            body: `<p>Last updated: April 2026</p>
<p>By using Peaceful Tasks, you agree to these terms.</p>
<h4>Use of the App</h4>
<p>Peaceful Tasks is provided for personal and family productivity use. You may not use it for unlawful purposes or attempt to reverse-engineer, exploit, or disrupt the service.</p>
<h4>Your Account</h4>
<p>You are responsible for keeping your password safe. We recommend using a password manager with a strong generated password. We cannot recover lost passwords.</p>
<h4>Data</h4>
<p>Your task, note, and project data is encrypted end-to-end before leaving your device. We cannot read your data. See our Security policy for details.</p>
<h4>Availability</h4>
<p>We aim to keep Peaceful Tasks running smoothly but cannot guarantee uninterrupted access. The app may be updated or changed at any time.</p>
<h4>Contact</h4>
<p>For questions, use the Feature Request form inside the app.</p>`
        },
        privacy: {
            title: 'Privacy Policy',
            body: `<p>Last updated: April 2026</p>
<p>We take your privacy seriously. Here is what we collect and why.</p>
<h4>What We Collect</h4>
<p>We store your username and a hashed (not readable) version of your password. Your tasks, notes, and projects are stored encrypted — we cannot read them.</p>
<h4>What We Don't Collect</h4>
<p>We do not collect your real name, email address, phone number, location, or any payment information at this time. We do not run ads and do not sell data.</p>
<h4>Reviews and Feature Requests</h4>
<p>If you submit a review or feature request, that content is stored unencrypted so the development team can read it. Do not include personal information in reviews or requests.</p>
<h4>Third Parties</h4>
<p>Data is stored via Backside (backside.app), our backend provider. Their privacy practices apply to infrastructure-level storage. Your content remains encrypted at the application layer.</p>
<h4>Changes</h4>
<p>We may update this policy. Continued use of the app means you accept the updated policy.</p>`
        },
        security: {
            title: 'Security',
            body: `<p>Last updated: April 2026</p>
<p>Peaceful Tasks is built with security as a core feature, not an afterthought.</p>
<h4>End-to-End Encryption</h4>
<p>All task titles, descriptions, note titles, and note content are encrypted on your device using AES-256-GCM before being sent to our servers. Your encryption key is derived from your password using PBKDF2 with 200,000 iterations. We never see your key or your unencrypted data.</p>
<h4>Password Storage</h4>
<p>Your password is never stored anywhere. Only a SHA-256 hash is stored for login verification. We strongly recommend using a password manager with a long randomly generated password.</p>
<h4>Transport Security</h4>
<p>All data in transit is protected by TLS 1.3.</p>
<h4>What This Means</h4>
<p>Even if our servers were compromised, your tasks and notes would remain unreadable to anyone without your password. This also means we cannot recover your data if you lose your password.</p>
<h4>Reporting Issues</h4>
<p>If you discover a security issue, please submit it via the Feature Request form in the app marked clearly as a security report.</p>`
        }
    };

    const { title, body } = content[type] || { title: 'Document', body: '<p>Coming soon.</p>' };
    const modalDiv = document.createElement('div');
    modalDiv.id = 'legalModal';
    modalDiv.innerHTML = `
        <div class="alert-overlay" onclick="document.getElementById('legalModal').remove()"></div>
        <div class="custom-alert" style="max-width:520px;max-height:75vh;overflow-y:auto;text-align:left;">
            <h3 style="margin-top:0;color:#5e8fb5;">${title}</h3>
            <div style="color:#555;line-height:1.7;font-size:14px;">${body}</div>
            <div style="text-align:center;margin-top:20px;">
                <button class="login-btn" onclick="document.getElementById('legalModal').remove()" style="margin:0;">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modalDiv);
}

// ── Check if landing page should be shown ────────────────────────────────
function checkShowLandingPage() {
    const isLoggedIn = localStorage.getItem('currentUser');
    const landingPage = document.getElementById('landingPage');

    if (!isLoggedIn && landingPage) {
        landingPage.classList.remove('hidden');
        detectAndSelectOS();
    } else if (isLoggedIn && landingPage) {
        landingPage.classList.add('hidden');
    }
}

// Utilities (defined early — used by all modules)
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

// Helper: Get accounts object from localStorage
function getAccounts() {
    const data = localStorage.getItem('todoAccounts');
    return data ? JSON.parse(data) : {};
}

// Helper: Set display property on element
function setDisplay(elementId, display) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = display;
}

// Helper: Parse time string (HH:MM) to minutes
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Global Variables
let currentUser = null;
let currentScreen = 'landingPage';
let tasks = {};
let hugGroups = [];
let completedTasksCount = 0;
let projects = [];
let notes = [];
let currentNoteId = null;
let currentView = 'today';
let currentEditDay = null;
let currentProjectId = null;
let isAdminMode = false;
const ADMIN_PASSWORD = 'hug2025';
const ANTI_CHEAT_TIME = 1000;

// localStorage key constants
const KEY_CURRENT_USER = 'currentUser';
const KEY_CURRENT_ACCOUNT_TYPE = 'currentAccountType';
const KEY_CURRENT_USER_DISPLAY_NAME = 'currentUserDisplayName';
const KEY_TODO_ACCOUNTS = 'todoAccounts';
const KEY_ALARMS = 'alarms';
const KEY_NOTIFIED_TASK_IDS = 'notifiedTaskIds';
const KEY_CURRENT_CONTACT_ID = 'currentContactId';
const KEY_INSTALL_DISMISSED = 'installDismissed';
const KEY_MIGRATED = '_pt_migrated';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadInitialState();
    setupEnterKeyListeners();
    checkForUpdates();
    initVoiceInput();
});

async function loadInitialState() {
    loadAlarms();

    // Handle invite link before anything else
    await handleInviteToken().catch(console.error);

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        if (bsIsConfigured()) {
            // Try to restore crypto key from sessionStorage
            sessionCryptoKey = await restoreCryptoKey().catch(() => null);
            if (!sessionCryptoKey) {
                // Key not available — need password again
                showScreen('loginPersonalAccount');
                const err = document.getElementById('loginAccountError');
                if (err) err.textContent = 'Session expired — please sign in again to decrypt your data.';
                return;
            }
            // Check trial
            if (currentBsContact && isTrialExpired(currentBsContact)) {
                showPaywallModal(currentBsContact);
                return;
            }
            await loadAndShowApp();
        } else {
            loadUserData();
            showScreen('mainApp');
        }
    } else {
        // Use _startRoute flag set synchronously at page start
        if (window._startRoute === 'login') {
            showScreen('loginPersonalAccount');
            history.replaceState({}, '', '/to-do/login');
        } else if (window._startRoute === 'signup') {
            showScreen('createPersonalAccount');
            history.replaceState({}, '', '/to-do/sign-up');
        } else {
            showScreen('landingPage');
        }
        window._startRoute = null;
    }
}

// Screen Navigation
function showScreen(screenId) {
    // Hide all screens
    const screens = [
        'landingPage', 'passcodeGate', 'accountTypeSelection',
        'createPersonalAccount', 'loginPersonalAccount', 'groupSetup',
        'createGroupAdmin', 'groupJoin', 'showGroupCredentials',
        'welcomeScreen', 'mainApp'
    ];

    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });

    // Show requested screen
    const element = document.getElementById(screenId);
    if (element) {
        element.classList.remove('hidden');
        currentScreen = screenId;
    } else {
        console.warn('Screen not found:', screenId);
        // Fallback: show landing page if requested screen doesn't exist
        const landingPage = document.getElementById('landingPage');
        if (landingPage) {
            landingPage.classList.remove('hidden');
        }
    }

    // Update UI if showing main app
    if (screenId === 'mainApp') {
        updateDateDisplay();
        populateProjectDropdown();
        renderTodayTasks();
        renderHugs();
        showTab('today');
        showHintsBanner();
    }
}

// Navigation functions
function showPasscodeGate() {
    showScreen('passcodeGate');
    document.getElementById('passcodeInput').focus();
}

function showSignIn() {
    // Go directly to login page
    showScreen('loginPersonalAccount');
    document.getElementById('loginUsername').focus();
}

function showCreateAccount() {
    // Go to password creation
    showScreen('passcodeGate');
    document.getElementById('passcodeInput').focus();
}

function backToInitialChoice() {
    showLandingPage();
    document.getElementById('passcodeError').textContent = '';
}

function backToPasscodeGate() {
    showScreen('passcodeGate');
    document.getElementById('loginAccountError').textContent = '';
}

function backToAccountTypeSelection() {
    showScreen('accountTypeSelection');
    document.getElementById('personalAccountError').textContent = '';
}

function backToGroupSetup() {
    showScreen('groupSetup');
    document.getElementById('groupAdminError').textContent = '';
}

function testModeLogin() {
    const testUser = 'test_user';
    const accounts = getAccounts();
    if (!accounts[testUser]) {
        accounts[testUser] = {
            password: 'test', type: 'personal',
            data: { tasks: {}, hugGroups: [], completedTasksCount: 0, spentHugs: 0 },
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('todoAccounts', JSON.stringify(accounts));
    }
    currentUser = testUser;
    localStorage.setItem('currentUser', testUser);
    localStorage.setItem('currentAccountType', 'personal');
    loadUserData();
    showScreen('mainApp');
}

// Passcode Check
function checkPasscode() {
    try {
        // If Backside is configured, bypass password gate and use username+password login
        if (bsIsConfigured()) {
            showSignIn();
            return;
        }

        const passcode = document.getElementById('passcodeInput').value.trim();
        const errorDiv = document.getElementById('passcodeError');

        if (!passcode) {
            errorDiv.textContent = 'Please enter a password';
            return;
        }

        // Check if this is an existing account (localStorage only when Backside not configured)
        const accounts = getAccounts();
        const matchingAccount = Object.entries(accounts).find(([user, data]) =>
            data.password === passcode
        );

        if (matchingAccount) {
            // Existing account - check if personal or group
            const [username, accountData] = matchingAccount;

            if (accountData.type === 'personal') {
                // Personal account - log them in
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);
                localStorage.setItem('currentAccountType', 'personal');
                loadUserData();
                showScreen('mainApp');
            } else if (accountData.type === 'group') {
                // Group account - log them in
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);
                localStorage.setItem('currentAccountType', 'group');
                loadUserData();
                showScreen('mainApp');
            }
        } else {
            // New password - ask what type of account
            // Store the password temporarily
            sessionStorage.setItem('pendingPassword', passcode);
            showScreen('accountTypeSelection');
        }

        errorDiv.textContent = '';
    } catch(e) {
        console.error('checkPasscode error:', e);
        document.getElementById('passcodeError').textContent = 'Error: ' + e.message;
    }
}

// Account Type Selection
function selectAccountType(type) {
    if (type === 'personal') {
        showScreen('createPersonalAccount');
        document.getElementById('personalUsername').focus();
    } else {
        showScreen('groupSetup');
    }
}

// Create Personal Account
async function createPersonalAccount() {
    const username = document.getElementById('personalUsername').value.trim();
    const password = document.getElementById('personalPassword').value.trim();
    const confirmPassword = document.getElementById('personalConfirmPassword').value.trim();
    const errorDiv = document.getElementById('personalAccountError');

    if (!username || !password || !confirmPassword) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return;
    }

    // --- Backside signup (when configured) ---
    if (bsIsConfigured()) {
        errorDiv.textContent = 'Creating account…';
        try {
            await bsSignup(username, password, 'member');
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            localStorage.setItem('currentAccountType', 'personal');
            await clearPendingInvite();
            await loadAndShowApp();
        } catch(err) {
            errorDiv.textContent = err.message || 'Error creating account.';
            console.error(err);
        }
        return;
    }

    // --- Fallback: localStorage signup ---
    const accounts = getAccounts();
    if (accounts[username]) {
        errorDiv.textContent = 'Username already exists';
        return;
    }
    accounts[username] = {
        password, type: 'personal',
        data: { tasks: {}, hugGroups: [], completedTasksCount: 0, spentHugs: 0 },
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('todoAccounts', JSON.stringify(accounts));
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentAccountType', 'personal');
    loadUserData();
    showScreen('mainApp');
}

// Login Personal Account
async function loginPersonalAccount() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginAccountError');

    if (!username || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }

    // --- Backside login (when configured) ---
    if (bsIsConfigured()) {
        errorDiv.textContent = 'Signing in…';
        try {
            const contact = await bsLogin(username, password);
            if (!contact) {
                errorDiv.textContent = 'Invalid username or password';
                return;
            }
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            localStorage.setItem('currentAccountType', 'personal');
            if (isTrialExpired(contact)) {
                showPaywallModal(contact);
                return;
            }
            await loadAndShowApp();
        } catch(err) {
            console.error('Login error:', err);
            errorDiv.textContent = 'Connection error — check your API key in backside.js or try again.';
        }
        return;
    }

    // --- Fallback: localStorage login ---
    const accounts = getAccounts();
    const account = accounts[username];
    if (!account || account.password !== password) {
        errorDiv.textContent = 'Invalid username or password';
        return;
    }
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentAccountType', account.type);
    loadUserData();
    showScreen('mainApp');
}

// Group Setup
function setupGroupAdmin() {
    showScreen('createGroupAdmin');
    document.getElementById('groupAdminUsername').focus();
}

function showGroupJoin() {
    showScreen('groupJoin');
    document.getElementById('groupJoinUsername').focus();
}

// Create Group Admin
function createGroupAdmin() {
    const username = document.getElementById('groupAdminUsername').value.trim();
    const password = document.getElementById('groupAdminPassword').value.trim();
    const confirmPassword = document.getElementById('groupAdminConfirm').value.trim();
    const errorDiv = document.getElementById('groupAdminError');
    
    if (!username || !password || !confirmPassword) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        return;
    }
    
    const accounts = getAccounts();
    
    if (accounts[username]) {
        errorDiv.textContent = 'Username already exists';
        return;
    }
    
    // Create the group account
    accounts[username] = {
        password: password,
        type: 'group',
        isAdmin: true,
        members: [username],
        data: {
            tasks: {},
            hugGroups: [],
            completedTasksCount: 0,
            spentHugs: 0
        },
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('todoAccounts', JSON.stringify(accounts));
    
    // Show credentials
    document.getElementById('createdGroupUsername').textContent = username;
    document.getElementById('createdGroupPassword').textContent = password;
    showScreen('showGroupCredentials');
}

function finishGroupCreation() {
    const username = document.getElementById('createdGroupUsername').textContent;
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentAccountType', 'group');
    loadUserData();
    showScreen('mainApp');
}

// Join Group
function joinGroup() {
    const groupUsername = document.getElementById('groupJoinUsername').value.trim();
    const groupPassword = document.getElementById('groupJoinPassword').value.trim();
    const yourName = document.getElementById('yourNameInGroup').value.trim();
    const errorDiv = document.getElementById('groupJoinError');
    
    if (!groupUsername || !groupPassword) {
        errorDiv.textContent = 'Please enter group username and password';
        return;
    }
    
    const accounts = getAccounts();
    const groupAccount = accounts[groupUsername];
    
    if (!groupAccount || groupAccount.password !== groupPassword) {
        errorDiv.textContent = 'Invalid group username or password';
        return;
    }
    
    if (groupAccount.type !== 'group') {
        errorDiv.textContent = 'This is not a group account';
        return;
    }
    
    // Check if this is a sub-account login (invited user)
    if (yourName && groupAccount.subAccounts && groupAccount.subAccounts.length > 0) {
        const subAccount = groupAccount.subAccounts.find(sub => sub.username === yourName);
        if (subAccount) {
            // This is an invited user - need their personal password
            sessionStorage.setItem('pendingGroupUsername', groupUsername);
            sessionStorage.setItem('pendingSubUsername', yourName);
            showSubAccountPasswordPrompt(yourName);
            return;
        }
    }
    
    // If no username provided or not a sub-account, just join as regular member
    if (!yourName) {
        errorDiv.textContent = 'Please enter your username';
        return;
    }
    
    // Regular group member join
    if (!groupAccount.members) {
        groupAccount.members = [];
    }
    if (!groupAccount.members.includes(yourName)) {
        groupAccount.members.push(yourName);
        localStorage.setItem('todoAccounts', JSON.stringify(accounts));
    }
    
    currentUser = groupUsername;
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentAccountType', 'group');
    localStorage.setItem('currentUserDisplayName', yourName);
    loadUserData();
    showScreen('mainApp');
}

function showSubAccountPasswordPrompt(username) {
    // Update the join screen to ask for password
    const errorDiv = document.getElementById('groupJoinError');
    errorDiv.innerHTML = `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 15px;">
            <p style="color: #1976d2; margin-bottom: 10px;">Found account for ${username}!</p>
            <input type="password" id="subAccountPassword" class="login-input" placeholder="Enter your password" style="margin-bottom: 10px;" />
            <button class="login-btn" onclick="loginSubAccount()">Sign In</button>
        </div>
    `;
    document.getElementById('subAccountPassword').focus();
}

function loginSubAccount() {
    const groupUsername = sessionStorage.getItem('pendingGroupUsername');
    const subUsername = sessionStorage.getItem('pendingSubUsername');
    const password = document.getElementById('subAccountPassword').value.trim();
    const errorDiv = document.getElementById('groupJoinError');

    if (!password) {
        showCustomAlert('Please enter your password');
        return;
    }

    const accounts = getAccounts();
    const groupAccount = accounts[groupUsername];
    const subAccount = groupAccount.subAccounts.find(sub => sub.username === subUsername);

    if (subAccount.password !== password) {
        showCustomAlert('Incorrect password');
        return;
    }

    // Log them in
    currentUser = groupUsername + '::' + subUsername; // Special format for sub-accounts
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('currentAccountType', 'subaccount');
    localStorage.setItem('currentUserDisplayName', subAccount.displayName);

    // Load SHARED group data (not individual)
    tasks = groupAccount.data.tasks || {};
    hugGroups = groupAccount.data.hugGroups || [];
    completedTasksCount = groupAccount.data.completedTasksCount || 0;
    projects = groupAccount.data.projects || [];
    notes = groupAccount.data.notes || [];

    sessionStorage.removeItem('pendingGroupUsername');
    sessionStorage.removeItem('pendingSubUsername');

    showScreen('mainApp');
}

// Copy Credential Function
function copyCredential(elementId, button) {
    const text = document.getElementById(elementId).textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function deleteAccount(username) {
    showCustomConfirm('Delete Account', `Are you sure you want to delete ${escapeHtml(username)}? This cannot be undone.`, () => {
        const accounts = getAccounts();
        delete accounts[username];
        localStorage.setItem('todoAccounts', JSON.stringify(accounts));
        loadAllAccounts();
    });
}

// Data Management - Group tasks are SHARED among all members
function saveUserData() {
    if (!currentUser) return;
    
    try {
        const accounts = getAccounts();

        // Check if this is a sub-account
        if (currentUser.includes('::')) {
            const [groupUsername] = currentUser.split('::');
            const groupAccount = accounts[groupUsername];

            if (!groupAccount) {
                console.error('Group account not found!');
                return;
            }

            groupAccount.data = {
                tasks: tasks,
                hugGroups: hugGroups,
                completedTasksCount: completedTasksCount,
                spentHugs: groupAccount.data?.spentHugs || 0,
                projects: projects,
                notes: notes
            };

            localStorage.setItem('todoAccounts', JSON.stringify(accounts));
        } else {
            if (!accounts[currentUser]) {
                console.error('User account not found!');
                return;
            }

            accounts[currentUser].data = {
                tasks: tasks,
                hugGroups: hugGroups,
                completedTasksCount: completedTasksCount,
                spentHugs: accounts[currentUser].data?.spentHugs || 0,
                projects: projects,
                notes: notes
            };

            localStorage.setItem('todoAccounts', JSON.stringify(accounts));
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showCustomAlert('There was an error saving your data. Please try again.');
    }
}

function loadUserData() {
    if (!currentUser) return;
    
    try {
        const accounts = getAccounts();
        
        // Check if this is a sub-account
        if (currentUser.includes('::')) {
            const [groupUsername, subUsername] = currentUser.split('::');
            const groupAccount = accounts[groupUsername];
            
            if (groupAccount && groupAccount.data) {
                // Load GROUP data (shared across all members)
                tasks = groupAccount.data.tasks || {};
                hugGroups = groupAccount.data.hugGroups || [];
                completedTasksCount = groupAccount.data.completedTasksCount || 0;
                projects = groupAccount.data.projects || [];
                notes = groupAccount.data.notes || [];
                return;
            }
        } else {
            // Regular account or group admin
            const userData = accounts[currentUser];
            if (userData && userData.data) {
                tasks = userData.data.tasks || {};
                hugGroups = userData.data.hugGroups || [];
                completedTasksCount = userData.data.completedTasksCount || 0;
                projects = userData.data.projects || [];
                notes = userData.data.notes || [];
                return;
            }
        }

        // Initialize empty data if not found
        tasks = {};
        hugGroups = [];
        completedTasksCount = 0;
        projects = [];
        notes = [];
        saveUserData(); // Save the initialized data
    } catch (error) {
        console.error('Error loading data:', error);
        showCustomAlert('There was an error loading your data.');
    }
}

function syncData() {
    saveUserData();
}

// Logout — uses custom confirm modal (never browser confirm())
function logout() {
    showCustomConfirm('Log Out', 'Are you sure you want to log out?', () => {
        saveUserData();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentAccountType');
        localStorage.removeItem('currentUserDisplayName');
        sessionStorage.removeItem('_pt_ck');
        sessionCryptoKey   = null;
        currentBsContact   = null;
        currentUser        = null;
        tasks              = {};
        hugGroups          = [];
        completedTasksCount= 0;
        projects           = [];
        notes              = [];
        lists              = [];
        currentNoteId      = null;
        currentListId      = null;
        showScreen('landingPage');
    });
}

// Tab Management
function showTab(tabName) {
    currentView = tabName;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') === `showTab('${tabName}')`) {
            item.classList.add('active');
        }
    });

    // Clear list polling when switching away from lists tab
    if (tabName !== 'lists' && listsPollingInterval) {
        clearInterval(listsPollingInterval);
        listsPollingInterval = null;
    }

    // Hide all tabs
    document.getElementById('todayTab').classList.add('hidden');
    document.getElementById('daysTab').classList.add('hidden');
    document.getElementById('projectsTab').classList.add('hidden');
    document.getElementById('listsTab').classList.add('hidden');
    document.getElementById('notesTab').classList.add('hidden');
    document.getElementById('hugsTab').classList.add('hidden');
    document.getElementById('alarmsTab').classList.add('hidden');
    document.getElementById('settingsTab').classList.add('hidden');

    // Show selected tab
    if (tabName === 'today') {
        document.getElementById('todayTab').classList.remove('hidden');
        renderTodayTasks();
    } else if (tabName === 'days') {
        document.getElementById('daysTab').classList.remove('hidden');
        renderDays();
        const _today = formatDate(new Date());
        const _hasPast = Object.entries(tasks).some(([d, ts]) => d < _today && ts.some(t => !t.completed));
        if (_hasPast) showPastIncompleteTasks();
    } else if (tabName === 'projects') {
        document.getElementById('projectsTab').classList.remove('hidden');
        renderProjects();
    } else if (tabName === 'lists') {
        document.getElementById('listsTab').classList.remove('hidden');
        loadLists();
    } else if (tabName === 'notes') {
        document.getElementById('notesTab').classList.remove('hidden');
        renderNotes();
    } else if (tabName === 'hugs') {
        document.getElementById('hugsTab').classList.remove('hidden');
        renderHugs();
    } else if (tabName === 'alarms') {
        document.getElementById('alarmsTab').classList.remove('hidden');
        renderAlarms();
    } else if (tabName === 'settings') {
        document.getElementById('settingsTab').classList.remove('hidden');
        loadSettings();
    }
}

// Update Date + Time Display (time refreshes every minute)
let _dateTimeInterval = null;
function updateDateDisplay() {
    const tick = () => {
        const now = new Date();
        const dateEl = document.getElementById('dateDisplay');
        if (!dateEl) return;
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        dateEl.innerHTML = `<div>${dateStr}</div><div style="font-size:15px;color:#888;margin-top:4px;">${timeStr}</div>`;
    };
    tick();
    clearInterval(_dateTimeInterval);
    _dateTimeInterval = setInterval(tick, 60000);
}


// Settings
function loadSettings() {
    const accounts = getAccounts();
    const actualUsername = currentUser.includes('::') ? currentUser.split('::')[0] : currentUser;
    const currentAccount = accounts[actualUsername];
    
    if (!currentAccount) return;
    
    // Load basic settings
    document.getElementById('settingsUsername').textContent = actualUsername;
    
    // Show current password
    if (currentUser.includes('::')) {
        // Sub-account
        const subUsername = currentUser.split('::')[1];
        const subAccount = currentAccount.subAccounts.find(s => s.username === subUsername);
        if (subAccount) {
            document.getElementById('settingsDisplayName').value = subAccount.displayName || '';
        }
    } else {
        // Regular account
        document.getElementById('settingsDisplayName').value = currentAccount.displayName || '';
    }
    
    document.getElementById('settingsNewPassword').value = '';
    
    // Load group credentials if admin
    if (currentAccount.type === 'group' && currentAccount.isAdmin) {
        document.getElementById('groupUsername').textContent = actualUsername;
        document.getElementById('groupPassword').textContent = currentAccount.password;
    }
    
    // Check if install button should be shown
    const settingsInstallBtn = document.getElementById('settingsInstallBtn');
    const settingsInstallMsg = document.getElementById('settingsInstallMessage');
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        // Already installed
        if (settingsInstallBtn) settingsInstallBtn.style.display = 'none';
        if (settingsInstallMsg) {
            settingsInstallMsg.textContent = '✓ App is already installed on this device';
            settingsInstallMsg.style.display = 'block';
            settingsInstallMsg.style.color = '#66bb6a';
        }
    } else if (!deferredPrompt) {
        // Not available
        if (settingsInstallBtn) settingsInstallBtn.style.display = 'none';
        if (settingsInstallMsg) {
            settingsInstallMsg.textContent = 'Installation not available on this browser';
            settingsInstallMsg.style.display = 'block';
        }
    } else {
        // Available
        if (settingsInstallBtn) settingsInstallBtn.style.display = 'block';
        if (settingsInstallMsg) settingsInstallMsg.style.display = 'none';
    }
    
    // Show/hide group admin section
    const groupAdminSection = document.getElementById('groupAdminSection');
    if (currentAccount.type === 'group' && currentAccount.isAdmin) {
        groupAdminSection.classList.remove('hidden');
        loadGroupMembers();
    } else {
        groupAdminSection.classList.add('hidden');
    }
}

function saveSettings() {
    // NOTE: Password change is intentionally disabled when Backside is configured.
    // Changing the password would produce a different PBKDF2-derived AES-256-GCM key,
    // making all existing encrypted tasks, notes, and other data permanently unreadable.
    // This is a known limitation. To support password changes in the future, implement
    // re-encryption of all user data before updating the key.
    if (bsIsConfigured()) {
        showCustomAlert('Password changes are disabled because your data is encrypted with a key derived from your password. Changing it would make all your data unreadable. Use your password manager to ensure you never lose access.');
        return;
    }

    const accounts = getAccounts();
    const displayName = document.getElementById('settingsDisplayName').value.trim();
    const newPassword = document.getElementById('settingsNewPassword').value.trim();
    const actualUsername = currentUser.includes('::') ? currentUser.split('::')[0] : currentUser;
    const account = accounts[actualUsername];
    if (!account) return;

    if (currentUser.includes('::')) {
        const subUsername = currentUser.split('::')[1];
        const subAccount = account.subAccounts?.find(s => s.username === subUsername);
        if (subAccount) {
            if (displayName) subAccount.displayName = displayName;
            if (newPassword) subAccount.password = newPassword;
        }
    } else {
        if (displayName) account.displayName = displayName;
        if (newPassword) account.password = newPassword;
    }

    localStorage.setItem('todoAccounts', JSON.stringify(accounts));
    const message = document.getElementById('settingsSaveMessage');
    message.style.display = 'block';
    setTimeout(() => { message.style.display = 'none'; }, 3000);
    document.getElementById('settingsNewPassword').value = '';
}

function changeAdminPassword() {
    const newPassword = document.getElementById('newAdminPassword').value.trim();

    if (!newPassword) {
        showCustomAlert('Please enter a new admin password');
        return;
    }
    
    localStorage.setItem('adminPassword', newPassword);
    
    // Show success message
    const message = document.getElementById('adminPasswordMessage');
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
    
    // Clear field
    document.getElementById('newAdminPassword').value = '';
}

function accessAdminDashboard() {
    const password = document.getElementById('adminDashboardPassword').value.trim();
    const errorDiv = document.getElementById('adminDashboardError');
    const storedAdminPassword = localStorage.getItem('adminPassword') || 'hug2025';
    
    if (!password) {
        errorDiv.textContent = 'Please enter the admin password';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password !== storedAdminPassword) {
        errorDiv.textContent = 'Incorrect admin password';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Password correct - show dashboard
    errorDiv.style.display = 'none';
    document.getElementById('adminDashboardContent').style.display = 'block';
    loadAllAccounts();
}

function loadAllAccounts() {
    const accounts = getAccounts();
    const accountsList = document.getElementById('allAccountsList');
    
    if (Object.keys(accounts).length === 0) {
        accountsList.innerHTML = '<p style="color: #999; padding: 10px;">No accounts found</p>';
        return;
    }
    
    accountsList.innerHTML = '';
    
    Object.entries(accounts).forEach(([username, data]) => {
        const accountDiv = document.createElement('div');
        accountDiv.className = 'account-item';
        accountDiv.style.marginBottom = '15px';

        const totalHugs = (data.data?.hugGroups || []).reduce((sum, g) => sum + g.count, 0);
        const spentHugs = data.data?.spentHugs || 0;
        const availableHugs = totalHugs - spentHugs;

        const members = data.type === 'group' && data.members && data.members.length > 0 ?
            `<br><small style="display: block; margin-top: 5px;"><strong>Group Members:</strong> ${data.members.map(escapeHtml).join(', ')}</small>` : '';

        const subAccountsInfo = data.subAccounts && data.subAccounts.length > 0 ?
            `<br><small style="display: block; margin-top: 5px;"><strong>Invited Users:</strong></small>` +
            data.subAccounts.map(s => `<br><small style="margin-left: 20px;">• ${escapeHtml(s.displayName || s.username)} (${escapeHtml(s.username)})</small>`).join('') : '';

        const isAdmin = data.isAdmin ? '<br><small style="color: #9575cd; font-weight: 600;">👑 Group Admin</small>' : '';

        const taskCount = data.data && data.data.tasks ? Object.values(data.data.tasks).reduce((sum, dayTasks) => sum + dayTasks.length, 0) : 0;
        const completedCount = data.data && data.data.tasks ? Object.values(data.data.tasks).reduce((sum, dayTasks) => sum + dayTasks.filter(t => t.completed).length, 0) : 0;

        const safeUsername = escapeHtml(username);

        accountDiv.innerHTML = `
            <div class="account-info">
                <strong>${safeUsername}</strong>
                <small>${data.type === 'group' ? '👥 Group' : '👤 Personal'} Account | ${availableHugs} points | ${taskCount} tasks (${completedCount} completed)${isAdmin}${members}${subAccountsInfo}</small>

                <div class="copyable-credential" style="margin-top: 10px;">
                    <span>${safeUsername}</span>
                </div>
            </div>
            <div class="account-actions">
                <button class="delete-btn">Delete</button>
            </div>
        `;

        accountDiv.querySelector('.delete-btn').addEventListener('click', () => deleteAccountFromDashboard(username));
        accountsList.appendChild(accountDiv);
    });
}

function copyAdminCredential(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

function deleteAccountFromDashboard(username) {
    showCustomConfirm('Delete Account', `Are you sure you want to delete ${escapeHtml(username)}? This cannot be undone.`, () => {
        const accounts = getAccounts();
        delete accounts[username];
        localStorage.setItem('todoAccounts', JSON.stringify(accounts));
        loadAllAccounts();
    });
}

function loadGroupMembers() {
    const accounts = getAccounts();
    const currentAccount = accounts[currentUser];
    const membersList = document.getElementById('groupMembersList');
    
    if (!currentAccount || !currentAccount.subAccounts) {
        membersList.innerHTML = '<p style="color: #999;">No members yet. Use the Invite User button to add members.</p>';
        return;
    }
    
    membersList.innerHTML = '<h4 style="margin-bottom: 15px; color: #5e8fb5;">Group Members</h4>';
    
    currentAccount.subAccounts.forEach((subAccount, index) => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'account-item';
        memberDiv.innerHTML = `
            <div class="account-info">
                <strong>${subAccount.displayName || subAccount.username}</strong>
                <small>Username: ${subAccount.username}</small>
            </div>
            <div class="account-actions">
                <button class="delete-btn" onclick="removeGroupMember(${index})">Remove</button>
            </div>
        `;
        membersList.appendChild(memberDiv);
    });
}

function showInviteUserModal() {
    document.getElementById('inviteUserModal').classList.remove('hidden');
    document.getElementById('inviteUsername').value = '';
    document.getElementById('invitePassword').value = '';
    document.getElementById('inviteDisplayName').value = '';
    document.getElementById('inviteError').textContent = '';
}

function closeInviteUser() {
    document.getElementById('inviteUserModal').classList.add('hidden');
}

function closeInviteUserIfOutside(event) {
    if (event.target.id === 'inviteUserModal') {
        closeInviteUser();
    }
}

function createInvitedUser() {
    const username = document.getElementById('inviteUsername').value.trim();
    const password = document.getElementById('invitePassword').value.trim();
    const displayName = document.getElementById('inviteDisplayName').value.trim();
    const errorDiv = document.getElementById('inviteError');
    
    if (!username || !password) {
        errorDiv.textContent = 'Please fill in username and password';
        return;
    }
    
    const accounts = getAccounts();
    const currentAccount = accounts[currentUser];
    
    // Initialize subAccounts if it doesn't exist
    if (!currentAccount.subAccounts) {
        currentAccount.subAccounts = [];
    }
    
    // Check if username already exists
    const usernameExists = currentAccount.subAccounts.some(sub => sub.username === username);
    if (usernameExists) {
        errorDiv.textContent = 'Username already exists in this group';
        return;
    }
    
    // Create new sub-account (no separate data - they share the group tasks)
    currentAccount.subAccounts.push({
        username: username,
        password: password,
        displayName: displayName || username,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('todoAccounts', JSON.stringify(accounts));
    
    closeInviteUser();
    loadGroupMembers();
}

function removeGroupMember(index) {
    showCustomConfirm('Remove Member', 'Are you sure you want to remove this member?', () => {
        const accounts = getAccounts();
        const currentAccount = accounts[currentUser];
        currentAccount.subAccounts.splice(index, 1);
        localStorage.setItem('todoAccounts', JSON.stringify(accounts));
        loadGroupMembers();
    });
}

// Custom Alert
function showCustomAlert(message, title = '⚠️ Alert', showOkButton = true) {
    const modalHTML = `
        <div class="alert-overlay" onclick="closeCustomAlert()"></div>
        <div class="custom-alert">
            <h3>${title}</h3>
            <div style="color: #666; margin-bottom: 20px; font-size: 16px;">${message}</div>
            ${showOkButton ? '<button class="login-btn" onclick="closeCustomAlert()" style="margin: 0;">OK</button>' : ''}
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.id = 'customAlertModal';
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);
}

function closeCustomAlert() {
    const modal = document.getElementById('customAlertModal');
    if (modal) modal.remove();
    // Stop any looping alarm/timer sound.
    // _alarmSoundSignal is defined in alarms.js which loads after app.js —
    // the typeof guard is intentional and must stay.
    if (typeof _alarmSoundSignal !== 'undefined' && _alarmSoundSignal) {
        _alarmSoundSignal.stopped = true;
        clearTimeout(_alarmSoundSignal._timer);
        _alarmSoundSignal = null;
    }
}

function showCustomConfirm(title, message, onConfirm) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'customConfirmModal';
    modalDiv.innerHTML = `
        <div class="alert-overlay" onclick="document.getElementById('customConfirmModal').remove()"></div>
        <div class="custom-alert">
            <h3>${title}</h3>
            <p>${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="login-btn decline-btn" onclick="document.getElementById('customConfirmModal').remove()" style="margin: 0;">Cancel</button>
                <button class="login-btn" id="customConfirmOkBtn" style="margin: 0;">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    document.getElementById('customConfirmOkBtn').onclick = () => {
        modalDiv.remove();
        onConfirm();
    };
}

function showCustomPrompt(title, message, defaultValue, onSubmit) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'customPromptModal';
    modalDiv.innerHTML = `
        <div class="alert-overlay" onclick="document.getElementById('customPromptModal').remove()"></div>
        <div class="custom-alert">
            <h3>${title}</h3>
            <p style="margin-bottom: 12px;">${message}</p>
            <input id="customPromptInput" class="login-input" style="margin-bottom: 16px;" value="${escapeHtml(defaultValue || '')}" />
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="login-btn decline-btn" onclick="document.getElementById('customPromptModal').remove()" style="margin: 0;">Cancel</button>
                <button class="login-btn" id="customPromptOkBtn" style="margin: 0;">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    const input = document.getElementById('customPromptInput');
    input.focus();
    input.select();
    document.getElementById('customPromptOkBtn').onclick = () => {
        const val = input.value;
        modalDiv.remove();
        onSubmit(val);
    };
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('customPromptOkBtn').click();
    });
}

// ── Past Incomplete Tasks Modal ────────────────────────────
function showPastIncompleteTasks() {
    const today = formatDate(new Date());
    const pastIncomplete = {};

    // Collect all incomplete tasks from previous days
    Object.entries(tasks).forEach(([dateStr, dayTasks]) => {
        if (dateStr < today && dayTasks.length > 0) {
            const incompleteTasks = dayTasks.filter(t => !t.completed);
            if (incompleteTasks.length > 0) {
                pastIncomplete[dateStr] = incompleteTasks;
            }
        }
    });

    if (Object.keys(pastIncomplete).length === 0) {
        showCustomAlert('No incomplete tasks from previous days! Great job! 🎉', '✅ All Caught Up');
        return;
    }

    const modalDiv = document.createElement('div');
    modalDiv.id = 'pastIncompleteModal';
    modalDiv.innerHTML = `
        <div class="alert-overlay" onclick="document.getElementById('pastIncompleteModal').remove()"></div>
        <div class="custom-alert" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin-top: 0; color: #5e8fb5;">📋 Unfinished from previous days</h3>
    `;

    // Sort dates in reverse (newest first, but all before today)
    const sortedDates = Object.keys(pastIncomplete).sort().reverse();
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        modalDiv.innerHTML += `<div style="margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
            <div style="font-weight: 600; color: #333; margin-bottom: 8px;">📅 ${dayName}</div>`;

        pastIncomplete[dateStr].forEach((task, idx) => {
            const taskId = `pastTask_${dateStr}_${idx}`;
            modalDiv.innerHTML += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding: 6px 8px; background: #fafafa; border-radius: 6px;">
                    <input type="checkbox" id="${taskId}" onchange="completePastTask('${escapeHtml(dateStr)}', ${idx})">
                    <span style="flex: 1; word-break: break-word; color: #555;">${escapeHtml(task.text)}</span>
                    <button class="login-btn" style="padding: 4px 8px; font-size: 11px; margin: 0;" onclick="reschedulePastTask('${escapeHtml(dateStr)}', ${idx}, 'today')">Today</button>
                    <button class="login-btn" style="padding: 4px 8px; font-size: 11px; margin: 0;" onclick="reschedulePastTask('${escapeHtml(dateStr)}', ${idx}, 'tomorrow')">Tomorrow</button>
                </div>`;
        });
        modalDiv.innerHTML += `</div>`;
    });

    modalDiv.innerHTML += `
            <div style="margin-top: 16px; text-align: center;">
                <button class="login-btn" onclick="document.getElementById('pastIncompleteModal').remove()" style="margin: 0;">Close</button>
            </div>
        </div>`;

    document.body.appendChild(modalDiv);
}

function completePastTask(dateStr, idx) {
    if (tasks[dateStr] && tasks[dateStr][idx]) {
        tasks[dateStr][idx].completed = true;
        saveUserData();
        // Refresh the modal
        document.getElementById('pastIncompleteModal').remove();
        showPastIncompleteTasks();
    }
}

function reschedulePastTask(dateStr, idx, target) {
    if (!tasks[dateStr] || !tasks[dateStr][idx]) return;
    const task = tasks[dateStr][idx];

    // Remove from old date
    tasks[dateStr].splice(idx, 1);

    // Add to new date
    const newDate = target === 'today' ? formatDate(new Date()) : formatDate(new Date(Date.now() + 86400000));
    if (!tasks[newDate]) tasks[newDate] = [];
    tasks[newDate].push(task);

    saveUserData();
    // Refresh the modal
    document.getElementById('pastIncompleteModal').remove();
    showPastIncompleteTasks();
}

// ── Hints Banner (once per session) ─────────────────────────
function showHintsBanner() {
    if (sessionStorage.getItem('_hintsDismissed')) return;
    if (document.getElementById('hintsBanner')) return;
    const el = document.createElement('div');
    el.id = 'hintsBanner';
    el.style.cssText = 'background:#e8f5e9;border-left:4px solid #66bb6a;padding:12px 16px;' +
        'margin-bottom:12px;border-radius:8px;font-size:13px;color:#2e7d32;display:flex;' +
        'justify-content:space-between;align-items:flex-start;gap:10px;';
    el.innerHTML = `
        <div>
            <strong>💡 Quick tips:</strong>
            <ul style="margin:6px 0 0 16px;padding:0;">
                <li>Drag ☰ handles to reorder tasks</li>
                <li>Double-click any task to edit it</li>
                <li>Notes auto-save as you type</li>
                <li>Complete 5 tasks → earn 100 points 🎉</li>
            </ul>
        </div>
        <button onclick="document.getElementById('hintsBanner').remove();sessionStorage.setItem('_hintsDismissed','1');"
            style="background:none;border:none;font-size:20px;cursor:pointer;color:#66bb6a;flex-shrink:0;line-height:1;">×</button>`;
    const content = document.querySelector('.main-content');
    if (content) content.prepend(el);
}

// ── Invite by Link (admin in Settings) ──────────────────────
async function generateInviteLink() {
    if (!bsIsConfigured()) {
        showCustomAlert('Backside is not configured yet. Add your API key to backside.js to enable invites.');
        return;
    }
    const contactId = localStorage.getItem('currentContactId');
    if (!contactId) { showCustomAlert('Please sign in to generate an invite link.'); return; }
    try {
        const token = await bsGenerateInviteToken(contactId);
        const link  = `https://akivamac.github.io/to-do/?invite=${token}`;
        showCustomAlert(`<strong>Invite Link</strong><br><br>
            <input value="${link}" readonly
                style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-size:12px;margin-top:8px;"
                onclick="this.select()" />
            <br><small style="color:#888;">Share this link with the person you want to invite. It expires after they sign up.</small>`, '🔗 Invite Link');
    } catch(e) {
        showCustomAlert('Could not generate invite link: ' + e.message);
    }
}

// ── Custom Time Picker ───────────────────────────────────────
let _timePickerCallback = null;

function showTimePicker(currentValue, callback) {
    _timePickerCallback = callback;
    const parts = (currentValue || '').split(':');
    let h = parseInt(parts[0] || '12');
    let m = parseInt(parts[1] || '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;

    document.getElementById('timePickerModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'timePickerModal';
    modal.innerHTML = `
        <div class="alert-overlay" onclick="document.getElementById('timePickerModal').remove()"></div>
        <div class="custom-alert" style="max-width:300px;text-align:center;">
            <h3>🕐 Set Time</h3>
            <div style="display:flex;gap:12px;justify-content:center;align-items:center;margin:20px 0;">
                <div>
                    <label style="display:block;font-size:12px;color:#666;margin-bottom:4px;">Hour</label>
                    <select id="tpHour" class="login-input" style="margin:0;width:70px;text-align:center;">
                        ${Array.from({length:12},(_,i)=>i+1).map(n=>`<option ${n===h?'selected':''}>${n}</option>`).join('')}
                    </select>
                </div>
                <div style="font-size:24px;font-weight:bold;color:#5e8fb5;padding-top:16px;">:</div>
                <div>
                    <label style="display:block;font-size:12px;color:#666;margin-bottom:4px;">Minute</label>
                    <select id="tpMinute" class="login-input" style="margin:0;width:70px;text-align:center;">
                        ${[0,5,10,15,20,25,30,35,40,45,50,55].map(n=>`<option value="${n}" ${n===m?'selected':''}>${String(n).padStart(2,'0')}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display:block;font-size:12px;color:#666;margin-bottom:4px;">AM/PM</label>
                    <select id="tpAmpm" class="login-input" style="margin:0;width:70px;text-align:center;">
                        <option ${ampm==='AM'?'selected':''}>AM</option>
                        <option ${ampm==='PM'?'selected':''}>PM</option>
                    </select>
                </div>
            </div>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button class="login-btn" style="margin:0;" onclick="confirmTimePicker()">Set</button>
                <button class="login-btn back-btn" style="margin:0;"
                    onclick="document.getElementById('timePickerModal').remove()">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function confirmTimePicker() {
    let h  = parseInt(document.getElementById('tpHour').value);
    const m  = parseInt(document.getElementById('tpMinute').value);
    const ap = document.getElementById('tpAmpm').value;
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    const val = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
    document.getElementById('timePickerModal').remove();
    if (_timePickerCallback) _timePickerCallback(val);
}

// Utilities
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function formatTime(militaryTime) {
    if (!militaryTime) return '';
    
    const [hours, minutes] = militaryTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minutes} ${ampm}`;
}

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            console.log('Service worker registration failed');
        });
    });
}

// Updates
function checkForUpdates() {
    // Placeholder for update checking
}

function updateApp() {
    document.getElementById('updateBanner').classList.remove('show');
    location.reload();
}

function dismissUpdate() {
    document.getElementById('updateBanner').classList.remove('show');
}

// ── Clear Data & Cache ────────────────────────────────────

async function clearAllData() {
    showCustomConfirm('⚠️ Clear All Data', 'This will clear all cached data, offline storage, and service worker cache. You will need to sign in again.', async () => {
        try {
            // Clear localStorage
            const savedAccounts = localStorage.getItem('todoAccounts');
            localStorage.clear();
            if (savedAccounts) localStorage.setItem('todoAccounts', savedAccounts);

            // Clear sessionStorage
            sessionStorage.clear();

            // Unregister service workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }

            // Clear cache storage
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (let cacheName of cacheNames) {
                    await caches.delete(cacheName);
                }
            }

            // Show message
            const msgEl = document.getElementById('clearDataMessage');
            if (msgEl) {
                msgEl.style.display = 'block';
            }

            // Reload after 1 second
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (e) {
            showCustomAlert('Error clearing data: ' + e.message);
            console.error(e);
        }
    });
}

// ── Shared Lists Management ────────────────────────────────

let lists = [];
let currentListId = null;
let listsPollingInterval = null;
let listOperationInProgress = false;

async function loadLists() {
    if (!bsIsConfigured()) return;
    try {
        const notes = await bsFetchNotes();
        lists = notes.filter(n => n.tags && n.tags.includes('peaceful-list')).sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });
        renderLists();
    } catch (e) {
        console.error('Error loading lists:', e);
    }
}

function renderLists() {
    const listsList = document.getElementById('listsList');
    if (!listsList) return;

    if (lists.length === 0) {
        listsList.innerHTML = '<p style="color: #999; grid-column: 1/-1; text-align: center; padding: 20px;">No lists yet. Create one to get started!</p>';
        return;
    }

    listsList.innerHTML = lists.map(list => `
        <div onclick="openListDetail('${escapeHtml(list.id)}')" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; text-align: center;">
            <h4 style="color: #5e8fb5; margin: 0 0 8px 0;">${escapeHtml(list.title || 'Untitled')}</h4>
            <p style="color: #999; margin: 0; font-size: 12px;">Tap to edit</p>
        </div>
    `).join('');
}

async function createList() {
    const nameInput = document.getElementById('newListName');
    const name = nameInput.value.trim();
    if (!name) return;

    if (!bsIsConfigured()) {
        showCustomAlert('Lists require Backside to be configured.');
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        await bsCreateNote({
            title: name,
            body: '', // Empty list starts with no items
            tags: ['peaceful-list'],
            encrypted: true,
            metadata: { contact_id: localStorage.getItem('currentContactId'), created_by: currentUser.username }
        });
        nameInput.value = '';
        await loadLists();
    } catch (e) {
        showCustomAlert('Error creating list');
        console.error(e);
    }
}

function openListDetail(listId) {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    currentListId = listId;
    document.getElementById('listsListView').classList.add('hidden');
    document.getElementById('listsDetailView').classList.remove('hidden');
    document.getElementById('listDetailTitle').textContent = list.title || 'List';
    document.getElementById('listItemInput').value = '';
    document.getElementById('listItemInput').focus();

    renderListItems(list);

    // Start polling while list is open
    if (listsPollingInterval) clearInterval(listsPollingInterval);
    listsPollingInterval = setInterval(() => {
        loadLists().then(() => {
            const updated = lists.find(l => l.id === listId);
            if (updated) renderListItems(updated);
        }).catch(e => {
            console.error('List polling error:', e);
            // Don't show alert every 5 seconds, just log it
        });
    }, 5000);
}

function renderListItems(list) {
    const itemsList = document.getElementById('listItemsList');
    if (!itemsList) return;

    const items = parseListItems(list.body || '');
    itemsList.innerHTML = items.map((item, idx) => `
        <div style="display: flex; align-items: center; padding: 8px; background: ${item.checked ? '#f5f5f5' : 'white'}; border-radius: 4px; margin-bottom: 8px;">
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleListItem('${currentListId}', ${idx})" style="width: 18px; height: 18px; cursor: pointer; margin-right: 10px;" />
            <span style="flex: 1; ${item.checked ? 'text-decoration: line-through; color: #999;' : 'color: #333;'}">${item.text}</span>
        </div>
    `).join('');
}

function parseListItems(body) {
    const items = [];
    const lines = body.split('\n');
    lines.forEach(line => {
        const checkboxMatch = line.match(/^- \[([ xX])\] (.+)$/);
        if (checkboxMatch) {
            items.push({
                checked: checkboxMatch[1].toLowerCase() === 'x',
                text: checkboxMatch[2]
            });
        }
    });
    return items;
}

function itemsToMarkdown(items) {
    return items.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`).join('\n');
}

async function addListItem() {
    if (listOperationInProgress) return;
    listOperationInProgress = true;

    const input = document.getElementById('listItemInput');
    const text = input.value.trim();
    if (!text) {
        listOperationInProgress = false;
        return;
    }

    const list = lists.find(l => l.id === currentListId);
    if (!list) {
        listOperationInProgress = false;
        return;
    }

    const items = parseListItems(list.body || '');
    items.push({ checked: false, text });

    try {
        await bsUpdateNote(currentListId, { body: itemsToMarkdown(items) });
        input.value = '';
        await loadLists();
        const updated = lists.find(l => l.id === currentListId);
        if (updated) renderListItems(updated);
    } catch (e) {
        showCustomAlert('Error adding item');
        console.error(e);
    } finally {
        listOperationInProgress = false;
    }
}

async function toggleListItem(listId, index) {
    if (listOperationInProgress) return;
    listOperationInProgress = true;

    const list = lists.find(l => l.id === listId);
    if (!list) {
        listOperationInProgress = false;
        return;
    }

    const items = parseListItems(list.body || '');
    if (index < items.length) {
        items[index].checked = !items[index].checked;
        try {
            await bsUpdateNote(listId, { body: itemsToMarkdown(items) });
            await loadLists();
            const updated = lists.find(l => l.id === listId);
            if (updated) renderListItems(updated);
        } catch (e) {
            console.error(e);
        } finally {
            listOperationInProgress = false;
        }
    } else {
        listOperationInProgress = false;
    }
}

async function clearListChecked() {
    if (listOperationInProgress) return;
    listOperationInProgress = true;

    const list = lists.find(l => l.id === currentListId);
    if (!list) {
        listOperationInProgress = false;
        return;
    }

    const items = parseListItems(list.body || '').filter(item => !item.checked);

    try {
        await bsUpdateNote(currentListId, { body: itemsToMarkdown(items) });
        await loadLists();
        const updated = lists.find(l => l.id === currentListId);
        if (updated) renderListItems(updated);
    } catch (e) {
        showCustomAlert('Error clearing items');
        console.error(e);
    } finally {
        listOperationInProgress = false;
    }
}

function closeListDetail() {
    if (listsPollingInterval) clearInterval(listsPollingInterval);
    currentListId = null;
    document.getElementById('listsDetailView').classList.add('hidden');
    document.getElementById('listsListView').classList.remove('hidden');
}

// ── Voice Input for Tasks ─────────────────────────────────

let voiceRecognition = null;

function initVoiceInput() {
    // Check if Web Speech API is supported (Chromium-based browsers only)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micButton = document.getElementById('voiceMicButton');

    if (SpeechRecognition) {
        voiceRecognition = new SpeechRecognition();
        voiceRecognition.continuous = false;
        voiceRecognition.interimResults = false;
        voiceRecognition.lang = 'en-US';

        voiceRecognition.onstart = () => {
            document.getElementById('voiceListeningIndicator').style.display = 'inline';
        };

        voiceRecognition.onend = () => {
            document.getElementById('voiceListeningIndicator').style.display = 'none';
        };

        voiceRecognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            const taskInput = document.getElementById('taskInput');
            taskInput.value = transcript;
            taskInput.focus();
            showPeacefulSuggestion('taskInput', 'taskSuggestion');
        };

        voiceRecognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            document.getElementById('voiceListeningIndicator').style.display = 'none';
        };

        // Show mic button on supported browsers
        if (micButton) {
            micButton.style.display = 'block';
        }
    } else if (micButton) {
        // Hide mic button on unsupported browsers
        micButton.style.display = 'none';
    }
}

function startVoiceInput() {
    if (!voiceRecognition) return;

    // Request microphone permission if needed
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' }).catch(() => {
            // Fallback: just start recognition
            voiceRecognition.start();
        });
    } else {
        voiceRecognition.start();
    }
}

// ── Real-Time Sync Notifications ──────────────────────────

async function checkForAssignmentNotifications() {
    if (!bsIsConfigured()) return;

    const currentContactId = localStorage.getItem('currentContactId');
    if (!currentContactId) return;

    try {
        const tasks = await bsFetchTasks();
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const notifiedTasks = JSON.parse(localStorage.getItem('notifiedTaskIds') || '{}');
        const nowMinus24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        tasks.forEach(task => {
            const isAssignedToMe = task.metadata?.assignedTo === currentContactId;
            const createdBy = task.metadata?.created_by || task.metadata?.contactId;
            const isNotByMe = createdBy !== currentContactId;
            const createdRecently = new Date(task.created_at || task.metadata?.created_at) > nowMinus24h;
            const wasNotNotified = !notifiedTasks[task.id];

            if (isAssignedToMe && isNotByMe && createdRecently && wasNotNotified) {
                const assignedByUser = task.metadata?.assigned_by_name || 'Someone';
                const taskTitle = task.title || 'Untitled task';

                // Show toast
                showToastNotification(`${assignedByUser} assigned you: ${taskTitle}`);

                // Try to show browser notification (only if document has focus)
                if ('Notification' in window && Notification.permission === 'granted' && document.hasFocus()) {
                    new Notification('Peaceful Tasks', {
                        body: `${assignedByUser} assigned you: ${taskTitle}`,
                        icon: '/to-do/icon-192.png'
                    });
                }

                // Mark as notified
                notifiedTasks[task.id] = Date.now();
                localStorage.setItem('notifiedTaskIds', JSON.stringify(notifiedTasks));
            }
        });
    } catch (e) {
        console.error('Error checking notifications:', e);
    }
}

function showToastNotification(message) {
    const toast = document.getElementById('hugToast');
    if (!toast) return;

    const toastContent = toast.querySelector('.hug-toast-content');
    if (toastContent) {
        toastContent.textContent = message;
    }

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function requestBrowserNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ── Error Logging ──────────────────────────────────────────

async function logError(errorMessage, context = '') {
    if (!bsIsConfigured()) return;
    try {
        const timestamp = new Date().toISOString();
        await bsCreateNote({
            title: `Error Report - ${timestamp}`,
            body: `${errorMessage}\n\nContext: ${context}`,
            tags: ['peaceful-error'],
            encrypted: false,
            metadata: { timestamp, context }
        });
    } catch (e) {
        console.error('Could not log error to Backside:', e);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    logError(event.message, event.filename + ':' + event.lineno);
});

// ── Reviews & Feature Requests ─────────────────────────────

let selectedReviewRating = 0;
let adminLongPressTimer = null;

function selectReviewRating(stars) {
    selectedReviewRating = stars;
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`rating${i}`);
        if (btn) {
            btn.style.opacity = i <= stars ? '1' : '0.5';
        }
    }
}

async function submitReview() {
    const reviewText = document.getElementById('reviewText').value.trim();
    if (!reviewText) {
        showCustomAlert('Please write a review');
        return;
    }
    if (selectedReviewRating === 0) {
        showCustomAlert('Please select a star rating');
        return;
    }

    if (!bsIsConfigured()) {
        showCustomAlert('Reviews require Backside to be configured. Contact the administrator.');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const username = currentUser.displayName || currentUser.username || 'Anonymous';

    try {
        await bsCreateNote({
            title: `Review from ${username}`,
            body: reviewText,
            tags: ['peaceful-review'],
            encrypted: false,
            metadata: { rating: selectedReviewRating, contact_id: localStorage.getItem('currentContactId') }
        });

        document.getElementById('reviewText').value = '';
        selectedReviewRating = 0;
        for (let i = 1; i <= 5; i++) {
            const btn = document.getElementById(`rating${i}`);
            if (btn) btn.style.opacity = '0.5';
        }

        const msgEl = document.getElementById('reviewMessage');
        if (msgEl) {
            msgEl.style.display = 'block';
            setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
        }
    } catch (e) {
        showCustomAlert('Error submitting review. Please try again.');
        console.error(e);
    }
}

async function submitFeatureRequest() {
    const featureText = document.getElementById('featureRequestText').value.trim();
    if (!featureText) {
        showCustomAlert('Please describe your feature idea');
        return;
    }

    if (!bsIsConfigured()) {
        showCustomAlert('Feature requests require Backside to be configured. Contact the administrator.');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const username = currentUser.displayName || currentUser.username || 'Anonymous';

    try {
        await bsCreateNote({
            title: `Feature Request from ${username}`,
            body: featureText,
            tags: ['peaceful-feature-request'],
            encrypted: false,
            metadata: { contact_id: localStorage.getItem('currentContactId'), submitted_at: new Date().toISOString() }
        });

        document.getElementById('featureRequestText').value = '';
        const msgEl = document.getElementById('featureRequestMessage');
        if (msgEl) {
            msgEl.style.display = 'block';
            setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
        }
    } catch (e) {
        showCustomAlert('Error submitting feature request. Please try again.');
        console.error(e);
    }
}

async function loadReviewsOnLandingPage() {
    try {
        const notes = await bsFetchNotes();
        const reviews = notes.filter(n => n.tags && n.tags.includes('peaceful-review')).sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        }).slice(0, 6);

        const reviewsGrid = document.getElementById('reviewsGrid');
        if (!reviewsGrid) return;

        if (reviews.length === 0) {
            reviewsGrid.innerHTML = '<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><p style="color: #999; margin: 0; font-size: 14px;">Be the first to leave a review!</p></div>';
            return;
        }

        reviewsGrid.innerHTML = reviews.map(review => {
            const rating = review.metadata?.rating || 0;
            const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
            const username = review.metadata?.username || review.title.replace('Review from ', '');
            return `
                <div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 18px; margin-bottom: 10px;">${stars}</div>
                    <p style="color: #333; margin: 0 0 10px 0; line-height: 1.5; font-size: 14px;">${review.body || ''}</p>
                    <p style="color: #999; margin: 0; font-size: 12px;">— ${username}</p>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Error loading reviews:', e);
    }
}

// ── Admin Panel for Feature Requests ────────────────────────

function startLongPress(event) {
    if (event.touches) {
        adminLongPressTimer = setTimeout(() => openAdminAccess(event), 1000);
    }
}

function cancelLongPress() {
    if (adminLongPressTimer) {
        clearTimeout(adminLongPressTimer);
        adminLongPressTimer = null;
    }
}

async function openAdminAccess(event) {
    event.preventDefault();
    if (event.button && event.button !== 2) return; // Only right-click on desktop

    if (!bsIsConfigured()) {
        showCustomAlert('Admin access requires Backside to be configured. Contact the administrator.');
        return;
    }

    const contactId = localStorage.getItem('currentContactId');
    if (!contactId) return;

    try {
        const contacts = await bsFetchContacts();
        const contact = contacts.find(c => c.id === contactId);

        if (!contact) return;

        const adminPasswordHash = contact.metadata?.admin_password_hash;
        const modal = document.getElementById('adminAccessModal');
        const contentDiv = document.getElementById('adminAccessContent');

        if (!adminPasswordHash) {
            // First-time setup
            contentDiv.innerHTML = `
                <p style="color: #666; margin-bottom: 15px;">Set your admin password to secure access</p>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Admin Password</label>
                    <input type="password" id="adminPassword1" class="login-input" style="margin: 0;" placeholder="Enter password" />
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Confirm Password</label>
                    <input type="password" id="adminPassword2" class="login-input" style="margin: 0;" placeholder="Confirm password" />
                </div>
                <button class="login-btn" onclick="setAdminPassword()" style="width: 100%;">Set Password</button>
                <div id="adminAccessError" class="login-error"></div>
            `;
        } else {
            // Password entry
            contentDiv.innerHTML = `
                <p style="color: #666; margin-bottom: 15px;">Enter your admin password</p>
                <div style="margin-bottom: 15px;">
                    <input type="password" id="adminPasswordEntry" class="login-input" style="margin: 0;" placeholder="Admin password" />
                </div>
                <button class="login-btn" onclick="verifyAdminPassword()" style="width: 100%;">Access Panel</button>
                <div id="adminAccessError" class="login-error"></div>
            `;
        }

        modal.classList.remove('hidden');
    } catch (e) {
        console.error('Error opening admin access:', e);
        showCustomAlert('Error accessing admin panel');
    }
}

async function setAdminPassword() {
    const pwd1 = document.getElementById('adminPassword1').value;
    const pwd2 = document.getElementById('adminPassword2').value;
    const errorEl = document.getElementById('adminAccessError');

    if (!pwd1 || !pwd2) {
        errorEl.textContent = 'Please fill in both fields';
        errorEl.style.display = 'block';
        return;
    }

    if (pwd1 !== pwd2) {
        errorEl.textContent = 'Passwords do not match';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const hash = await sha256hex(pwd1);
        const contactId = localStorage.getItem('currentContactId');
        await bsUpdateContact(contactId, { metadata: { admin_password_hash: hash } });

        closeAdminAccess();
        openAdminPanel();
    } catch (e) {
        errorEl.textContent = 'Error setting password';
        errorEl.style.display = 'block';
        console.error(e);
    }
}

async function verifyAdminPassword() {
    const pwd = document.getElementById('adminPasswordEntry').value;
    const errorEl = document.getElementById('adminAccessError');

    if (!pwd) {
        errorEl.textContent = 'Please enter your password';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const hash = await sha256hex(pwd);
        const contactId = localStorage.getItem('currentContactId');
        const contacts = await bsFetchContacts();
        const contact = contacts.find(c => c.id === contactId);

        if (contact?.metadata?.admin_password_hash !== hash) {
            errorEl.textContent = 'Incorrect password';
            errorEl.style.display = 'block';
            return;
        }

        closeAdminAccess();
        openAdminPanel();
    } catch (e) {
        errorEl.textContent = 'Error verifying password';
        errorEl.style.display = 'block';
        console.error(e);
    }
}

async function openAdminPanel() {
    if (!bsIsConfigured()) {
        showCustomAlert('Admin panel requires Backside to be configured. Contact the administrator.');
        exitAdminPanel();
        return;
    }

    try {
        const notes = await bsFetchNotes();
        const requests = notes.filter(n => n.tags && n.tags.includes('peaceful-feature-request'));
        const errors = notes.filter(n => n.tags && n.tags.includes('peaceful-error')).sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        const undone = requests.filter(r => !r.tags?.includes('done')).sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        const done = requests.filter(r => r.tags?.includes('done')).sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        const allRequests = [...undone, ...done];
        const listDiv = document.getElementById('featureRequestsList');

        let html = '';

        // Error Reports Section
        if (errors.length > 0) {
            html += `<div style="margin-bottom: 40px;">
                <h3 style="color: #e57373; margin-bottom: 20px;">⚠️ Error Reports (${errors.length})</h3>
                ${errors.map(err => {
                    const errDate = new Date(err.created_at).toLocaleString();
                    return `
                        <div style="background: #ffebee; border: 1px solid #ef5350; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                            <p style="color: #c62828; margin: 0 0 10px 0; line-height: 1.5; font-family: monospace; font-size: 13px;">${err.body || ''}</p>
                            <div style="color: #999; font-size: 12px;">
                                ${errDate}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>`;
        }

        // Feature Requests Section
        html += `<div>
            <h3 style="color: #5e8fb5; margin-bottom: 20px;">💡 Feature Requests ${allRequests.length > 0 ? `(${undone.length} new)` : ''}</h3>`;

        if (allRequests.length === 0) {
            html += '<p style="color: #999; text-align: center; padding: 20px;">No feature requests yet.</p>';
        } else {
            html += allRequests.map((req, idx) => {
                const isDone = req.tags?.includes('done');
                const submittedBy = req.metadata?.username || req.title.replace('Feature Request from ', '');
                const submittedDate = new Date(req.metadata?.submitted_at || req.created_at).toLocaleDateString();
                return `
                    <div style="background: ${isDone ? '#f5f5f5' : 'white'}; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 12px; ${isDone ? 'opacity: 0.6;' : ''}">
                        <p style="color: ${isDone ? '#999' : '#333'}; margin: 0 0 10px 0; line-height: 1.5;">${req.body || ''}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="color: #999; font-size: 12px;">
                                <strong>${submittedBy}</strong> • ${submittedDate}
                            </div>
                            ${!isDone ? `<button class="login-btn" onclick="markFeatureRequestDone('${req.id}')" style="padding: 8px 16px; font-size: 13px;">Mark as Done</button>` : '<span style="color: #66bb6a; font-weight: 600;">✓ Done</span>'}
                        </div>
                    </div>
                `;
            }).join('');
        }

        html += '</div>';
        listDiv.innerHTML = html;

        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
    } catch (e) {
        showCustomAlert('Error loading admin panel');
        console.error(e);
    }
}

async function markFeatureRequestDone(noteId) {
    try {
        const notes = await bsFetchNotes();
        const note = notes.find(n => n.id === noteId);
        if (!note) return;

        const tags = Array.isArray(note.tags) ? note.tags : [];
        if (!tags.includes('done')) {
            tags.push('done');
        }

        await bsUpdateNote(noteId, { tags });
        openAdminPanel();
    } catch (e) {
        showCustomAlert('Error updating request');
        console.error(e);
    }
}

function closeAdminAccess() {
    const modal = document.getElementById('adminAccessModal');
    if (modal) modal.classList.add('hidden');
}

function closeAdminAccessIfOutside(event) {
    if (event.target.id === 'adminAccessModal') {
        closeAdminAccess();
    }
}

function exitAdminPanel() {
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
}

// Enter Key Support
function setupEnterKeyListeners() {
    const enterHandlers = {
        'passcodeInput': checkPasscode,
        'loginPassword': loginPersonalAccount,
        'personalConfirmPassword': createPersonalAccount,
        'groupAdminConfirm': createGroupAdmin,
        'yourNameInGroup': joinGroup,
        'taskInput': addTask,
        'editDayTaskInput': addTaskToEditDay,
        'projectTaskInput': addTaskToProject,
        'newProjectName': addProject
    };

    Object.entries(enterHandlers).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handler();
            });
        }
    });
}
