(function () {
  var form = document.getElementById('memo-form');
  if (!form) return;

  var id = form.dataset.submissionId;
  var statusEl = document.getElementById('save-status');
  var dirty = false;

  form.addEventListener('input', function () { dirty = true; });
  form.addEventListener('change', function () { dirty = true; });

  async function save() {
    statusEl.textContent = 'กำลังบันทึก...';
    try {
      var body = new URLSearchParams(new FormData(form));
      var res = await fetch('/memo/' + id + '/save', { method: 'POST', body: body });
      if (!res.ok) throw new Error('save failed');
      statusEl.textContent = 'บันทึกร่างล่าสุด ' + new Date().toLocaleTimeString('th-TH');
      dirty = false;
    } catch (err) {
      statusEl.textContent = 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';
    }
  }

  var saveBtn = document.getElementById('btn-save');
  if (saveBtn) saveBtn.addEventListener('click', save);

  setInterval(function () {
    if (dirty) save();
  }, 30000);
})();