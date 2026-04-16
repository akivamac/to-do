        // Alarms & Timers
        let alarms = [];
        let timerInterval = null;
        let timerSeconds = 0;
        let timerRunning = false;
        let stopwatchInterval = null;
        let stopwatchSeconds = 0;
        let stopwatchRunning = false;
        let alarmCheckInterval = null;

        async function loadAlarms() {
            const saved = localStorage.getItem('alarms');
            if (saved) {
                try {
                    if (saved.startsWith('enc:')) {
                        const decrypted = await decryptField(saved);
                        alarms = JSON.parse(decrypted);
                    } else {
                        // Legacy plaintext — parse and re-save encrypted
                        alarms = JSON.parse(saved);
                        await saveAlarms();
                    }
                } catch (e) {
                    console.warn('Failed to load alarms:', e);
                    alarms = [];
                }
            }

            // Start checking alarms
            if (!alarmCheckInterval) {
                alarmCheckInterval = setInterval(checkAlarms, 1000);
            }
        }

        async function saveAlarms() {
            if (typeof sessionCryptoKey !== 'undefined' && sessionCryptoKey) {
                const encrypted = await encryptField(JSON.stringify(alarms));
                localStorage.setItem('alarms', encrypted);
            } else {
                localStorage.setItem('alarms', JSON.stringify(alarms));
            }
        }

        async function addAlarm() {
            const timeInput = document.getElementById('alarmTimeHidden');
            const labelInput = document.getElementById('alarmLabel');
            const recurringInput = document.getElementById('alarmRecurring');

            if (!timeInput.value) {
                showCustomAlert('Please set a time for the alarm');
                return;
            }

            const alarm = {
                id: Date.now(),
                time: timeInput.value,
                label: labelInput.value || 'Alarm',
                active: true,
                ringing: false,
                recurring: recurringInput.checked
            };

            alarms.push(alarm);
            await saveAlarms();
            renderAlarms();

            timeInput.value = '';
            document.getElementById('alarmTimeDisplay').textContent = 'Set alarm time';
            labelInput.value = '';
            recurringInput.checked = false;
        }
        
        function editAlarm(id) {
            const alarm = alarms.find(a => a.id === id);
            if (!alarm) return;

            const modalHTML = `
                <div class="alert-overlay" onclick="closeEditAlarmModal()"></div>
                <div class="custom-alert" onclick="event.stopPropagation()">
                    <h3>Edit Alarm</h3>
                    <div class="edit-alarm-form-container">
                        <label class="edit-alarm-label">Time</label>
                        <div id="editAlarmTimeDisplay" class="add-task-time-btn edit-alarm-input-margin"
                            onclick="showTimePicker(document.getElementById('editAlarmTimeHidden').value, v=>{document.getElementById('editAlarmTimeHidden').value=v;document.getElementById('editAlarmTimeDisplay').textContent=formatTime(v)||'Set time';})">
                            ${alarm.time ? formatTime(alarm.time) : 'Set time'}
                        </div>
                        <input type="hidden" id="editAlarmTimeHidden" value="${alarm.time}" />

                        <label class="edit-alarm-label">Label</label>
                        <input type="text" id="editAlarmLabel" value="${escapeHtml(alarm.label)}" class="login-input edit-alarm-input-margin" />

                        <div class="edit-alarm-checkbox-group">
                            <input type="checkbox" id="editAlarmRecurring" ${alarm.recurring ? 'checked' : ''} class="edit-alarm-checkbox" />
                            <label for="editAlarmRecurring" class="edit-alarm-checkbox-label">Recurring (Daily)</label>
                        </div>
                    </div>
                    <div class="edit-alarm-buttons">
                        <button class="login-btn edit-alarm-button" onclick="saveEditAlarm(${id})">Save</button>
                        <button class="login-btn back-btn edit-alarm-button" onclick="closeEditAlarmModal()">Cancel</button>
                    </div>
                </div>
            `;

            const modalDiv = document.createElement('div');
            modalDiv.id = 'editAlarmModal';
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);
        }
        
        async function saveEditAlarm(id) {
            const alarm = alarms.find(a => a.id === id);
            if (!alarm) return;

            alarm.time = document.getElementById('editAlarmTimeHidden').value;
            alarm.label = document.getElementById('editAlarmLabel').value;
            alarm.recurring = document.getElementById('editAlarmRecurring').checked;

            await saveAlarms();
            renderAlarms();
            closeEditAlarmModal();
        }
        
        function closeEditAlarmModal() {
            const modal = document.getElementById('editAlarmModal');
            if (modal) modal.remove();
        }

        async function toggleAlarm(id) {
            const alarm = alarms.find(a => a.id === id);
            if (alarm) {
                alarm.active = !alarm.active;
                alarm.ringing = false;
                await saveAlarms();
                renderAlarms();
            }
        }

        async function deleteAlarm(id) {
            alarms = alarms.filter(a => a.id !== id);
            await saveAlarms();
            renderAlarms();
        }

        async function dismissAlarm(id) {
            id = parseInt(id);
            const alarm = alarms.find(a => a.id === id);
            if (alarm) {
                alarm.ringing = false;
                alarm.active = false;
                if (alarm.recurring) {
                    alarm.reactivateAfterDismiss = true;
                }
                await saveAlarms();
                renderAlarms();
                closeCustomAlert();
            } else {
                console.error('Alarm not found:', id);
            }
        }

        function checkAlarms() {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const currentMinute = now.getHours() * 60 + now.getMinutes();

            alarms.forEach(alarm => {
                const alarmMinute = parseInt(alarm.time.split(':')[0]) * 60 + parseInt(alarm.time.split(':')[1]);

                // Check if alarm should ring
                if (alarm.active && alarm.time === currentTime && !alarm.ringing) {
                    alarm.ringing = true;
                    alarm.lastRang = currentMinute;
                    saveAlarms();
                    renderAlarms();
                    playAlarmSound();
                    showAlarmNotification(alarm);
                }
                
                // Reset ringing status if time has passed and alarm is recurring
                if (alarm.ringing && alarm.recurring && currentMinute !== alarmMinute) {
                    alarm.ringing = false;
                    saveAlarms();
                }

                // Reactivate recurring alarms after the dismiss minute passes
                if (alarm.reactivateAfterDismiss && !alarm.active && currentMinute !== alarmMinute) {
                    alarm.active = true;
                    delete alarm.reactivateAfterDismiss;
                    saveAlarms();
                    renderAlarms();
                }
            });
        }

        function playAlarmSound() {
            // Create beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // Repeat 3 times
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 800;
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 600);
            
            setTimeout(() => {
                const osc3 = audioContext.createOscillator();
                const gain3 = audioContext.createGain();
                osc3.connect(gain3);
                gain3.connect(audioContext.destination);
                osc3.frequency.value = 800;
                gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc3.start(audioContext.currentTime);
                osc3.stop(audioContext.currentTime + 0.5);
            }, 1200);
        }

        function showAlarmNotification(alarm) {
            // Play sound multiple times
            playAlarmSound();
            setTimeout(playAlarmSound, 1000);
            setTimeout(playAlarmSound, 2000);
            
            // Browser notification - works even when in other apps
            if ('Notification' in window && Notification.permission === 'granted') {
                const notification = new Notification('⏰ Alarm Ringing!', {
                    body: alarm.label,
                    icon: './icon-192.png',
                    requireInteraction: true,
                    tag: 'alarm-' + alarm.id,
                    vibrate: [300, 100, 300, 100, 300],
                    silent: false
                });
                
                notification.onclick = () => {
                    window.focus();
                    parent.focus();
                    notification.close();
                    dismissAlarm(alarm.id);
                };
            } else if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
            
            // Try to focus the window
            if (window.focus) {
                window.focus();
            }
            if (parent && parent.focus) {
                parent.focus();
            }
            
            // Show custom alert popup
            showCustomAlert(
                `<div class="alarm-notification-label">${escapeHtml(alarm.label)}</div>
                <button class="login-btn alarm-dismiss-button" onclick="dismissAlarm(${alarm.id});">Dismiss Alarm</button>`,
                '⏰ Alarm Ringing!',
                false
            );
        }

        function renderAlarms() {
            const list = document.getElementById('alarmsList');

            if (alarms.length === 0) {
                list.innerHTML = '<div class="alarms-empty-state">No alarms set</div>';
                return;
            }

            list.innerHTML = '';

            alarms.sort((a, b) => a.time.localeCompare(b.time));

            alarms.forEach(alarm => {
                const div = document.createElement('div');
                const visuallyActive = alarm.active || alarm.reactivateAfterDismiss;
                div.className = `alarm-item ${visuallyActive ? 'active' : ''} ${alarm.ringing ? 'ringing' : ''}`;

                div.innerHTML = `
                    <div class="alarm-info">
                        <div class="alarm-time">${escapeHtml(alarm.time)}</div>
                        <div class="alarm-label">${escapeHtml(alarm.label)}${alarm.recurring ? ' 🔄' : ''}</div>
                    </div>
                    <div class="alarm-actions">
                        ${alarm.ringing ? '<button class="login-btn alarm-button-small" onclick="dismissAlarm(' + alarm.id + ')">Dismiss</button>' : ''}
                        <button class="edit-btn edit-button-small" onclick="editAlarm(${alarm.id})">Edit</button>
                        <div class="alarm-toggle ${visuallyActive ? 'active' : ''}" onclick="toggleAlarm(${alarm.id})" role="switch" aria-checked="${visuallyActive ? 'true' : 'false'}" aria-label="Toggle alarm" tabindex="0" onkeydown="if(event.key===' '||event.key==='Enter')toggleAlarm(${alarm.id})"></div>
                        <button class="delete-btn" onclick="deleteAlarm(${alarm.id})">Delete</button>
                    </div>
                `;

                list.appendChild(div);
            });
        }

        // Timer functions
        function startTimer() {
            const hours = parseInt(document.getElementById('timerHours').value) || 0;
            const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
            const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
            
            if (!timerRunning) {
                timerSeconds = hours * 3600 + minutes * 60 + seconds;
                
                if (timerSeconds === 0) {
                    showCustomAlert('Please set a time for the timer');
                    return;
                }
            }
            
            timerRunning = true;
            document.getElementById('startTimerBtn').style.display = 'none';
            document.getElementById('pauseTimerBtn').style.display = 'inline-block';
            
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    pauseTimer();
                    playAlarmSound();
                    setTimeout(playAlarmSound, 1000);
                    setTimeout(playAlarmSound, 2000);
                    
                    const label = document.getElementById('timerLabel').value || 'Timer';
                    
                    // Browser notification - works even in other apps
                    if ('Notification' in window && Notification.permission === 'granted') {
                        const notification = new Notification('⏱️ Timer Complete!', {
                            body: label,
                            icon: './icon-192.png',
                            requireInteraction: true,
                            vibrate: [300, 100, 300],
                            silent: false
                        });
                        
                        notification.onclick = () => {
                            window.focus();
                            notification.close();
                        };
                    }
                    
                    // Try to focus window
                    if (window.focus) window.focus();
                    if (parent && parent.focus) parent.focus();
                    
                    showCustomAlert(label, '⏱️ Timer Complete!');
                }
            }, 1000);
        }

        function pauseTimer() {
            timerRunning = false;
            clearInterval(timerInterval);
            document.getElementById('startTimerBtn').style.display = 'inline-block';
            document.getElementById('pauseTimerBtn').style.display = 'none';
        }

        function resetTimer() {
            pauseTimer();
            timerSeconds = 0;
            updateTimerDisplay();
            document.getElementById('timerHours').value = 0;
            document.getElementById('timerMinutes').value = 0;
            document.getElementById('timerSeconds').value = 0;
        }

        function updateTimerDisplay() {
            const hours = Math.floor(timerSeconds / 3600);
            const minutes = Math.floor((timerSeconds % 3600) / 60);
            const seconds = timerSeconds % 60;
            
            document.getElementById('timerDisplay').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        // Stopwatch functions
        function startStopwatch() {
            stopwatchRunning = true;
            document.getElementById('startStopwatchBtn').style.display = 'none';
            document.getElementById('pauseStopwatchBtn').style.display = 'inline-block';
            
            stopwatchInterval = setInterval(() => {
                stopwatchSeconds++;
                updateStopwatchDisplay();
            }, 1000);
        }

        function pauseStopwatch() {
            stopwatchRunning = false;
            clearInterval(stopwatchInterval);
            document.getElementById('startStopwatchBtn').style.display = 'inline-block';
            document.getElementById('pauseStopwatchBtn').style.display = 'none';
        }

        function resetStopwatch() {
            pauseStopwatch();
            stopwatchSeconds = 0;
            updateStopwatchDisplay();
        }

        function updateStopwatchDisplay() {
            const hours = Math.floor(stopwatchSeconds / 3600);
            const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
            const seconds = stopwatchSeconds % 60;
            
            document.getElementById('stopwatchDisplay').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        // Request notification permission on load
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

