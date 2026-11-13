function applyCircularFavicon(src = "la logo.webp") {
  const img = new Image();
  img.onload = () => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 2, 2, size - 4, size - 4);

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  };
  img.src = src;
}

function renderAdminDashboardAnnouncements() {
  const listEl = $("adminAnnouncementsList");
  const countEl = $("adminNoticeCount");
  const notices = data.announcements || [];

  if (countEl) countEl.textContent = `${notices.length} Active`;
  if (!listEl) return;

  listEl.innerHTML = notices.map(a => `
    <div class="fac-notice-item">
      <div class="fac-notice-header">
        <div>
          <h4 style="margin: 0; font-size: 15px; color: var(--primary-dark);">${esc(a.title)}</h4>
          <small style="color:var(--text-muted);"><i class="fa-solid fa-bullhorn"></i> Posted by ${esc(a.author)} &bull; ${esc(a.date)}</small>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="badge enrolled">${esc(a.target)}</span>
          <button class="secondary table-btn" style="color:var(--primary);" onclick="deleteAnnouncement('${a.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13px; line-height: 1.5; color: var(--text-main);">${esc(a.content)}</p>
    </div>
  `).join("") || `<p style="color:var(--text-muted);margin:0;">No active notices posted.</p>`;
}

function renderDashboard() {
  const droppedIds = new Set(data.enrollments.filter(e => e.enrollmentStatus === "Dropped").map(e => e.student));
  const enrolledIds = new Set(data.enrollments.filter(e => e.enrollmentStatus === "Enrolled").map(e => e.student));
  const enrolledCount = data.students.filter(s => enrolledIds.has(s.id) && !droppedIds.has(s.id)).length;

  $("totalStudents").textContent = data.students.length;
  $("enrolledStudents").textContent = enrolledCount;
  $("droppedCount").textContent = droppedIds.size;

  $("recentStudents").innerHTML = data.students.slice(0, 6).map(s =>
    `<p><b>${esc(formatNameId(s))}</b><br><small>${esc(s.grade)} • ${esc(s.section)}</small></p>`
  ).join("");

  renderAdminDashboardAnnouncements();
}

function populateSelects() {
  const el = $("eStudent");
  if (el) {
    const old = el.value;
    el.innerHTML = data.students.map(s => `<option value="${esc(s.id)}">${esc(formatNameId(s))}</option>`).join("");
    if (old && data.students.some(s => s.id === old)) el.value = old;
  }

  const eGrade = $("eGrade");
  if (eGrade) {
    eGrade.innerHTML = gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
  }

  const eDateInput = $("eDate");
  if (eDateInput) {
    const today = new Date().toISOString().slice(0, 10);
    eDateInput.value = today;
    eDateInput.min = today;
    eDateInput.max = today;
  }

  syncEnrollmentStudentData();

  const filterGrade = $("studentGrade");
  if (filterGrade) {
    filterGrade.innerHTML = `<option value="">All Grade Levels</option>` + gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
  }

  const fGrade = $("fGrade");
  if (fGrade) {
    fGrade.innerHTML = gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
  }
}

function renderAll() {
  populateGradeFilters();
  populateSelects();
  renderDashboard();
  renderStudents();
  filterGradeStudents();
  renderEnrollments();
  renderPerformance();
  populateStatusSubjects();
  renderStatus();

  if (typeof renderAdminFaculty === "function") renderAdminFaculty();
  if (typeof renderAdminSubjects === "function") renderAdminSubjects();
  if (typeof renderAdminSchedules === "function") renderAdminSchedules();
  if (typeof renderUsersTable === "function") renderUsersTable();
}

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  applyCircularFavicon();

  $("gradeStudent")?.addEventListener("change", renderGrades);
  $("studentSearch")?.addEventListener("input", renderStudents);
  $("studentGrade")?.addEventListener("change", renderStudents);
  $("eStudent")?.addEventListener("change", syncEnrollmentStudentData);
  $("eGrade")?.addEventListener("change", updateEnrollmentFields);
  $("eStrand")?.addEventListener("change", updateEnrollmentFields);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeDrawer();
      closeStudentModal();
      closeReportModal();
      closeDeleteModal();
      if (typeof closeAdminDeleteModal === "function") closeAdminDeleteModal();
      if (typeof closeFindAccountModal === "function") closeFindAccountModal();
    }
  });

  ["username", "password"].forEach(id => {
    $(id)?.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  });

  if (typeof renderReportList === "function") {
    renderReportList();
  }

  const idInp = $("fId");
  if (idInp) {
    idInp.addEventListener("input", e => {
      let digits = e.target.value.replace(/\D/g, "").slice(0, 7);
      e.target.value = digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
    });
  }

  renderAll();
  if (typeof restoreSession === "function") {
    restoreSession();
  }
});