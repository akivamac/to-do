// ============================================================
// Backside BaaS Integration + E2E Encryption
// ============================================================
// Sign up at https://backside.app, create a project, copy the
// Live key from the dashboard, and replace the value below.
//
// NOTE: Password changes are DISABLED on purpose. Changing the
// password would produce a different PBKDF2-derived AES key,
// making all existing encrypted tasks/notes permanently
// unreadable. This is a known limitation.
// ============================================================

const BACKSIDE_API_KEY = 'bsk_live_VDbFLbqDghOMmDSdg79HGh4wzFA2NFozB3Q0LjDiKoc';
const BACKSIDE_BASE    = 'https://api.backside.app/api/v1';

// In-memory session crypto key — derived from password at login,
// never stored in localStorage, stored temporarily in sessionStorage
// so page refreshes within the same tab don't require re-login.
let sessionCryptoKey = null;

// The Backside contact record for the currently logged-in user
let currentBsContact = null;

// ── Helpers ─────────────────────────────────────────────────

function bsIsConfigured() {
    return BACKSIDE_API_KEY && BACKSIDE_API_KEY !== 'bsk_live_REPLACE_WITH_REAL_KEY';
}

// ── SHA-256 (hex) ────────────────────────────────────────────

async function sha256hex(message) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── PBKDF2 → AES-256-GCM Key Derivation ─────────────────────

async function deriveCryptoKey(password, saltB64) {
    const km = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
        km,
        { name: 'AES-GCM', length: 256 },
        true,  // extractable so we can persist in sessionStorage for same-tab refreshes
        ['encrypt', 'decrypt']
    );
}

async function generateSalt() {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    return btoa(String.fromCharCode(...b));
}

// ── Session key persistence (sessionStorage, not localStorage) ──

async function persistCryptoKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    sessionStorage.setItem('_pt_ck', btoa(String.fromCharCode(...new Uint8Array(raw))));
}

async function restoreCryptoKey() {
    const b64 = sessionStorage.getItem('_pt_ck');
    if (!b64) return null;
    try {
        const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    } catch { return null; }
}

// ── AES-256-GCM Encrypt / Decrypt ────────────────────────────

async function encryptField(plaintext) {
    if (!sessionCryptoKey || plaintext === undefined || plaintext === null || plaintext === '') return plaintext;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, sessionCryptoKey,
        new TextEncoder().encode(String(plaintext))
    );
    return 'enc:' + btoa(String.fromCharCode(...iv)) + ':' + btoa(String.fromCharCode(...new Uint8Array(ct)));
}

async function decryptField(val) {
    if (!val || !String(val).startsWith('enc:')) return val || '';
    if (!sessionCryptoKey) return '[encrypted – please sign in again]';
    try {
        const parts = String(val).split(':');
        const iv = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
        const ct = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sessionCryptoKey, ct);
        return new TextDecoder().decode(plain);
    } catch { return '[encrypted]'; }
}

// ── Backside REST helper ──────────────────────────────────────

