
        // Notes
        let noteSyncTimer = null;

        // ── Note saved toast ─────────────────────────────────────────
        function showNoteSavedToast() {
            let toast = document.getElementById('noteSavedToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'noteSavedToast';
                toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#66bb6a;color:white;' +
                    'padding:10px 20px;border-radius:20px;font-size:14px;z-index:99999;opacity:0;' +
                    'transition:opacity 0.3s;pointer-events:none;';
                toast.textContent = '✓ Note saved';
                document.body.appendChild(toast);
            }
            toast.style.opacity = '1';
            clearTimeout(toast._timer);
            toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2000);
        }

        // ── Download note as .md ─────────────────────────────────────
        function downloadCurrentNote() {
            if (!currentNoteId) return;
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) return;
            const title   = note.title || 'Untitled';
            const content = note.content || '';
            // Convert HTML to rough Markdown for download
            const tmp  = document.createElement('div');
            tmp.innerHTML = content;
            const text = tmp.innerText || tmp.textContent || '';
            const blob = new Blob(['# ' + title + '\n\n' + text], { type: 'text/markdown' });
            const a    = document.createElement('a');
            a.href     = URL.createObjectURL(blob);
            a.download = title.replace(/[^a-z0-9\-_ ]/gi, '_') + '.md';
            a.click();
        }

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
            if (currentNoteId) showNoteSavedToast();
            currentNoteId = null;
            renderNotes();
        }

        function saveCurrentNote() {
            if (!currentNoteId) return;
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) return;
            note.title     = document.getElementById('noteTitleInput').value;
            note.content   = document.getElementById('noteEditor').innerHTML;
            note.updatedAt = new Date().toISOString();
            saveUserData();
            // Update live preview if it exists
            updateNotePreview();
            clearTimeout(noteSyncTimer);
            noteSyncTimer = setTimeout(() => {
                syncData();
                if (bsIsConfigured()) bsSyncNote(note).catch(e => console.warn('Note sync:', e));
            }, 1500);
        }

        function updateNotePreview() {
            const preview = document.getElementById('notePreviewPane');
            if (!preview || typeof marked === 'undefined') return;
            const raw = document.getElementById('noteEditor').innerText || '';
            preview.innerHTML = marked.parse(raw);
        }

        function deleteCurrentNote() {
            if (!currentNoteId) return;
            showCustomConfirm('Delete this note?', 'This cannot be undone.', () => {
                const note = notes.find(n => n.id === currentNoteId);
                notes = notes.filter(n => n.id !== currentNoteId);
                currentNoteId = null;
                saveUserData();
                syncData();
                if (note && bsIsConfigured()) bsRemoveNote(note).catch(console.error);
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

        function noteFormatBlock(tag) {
            document.getElementById('noteEditor').focus();
            try { document.execCommand('formatBlock', false, tag); } catch(e) {}
            saveCurrentNote();
        }

        function noteInsertLink() {
            const url = prompt('Enter URL:');
            if (!url) return;
            document.getElementById('noteEditor').focus();
            try { document.execCommand('createLink', false, url); } catch(e) {}
            saveCurrentNote();
        }

        function noteInsertHR() {
            document.getElementById('noteEditor').focus();
            try { document.execCommand('insertHTML', false, '<hr/>'); } catch(e) {}
            saveCurrentNote();
        }

        function noteInsertAlphaList() {
            // Insert an alphabetical ordered list using CSS list-style-type
            document.getElementById('noteEditor').focus();
            try {
                document.execCommand('insertHTML', false,
                    '<ol style="list-style-type:lower-alpha"><li>Item</li></ol>');
            } catch(e) {}
            saveCurrentNote();
        }

        function noteAlign(direction) {
            const cmds = { left:'justifyLeft', center:'justifyCenter', right:'justifyRight' };
            document.getElementById('noteEditor').focus();
            try { document.execCommand(cmds[direction], false, null); } catch(e) {}
            saveCurrentNote();
        }

        function noteSetFontSize(size) {
            const sizeMap = { small:'1', medium:'3', large:'5', huge:'7' };
            document.getElementById('noteEditor').focus();
            try { document.execCommand('fontSize', false, sizeMap[size] || '3'); } catch(e) {}
            saveCurrentNote();
        }

        function noteInsertTable() {
            document.getElementById('noteEditor').focus();
            const rows = 3, cols = 3;
            let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0;">';
            for (let r = 0; r < rows; r++) {
                html += '<tr>';
                for (let c = 0; c < cols; c++) {
                    const tag = r === 0 ? 'th' : 'td';
                    html += `<${tag} style="border:1px solid #ccc;padding:6px 10px;min-width:60px;" contenteditable="true">${r===0?'Header ':''}</th>`;
                }
                html += '</tr>';
            }
            html += '</table><p><br></p>';
            try { document.execCommand('insertHTML', false, html); } catch(e) {}
            saveCurrentNote();
        }

        function toggleNotePreview() {
            const pane = document.getElementById('notePreviewPane');
            const btn  = document.getElementById('previewToggleBtn');
            if (!pane) return;
            const shown = pane.style.display !== 'none';
            pane.style.display = shown ? 'none' : 'block';
            if (btn) btn.style.background = shown ? '' : '#e3f2fd';
            if (!shown) updateNotePreview();
        }

        // Days Page - Shows next 90 days
