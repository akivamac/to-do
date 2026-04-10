        // Task Management
        function populateAssignDropdowns() {
            const accounts = JSON.parse(localStorage.getItem('todoAccounts') || '{}');
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
            
            if (!tasks[today] || tasks[today].length === 0) {
                taskList.innerHTML = '<div class="empty-state">No tasks for today. Add one above! 📝</div>';
                return;
            }
            
            tasks[today].forEach((task, index) => {
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
                    assignedTag = `<span class="task-assigned">@${task.assignedTo}</span>`;
                }

                let rolloverTag = '';
                if (task.rolledFrom) {
                    rolloverTag = `<span style="font-size: 11px; color: #bbb; margin-left: 4px;" title="Rolled over from ${task.rolledFrom}">↩</span>`;
                }

                taskDiv.innerHTML = `
                    <span class="drag-handle">☰</span>
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                    <div class="task-content" onclick="editTask(${index}, false)" style="cursor: pointer;">
                        <span class="task-text" style="${task.rolledFrom ? 'color: #aaa;' : ''}">${task.text}</span>
                        <span class="task-time">${formatTime(task.time)}</span>
                        ${assignedTag}${rolloverTag}
                    </div>
                    <button class="task-delete" onclick="deleteTask(${index})">Delete</button>
                `;
                
                taskList.appendChild(taskDiv);
            });
        }

        function addTask() {
            const input = document.getElementById('taskInput');
            const timeInput = document.getElementById('taskTime');
            const assignInput = document.getElementById('taskAssign');
            const projectInput = document.getElementById('taskProject');
            const text = input.value.trim();

            if (text) {
                const today = formatDate(new Date());
                if (!tasks[today]) {
                    tasks[today] = [];
                }

                tasks[today].push({
                    text: text,
                    time: timeInput.value || '',
                    completed: false,
                    assignedTo: assignInput.value || '',
                    project: projectInput ? projectInput.value || '' : '',
                    id: Date.now(),
                    createdBy: currentUser,
                    createdAt: new Date().toISOString()
                });

                renderTodayTasks();
                saveUserData();
                syncData();

                input.value = '';
                timeInput.value = '';
                assignInput.value = '';
                if (projectInput) projectInput.value = '';
            }
        }

        function toggleTask(index) {
            const today = formatDate(new Date());
            const task = tasks[today][index];
            const wasCompleted = task.completed;
            task.completed = !task.completed;
            
            // Only count points if task hasn't been completed before
            if (!wasCompleted && task.completed) {
                // First time completing - check if this task was ever completed before
                if (!task.hasBeenCompleted) {
                    task.hasBeenCompleted = true;
                    completedTasksCount++;
                    checkHugReward();
                }
            }
            
            renderTodayTasks();
            saveUserData();
            syncData();
            if (currentView === 'projects' && currentProjectId) showProjectTasks(currentProjectId);
        }

        function deleteTask(index) {
            const today = formatDate(new Date());
            const task = tasks[today][index];
            
            // Only deduct points if this task was completed and counted
            if (task.completed && task.hasBeenCompleted) {
                completedTasksCount--;
            }
            
            tasks[today].splice(index, 1);
            renderTodayTasks();
            saveUserData();
            syncData();
        }

        function editTask(index, isEditDay) {
            const dateStr = isEditDay ? currentEditDay : formatDate(new Date());
            const task = tasks[dateStr][index];
            
            const accounts = JSON.parse(localStorage.getItem('todoAccounts') || '{}');
            const currentAccount = accounts[currentUser.split('::')[0]];
            let memberOptions = '<option value="">No one</option>';
            
            if (currentAccount && currentAccount.type === 'group') {
                if (currentAccount.members) {
                    currentAccount.members.forEach(member => {
                        const selected = task.assignedTo === member ? 'selected' : '';
                        memberOptions += `<option value="${member}" ${selected}>${member}</option>`;
                    });
                }
                if (currentAccount.subAccounts) {
                    currentAccount.subAccounts.forEach(sub => {
                        const selected = task.assignedTo === sub.username ? 'selected' : '';
                        memberOptions += `<option value="${sub.username}" ${selected}>${sub.displayName || sub.username}</option>`;
                    });
                }
            }
            
            const modalHTML = `
                <div class="alert-overlay" onclick="closeEditTaskModal()"></div>
                <div class="custom-alert" onclick="event.stopPropagation()">
                    <h3>Edit Task</h3>
                    <div style="text-align: left; margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Task</label>
                        <input type="text" id="editTaskText" value="${task.text}" class="login-input" style="margin: 0 0 15px 0;" />
                        
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Time</label>
                        <input type="time" id="editTaskTime" value="${task.time}" class="login-input" style="margin: 0 0 15px 0;" />
                        
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #666;">Assigned To</label>
                        <select id="editTaskAssigned" class="login-input" style="margin: 0;">
                            ${memberOptions}
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="login-btn" onclick="saveEditTask(${index}, ${isEditDay})" style="margin: 0;">Save</button>
                        <button class="login-btn back-btn" onclick="closeEditTaskModal()" style="margin: 0;">Cancel</button>
                    </div>
                </div>
            `;
            
            const modalDiv = document.createElement('div');
            modalDiv.id = 'editTaskModal';
            modalDiv.innerHTML = modalHTML;
            document.body.appendChild(modalDiv);
        }
        
        function saveEditTask(index, isEditDay) {
            const dateStr = isEditDay ? currentEditDay : formatDate(new Date());
            const task = tasks[dateStr][index];
            
            task.text = document.getElementById('editTaskText').value;
            task.time = document.getElementById('editTaskTime').value;
            task.assignedTo = document.getElementById('editTaskAssigned').value;
            
            saveUserData();
            syncData();
            
            if (isEditDay) {
                renderEditDayTasks();
            } else {
                renderTodayTasks();
            }
            
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
            
            const today = new Date();
            for (let i = 1; i < 91; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = formatDate(date);
                
                const dayTasks = tasks[dateStr] || [];
                const taskCount = dayTasks.length;
                const completedCount = dayTasks.filter(t => t.completed).length;
                
                const card = document.createElement('div');
                card.className = 'day-card';
                card.onclick = () => openEditDay(dateStr);
                
                const dayName = i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });
                
                card.innerHTML = `
                    <div class="day-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div class="day-name">${dayName}</div>
                    <div class="task-count">${taskCount} task${taskCount !== 1 ? 's' : ''} (${completedCount} done)</div>
                `;
                
                grid.appendChild(card);
            }
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
                    assignedTag = `<span class="task-assigned">@${task.assignedTo}</span>`;
                }
                
                taskDiv.innerHTML = `
                    <span class="drag-handle">☰</span>
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleEditDayTask(${index})">
                    <div class="task-content" onclick="editTask(${index}, true)" style="cursor: pointer;">
                        <span class="task-text">${task.text}</span>
                        <span class="task-time">${formatTime(task.time)}</span>
                        ${assignedTag}
                    </div>
                    <button class="task-delete" onclick="deleteEditDayTask(${index})">Delete</button>
                `;
                
                taskList.appendChild(taskDiv);
            });
        }

        function addTaskToEditDay() {
            const input = document.getElementById('editDayTaskInput');
            const timeInput = document.getElementById('editDayTaskTime');
            const assignInput = document.getElementById('editDayTaskAssign');
            const text = input.value.trim();
            
            if (text) {
                if (!tasks[currentEditDay]) {
                    tasks[currentEditDay] = [];
                }
                
                tasks[currentEditDay].push({
                    text: text,
                    time: timeInput.value || '',
                    completed: false,
                    assignedTo: assignInput.value || '',
                    id: Date.now(),
                    createdBy: currentUser,
                    createdAt: new Date().toISOString()
                });
                
                renderEditDayTasks();
                saveUserData();
                syncData();
                
                input.value = '';
                timeInput.value = '';
                assignInput.value = '';
            }
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
                    checkHugReward();
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
        function checkHugReward() {
            // Award 100 points for every 5 completed tasks
            if (completedTasksCount % 5 !== 0) {
                return; // Only award points every 5 tasks
            }
            
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            const weekStart = getWeekStart(now);
            let existingGroup = hugGroups.find(g => formatDate(new Date(g.date)) === formatDate(weekStart));
            
            if (existingGroup) {
                existingGroup.count += 100;
            } else {
                hugGroups.push({
                    date: weekStart.toISOString(),
                    count: 100,
                    expiresAt: expiresAt.toISOString()
                });
            }
            
            saveUserData();
            syncData();
            showHugToast();
        }

        function showHugToast() {
            const toast = document.getElementById('hugToast');
            const toastContent = toast.querySelector('.hug-toast-content');
            toastContent.textContent = '🎉 Earned 100 points! (5 tasks completed) 🎉';
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        function renderHugs() {
            const now = new Date();
            hugGroups = hugGroups.filter(g => new Date(g.expiresAt) > now);
            
            const accounts = JSON.parse(localStorage.getItem('todoAccounts') || '{}');
            const spentHugs = accounts[currentUser]?.data?.spentHugs || 0;
            
            const totalEarned = hugGroups.reduce((sum, g) => sum + g.count, 0);
            const totalAvailable = totalEarned - spentHugs;
            document.getElementById('totalHugs').textContent = totalAvailable;
            
            const container = document.getElementById('hugGroups');
            container.innerHTML = '';
            
            if (hugGroups.length === 0) {
                container.innerHTML = '<div class="empty-state">Complete tasks to earn points! 🎉</div>';
                return;
            }
            
            hugGroups.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            hugGroups.forEach(group => {
                const date = new Date(group.date);
                const expiresAt = new Date(group.expiresAt);
                const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
                
                const div = document.createElement('div');
                div.className = 'hug-group';
                div.innerHTML = `
                    <div class="hug-group-info">
                        <div class="hug-group-date">Week of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
                        <div class="hug-group-count">${group.count} point${group.count !== 1 ? 's' : ''} 🎉</div>
                    </div>
                    <div class="hug-group-expires">${daysLeft} day${daysLeft !== 1 ? 's' : ''} left</div>
                `;
                container.appendChild(div);
            });
            
            saveUserData();
        }

