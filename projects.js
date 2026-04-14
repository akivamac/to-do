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
                list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No projects yet. Create one above!</p>';
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
                card.className = 'card';
                card.style.cssText = 'background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 12px;';
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 16px; font-weight: 600; color: #333; cursor: pointer; flex: 1;" onclick="showProjectTasks('${p.id}')">${p.name}</span>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="renameProject('${p.id}')" style="background: #64b5f6; color: white; border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 13px;">Rename</button>
                            <button onclick="deleteProject('${p.id}')" style="background: #e57373; color: white; border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 13px;">Delete</button>
                        </div>
                    </div>
                    <div style="background: #eee; border-radius: 8px; height: 12px; margin-top: 10px; overflow: hidden;">
                        <div style="background: #66bb6a; height: 100%; width: ${pct}%; border-radius: 8px; transition: width 0.3s;"></div>
                    </div>
                    <span style="font-size: 12px; color: #888;">${done}/${total} tasks (${pct}%)</span>
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
                taskList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No tasks in this project yet.</p>';
            } else {
                taskList.innerHTML = allTasks.map(t => `
                    <div style="padding: 12px; border: 2px solid ${t.completed ? '#c8e6c9' : '#e0e0e0'}; border-radius: 10px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} onchange="toggleProjectTask(${t.id}, '${t.date}')">
                        <span style="flex: 1; color: ${t.completed ? '#999' : '#333'}; ${t.completed ? 'text-decoration: line-through;' : ''}">${escapeHtml(t.text)}</span>
                        <span style="font-size: 12px; color: #888;">${escapeHtml(t.date)}</span>
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
                checkHugReward();
            }
            saveUserData();
            syncData();
            showProjectTasks(currentProjectId);
        }