async function bsRequest(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'x-api-key': BACKSIDE_API_KEY }
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(BACKSIDE_BASE + path, opts);
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Backside ${method} ${path} → ${res.status}: ${txt}`);
    }
    const txt = await res.text();
    return txt ? JSON.parse(txt) : {};
}

function bsList(res) {
    return Array.isArray(res) ? res : (res.data || res.results || res.items || []);
}

// ── Contacts ─────────────────────────────────────────────────

async function bsFetchContacts()    { return bsList(await bsRequest('GET', '/contacts')); }
async function bsCreateContact(d)   { return bsRequest('POST', '/contacts', d); }
async function bsUpdateContact(id, d) { return bsRequest('PUT', `/contacts/${id}`, d); }

// ── Tasks ─────────────────────────────────────────────────────

async function bsFetchTasks()       { return bsList(await bsRequest('GET', '/tasks')); }
async function bsCreateTask(d)      { return bsRequest('POST', '/tasks', d); }
async function bsUpdateTask(id, d)  { return bsRequest('PUT', `/tasks/${id}`, d); }
async function bsDeleteTask(id)     { return bsRequest('DELETE', `/tasks/${id}`); }

// ── Projects ──────────────────────────────────────────────────

async function bsFetchProjects()       { return bsList(await bsRequest('GET', '/projects')); }
async function bsCreateProject(d)      { return bsRequest('POST', '/projects', d); }
async function bsUpdateProject(id, d)  { return bsRequest('PUT', `/projects/${id}`, d); }
async function bsDeleteProject(id)     { return bsRequest('DELETE', `/projects/${id}`); }

// ── Notes ─────────────────────────────────────────────────────

async function bsFetchNotes()       { return bsList(await bsRequest('GET', '/notes')); }
async function bsCreateNote(d)      { return bsRequest('POST', '/notes', d); }
async function bsUpdateNote(id, d)  { return bsRequest('PUT', `/notes/${id}`, d); }
async function bsDeleteNote(id)     { return bsRequest('DELETE', `/notes/${id}`); }

// ── Login (verify via Contacts) ───────────────────────────────

async function bsLogin(username, password) {
    const contacts = await bsFetchContacts();
    const hash = await sha256hex(password);
    const match = contacts.find(c =>
        c.metadata?.username === username && c.metadata?.password_hash === hash
    );
    if (!match) return null;
    sessionCryptoKey = await deriveCryptoKey(password, match.metadata.crypto_salt);
    await persistCryptoKey(sessionCryptoKey);
    currentBsContact = match;
    localStorage.setItem('currentContactId', match.id);
    return match;
}

// ── Signup (create Contact) ───────────────────────────────────

async function bsSignup(username, password, role = 'member') {
    const contacts = await bsFetchContacts();
    if (contacts.find(c => c.metadata?.username === username)) {
        throw new Error('Username already exists');
    }
    const hash  = await sha256hex(password);
    const salt  = await generateSalt();
    const today = new Date().toISOString().split('T')[0];
    const res   = await bsCreateContact({
        first_name: username,
        metadata: { username, password_hash: hash, role, points: 0,
                    trial_start: today, plan: 'trial',
                    invite_token: null, crypto_salt: salt }
    });
    const contact = res.data || res;
    sessionCryptoKey = await deriveCryptoKey(password, salt);
    await persistCryptoKey(sessionCryptoKey);
    currentBsContact = contact;
    localStorage.setItem('currentContactId', contact.id);
    return contact;
}

// ── Trial Check ───────────────────────────────────────────────

function isTrialExpired(contact) {
    if (!contact) return false;
    const meta = contact.metadata || {};
    if (meta.plan === 'paid') return false;
    if (!meta.trial_start) return false;
    return (Date.now() - new Date(meta.trial_start)) / 86400000 > 5;
}

async function bsMarkPaid(contactId) {
    await bsUpdateContact(contactId, { metadata: { plan: 'paid' } });
    if (currentBsContact?.metadata) currentBsContact.metadata.plan = 'paid';
}

// ── Invite by Link ────────────────────────────────────────────

async function bsGenerateInviteToken(contactId) {
    // 32 cryptographically random hex chars
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    await bsUpdateContact(contactId, { metadata: { invite_token: token } });
    if (currentBsContact?.metadata) currentBsContact.metadata.invite_token = token;
    return token;
}

async function bsFindByInviteToken(token) {
    const contacts = await bsFetchContacts();
    return contacts.find(c => c.metadata?.invite_token === token) || null;
}

async function bsClearInviteToken(contactId) {
    await bsUpdateContact(contactId, { metadata: { invite_token: null } });
}

// ── Load all user data from Backside ─────────────────────────

async function loadBacksideData() {
    const contactId = localStorage.getItem('currentContactId');
    if (!contactId) {
        throw new Error('No contact ID found. Please sign in again.');
    }
    const [rawTasks, rawProjects, rawNotes] = await Promise.all([
        bsFetchTasks(), bsFetchProjects(), bsFetchNotes()
    ]);

    // Filter to this user
    const myTasks    = rawTasks.filter(t   => (t.metadata?.contact_id || '') === contactId);
    const myProjects = rawProjects.filter(p => (p.metadata?.contact_id || '') === contactId);
    const myNotes    = rawNotes.filter(n   => (n.metadata?.contact_id || '') === contactId);

    // Decrypt tasks
    const tasksByDate = {};
    for (const t of myTasks) {
        const date = t.metadata?.date || formatDate(new Date());
        if (!tasksByDate[date]) tasksByDate[date] = [];
        tasksByDate[date].push({
            backsideId:      t.id,
            id:              t.metadata?.localId || t.id,
            text:            await decryptField(t.title),
            description:     await decryptField(t.description || ''),
            time:            t.metadata?.time || '',
            assignedTo:      t.metadata?.assignedTo || '',
            project:         t.project_id || t.metadata?.projectId || '',
            completed:       !!t.completed,
            rolledFrom:      t.metadata?.rolledFrom || null,
            hasBeenCompleted:!!t.metadata?.hasBeenCompleted,
            createdAt:       t.metadata?.createdAt || new Date().toISOString(),
            createdBy:       t.metadata?.createdBy || ''
        });
    }

    // Reshape projects (not encrypted)
    const projectsOut = myProjects.map(p => ({
        backsideId: p.id,
        id:   p.metadata?.localId || p.id,
        name: p.name || p.title || ''
    }));

    // Decrypt notes
    const notesOut = [];
    for (const n of myNotes) {
        notesOut.push({
            backsideId: n.id,
            id:         n.metadata?.localId || n.id,
            title:      await decryptField(n.title),
            content:    await decryptField(n.body || n.content || ''),
            createdAt:  n.metadata?.createdAt || n.created_at || new Date().toISOString(),
            updatedAt:  n.metadata?.updatedAt || n.updated_at || new Date().toISOString()
        });
    }

    return { tasks: tasksByDate, projects: projectsOut, notes: notesOut };
}

// ── Sync individual records ────────────────────────────────────

async function bsSyncTask(task, date) {
    const contactId = localStorage.getItem('currentContactId') || '';
    const payload = {
        title:      await encryptField(task.text || ''),
        description:await encryptField(task.description || ''),
        due_date:   date,
        priority:   task.priority  || 'normal',
        status:     task.status    || 'pending',
        project_id: task.project   || null,
        completed:  !!task.completed,
        metadata: {
            contact_id:      contactId,
            date,
            localId:         task.id,
            time:            task.time       || '',
            assignedTo:      task.assignedTo || '',
            rolledFrom:      task.rolledFrom || null,
            hasBeenCompleted:!!task.hasBeenCompleted,
            createdAt:       task.createdAt,
            createdBy:       task.createdBy  || '',
            projectId:       task.project    || ''
        }
    };
    if (task.backsideId) {
        await bsUpdateTask(task.backsideId, payload);
    } else {
        const res = await bsCreateTask(payload);
        task.backsideId = (res.data || res).id || res.id;
    }
}

async function bsRemoveTask(task) {
    if (task.backsideId) await bsDeleteTask(task.backsideId);
}

async function bsSyncNote(note) {
    const contactId = localStorage.getItem('currentContactId') || '';
    const payload = {
        title: await encryptField(note.title   || ''),
        body:  await encryptField(note.content || ''),
        metadata: {
            contact_id: contactId,
            localId:    note.id,
            createdAt:  note.createdAt,
            updatedAt:  note.updatedAt
        }
    };
    if (note.backsideId) {
        await bsUpdateNote(note.backsideId, payload);
    } else {
        const res = await bsCreateNote(payload);
        note.backsideId = (res.data || res).id || res.id;
    }
}

async function bsRemoveNote(note) {
    if (note.backsideId) await bsDeleteNote(note.backsideId);
}

async function bsSyncProject(project) {
    const contactId = localStorage.getItem('currentContactId') || '';
    const payload = {
        name: project.name,
        metadata: { contact_id: contactId, localId: project.id }
    };
    if (project.backsideId) {
        await bsUpdateProject(project.backsideId, payload);
    } else {
        const res = await bsCreateProject(payload);
        project.backsideId = (res.data || res).id || res.id;
    }
}

async function bsRemoveProject(project) {
    if (project.backsideId) await bsDeleteProject(project.backsideId);
}

// ── Migration: localStorage → Backside ───────────────────────

async function migrateLocalToBackside(localTasks, localProjects, localNotes) {
    // Projects first (tasks reference them)
    for (const p of localProjects) {
        try { await bsSyncProject(p); } catch(e) { console.warn('Project sync:', e); }
    }
    for (const [date, dayTasks] of Object.entries(localTasks)) {
        for (const t of dayTasks) {
            try { await bsSyncTask(t, date); } catch(e) { console.warn('Task sync:', e); }
        }
    }
    for (const n of localNotes) {
        n.updatedAt = n.updatedAt || new Date().toISOString();
        try { await bsSyncNote(n); } catch(e) { console.warn('Note sync:', e); }
    }
}

// ── Load app data (Backside with localStorage fallback) ────────

async function loadAndShowApp() {
    showScreen('mainApp');
    navigateTo('/to-do/app');
    showLoadingSpinner();

    try {
        // Try to restore crypto key from sessionStorage (same-tab refreshes)
        if (!sessionCryptoKey) {
            sessionCryptoKey = await restoreCryptoKey();
        }

        if (bsIsConfigured()) {
            // Check migration first (once, before Backside fetch)
            checkMigrationNeeded();

            const data = await loadBacksideData();
            tasks               = data.tasks;
            projects            = data.projects;
            notes               = data.notes;
            completedTasksCount = countCompleted();
        } else {
            // Backside not configured → use localStorage data
            loadUserData();
        }
    } catch (err) {
        console.error('Error loading Backside data:', err);
        showApiError('Could not reach the server. Showing locally cached data.');
        loadUserData();
    }

    hideLoadingSpinner();

    // Check if trial has expired
    if (currentBsContact && isTrialExpired(currentBsContact)) {
        showCustomAlert('Your trial has expired. Contact support to upgrade your plan.');
    }

    renderTodayTasks();
    renderHugs();
    populateProjectDropdown();
    updateDateDisplay();
}

function countCompleted() {
    let n = 0;
    Object.values(tasks).forEach(day => day.forEach(t => { if (t.hasBeenCompleted) n++; }));
    return n;
}

// ── Migration modal ───────────────────────────────────────────

function checkMigrationNeeded() {
    if (localStorage.getItem('_pt_migrated')) return;
    const accounts = JSON.parse(localStorage.getItem('todoAccounts') || '{}');
    const username = localStorage.getItem('currentUser');
    if (!username) return;
    const userData = accounts[username]?.data;
    if (!userData) return;

    const hasTasks    = userData.tasks    && Object.keys(userData.tasks).some(d => userData.tasks[d].length > 0);
    const hasProjects = userData.projects && userData.projects.length > 0;
    const hasNotes    = userData.notes    && userData.notes.length > 0;
    if (!hasTasks && !hasProjects && !hasNotes) return;

    showMigrationModal(userData);
}

function showMigrationModal(userData) {
    const el = document.createElement('div');
    el.id = 'migrationModal';
    el.innerHTML = `
        <div class="alert-overlay"></div>
        <div class="custom-alert" style="max-width:400px;text-align:center;">
            <h3>📦 Existing Data Found</h3>
            <p style="margin-bottom:20px;">We found tasks, notes, and projects saved on this device from before the cloud sync update. Would you like to migrate them to your account?</p>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button class="login-btn" onclick="doMigrate()" style="margin:0;">Migrate</button>
                <button class="login-btn back-btn" onclick="doDiscardLocal()" style="margin:0;">Discard</button>
            </div>
            <div id="migrationStatus" style="margin-top:12px;color:#666;font-size:13px;"></div>
        </div>`;
    document.body.appendChild(el);
    window._pendingMigrateData = userData;
}

async function doMigrate() {
    const status = document.getElementById('migrationStatus');
    if (status) status.textContent = 'Migrating… please wait';
    const d = window._pendingMigrateData;
    if (d && bsIsConfigured()) {
        try {
            await migrateLocalToBackside(d.tasks || {}, d.projects || [], d.notes || []);
            if (status) status.textContent = '✓ Done!';
        } catch(e) {
            if (status) status.textContent = 'Migration had errors. Some items may not have uploaded.';
        }
    }
    localStorage.setItem('_pt_migrated', '1');
    document.getElementById('migrationModal')?.remove();
}

function doDiscardLocal() {
    localStorage.setItem('_pt_migrated', '1');
    document.getElementById('migrationModal')?.remove();
}

// ── Loading spinner ───────────────────────────────────────────

function showLoadingSpinner() {
    let el = document.getElementById('loadingSpinner');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loadingSpinner';
        el.innerHTML = `
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.85);
                        display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;">
                <div style="font-size:36px;animation:spin 1s linear infinite;">🌸</div>
                <div style="color:#5e8fb5;margin-top:12px;font-size:15px;">Loading your data…</div>
            </div>`;
        document.body.appendChild(el);
    }
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner')?.remove();
}

// ── API error banner ──────────────────────────────────────────

function showApiError(msg) {
    let banner = document.getElementById('apiErrorBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'apiErrorBanner';
        banner.style.cssText =
            'background:#ffebee;color:#c62828;padding:10px 16px;font-size:13px;' +
            'display:flex;justify-content:space-between;align-items:center;' +
            'border-bottom:1px solid #ffcdd2;z-index:500;position:relative;';
        const mainApp = document.getElementById('mainApp');
        if (mainApp) mainApp.prepend(banner);
    }
    banner.innerHTML = `<span>⚠️ ${msg}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:18px;color:#c62828;">×</button>`;
}

