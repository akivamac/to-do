        // Alarms & Timers
        let alarms = [];
        let timerInterval = null;
        let timerSeconds = 0;
        let timerRunning = false;
        let alarmCheckInterval = null;

        // Unlock AudioContext on first user interaction (required on Android/iOS)
        let _audioCtxUnlocked = false;
        function _unlockAudio() {
            if (_audioCtxUnlocked) return;
            _audioCtxUnlocked = true;
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const buf = ctx.createBuffer(1, 1, 22050);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
            ctx.resume();
        }
        document.addEventListener('touchstart', _unlockAudio, { once: true });
        document.addEventListener('click', _unlockAudio, { once: true });

        let _alarmSoundSignal = null;

        function loadAlarms() {
            const saved = localStorage.getItem('alarms');
            if (saved) {
                alarms = JSON.parse(saved);
            }
            
            // Start checking alarms
            if (!alarmCheckInterval) {
                alarmCheckInterval = setInterval(checkAlarms, 1000);
            }
        }

        function saveAlarms() {
            localStorage.setItem('alarms', JSON.stringify(alarms));
        }

        function addAlarm() {
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
            saveAlarms();
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
                    <div style="text-align: left; margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Time</label>
                        <div id="editAlarmTimeDisplay" class="add-task-time-btn" style="margin:0 0 15px 0;"
                            onclick="showTimePicker(document.getElementById('editAlarmTimeHidden').value, v=>{document.getElementById('editAlarmTimeHidden').value=v;document.getElementById('editAlarmTimeDisplay').textContent=formatTime(v)||'Set time';})">
                            ${alarm.time ? formatTime(alarm.time) : 'Set time'}
                        </div>
                        <input type="hidden" id="editAlarmTimeHidden" value="${alarm.time}" />

                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Label</label>
                        <input type="text" id="editAlarmLabel" value="${escapeHtml(alarm.label)}" class="login-input" style="margin: 0 0 15px 0;" />
                        
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="editAlarmRecurring" ${alarm.recurring ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
                            <label for="editAlarmRecurring" style="font-weight: 600; color: #666; cursor: pointer;">Recurring (Daily)</label>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="login-btn" onclick="saveEditAlarm(${id})" style="margin: 0;">Save</button>
                        <button class="login-btn back-btn" onclick="closeEditAlarmModal()" style="margin: 0;">Cancel</button>
                    </div>
                </div>
            `;
            
            const modalDiv = document.createElement('div');
            modalDiv.id = 'editAlarmModal';
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);
        }
        
        function saveEditAlarm(id) {
            const alarm = alarms.find(a => a.id === id);
            if (!alarm) return;
            
            alarm.time = document.getElementById('editAlarmTimeHidden').value;
            alarm.label = document.getElementById('editAlarmLabel').value;
            alarm.recurring = document.getElementById('editAlarmRecurring').checked;
            
            saveAlarms();
            renderAlarms();
            closeEditAlarmModal();
        }
        
        function closeEditAlarmModal() {
            const modal = document.getElementById('editAlarmModal');
            if (modal) modal.remove();
        }

        function toggleAlarm(id) {
            const alarm = alarms.find(a => a.id === id);
            if (alarm) {
                alarm.active = !alarm.active;
                alarm.ringing = false;
                saveAlarms();
                renderAlarms();
            }
        }

        function deleteAlarm(id) {
            alarms = alarms.filter(a => a.id !== id);
            saveAlarms();
            renderAlarms();
        }

        function dismissAlarm(id) {
            id = parseInt(id);
            const alarm = alarms.find(a => a.id === id);
            if (alarm) {
                if (_alarmSoundSignal) { _alarmSoundSignal.stopped = true; clearTimeout(_alarmSoundSignal._timer); _alarmSoundSignal = null; }
                alarm.ringing = false;
                alarm.active = false;
                if (alarm.recurring) {
                    alarm.reactivateAfterDismiss = true;
                }
                saveAlarms();
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
                const alarmMinute = timeToMinutes(alarm.time);

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

        function playAlarmSound(stopSignal) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.resume().then(() => {
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
            });
            if (stopSignal && !stopSignal.stopped) {
                stopSignal._timer = setTimeout(() => playAlarmSound(stopSignal), 700);
            }
        }

        function showAlarmNotification(alarm) {
            // Play sound with looping signal
            if (_alarmSoundSignal) { _alarmSoundSignal.stopped = true; clearTimeout(_alarmSoundSignal._timer); }
            _alarmSoundSignal = { stopped: false };
            playAlarmSound(_alarmSoundSignal);
            
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
                `<div style="font-size: 18px; margin-bottom: 10px;">${escapeHtml(alarm.label)}</div>
                <button class="login-btn" onclick="dismissAlarm(${alarm.id});" style="margin: 10px auto 0;">Dismiss Alarm</button>`,
                '⏰ Alarm Ringing!',
                false
            );
        }

        function renderAlarms() {
            const list = document.getElementById('alarmsList');
            
            if (alarms.length === 0) {
                list.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No alarms set</div>';
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
                        <div class="alarm-time">${formatTime(alarm.time)}</div>
                        <div class="alarm-label">${escapeHtml(alarm.label)}${alarm.recurring ? ' 🔄' : ''}</div>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        ${alarm.ringing ? '<button class="login-btn" onclick="dismissAlarm(' + alarm.id + ')" style="padding: 8px 16px; margin: 0; font-size: 14px;">Dismiss</button>' : ''}
                        <button class="edit-btn" onclick="editAlarm(${alarm.id})" style="padding: 8px 16px; font-size: 14px;">Edit</button>
                        <div class="alarm-toggle ${visuallyActive ? 'active' : ''}" onclick="toggleAlarm(${alarm.id})"></div>
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
                    if (_alarmSoundSignal) { _alarmSoundSignal.stopped = true; clearTimeout(_alarmSoundSignal._timer); }
                    _alarmSoundSignal = { stopped: false };
                    playAlarmSound(_alarmSoundSignal);

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

        // Request notification permission on load
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

