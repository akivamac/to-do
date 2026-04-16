        // Task Management

        // ── Peaceful task name suggestions ───────────────────────────
        // Maps stressful words/phrases → calmer alternatives.
        // Zero external API calls — all suggestions are from this local lookup table.
        const STRESS_REWRITES = {
            // ── TIME PRESSURE ──
            'urgent': 'soon',
            'asap': 'soon',
            'immediately': 'today',
            'right now': 'when ready',
            'deadline': 'due date',
            'overdue': 'to revisit',
            'last minute': 'upcoming',
            'in a hurry': 'upcoming',
            'hurry': 'handle',
            'rush': 'do',
            'rushed': 'managed',
            'rushing': 'working on',
            'no time': 'limited time for',
            'asap!': 'soon',
            'urgent!': 'soon',

            // ── SEVERITY & IMPORTANCE ──
            'critical': 'important',
            'crisis': 'situation to address',
            'dire': 'noteworthy',
            'vital': 'important',
            'crucial': 'important',
            'essential': 'valuable',
            'must do': 'should do',
            'must have': 'want to have',
            'must': 'should',
            'have to': 'can',
            'got to': 'aim to',
            'need to': 'want to',
            'supposed to': 'choose to',
            'obligated': 'committed',
            'required': 'helpful',

            // ── EMOTIONAL DISTRESS ──
            'stress': 'work on',
            'stressed': 'managing',
            'stressful': 'challenging',
            'panic': 'address',
            'panicking': 'take a breath and',
            'panicked': 'regrouping from',
            'overwhelm': 'manage',
            'overwhelmed': 'working through',
            'drowning': 'managing a lot of',
            'suffocating': 'managing',
            'trapped': 'navigating',
            'stuck': 'working on getting past',
            'helpless': 'learning to navigate',
            'hopeless': 'exploring options for',
            'desperate': 'determined',
            'desperation': 'determination',
            'anxiety': 'managing',
            'anxious': 'aware of',
            'nervous': 'preparing for',
            'terrified': 'cautious about',
            'scared': 'preparing for',

            // ── FAILURE & NEGATIVITY ──
            'failing': 'learning from',
            'failure': 'learning opportunity',
            'failed': 'attempted',
            'disaster': 'challenge',
            'catastrophe': 'setback',
            'broken': 'needs attention',
            'toxic': 'difficult',
            'negative': 'considering',
            'worst': 'challenging',
            'terrible': 'tough',
            'horrible': 'difficult',
            'awful': 'challenging',

            // ── OBLIGATION & PRESSURE ──
            'forced': 'choose to',
            'forced to': 'choosing to',
            'pushed': 'encouraged to',
            'pressure': 'focus on',
            'pressured': 'motivated to',
            'nagging': 'remember to',
            'should': 'could',
            'can\'t': 'finding ways to',
            'won\'t': 'choosing not to',
            'don\'t want to': 'thinking about',
            'hate': 'prefer not to',

            // ── INTENSITY & SCALE ──
            'crushing': 'working through',
            'crushed': 'processing',
            'insane': 'intense',
            'crazy': 'interesting',
            'impossible': 'challenging',
            'unbearable': 'managing',
            'unmanageable': 'working on',
            'massive': 'significant',
            'gigantic': 'substantial',
            'enormous': 'considerable',
            'endless': 'ongoing',

            // ── TIME-RELATED STRESS ──
            'behind': 'catching up on',
            'late': 'upcoming',
            'delayed': 'rescheduling',
            'procrastinating': 'preparing to start',
            'procrastinate': 'prepare to start',
            'putting off': 'preparing for',
            'avoiding': 'preparing for',
            'stuck on': 'working on',
            'stalled': 'paused on',

            // ── DEMAND & BURDEN ──
            'demanding': 'requiring attention',
            'burden': 'responsibility',
            'burdened': 'managing',
            'exhausting': 'tiring but doable',
            'exhausted': 'resting after',
            'draining': 'takes energy',
            'drained': 'recovering from',
            'wearing': 'challenging',
            'relentless': 'ongoing',

            // ── CONFLICT & DIFFICULTY ──
            'fight': 'work through',
            'fighting': 'working through',
            'battle': 'navigate',
            'battling': 'navigating',
            'struggle': 'work on',
            'struggling': 'working on',
            'conflict': 'communication about',
            'confrontation': 'discussion with',
            'argument': 'conversation with',
            'difficult': 'challenging',
            'hard': 'challenging',

            // ── HEALTH & WELL-BEING ──
            'sick': 'managing',
            'tired': 'pace myself on',
            'exhaustion': 'recovery from',
            'burnout': 'rest and renewal for',
            'worn out': 'refresh from',
            'pain': 'address',
            'suffering': 'manage',

            // ── JUDGMENT & SHAME ──
            'stupid': 'learning',
            'idiot': 'reflection on',
            'dumb': 'rethinking',
            'loser': 'exploring new approach to',
            'useless': 'working on improving',
            'worthless': 'reclaiming value in',
            'shame': 'reflect on',
            'ashamed': 'learning from',
            'guilty': 'addressing',

            // ── EXTREME LANGUAGE ──
            'dying': 'urgent but manageable',
            'die': 'complete',
            'dead': 'done',
            'kill': 'complete',
            'killing me': 'challenging',
            'destroy': 'resolve',
            'destroyed': 'recovering from',
            'hell': 'difficulty',
            'nightmare': 'challenging',
            'dread': 'prepare for',
            'dreading': 'preparing for',
            'fear': 'prepare for',
            'fearful': 'cautious about'
        };

        function getPeacefulSuggestion(text) {
            if (!text) return null;
            const lower = text.toLowerCase();
            for (const [bad, calm] of Object.entries(STRESS_REWRITES)) {
                if (lower.includes(bad)) {
                    const calmed = text.replace(new RegExp(bad, 'gi'), calm);
                    if (calmed.toLowerCase() !== lower) return calmed;
                }
            }
            return null;
        }

        function showPeacefulSuggestion(inputId, suggestionId) {
            const input = document.getElementById(inputId);
            const box   = document.getElementById(suggestionId);
            if (!input || !box) return;
            const suggestion = getPeacefulSuggestion(input.value);
            if (suggestion) {
                box.innerHTML = `💚 Calmer wording: <em>"${escapeHtml(suggestion)}"</em>
                    <button class="peaceful-accept-btn"
                        data-input-id="${escapeHtml(inputId)}"
                        data-suggestion="${escapeHtml(suggestion)}"
                        data-box-id="${escapeHtml(suggestionId)}">Use this</button>
                    <button class="peaceful-dismiss-btn"
                        data-box-id="${escapeHtml(suggestionId)}">×</button>`;
                box.style.display = 'block';

                // Event delegation for buttons
                const acceptBtn = box.querySelector('.peaceful-accept-btn');
                const dismissBtn = box.querySelector('.peaceful-dismiss-btn');

                if (acceptBtn) {
                    acceptBtn.onclick = () => {
                        const iId = acceptBtn.dataset.inputId;
                        const suggestion = acceptBtn.dataset.suggestion;
                        const bId = acceptBtn.dataset.boxId;
                        const inp = document.getElementById(iId);
                        if (inp) inp.value = suggestion;
                        const b = document.getElementById(bId);
                        if (b) b.style.display = 'none';
                    };
                }

                if (dismissBtn) {
                    dismissBtn.onclick = () => {
                        const bId = dismissBtn.dataset.boxId;
                        const b = document.getElementById(bId);
                        if (b) b.style.display = 'none';
                    };
                }
            } else {
                box.style.display = 'none';
            }
        }

        // ── Double-click tooltip (once per session) ──────────────────
        function maybeShowDblClickTooltip() {
            if (sessionStorage.getItem('_dblClickTip')) return;
            const el = document.createElement('div');
            el.id = 'dblClickTip';
            el.style.cssText = 'background:#fff8e1;border-left:3px solid #ffc107;padding:8px 12px;' +
                'border-radius:6px;font-size:12px;color:#555;display:flex;justify-content:space-between;' +
                'align-items:center;margin-bottom:8px;';
            el.innerHTML = `<span>✏️ Tip: you can also <strong>double-click</strong> a task to edit it</span>
                <button class="modal-close-btn" onclick="this.parentElement.remove();sessionStorage.setItem('_dblClickTip','1')">×</button>`;
            const taskList = document.getElementById('taskList');
            if (taskList) taskList.before(el);
        }

        function populateAssignDropdowns() {
            const accounts = getAccounts();
            const actualUsername = currentUser.includes('::') ? currentUser.split('::')[0] : currentUser;
            const currentAccount = accounts[actualUsername];
            
            let options = '<option value="">No one</option>';
            
            if (currentAccount && currentAccount.type === 'group') {
                if (currentAccount.members) {
                    currentAccount.members.forEach(member => {
                        options += `<option value="${member}">${member}</option>`;
                    });
                }
                if (currentAccount.subAccounts) {
                    currentAccount.subAccounts.forEach(sub => {
                        options += `<option value="${sub.username}">${sub.displayName || sub.username}</option>`;
                    });
                }
            }
            
            const todayAssign = document.getElementById('taskAssign');
            const editDayAssign = document.getElementById('editDayTaskAssign');
            
            if (todayAssign) todayAssign.innerHTML = options;
            if (editDayAssign) editDayAssign.innerHTML = options;
        }

        function rolloverTasks() {
            const today = formatDate(new Date());

            const rolloverKey = 'lastRolloverDate_' + currentUser;
            if (localStorage.getItem(rolloverKey) === today) return;

            let rolled = false;

            Object.keys(tasks).forEach(dateKey => {
                if (dateKey < today) {
                    const unfinished = tasks[dateKey].filter(t => !t.completed);
                    const finished = tasks[dateKey].filter(t => t.completed);

                    if (unfinished.length > 0) {
                        if (!tasks[today]) tasks[today] = [];
                        unfinished.forEach(t => {
                            t.rolledFrom = t.rolledFrom || dateKey;
                            tasks[today].push(t);
                        });
                        rolled = true;
                    }

                    // Keep only completed tasks in old dates (for history)
                    tasks[dateKey] = finished;
                }
            });

            localStorage.setItem(rolloverKey, today);

            if (rolled) {
                saveUserData();
                syncData();
            }
        }

        function renderTodayTasks() {
            rolloverTasks();
            populateAssignDropdowns();
            const today = formatDate(new Date());
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';

            const todayTasks = tasks[today] || [];

            // ── Progress bar ────────────────────────────────────────
            const total     = todayTasks.length;
            const done      = todayTasks.filter(t => t.completed).length;
            const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
            let progressEl  = document.getElementById('todayProgressWrap');
            if (!progressEl) {
                progressEl = document.createElement('div');
                progressEl.id = 'todayProgressWrap';
                progressEl.style.cssText = 'margin-bottom:16px;';
                taskList.before(progressEl);
            }
            progressEl.innerHTML = total === 0 ? '' : `
                <div class="progress-labels">
                    <span>${done} of ${total} tasks completed</span><span>${pct}%</span>
                </div>
                <div class="progress-background">
                    <div class="progress-fill" style="width:${pct}%;"></div>
                </div>`;

            if (todayTasks.length === 0) {
                taskList.innerHTML = '<div class="empty-state">No tasks for today. Add one above! 📝</div>';
                maybeShowDblClickTooltip();
                return;
            }

            todayTasks.forEach((task, index) => {
                const taskDiv = document.createElement('div');
                taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskDiv.draggable = true;
                taskDiv.dataset.index = index;

                taskDiv.addEventListener('dragstart', handleDragStart);
                taskDiv.addEventListener('dragover', handleDragOver);
                taskDiv.addEventListener('drop', handleDrop);
                taskDiv.addEventListener('dragend', handleDragEnd);

                // Double-click to edit (keep for power users)
                taskDiv.addEventListener('dblclick', (e) => {
                    if (!e.target.matches('input,button,select')) editTask(index, false);
                });

                let assignedTag = '';
                if (task.assignedTo) {
                    assignedTag = `<span class="task-assigned">@${escapeHtml(task.assignedTo)}</span>`;
                }
                let projectTag = '';
                if (task.project) {
                    const proj = projects.find(p => String(p.id) === String(task.project));
                    if (proj) projectTag = `<span class="task-project-tag">📁 ${escapeHtml(proj.name)}</span>`;
                }
                let rolloverTag = '';
                if (task.rolledFrom) {
                    rolloverTag = `<span class="task-rollover-tag" title="Rolled over from ${escapeHtml(task.rolledFrom)}">↩</span>`;
                }

                taskDiv.innerHTML = `
                    <span class="drag-handle" aria-label="Drag to reorder" tabindex="0">☰</span>
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                    <div class="task-content-flex">
                        <span class="task-text ${task.rolledFrom ? 'task-text-faded' : ''}">${escapeHtml(task.text)}</span>
                        ${task.time ? `<span class="task-time">${formatTime(task.time)}</span>` : ''}
                        ${assignedTag}${projectTag}${rolloverTag}
                    </div>
                    <button class="task-edit-btn" onclick="editTask(${index}, false)" title="Edit task" aria-label="Edit task">✏️</button>
                    <button class="task-delete" onclick="deleteTask(${index})" aria-label="Delete task">Delete</button>
                `;

                taskList.appendChild(taskDiv);
            });

            maybeShowDblClickTooltip();
        }

        async function addTask() {
            const input       = document.getElementById('taskInput');
            const timeInput   = document.getElementById('taskTime');
            const assignInput = document.getElementById('taskAssign');
            const projectInput= document.getElementById('taskProject');
            const text = input.value.trim();
            if (!text) return;

            const today = formatDate(new Date());
            if (!tasks[today]) tasks[today] = [];

            const task = {
                text,
                time:       timeInput.value || '',
                completed:  false,
                assignedTo: assignInput.value || '',
                project:    projectInput ? projectInput.value || '' : '',
                id:         Date.now(),
                createdBy:  currentUser,
                createdAt:  new Date().toISOString()
            };
            tasks[today].push(task);

            renderTodayTasks();
            saveUserData();
            syncData();

            if (bsIsConfigured()) {
                bsSyncTask(task, today)
                    .then(() => showApiError('✓ Task synced to Backside'))
                    .catch(e => showApiError('✗ Could not sync task: ' + e.message));
            }

            input.value = '';
            timeInput.value = '';
            assignInput.value = '';
            if (projectInput) projectInput.value = '';
        }

        async function toggleTask(index) {
            const today = formatDate(new Date());
            const task = tasks[today][index];
            const wasCompleted = task.completed;
            task.completed = !task.completed;

            if (!wasCompleted && task.completed && !task.hasBeenCompleted) {
                task.hasBeenCompleted = true;
                completedTasksCount++;
                checkPointReward();
            }

            renderTodayTasks();
            saveUserData();
            syncData();
            if (bsIsConfigured()) bsSyncTask(task, today).catch(console.error);
            if (currentView === 'projects' && currentProjectId) showProjectTasks(currentProjectId);
        }

        async function deleteTask(index) {
            const today = formatDate(new Date());
            const task = tasks[today][index];
            if (task.completed && task.hasBeenCompleted) completedTasksCount--;
            tasks[today].splice(index, 1);
            renderTodayTasks();
            saveUserData();
            syncData();
            if (bsIsConfigured()) bsRemoveTask(task).catch(console.error);
        }

        function editTask(index, isEditDay) {
            const dateStr = isEditDay ? currentEditDay : formatDate(new Date());
            const task = tasks[dateStr][index];

            const accounts = getAccounts();
            const currentAccount = accounts[(currentUser || '').split('::')[0]];
            let memberOptions = '<option value="">No one</option>';
            if (currentAccount?.type === 'group') {
                (currentAccount.members || []).forEach(member => {
                    memberOptions += `<option value="${member}" ${task.assignedTo===member?'selected':''}>${member}</option>`;
                });
                (currentAccount.subAccounts || []).forEach(sub => {
                    memberOptions += `<option value="${sub.username}" ${task.assignedTo===sub.username?'selected':''}>${sub.displayName||sub.username}</option>`;
                });
            }

            let projectOptions = '<option value="">No project</option>';
            projects.forEach(p => {
                projectOptions += `<option value="${p.id}" ${String(task.project)===String(p.id)?'selected':''}>${escapeHtml(p.name)}</option>`;
            });

            const modalDiv = document.createElement('div');
            modalDiv.id = 'editTaskModal';
            modalDiv.innerHTML = `
                <div class="alert-overlay" onclick="closeEditTaskModal()"></div>
                <div class="custom-alert edit-modal-max-width" onclick="event.stopPropagation()">
                    <h3>Edit Task</h3>
                    <div class="edit-form-wrapper">
                        <label class="edit-label">Task</label>
                        <input type="text" id="editTaskText" value="${escapeHtml(task.text)}" class="login-input edit-input-margin"
                            oninput="showPeacefulSuggestion('editTaskText','editTaskSuggestion')" />
                        <div id="editTaskSuggestion" class="edit-suggestion-box"></div>

                        <label class="edit-label">Time</label>
                        <div class="time-input-wrapper">
                            <input type="text" id="editTaskTimeDisplay" readonly class="login-input time-input-display"
                                placeholder="No time" value="${task.time ? formatTime(task.time) : ''}"
                                onclick="showTimePicker(document.getElementById('editTaskTimeHidden').value, v=>{document.getElementById('editTaskTimeHidden').value=v;document.getElementById('editTaskTimeDisplay').value=formatTime(v);})" />
                            <input type="hidden" id="editTaskTimeHidden" value="${task.time||''}" />
                            <button type="button" class="time-clear-button" onclick="document.getElementById('editTaskTimeHidden').value='';document.getElementById('editTaskTimeDisplay').value='';">Clear</button>
                        </div>

                        <label class="edit-label">Project</label>
                        <select id="editTaskProject" class="login-input edit-select-margin-large">
                            ${projectOptions}
                        </select>

                        <label class="edit-label">Assigned To</label>
                        <select id="editTaskAssigned" class="login-input edit-select-margin-zero">
                            ${memberOptions}
                        </select>
                    </div>
                    <div class="modal-button-wrapper">
                        <button class="login-btn modal-button-margin" onclick="saveEditTask(${index}, ${isEditDay})">Save</button>
                        <button class="login-btn back-btn modal-button-margin" onclick="closeEditTaskModal()">Cancel</button>
                    </div>
                </div>`;
            document.body.appendChild(modalDiv);
        }
        
        async function saveEditTask(index, isEditDay) {
            const dateStr = isEditDay ? currentEditDay : formatDate(new Date());
            const task = tasks[dateStr][index];

            task.text       = document.getElementById('editTaskText').value;
            task.time       = document.getElementById('editTaskTimeHidden').value;
            task.assignedTo = document.getElementById('editTaskAssigned').value;
            task.project    = document.getElementById('editTaskProject')?.value || task.project;

            saveUserData();
            syncData();

            if (bsIsConfigured()) {
                bsSyncTask(task, dateStr).catch(e => showApiError('Sync error: ' + e.message));
            }

            if (isEditDay) renderEditDayTasks();
            else           renderTodayTasks();
            closeEditTaskModal();
        }
        
        function closeEditTaskModal() {
            const modal = document.getElementById('editTaskModal');
            if (modal) modal.remove();
        }

        // Drag and Drop
        let draggedElement = null;

        function handleDragStart(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragOver(e) {
            if (e.preventDefault) e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const afterElement = getDragAfterElement(this.parentElement, e.clientY);
            if (afterElement == null) {
                this.parentElement.appendChild(draggedElement);
            } else {
                this.parentElement.insertBefore(draggedElement, afterElement);
            }
            
            return false;
        }

        function handleDrop(e) {
            if (e.stopPropagation) e.stopPropagation();
            
            const list = this.parentElement;
            const items = Array.from(list.children);
            const newOrder = items.map(item => parseInt(item.dataset.index));
            
            const dateStr = currentEditDay || formatDate(new Date());
            const reorderedTasks = newOrder.map(i => tasks[dateStr][i]);
            tasks[dateStr] = reorderedTasks;
            
            saveUserData();
            syncData();
            
            return false;
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            
            if (currentEditDay) {
                renderEditDayTasks();
            } else {
                renderTodayTasks();
            }
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function renderDays() {
            const grid = document.getElementById('daysGrid');
            grid.innerHTML = '';

            // Show ±2 days around today + next 90 days. Day cards are compact to fit more.
            // On mobile, cards are scrollable horizontally rather than hidden.
            const today = new Date();

            const entries = [];
            // Include past 2 days + today + next 87 days = 90 days total
            for (let i = -2; i < 88; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() + i);
                entries.push({ offset: i, date: d });
            }

            entries.forEach(({ offset, date }) => {
                const dateStr    = formatDate(date);
                const dayTasks   = tasks[dateStr] || [];
                const taskCount  = dayTasks.length;
                const doneCount  = dayTasks.filter(t => t.completed).length;
                const isToday    = offset === 0;
                const isTomorrow = offset === 1;

                const card = document.createElement('div');
                card.className = 'day-card' + (isToday ? ' day-card-today' : '');
                card.onclick = () => openEditDay(dateStr);

                const dayName = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
                    : date.toLocaleDateString('en-US', { weekday: 'long' });

                card.innerHTML = `
                    <div class="day-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div class="day-name">${dayName}</div>
                    <div class="task-count">${taskCount} task${taskCount !== 1 ? 's' : ''} (${doneCount} done)</div>
                `;
                grid.appendChild(card);
            });
        }

        // Edit Day Modal
        function openEditDay(dateStr) {
            currentEditDay = dateStr;
            const date = new Date(dateStr);
            
            document.getElementById('editDayTitle').textContent = 
                date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            
            const today = formatDate(new Date());
            if (dateStr === today) {
                document.getElementById('editDaySubtitle').textContent = '(Today)';
            } else {
                document.getElementById('editDaySubtitle').textContent = '';
            }
            
            renderEditDayTasks();
            document.getElementById('editDayModal').classList.remove('hidden');
        }

        function closeEditDay() {
            currentEditDay = null;
            document.getElementById('editDayModal').classList.add('hidden');
            renderDays();
            if (currentView === 'today') {
                renderTodayTasks();
            }
        }

        function closeEditDayIfOutside(event) {
            if (event.target.id === 'editDayModal') {
                closeEditDay();
            }
        }

        function renderEditDayTasks() {
            const taskList = document.getElementById('editDayTaskList');
            taskList.innerHTML = '';
            
            const dayTasks = tasks[currentEditDay] || [];
            
            if (dayTasks.length === 0) {
                taskList.innerHTML = '<div class="empty-state">No tasks for this day</div>';
                return;
            }
            
            dayTasks.forEach((task, index) => {
                const taskDiv = document.createElement('div');
                taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskDiv.draggable = true;
                taskDiv.dataset.index = index;
                
                taskDiv.addEventListener('dragstart', handleDragStart);
                taskDiv.addEventListener('dragover', handleDragOver);
                taskDiv.addEventListener('drop', handleDrop);
                taskDiv.addEventListener('dragend', handleDragEnd);
                
                let assignedTag = '';
                if (task.assignedTo) {
                    assignedTag = `<span class="task-assigned">@${escapeHtml(task.assignedTo)}</span>`;
                }

                let projectTagED = '';
                if (task.project) {
                    const proj = projects.find(p => String(p.id) === String(task.project));
                    if (proj) projectTagED = `<span class="task-project-tag">📁 ${escapeHtml(proj.name)}</span>`;
                }
                taskDiv.innerHTML = `
                    <span class="drag-handle" aria-label="Drag to reorder" tabindex="0">☰</span>
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleEditDayTask(${index})">
                    <div class="task-content-flex">
                        <span class="task-text">${escapeHtml(task.text)}</span>
                        ${task.time ? `<span class="task-time">${formatTime(task.time)}</span>` : ''}
                        ${assignedTag}${projectTagED}
                    </div>
                    <button class="task-edit-btn" onclick="editTask(${index}, true)" title="Edit task" aria-label="Edit task">✏️</button>
                    <button class="task-delete" onclick="deleteEditDayTask(${index})" aria-label="Delete task">Delete</button>
                `;
                
                taskList.appendChild(taskDiv);
            });
        }

        async function addTaskToEditDay() {
            const input       = document.getElementById('editDayTaskInput');
            const timeInput   = document.getElementById('editDayTaskTime');
            const assignInput = document.getElementById('editDayTaskAssign');
            const projectInput= document.getElementById('editDayTaskProject');
            const text = input.value.trim();
            if (!text) return;

            if (!tasks[currentEditDay]) tasks[currentEditDay] = [];
            const task = {
                text,
                time:       timeInput.value || '',
                completed:  false,
                assignedTo: assignInput.value || '',
                project:    projectInput ? projectInput.value || '' : '',
                id:         Date.now(),
                createdBy:  currentUser,
                createdAt:  new Date().toISOString()
            };
            tasks[currentEditDay].push(task);
            renderEditDayTasks();
            saveUserData();
            syncData();
            if (bsIsConfigured()) bsSyncTask(task, currentEditDay).catch(console.error);
            input.value = '';
            timeInput.value = '';
            assignInput.value = '';
            if (projectInput) projectInput.value = '';
        }

        function toggleEditDayTask(index) {
            const task = tasks[currentEditDay][index];
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            
            // Only count points if task hasn't been completed before
            if (!wasCompleted && task.completed) {
                if (!task.hasBeenCompleted) {
                    task.hasBeenCompleted = true;
                    completedTasksCount++;
                    checkPointReward();
                }
            }
            
            renderEditDayTasks();
            saveUserData();
            syncData();
        }

        function deleteEditDayTask(index) {
            const task = tasks[currentEditDay][index];
            
            // Only deduct points if this task was completed and counted
            if (task.completed && task.hasBeenCompleted) {
                completedTasksCount--;
            }
            
            tasks[currentEditDay].splice(index, 1);
            renderEditDayTasks();
            saveUserData();
            syncData();
        }

        // Hugs System
        function checkPointReward() {
            // Award 100 points for every 5 completed tasks
            if (completedTasksCount % 5 !== 0) {
                return; // Only award points every 5 tasks
            }
            
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            const weekStart = getWeekStart(now);
            let existingGroup = pointGroups.find(g => formatDate(new Date(g.date)) === formatDate(weekStart));
            
            if (existingGroup) {
                existingGroup.count += 100;
            } else {
                pointGroups.push({
                    date: weekStart.toISOString(),
                    count: 100,
                    expiresAt: expiresAt.toISOString()
                });
            }
            
            saveUserData();
            syncData();
            showPointsToast();
        }

        function showPointsToast() {
            const toast = document.getElementById('pointsToast');
            const toastContent = toast.querySelector('.points-toast-content');
            toastContent.textContent = '🎉 Earned 100 points! (5 tasks completed) 🎉';
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        function renderPoints() {
            const now = new Date();
            pointGroups = pointGroups.filter(g => new Date(g.expiresAt) > now);
            
            const accounts = getAccounts();
            const spentPoints = accounts[currentUser]?.data?.spentPoints || 0;
            
            const totalEarned = pointGroups.reduce((sum, g) => sum + g.count, 0);
            const totalAvailable = totalEarned - spentPoints;
            document.getElementById('totalPoints').textContent = totalAvailable;
            
            const container = document.getElementById('pointGroups');
            container.innerHTML = '';
            
            if (pointGroups.length === 0) {
                container.innerHTML = '<div class="empty-state">Complete tasks to earn points! 🎉</div>';
                return;
            }
            
            pointGroups.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            pointGroups.forEach(group => {
                const date = new Date(group.date);
                const expiresAt = new Date(group.expiresAt);
                const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
                
                const div = document.createElement('div');
                div.className = 'points-group';
                div.innerHTML = `
                    <div class="points-group-info">
                        <div class="points-group-date">Week of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
                        <div class="points-group-count">${group.count} point${group.count !== 1 ? 's' : ''} 🎉</div>
                    </div>
                    <div class="points-group-expires">${daysLeft} day${daysLeft !== 1 ? 's' : ''} left</div>
                `;
                container.appendChild(div);
            });
            
            saveUserData();
        }