// ── Paywall modal ─────────────────────────────────────────────
// TODO: To integrate Stripe, replace showPaymentModal() body with:
//   const { sessionId } = await fetch('/api/create-checkout', {
//       method:'POST', body: JSON.stringify({ plan, contactId })
//   }).then(r => r.json());
//   await Stripe('<publishable-key>').redirectToCheckout({ sessionId });
// Then handle the success URL to call bsMarkPaid(contactId) server-side
// and redirect back to the app.

function showPaywallModal(contact) {
    document.getElementById('paywallModal')?.remove();
    const contactId = contact?.id || localStorage.getItem('currentContactId');
    const el = document.createElement('div');
    el.id = 'paywallModal';
    el.innerHTML = `
        <div class="alert-overlay"></div>
        <div class="custom-alert" style="max-width:420px;text-align:center;">
            <h2 style="color:#5e8fb5;margin-bottom:10px;">🌸 Free Trial Ended</h2>
            <p style="color:#666;margin-bottom:24px;font-size:14px;">Choose a plan to continue using Peaceful Tasks</p>
            <div style="background:#f5f5f5;border-radius:12px;padding:16px;margin-bottom:12px;opacity:0.55;">
                <div style="font-size:18px;font-weight:700;color:#999;">Free Trial</div>
                <div style="color:#bbb;font-size:13px;">Expired</div>
            </div>
            <div style="background:#e3f2fd;border:2px solid #64b5f6;border-radius:12px;padding:16px;margin-bottom:12px;cursor:pointer;"
                 onclick="showPaymentModal('monthly','$4 / month','${contactId}')">
                <div style="font-size:18px;font-weight:700;color:#1565c0;">$4 / month</div>
            </div>
            <div style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border:2px solid #66bb6a;border-radius:12px;
                        padding:16px;margin-bottom:20px;cursor:pointer;position:relative;"
                 onclick="showPaymentModal('yearly','$30 / year','${contactId}')">
                <span style="position:absolute;top:-10px;right:12px;background:#66bb6a;color:white;font-size:11px;
                             padding:2px 10px;border-radius:12px;font-weight:600;">Best Value</span>
                <div style="font-size:18px;font-weight:700;color:#2e7d32;">$30 / year</div>
                <div style="font-size:12px;color:#388e3c;">Save $18 vs monthly</div>
            </div>
        </div>`;
    document.body.appendChild(el);
}

