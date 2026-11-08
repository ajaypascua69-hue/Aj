(() => {
  'use strict';
  const add = (tag, attrs = {}, text = '') => {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') el.className = value;
      else if (key === 'textContent') el.textContent = value;
      else el.setAttribute(key, value);
    }
    if (text) el.textContent = text;
    return el;
  };

  function init() {
    if (document.getElementById('usb-storage-open')) return;
    const actions = document.querySelector('.top-actions');
    if (!actions) return;

    const open = add('button', { id: 'usb-storage-open', type: 'button', className: 'small-btn' }, '▤ USB backup');
    actions.insertBefore(open, actions.firstChild);

    const dialog = add('dialog', { id: 'usb-storage-dialog', className: 'settings-dialog', 'aria-labelledby': 'usb-storage-title' });
    const form = add('form', { className: 'settings-card', method: 'dialog' });
    const head = add('div', { className: 'settings-head' });
    const heading = add('div');
    heading.append(
      add('p', { className: 'eyebrow' }, 'PORTABLE FILE BACKUP'),
      add('h2', { id: 'usb-storage-title' }, 'USB storage'),
      add('p', { className: 'settings-note' }, 'Back up Leo AI data to a file, then save that file to your USB drive using Android Files.')
    );
    head.append(heading, add('button', { className: 'small-btn', value: 'close', 'aria-label': 'Close USB storage' }, '✕'));
    form.append(head);

    const privacy = add('p', { className: 'settings-note' });
    privacy.textContent = 'Customizable skills and active-skill settings are deliberately excluded from USB backups. They stay in Leo AI on this device.';
    form.append(privacy);

    const backup = add('button', { type: 'button', className: 'generate-btn', id: 'usb-backup-create' }, 'Create USB backup');
    form.append(backup);

    const restoreTitle = add('h3', {}, 'Restore a Leo AI backup');
    form.append(restoreTitle);
    const restoreInput = add('input', { type: 'file', id: 'usb-backup-file', accept: 'application/json,.json', 'aria-label': 'Choose a Leo AI backup file' });
    form.append(restoreInput);
    const restore = add('button', { type: 'button', className: 'generate-btn', id: 'usb-backup-restore' }, 'Restore selected backup');
    form.append(restore);

    const note = add('p', { className: 'settings-note', id: 'usb-storage-note', role: 'status' });
    note.textContent = 'Connect your USB drive with a compatible USB-C OTG adapter. Use Android’s file picker to select a backup on the drive. After creating a backup, open Android Files and move the downloaded JSON file to your USB drive.';
    form.append(note);
    dialog.append(form);
    document.body.append(dialog);

    open.addEventListener('click', () => dialog.showModal());
    backup.addEventListener('click', createBackup);
    restore.addEventListener('click', restoreBackup);
  }

  function createBackup() {
    const payload = {
      format: 'leo-ai-portable-backup',
      version: 1,
      createdAt: new Date().toISOString(),
      data: {
        tasks: readArray('leo-tasks'),
        knowledge: readArray('leo-knowledge'),
        preferences: {
          style: localStorage.getItem('leo-style') || 'balanced',
          language: localStorage.getItem('leo-language') || 'auto',
          enterToSend: localStorage.getItem('leo-enter') !== 'false'
        }
      },
      excluded: ['customizable skills', 'active skill selection']
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = add('a', { href: url, download: 'leo-ai-backup-' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setNote('Backup created. In Android Files, move the downloaded Leo AI JSON file from Downloads to your USB drive. Customizable skills were not included.');
  }

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  async function restoreBackup() {
    const picker = document.getElementById('usb-backup-file');
    const file = picker && picker.files && picker.files[0];
    if (!file) { setNote('Choose a Leo AI JSON backup from your phone or USB drive first.'); return; }
    try {
      const backup = JSON.parse(await file.text());
      if (backup.format !== 'leo-ai-portable-backup' || backup.version !== 1 || !backup.data) {
        throw new Error('This is not a supported Leo AI backup.');
      }
      if (!confirm('Restore tasks, knowledge notes, and preferences? Existing items in those categories will be replaced. Customizable skills will remain unchanged.')) return;
      const tasks = Array.isArray(backup.data.tasks) ? backup.data.tasks : [];
      const knowledge = Array.isArray(backup.data.knowledge) ? backup.data.knowledge : [];
      localStorage.setItem('leo-tasks', JSON.stringify(tasks));
      localStorage.setItem('leo-knowledge', JSON.stringify(knowledge));
      const prefs = backup.data.preferences || {};
      if (typeof prefs.style === 'string') localStorage.setItem('leo-style', prefs.style);
      if (typeof prefs.language === 'string') localStorage.setItem('leo-language', prefs.language);
      if (typeof prefs.enterToSend === 'boolean') localStorage.setItem('leo-enter', String(prefs.enterToSend));
      setNote('Backup restored. Reload Leo AI to refresh the task list and knowledge library. Your customizable skills were left untouched.');
    } catch (error) {
      setNote(error && error.message ? error.message : 'Could not read this backup file.');
    }
  }

  function setNote(message) {
    const note = document.getElementById('usb-storage-note');
    if (note) note.textContent = message;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();