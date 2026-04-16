        // Projects
        function populateProjectDropdown() {
            const selIds = ['taskProject', 'editDayTaskProject'];
            selIds.forEach(id => {
                const sel = document.getElementById(id);
                if (!sel) return;
                const current = sel.value;
                sel.innerHTML = '<option value="">No Project</option>';
                projects.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.name;
                    if (String(p.id) === String(current)) opt.selected = true;
                    sel.appendChild(opt);
                });
            });
        }

        function renderProjects() {
            const list = document.getElementById('projectsList');
            if (!list) return;
            document.getElementById('projectTasksView').classList.add('hidden');
            if (projects.length === 0) {
                list.innerHTML = '<p class="empty-placeholder">No projects yet. Create one above!</p>';
                return;
            }
            list.innerHTML = '';
            projects.forEach(p => {
                // Count tasks across all dates
                let total = 0, done = 0;
                Object.values(tasks).forEach(dayTasks => {
                    dayTasks.forEach(t => {
                        if (String(t.project) === String(p.id)) {
                            total++;
                            if (t.completed) done++;
                        }
                    });
                });
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="project-header">
                        <span class="project-name" onclick="showProjectTasks('${p.id}')">${p.name}</span>
                        <div class="project-actions">
                            <button onclick="renameProject('${p.id}')" class="project-btn project-rename-btn">Rename</button>
                            <button onclick="deleteProject('${p.id}')" class="project-btn project-delete-btn">Delete</button>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="--progress-width: ${pct}%"></div>
                    </div>
                    <span class="progress-label">${done}/${total} tasks (${pct}%)</span>
                `;
                list.appendChild(card);
            });
        }

        async function addProject() {
            const input = document.getElementById('newProjectName');
            const name = input.value.trim();
            if (!name) return;
            const project = { id: Date.now(), name };
            projects.push(project);
            input.value = '';
            saveUserData();
            syncData();
            if (bsIsConfigured()) {
                bsSyncProject(project)
                    .then(() => showApiError('✓ Project synced to Backside'))
                    .catch(e => showApiError('✗ Could not sync project: ' + e.message));
            }
            renderProjects();
            populateProjectDropdown();
        }

        async function deleteProject(id) {
            showCustomConfirm('Delete this project?', 'Tasks assigned to it will keep their data but lose the project link.', () => {
                const proj = projects.find(p => String(p.id) === String(id));
                projects = projects.filter(p => String(p.id) !== String(id));
                saveUserData();
                syncData();
                if (proj && bsIsConfigured()) bsRemoveProject(proj).catch(console.error);
                renderProjects();
                populateProjectDropdown();
            });
        }

        function renameProject(id) {
            const p = projects.find(p => String(p.id) === String(id));
            if (!p) return;
            showCustomPrompt('Rename Project', 'Enter new name:', p.name, (newName) => {
                if (newName && newName.trim()) {
                    p.name = newName.trim();
                    saveUserData();
                    syncData();
                    if (bsIsConfigured()) bsSyncProject(p).catch(console.error);
                    renderProjects();
                    populateProjectDropdown();
                }
            });
        }

        function addTaskToProject() {
            const input = document.getElementById('projectTaskInput');
            const text = input.value.trim();
            if (!text || !currentProjectId) return;
            const today = formatDate(new Date());
            if (!tasks[today]) tasks[today] = [];
            tasks[today].push({
                text: text,
                time: '',
                completed: false,
                assignedTo: '',
                project: currentProjectId,
                id: Date.now(),
                createdBy: currentUser,
                createdAt: new Date().toISOString()
            });
            input.value = '';
            saveUserData();
            syncData();
            showProjectTasks(currentProjectId);
        }

        function showProjectTasks(id) {
            currentProjectId = id;
            const p = projects.find(p => String(p.id) === String(id));
            if (!p) return;
            document.getElementById('projectTasksTitle').textContent = '📁 ' + p.name;
            const taskList = document.getElementById('projectTasksList');
            const allTasks = [];
            Object.entries(tasks).forEach(([date, dayTasks]) => {
                dayTasks.forEach(t => {
                    if (String(t.project) === String(id)) {
                        allTasks.push({ ...t, date });
                    }
                });
            });
            if (allTasks.length === 0) {
                taskList.innerHTML = '<p class="empty-placeholder">No tasks in this project yet.</p>';
            } else {
                taskList.innerHTML = allTasks.map(t => `
                    <div class="project-task-item${t.completed ? ' completed' : ''}">
                        <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} onchange="toggleProjectTask(${t.id}, '${t.date}')">
                        <span class="project-task-text${t.completed ? ' completed' : ''}">${escapeHtml(t.text)}</span>
                        <span class="project-task-date">${escapeHtml(t.date)}</span>
                    </div>
                `).join('');
            }
            document.getElementById('projectTasksView').classList.remove('hidden');
        }

        function closeProjectTasks() {
            document.getElementById('projectTasksView').classList.add('hidden');
        }

        function toggleProjectTask(taskId, date) {
            if (!tasks[date]) return;
            const task = tasks[date].find(t => t.id === taskId);
            if (!task) return;
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            if (!wasCompleted && task.completed && !task.hasBeenCompleted) {
                task.hasBeenCompleted = true;
                completedTasksCount++;
                checkPointReward();
            }
            saveUserData();
            syncData();
            showProjectTasks(currentProjectId);
        }