function showPaymentModal(plan, label, contactId) {
    // TODO: Replace this stub with Stripe Checkout (see comment on showPaywallModal above).
    document.getElementById('paymentModal')?.remove();
    const el = document.createElement('div');
    el.id = 'paymentModal';
    el.innerHTML = `
        <div class="alert-overlay"></div>
        <div class="custom-alert" style="max-width:380px;text-align:center;">
            <h3 style="margin-bottom:16px;">${label}</h3>
            <p style="color:#666;margin-bottom:24px;line-height:1.6;">
                Payment processing is not yet available.<br>
                Tap below to continue for free while we set it up.
            </p>
            <button class="login-btn" style="margin:0;" onclick="continueForFree('${contactId}')">Continue for Free</button>
        </div>`;
    document.body.appendChild(el);
}

async function continueForFree(contactId) {
    document.getElementById('paymentModal')?.remove();
    document.getElementById('paywallModal')?.remove();
    if (bsIsConfigured() && contactId) {
        try { await bsMarkPaid(contactId); } catch(e) { console.warn(e); }
    }
    await loadAndShowApp();
}

// ── Invite by Link: URL handling ──────────────────────────────

async function handleInviteToken() {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('invite');
    if (!token) return;

    // Remove token from URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.delete('invite');
    history.replaceState({}, '', url.toString());

    if (!bsIsConfigured()) return;

    try {
        const inviter = await bsFindByInviteToken(token);
        if (!inviter) {
            showCustomAlert('This invite link is invalid or has already been used.');
            return;
        }
        // Pre-fill signup form and note who invited them
        showScreen('createPersonalAccount');
        const hint = document.getElementById('inviteHint');
        if (hint) {
            hint.textContent = `Invited by ${inviter.metadata?.username || 'someone'} 🎉`;
            hint.style.display = 'block';
        }
        // Store token + inviter ID for use during signup
        sessionStorage.setItem('_inviteToken', token);
        sessionStorage.setItem('_inviterId', inviter.id);
    } catch(e) {
        console.error(e);
    }
}

// Call this after successful signup if an invite token was pending
async function clearPendingInvite() {
    const inviterId = sessionStorage.getItem('_inviterId');
    if (inviterId && bsIsConfigured()) {
        try { await bsClearInviteToken(inviterId); } catch(e) { console.warn(e); }
    }
    sessionStorage.removeItem('_inviteToken');
    sessionStorage.removeItem('_inviterId');
}
