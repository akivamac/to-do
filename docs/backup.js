showCustomConfirm(
        'Restore Backup',
        'This will overwrite all current data and reload. Continue?',
        () => {// backup.js — Backup & Restore all localStorage data

function generateBackupCode() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const el = document.getElementById('backupCodeOutput');
    el.value = code;
    el.classList.remove('hidden');
    el.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.getElementById('backupGenerateMsg').classList.remove('hidden');
    setTimeout(() => document.getElementById('backupGenerateMsg').classList.add('hidden'), 3000);
}

function restoreFromCode() {
    const code = document.getElementById('restoreCodeInput').value.trim();
    if (!code) {
        showCustomAlert('Please paste a backup code first.');
        return;
    }
    showCustomConfirm(
        'Restore Backup',
        'This will overwrite all current data and reload. Continue?',
        () => {
            try {
                const data = JSON.parse(decodeURIComponent(escape(atob(code))));
                localStorage.clear();
                for (const [key, value] of Object.entries(data)) {
                    localStorage.setItem(key, value);
                }
                location.reload();
            } catch(e) {
                showCustomAlert('Invalid backup code. Please check and try again.');
            }
        }
    );
}
