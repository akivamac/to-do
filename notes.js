
        // Notes
        let noteSyncTimer = null;

        // Allowlist-based sanitizer: only permit known-safe tags, no attributes
        function sanitizeNoteHtml(html) {
            // No span: without style attr it's a no-op. Scripts in detached DOM don't execute in modern browsers.
            const ALLOWED_TAGS = new Set(['b','strong','i','em','u','ul','ol','li','p','br','div','h1','h2','h3']);
            const temp = document.createElement('div');
            temp.innerHTML = html;
            // Loop until no disallowed tags remain (handles nested unknowns that get
            // promoted into the tree after a previous pass unwrapped their parent)
            let found = true;
            while (found) {
                found = false;
                temp.querySelectorAll('*').forEach(el => {
                    if (!ALLOWED_TAGS.has(el.tagName.toLowerCase())) {
                        el.replaceWith(...Array.from(el.childNodes));
                        found = true;
                    } else {
                        // Strip ALL attributes from allowed tags — notes only need formatting
                        Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
                    }
                });
            }
            return temp.innerHTML;
        }

        function renderNotes() {
            document.getElementById('notesListView').classList.remove('hidden');
            document.getElementById('noteEditorView').classList.add('hidden');
            const list = document.getElementById('notesList');
            if (notes.length === 0) {
                list.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No notes yet. Create one above!</p>';
                return;
            }
            // Sort newest-updated first
            const sorted = [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
            list.innerHTML = sorted.map(n => `
                <div class="card" style="cursor: pointer; margin-bottom: 12px;" onclick="openNote(${n.id})">
                    <div style="font-weight: bold; font-size: 15px; color: #5e8fb5;">${escapeHtml(n.title || 'Untitled')}</div>
                    <div style="font-size: 12px; color: #aaa; margin-top: 4px;">Updated ${new Date(n.updatedAt || n.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('');
        }

        function createNote() {
            const now = new Date().toISOString();
            const note = { id: Date.now(), title: '', content: '', createdAt: now, updatedAt: now };
            notes.push(note);
            saveUserData();
            syncData();
            openNote(note.id);
        }

        function openNote(id) {
            const note = notes.find(n => n.id === id);
            if (!note) return;
            currentNoteId = id;
            document.getElementById('notesListView').classList.add('hidden');
            document.getElementById('noteEditorView').classList.remove('hidden');
            document.getElementById('noteTitleInput').value = note.title || '';
            document.getElementById('noteEditor').innerHTML = sanitizeNoteHtml(note.content || '');
        }

        function closeNoteEditor() {
            currentNoteId = null;
            renderNotes();
        }

        function saveCurrentNote() {
            if (!currentNoteId) return;
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) return;
            note.title = document.getElementById('noteTitleInput').value;
            note.content = document.getElementById('noteEditor').innerHTML;
            note.updatedAt = new Date().toISOString();
            saveUserData();
            // Debounce syncData — don't blast the server on every keystroke
            clearTimeout(noteSyncTimer);
            noteSyncTimer = setTimeout(() => syncData(), 1500);
        }

        function deleteCurrentNote() {
            if (!currentNoteId) return;
            showCustomConfirm('Delete this note?', 'This cannot be undone.', () => {
                notes = notes.filter(n => n.id !== currentNoteId);
                currentNoteId = null;
                saveUserData();
                syncData();
                renderNotes();
            });
        }

        function noteFormat(command) {
            document.getElementById('noteEditor').focus();
            try {
                // execCommand is deprecated but has no clean library-free replacement
                document.execCommand(command, false, null);
            } catch (e) {
                console.warn('execCommand failed:', command, e);
            }
            saveCurrentNote();
        }

        // Days Page - Shows next 90 days
