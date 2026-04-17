document.addEventListener('DOMContentLoaded', () => {

    // ── Static element listeners ──────────────────────────────────────────────

    // Install banner
    const installAppBtn = document.getElementById('installBanner')?.querySelector('button:first-of-type');
    if (installAppBtn) installAppBtn.addEventListener('click', installApp);
    const dismissInstallBtn = document.querySelector('#installBanner .dismiss-install-btn');
    if (dismissInstallBtn) dismissInstallBtn.addEventListener('click', dismissInstall);

    // Update banner
    const updateBanner = document.getElementById('updateBanner');
    if (updateBanner) {
        const [updateBtn, dismissBtn] = updateBanner.querySelectorAll('button');
        if (updateBtn) updateBtn.addEventListener('click', updateApp);
        if (dismissBtn) dismissBtn.addEventListener('click', dismissUpdate);
    }

    // Hero buttons
    const signinBtn = document.querySelector('.signin-btn');
    if (signinBtn) signinBtn.addEventListener('click', showSignIn);
    const signupBtn = document.querySelector('.signup-btn');
    if (signupBtn) signupBtn.addEventListener('click', showCreateAccount);

    // OS selector
    const osSelector = document.getElementById('osSelector');
    if (osSelector) osSelector.addEventListener('change', () => updateInstallInstructions(osSelector.value));

    // Android install prompt button
    const triggerInstallBtn = document.querySelector('.install-btn-action');
    if (triggerInstallBtn) triggerInstallBtn.addEventListener('click', triggerInstallPrompt);

    // Footer legal links
    const termsLink = document.querySelector('.footer-link[data-legal="terms"]');
    if (termsLink) termsLink.addEventListener('click', e => { e.preventDefault(); showLegalModal('terms'); });
    const privacyLink = document.querySelector('.footer-link[data-legal="privacy"]');
    if (privacyLink) privacyLink.addEventListener('click', e => { e.preventDefault(); showLegalModal('privacy'); });
    const securityLink = document.querySelector('.footer-link[data-legal="security"]');
    if (securityLink) securityLink.addEventListener('click', e => { e.preventDefault(); showLegalModal('security'); });

    // Auth forms
    const createAccountForm = document.getElementById('createAccountForm');
    if (createAccountForm) createAccountForm.addEventListener('submit', e => { e.preventDefault(); createPersonalAccount(); });
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', e => { e.preventDefault(); loginPersonalAccount(); });

    // Auth navigation buttons
    const backToSigninBtn = document.getElementById('backToSigninBtn');
    if (backToSigninBtn) backToSigninBtn.addEventListener('click', () => {
        showScreen('loginPersonalAccount');
        history.pushState(null, '', '/to-do/login');
    });
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) backToHomeBtn.addEventListener('click', showLandingPage);
    const testModeBtn = document.getElementById('testModeBtn');
    if (testModeBtn) testModeBtn.addEventListener('click', testModeLogin);

    // App header
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Nav tabs
    document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    // Today tab
    const taskInput = document.getElementById('taskInput');
    if (taskInput) taskInput.addEventListener('input', () => showPeacefulSuggestion('taskInput', 'taskSuggestion'));
    const voiceMicButton = document.getElementById('voiceMicButton');
    if (voiceMicButton) voiceMicButton.addEventListener('click', startVoiceInput);
    const taskTimeDisplay = document.getElementById('taskTimeDisplay');
    if (taskTimeDisplay) taskTimeDisplay.addEventListener('click', () => {
        showTimePicker(document.getElementById('taskTime').value, v => {
            document.getElementById('taskTime').value = v;
            document.getElementById('taskTimeDisplay').textContent = formatTime(v) || 'Set time';
        });
    });
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);

    // Projects tab
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) addProjectBtn.addEventListener('click', addProject);
    const addTaskToProjectBtn = document.getElementById('addTaskToProjectBtn');
    if (addTaskToProjectBtn) addTaskToProjectBtn.addEventListener('click', addTaskToProject);
    const closeProjectTasksBtn = document.getElementById('closeProjectTasksBtn');
    if (closeProjectTasksBtn) closeProjectTasksBtn.addEventListener('click', closeProjectTasks);

    // Lists tab
    const createListBtn = document.getElementById('createListBtn');
    if (createListBtn) createListBtn.addEventListener('click', createList);
    const addListItemBtn = document.getElementById('addListItemBtn');
    if (addListItemBtn) addListItemBtn.addEventListener('click', addListItem);
    const clearListCheckedBtn = document.getElementById('clearListCheckedBtn');
    if (clearListCheckedBtn) clearListCheckedBtn.addEventListener('click', clearListChecked);
    const closeListDetailBtn = document.getElementById('closeListDetailBtn');
    if (closeListDetailBtn) closeListDetailBtn.addEventListener('click', closeListDetail);

    // Notes tab
    const newNoteBtn = document.getElementById('newNoteBtn');
    if (newNoteBtn) newNoteBtn.addEventListener('click', createNote);
    const closeNoteEditorBtn = document.getElementById('closeNoteEditorBtn');
    if (closeNoteEditorBtn) closeNoteEditorBtn.addEventListener('click', closeNoteEditor);
    const noteTitleInput = document.getElementById('noteTitleInput');
    if (noteTitleInput) noteTitleInput.addEventListener('input', saveCurrentNote);
    const downloadNoteBtn = document.querySelector('.download-note-btn');
    if (downloadNoteBtn) downloadNoteBtn.addEventListener('click', downloadCurrentNote);
    const deleteNoteBtn = document.querySelector('.delete-note-btn');
    if (deleteNoteBtn) deleteNoteBtn.addEventListener('click', deleteCurrentNote);

    // Note toolbar
    document.querySelectorAll('.tb-btn[data-command]').forEach(btn => {
        btn.addEventListener('click', () => noteFormat(btn.dataset.command));
    });
    document.querySelectorAll('.tb-btn[data-align]').forEach(btn => {
        btn.addEventListener('click', () => noteAlign(btn.dataset.align));
    });
    const previewToggleBtn = document.getElementById('previewToggleBtn');
    if (previewToggleBtn) previewToggleBtn.addEventListener('click', toggleNotePreview);
    const headingSelector = document.getElementById('headingSelector');
    if (headingSelector) headingSelector.addEventListener('change', () => {
        noteFormatHeading(headingSelector.value);
        headingSelector.value = '';
    });
    const fontSizeSelector = document.getElementById('fontSizeSelector');
    if (fontSizeSelector) fontSizeSelector.addEventListener('change', () => {
        noteSetFontSize(fontSizeSelector.value);
        fontSizeSelector.value = '';
    });
    const noteEditor = document.getElementById('noteEditor');
    if (noteEditor) noteEditor.addEventListener('input', saveCurrentNote);

    // Settings — completed tasks to bottom toggle
    const completedToggle = document.getElementById('completedToBottomToggle');
    if (completedToggle) {
        completedToggle.addEventListener('change', (e) => {
            localStorage.setItem('_pt_completed_bottom', e.target.checked);
            renderTodayTasks();
        });
    }

    // Points tab — admin long-press / right-click
    const totalHugs = document.getElementById('totalHugs');
    if (totalHugs) {
        totalHugs.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openAdminAccess(e);
        });
        totalHugs.addEventListener('dblclick', (e) => {
            openAdminAccess(e);
        });
        totalHugs.addEventListener('mousedown', startLongPress);
        totalHugs.addEventListener('mouseup', cancelLongPress);
        totalHugs.addEventListener('mouseleave', cancelLongPress);
        totalHugs.addEventListener('touchstart', startLongPress, { passive: true });
        totalHugs.addEventListener('touchend', cancelLongPress);
    }

    // Settings tab — admin access trigger on trash icon
    const adminTrigger = document.getElementById('adminAccessTrigger');
    if (adminTrigger) {
        adminTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openAdminAccess(e);
        });
    }

    // Alarms tab
    const alarmTimeDisplay = document.getElementById('alarmTimeDisplay');
    if (alarmTimeDisplay) alarmTimeDisplay.addEventListener('click', () => {
        showTimePicker(document.getElementById('alarmTimeHidden').value, v => {
            document.getElementById('alarmTimeHidden').value = v;
            document.getElementById('alarmTimeDisplay').textContent = formatTime(v) || 'Set alarm time';
        });
    });
    const addAlarmBtn = document.getElementById('addAlarmBtn');
    if (addAlarmBtn) addAlarmBtn.addEventListener('click', addAlarm);
    const startTimerBtn = document.getElementById('startTimerBtn');
    if (startTimerBtn) startTimerBtn.addEventListener('click', startTimer);
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', pauseTimer);
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', resetTimer);

    // Settings tab
    const settingsInstallBtn = document.getElementById('settingsInstallBtn');
    if (settingsInstallBtn) settingsInstallBtn.addEventListener('click', installAppFromButton);
    const copyCredentialBtn = document.querySelector('.copy-btn');
    if (copyCredentialBtn) copyCredentialBtn.addEventListener('click', function() {
        copyCredential('settingsUsername', this);
    });
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    document.querySelectorAll('.star-btn[data-rating]').forEach(btn => {
        btn.addEventListener('click', () => selectReviewRating(parseInt(btn.dataset.rating)));
    });
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    if (submitReviewBtn) submitReviewBtn.addEventListener('click', submitReview);
    const submitFeatureRequestBtn = document.getElementById('submitFeatureRequestBtn');
    if (submitFeatureRequestBtn) submitFeatureRequestBtn.addEventListener('click', submitFeatureRequest);
    const generateInviteLinkBtn = document.getElementById('generateInviteLinkBtn');
    if (generateInviteLinkBtn) generateInviteLinkBtn.addEventListener('click', generateInviteLink);
    const clearAllDataBtn = document.querySelector('.danger-btn');
    if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', clearAllData);

    // Edit Day Modal
    const editDayModal = document.getElementById('editDayModal');
    if (editDayModal) editDayModal.addEventListener('click', closeEditDayIfOutside);
    const closeEditDayBtn = document.getElementById('closeEditDayBtn');
    if (closeEditDayBtn) closeEditDayBtn.addEventListener('click', closeEditDay);
    const editDayAddTaskBtn = document.querySelector('#editDayModal .add-task-btn');
    if (editDayAddTaskBtn) editDayAddTaskBtn.addEventListener('click', addTaskToEditDay);

    // Admin Access Modal
    const adminAccessModal = document.getElementById('adminAccessModal');
    if (adminAccessModal) adminAccessModal.addEventListener('click', closeAdminAccessIfOutside);
    const closeAdminAccessBtn = document.getElementById('closeAdminAccessBtn');
    if (closeAdminAccessBtn) closeAdminAccessBtn.addEventListener('click', closeAdminAccess);

    // Admin Panel
    const exitAdminPanelBtn = document.getElementById('exitAdminPanelBtn');
    if (exitAdminPanelBtn) exitAdminPanelBtn.addEventListener('click', exitAdminPanel);

    // Note toolbar — action-specific buttons
    document.querySelectorAll('.tb-btn[data-note-action="insertAlphaList"]').forEach(b => b.addEventListener('click', noteInsertAlphaList));
    document.querySelectorAll('.tb-btn[data-note-action="insertLink"]').forEach(b => b.addEventListener('click', noteInsertLink));
    document.querySelectorAll('.tb-btn[data-note-action="insertTable"]').forEach(b => b.addEventListener('click', noteInsertTable));
    document.querySelectorAll('.tb-btn[data-note-action="insertHR"]').forEach(b => b.addEventListener('click', noteInsertHR));

    // ── Single delegated click handler ─────────────────────────────────────────
    document.addEventListener('click', e => {
        // Special ID-based delegation (complex time picker openers)
        if (e.target.id === 'editTaskTimeDisplay') {
            showTimePicker(document.getElementById('editTaskTimeHidden').value, v => {
                document.getElementById('editTaskTimeHidden').value = v;
                document.getElementById('editTaskTimeDisplay').value = formatTime(v);
            });
            return;
        }
        if (e.target.id === 'editAlarmTimeDisplay') {
            showTimePicker(document.getElementById('editAlarmTimeHidden').value, v => {
                document.getElementById('editAlarmTimeHidden').value = v;
                document.getElementById('editAlarmTimeDisplay').textContent = formatTime(v) || 'Set time';
            });
            return;
        }
        // Auto-select readonly inputs
        if (e.target.matches('.auto-select-on-click')) {
            e.target.select();
            return;
        }

        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.dataset.action;

        switch (action) {
            // Tasks
            case 'delete-task':
                deleteTask(parseInt(el.dataset.index));
                break;
            case 'edit-task':
                editTask(parseInt(el.dataset.index), el.dataset.isEditDay === 'true');
                break;
            case 'delete-edit-day-task':
                deleteEditDayTask(parseInt(el.dataset.index));
                break;
            case 'save-edit-task':
                saveEditTask(parseInt(el.dataset.index), el.dataset.isEditDay === 'true');
                break;
            case 'close-edit-task-modal':
                closeEditTaskModal();
                break;
            case 'clear-edit-task-time':
                document.getElementById('editTaskTimeHidden').value = '';
                document.getElementById('editTaskTimeDisplay').value = '';
                break;
            case 'reschedule-past-task':
                reschedulePastTask(el.dataset.date, parseInt(el.dataset.idx), el.dataset.target);
                break;

            // Alarms
            case 'dismiss-alarm':
                dismissAlarm(parseInt(el.dataset.id));
                break;
            case 'edit-alarm':
                editAlarm(parseInt(el.dataset.id));
                break;
            case 'toggle-alarm':
                toggleAlarm(parseInt(el.dataset.id));
                break;
            case 'delete-alarm':
                deleteAlarm(parseInt(el.dataset.id));
                break;
            case 'save-edit-alarm':
                saveEditAlarm(parseInt(el.dataset.id));
                break;
            case 'close-edit-alarm-modal':
                closeEditAlarmModal();
                break;

            // Notes
            case 'open-note':
                openNote(parseInt(el.dataset.id));
                break;

            // Projects
            case 'show-project-tasks':
                showProjectTasks(el.dataset.id);
                break;
            case 'rename-project':
                renameProject(el.dataset.id);
                break;
            case 'delete-project':
                deleteProject(el.dataset.id);
                break;

            // Modals (dynamic)
            case 'close-legal-modal': {
                const m = document.getElementById('legalModal');
                if (m) m.remove();
                break;
            }
            case 'stay-signed-in': {
                const w = document.getElementById('_sessionWarnModal');
                if (w) w.remove();
                _resetSessionTimer();
                break;
            }
            case 'close-custom-alert':
                closeCustomAlert();
                break;
            case 'close-custom-confirm': {
                const cc = document.getElementById('customConfirmModal');
                if (cc) cc.remove();
                break;
            }
            case 'close-custom-prompt': {
                const cp = document.getElementById('customPromptModal');
                if (cp) cp.remove();
                break;
            }
            case 'close-past-incomplete': {
                const pi = document.getElementById('pastIncompleteModal');
                if (pi) pi.remove();
                break;
            }

            // Lists
            case 'open-list-detail':
                openListDetail(el.dataset.id);
                break;
            case 'dismiss-hints-banner': {
                const hb = document.getElementById('hintsBanner');
                if (hb) hb.remove();
                sessionStorage.setItem('_hintsDismissed', '1');
                break;
            }
            case 'dismiss-dblclick-tip': {
                const tip = document.getElementById('dblClickTip');
                if (tip) tip.remove();
                sessionStorage.setItem('_dblClickTip', '1');
                break;
            }
            case 'close-time-picker': {
                const tp = document.getElementById('timePickerModal');
                if (tp) tp.remove();
                break;
            }
            case 'confirm-time-picker':
                confirmTimePicker();
                break;
            case 'set-admin-password':
                setAdminPassword();
                break;
            case 'verify-admin-password':
                verifyAdminPassword();
                break;
            case 'note-underline':
                noteFormat('underline');
                break;
            case 'dismiss-hints':
                document.getElementById('hintsBanner')?.remove();
                break;
            case 'mark-feature-request-done':
                markFeatureRequestDone(el.dataset.id);
                break;
        }
    });

    // ── Delegated change handler ───────────────────────────────────────────────
    document.addEventListener('change', e => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        const action = el.dataset.action;

        switch (action) {
            case 'toggle-task':
                toggleTask(parseInt(el.dataset.index));
                break;
            case 'toggle-edit-day-task':
                toggleEditDayTask(parseInt(el.dataset.index));
                break;
            case 'toggle-project-task':
                toggleProjectTask(parseInt(el.dataset.id), el.dataset.date);
                break;
            case 'complete-past-task':
                completePastTask(el.dataset.date, parseInt(el.dataset.idx));
                break;
            case 'toggle-list-item':
                toggleListItem(el.dataset.id, parseInt(el.dataset.idx));
                break;
        }
    });

    // ── Delegated input handler ───────────────────────────────────────────────
    document.addEventListener('input', e => {
        if (e.target.id === 'editTaskText') {
            showPeacefulSuggestion('editTaskText', 'editTaskSuggestion');
        }
    });

    // ── Delegated keydown handler ─────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') {
            const el = e.target.closest('[data-action="toggle-alarm"]');
            if (el) toggleAlarm(parseInt(el.dataset.id));
        }
    });

});
