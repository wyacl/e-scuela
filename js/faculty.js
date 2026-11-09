// ==========================================================
// FACULTY & ANNOUNCEMENTS CONTROLLER
// ==========================================================

function initFacultyData() {
  if (!data.faculty) {
    data.faculty = {
      id: "FAC-2026-01",
      name: "Prof. Maria Santos",
      email: "m.santos@salette.edu.ph",
      department: "Senior High School - STEM & Academics",
      contact: "0917-555-0199",
      office: "Faculty Room 204, St. Joseph Hall",
      classes: [
        { id: "CLS-1", grade: "Grade 12", section: "STEM-A", subject: "Research", schedule: "Wed 1:00 PM - 2:00 PM", room: "Computer Lab 2" },
        { id: "CLS-2", grade: "Grade 12", section: "STEM-A", subject: "ICT", schedule: "Mon 9:00 AM - 10:00 AM", room: "Computer Lab 1" },
        { id: "CLS-3", grade: "Grade 11", section: "STEM-A", subject: "Mathematics", schedule: "Mon 8:00 AM - 9:00 AM", room: "Room 301" },
        { id: "CLS-4", grade: "Grade 11", section: "HUMSS-A", subject: "History", schedule: "Fri 10:00 AM - 11:00 AM", room: "Room 205" }
      ]
    };
  }

  // Ensure rooms exist if data was already cached in localStorage
  const roomDefaults = {
    "CLS-1": "Computer Lab 2",
    "CLS-2": "Computer Lab 1",
    "CLS-3": "Room 301",
    "CLS-4": "Room 205"
  };
  if (Array.isArray(data.faculty.classes)) {
    data.faculty.classes.forEach(c => {
      if (!c.room) c.room = roomDefaults[c.id] || "Room 204";
    });
  }

  if (!data.attendance) {
    data.attendance = {};
  }

  if (!data.announcements || !Array.isArray(data.announcements)) {
    data.announcements = [
      {
        id: "ANN-001",
        title: "2nd Quarter Examination Guidelines",
        target: "All Classes",
        author: "Prof. Maria Santos",
        date: "2026-11-05",
        content: "Please be reminded that the 2nd Quarter Examination schedules have been posted. Prepare all draft papers and research folios prior to Friday."
      },
      {
        id: "ANN-002",
        title: "STEM-A Research Consultation",
        target: "Grade 12 - STEM-A",
        author: "Prof. Maria Santos",
        date: "2026-11-08",
        content: "Research capstone draft consultations will take place this Wednesday at Computer Lab 2. Attendance is mandatory."
      }
    ];
  }
}

initFacultyData();

function renderFacultyPortal(page) {
  initFacultyData();
  switch (page) {
    case "facultyDashboard":
      renderFacultyDashboard();
      break;
    case "facultyClasses":
      renderFacultyClasses();
      break;
    case "facultyGrades":
      populateFacultyGradesFilters();
      renderFacultyGrades();
      break;
    case "facultyAttendance":
      populateFacultyAttendanceFilters();
      renderFacultyAttendance();
      break;
    case "facultyAnnouncements":
      renderFacultyAnnouncements();
      break;
    case "facultyReports":
      renderFacultyReports();
      break;
    case "facultyProfile":
      renderFacultyProfile();
      break;
    default:
      renderFacultyDashboard();
  }
}

// --------------------------------------------------
// 1. DASHBOARD
// --------------------------------------------------
function renderFacultyDashboard() {
  const fac = data.faculty;
  $("facultyWelcomeName").textContent = `Welcome, ${fac.name}`;
  $("facultyDeptBadge").textContent = fac.department;

  const totalClasses = fac.classes.length;
  const studentIds = new Set();
  fac.classes.forEach(c => {
    data.students.filter(s => s.grade === c.grade && s.section === c.section).forEach(s => studentIds.add(s.id));
  });

  $("facCardClasses").textContent = totalClasses;
  $("facCardStudents").textContent = studentIds.size;
  $("facCardNotices").textContent = data.announcements.length;

  const schedEl = $("facultyUpcomingSchedule");
  if (schedEl) {
    schedEl.innerHTML = fac.classes.map(c => `
      <div class="fac-schedule-item">
        <div class="fac-sched-time">
          <i class="fa-solid fa-clock"></i> ${esc(c.schedule)} &bull; <i class="fa-solid fa-location-dot"></i> <b>${esc(c.room || "Room 204")}</b>
        </div>
        <div class="fac-sched-title"><b>${esc(c.subject)}</b> &bull; ${esc(c.grade)} (${esc(c.section)})</div>
      </div>
    `).join("");
  }

  const noticeEl = $("facultyRecentNotices");
  if (noticeEl) {
    noticeEl.innerHTML = data.announcements.slice(0, 3).map(a => `
      <div class="fac-notice-card">
        <div class="fac-notice-head">
          <strong>${esc(a.title)}</strong>
          <span class="badge pending">${esc(a.target)}</span>
        </div>
        <p>${esc(a.content)}</p>
        <small><i class="fa-regular fa-calendar"></i> ${esc(a.date)} &bull; ${esc(a.author)}</small>
      </div>
    `).join("") || `<p style="color:var(--text-muted);">No notices posted.</p>`;
  }
}

// --------------------------------------------------
// 2. MY CLASSES & STUDENT LIST
// --------------------------------------------------
let activeClassId = null;

function renderFacultyClasses() {
  const container = $("facultyClassesGrid");
  if (!container) return;

  const listEl = $("facultyClassStudentsView");
  if (listEl) listEl.classList.add("hidden");

  container.innerHTML = data.faculty.classes.map(c => {
    const enrolledCount = data.students.filter(s => s.grade === c.grade && s.section === c.section).length;
    return `
      <div class="card faculty-class-card">
        <div class="fac-class-header">
          <span class="badge enrolled">${esc(c.grade)}</span>
          <span class="badge gold">${esc(c.section)}</span>
        </div>
        <h3 style="margin: 10px 0 4px 0; color: var(--primary-dark); font-size: 18px;">${esc(c.subject)}</h3>
        <p style="margin: 0 0 4px 0; font-size: 12.5px; color: var(--text-muted);">
          <i class="fa-solid fa-clock fa-fw"></i> ${esc(c.schedule)}
        </p>
        <p style="margin: 0 0 12px 0; font-size: 12.5px; color: var(--primary-dark); font-weight: 600;">
          <i class="fa-solid fa-location-dot fa-fw"></i> ${esc(c.room || "Room 204")}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px; margin-top: auto;">
          <small><b>${enrolledCount}</b> Students Enrolled</small>
          <button class="primary table-btn" onclick="openClassStudentList('${c.id}')"><i class="fa-solid fa-users fa-fw"></i> View Students</button>
        </div>
      </div>
    `;
  }).join("");
}

function openClassStudentList(classId) {
  activeClassId = classId;
  const cls = data.faculty.classes.find(c => c.id === classId);
  if (!cls) return;

  $("facultyClassTitle").textContent = `${cls.subject} — ${cls.grade} (${cls.section}) • ${cls.room || "Room 204"}`;
  const students = data.students.filter(s => s.grade === cls.grade && s.section === cls.section);

  const tableBody = $("facultyClassStudentsTable");
  if (tableBody) {
    tableBody.innerHTML = students.map((s, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${esc(s.name)}</b></td>
        <td>${esc(s.id)}</td>
        <td><span class="badge regular">${esc(s.status || "Regular")}</span></td>
        <td style="white-space: nowrap;">
          <button class="secondary table-btn" onclick="directToStudentGrades('${cls.id}', '${s.id}')"><i class="fa-solid fa-pen-to-square"></i> Grades</button>
          <button class="secondary table-btn" onclick="directToStudentAttendance('${cls.id}')"><i class="fa-solid fa-clipboard-user"></i> Attendance</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5">No students found in this section.</td></tr>`;
  }

  $("facultyClassStudentsView")?.classList.remove("hidden");
  $("facultyClassStudentsView")?.scrollIntoView({ behavior: "smooth" });
}

function directToStudentGrades(classId, studentId) {
  showPage("facultyGrades");
  const clsSelect = $("facGradeClassSelect");
  if (clsSelect) {
    clsSelect.value = classId;
    renderFacultyGrades(studentId);
  }
}

function directToStudentAttendance(classId) {
  showPage("facultyAttendance");
  const clsSelect = $("facAttClassSelect");
  if (clsSelect) {
    clsSelect.value = classId;
    renderFacultyAttendance();
  }
}

// --------------------------------------------------
// 3. GRADES ENTRY
// --------------------------------------------------
function populateFacultyGradesFilters() {
  const sel = $("facGradeClassSelect");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = data.faculty.classes.map(c => `
    <option value="${c.id}">${esc(c.grade)} - ${esc(c.section)} &bull; ${esc(c.subject)} (${esc(c.room || "Room 204")})</option>
  `).join("");
  if (current && data.faculty.classes.some(c => c.id === current)) sel.value = current;
}

function renderFacultyGrades(highlightStudentId = null) {
  const classId = $("facGradeClassSelect")?.value;
  const cls = data.faculty.classes.find(c => c.id === classId);
  const tableBody = $("facGradesEntryTable");
  if (!tableBody || !cls) return;

  const students = data.students.filter(s => s.grade === cls.grade && s.section === cls.section);

  tableBody.innerHTML = students.map((s, idx) => {
    let studentGrades = data.grades[s.id] || [];
    let subjectRow = studentGrades.find(g => g[0].toLowerCase() === cls.subject.toLowerCase());

    if (!subjectRow) {
      subjectRow = [cls.subject, "", "", "", ""];
      studentGrades.push(subjectRow);
      data.grades[s.id] = studentGrades;
    }

    const finalVal = calc(subjectRow);
    const isTarget = highlightStudentId && s.id === highlightStudentId;

    return `
      <tr style="${isTarget ? 'background-color:#fff3e0;' : ''}">
        <td style="text-align: center; color: var(--text-muted);">${idx + 1}</td>
        <td><b>${esc(s.name)}</b><br><small style="color:var(--text-muted);">${esc(s.id)}</small></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="1" value="${subjectRow[1] ?? ''}"></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="2" value="${subjectRow[2] ?? ''}"></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="3" value="${subjectRow[3] ?? ''}"></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="4" value="${subjectRow[4] ?? ''}"></td>
        <td style="text-align: center; font-weight: 800; font-size: 14px; color: var(--primary-dark);">${finalVal}</td>
        <td style="text-align: center;">${badge(statusOf(finalVal))}</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="8" style="text-align:center;padding:16px;">No students found for this class.</td></tr>`;
}

function saveFacultyGrades() {
  const classId = $("facGradeClassSelect")?.value;
  const cls = data.faculty.classes.find(c => c.id === classId);
  if (!cls) return;

  const inputs = document.querySelectorAll(".fac-grade-q");
  inputs.forEach(inp => {
    const sId = inp.dataset.sid;
    const q = Number(inp.dataset.q);
    const val = inp.value.trim();

    const studentGrades = data.grades[sId] || [];
    let subjectRow = studentGrades.find(g => g[0].toLowerCase() === cls.subject.toLowerCase());

    if (!subjectRow) {
      subjectRow = [cls.subject, "", "", "", ""];
      studentGrades.push(subjectRow);
    }

    subjectRow[q] = val === "" ? "" : Math.min(100, Math.max(0, Number(val) || 0));
    data.grades[sId] = studentGrades;
  });

  persist();
  renderFacultyGrades();
  toast(`Grades saved for ${cls.subject} (${cls.section})`);
}

// --------------------------------------------------
// 4. ATTENDANCE
// --------------------------------------------------
function populateFacultyAttendanceFilters() {
  const sel = $("facAttClassSelect");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = data.faculty.classes.map(c => `
    <option value="${c.id}">${esc(c.grade)} - ${esc(c.section)} &bull; ${esc(c.subject)} (${esc(c.room || "Room 204")})</option>
  `).join("");
  if (current && data.faculty.classes.some(c => c.id === current)) sel.value = current;

  const dateInp = $("facAttDate");
  if (dateInp && !dateInp.value) {
    dateInp.value = new Date().toISOString().slice(0, 10);
  }
}

function toggleAttendanceMode(mode) {
  $("facAttModeDailyBtn")?.classList.toggle("active", mode === "daily");
  $("facAttModeMonthlyBtn")?.classList.toggle("active", mode === "monthly");
  $("facAttDailySection")?.classList.toggle("hidden", mode !== "daily");
  $("facAttMonthlySection")?.classList.toggle("hidden", mode !== "monthly");

  if (mode === "monthly") renderFacultyMonthlyAttendance();
}

function renderFacultyAttendance() {
  const classId = $("facAttClassSelect")?.value;
  const date = $("facAttDate")?.value || new Date().toISOString().slice(0, 10);
  const cls = data.faculty.classes.find(c => c.id === classId);
  const tableBody = $("facAttendanceDailyTable");
  if (!tableBody || !cls) return;

  const students = data.students.filter(s => s.grade === cls.grade && s.section === cls.section);
  const attKey = `${date}_${cls.id}`;
  const dayRecords = data.attendance[attKey] || {};

  tableBody.innerHTML = students.map((s, idx) => {
    const currentStatus = dayRecords[s.id] || "Present";
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${esc(s.name)}</b></td>
        <td>${esc(s.id)}</td>
        <td>
          <div class="fac-att-btn-group" data-student="${s.id}">
            <button type="button" class="fac-att-btn ${currentStatus === 'Present' ? 'active present' : ''}" onclick="setAttendanceRowStatus(this, 'Present')">Present</button>
            <button type="button" class="fac-att-btn ${currentStatus === 'Late' ? 'active late' : ''}" onclick="setAttendanceRowStatus(this, 'Late')">Late</button>
            <button type="button" class="fac-att-btn ${currentStatus === 'Absent' ? 'active absent' : ''}" onclick="setAttendanceRowStatus(this, 'Absent')">Absent</button>
            <button type="button" class="fac-att-btn ${currentStatus === 'Excused' ? 'active excused' : ''}" onclick="setAttendanceRowStatus(this, 'Excused')">Excused</button>
          </div>
        </td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="4">No students enrolled in this section.</td></tr>`;
}

function setAttendanceRowStatus(btn, status) {
  const group = btn.closest(".fac-att-btn-group");
  group.querySelectorAll(".fac-att-btn").forEach(b => {
    b.className = "fac-att-btn";
  });
  btn.classList.add("active", status.toLowerCase());
}

function markAllPresent() {
  document.querySelectorAll(".fac-att-btn-group").forEach(group => {
    group.querySelectorAll(".fac-att-btn").forEach(b => b.className = "fac-att-btn");
    const presentBtn = group.querySelector(".fac-att-btn:nth-child(1)");
    if (presentBtn) presentBtn.classList.add("active", "present");
  });
  toast("All students set to Present.");
}

function saveFacultyAttendance() {
  const classId = $("facAttClassSelect")?.value;
  const date = $("facAttDate")?.value || new Date().toISOString().slice(0, 10);
  const cls = data.faculty.classes.find(c => c.id === classId);
  if (!cls) return;

  const attKey = `${date}_${cls.id}`;
  const dayRecords = {};

  document.querySelectorAll(".fac-att-btn-group").forEach(group => {
    const sId = group.dataset.student;
    const activeBtn = group.querySelector(".fac-att-btn.active");
    dayRecords[sId] = activeBtn ? activeBtn.textContent.trim() : "Present";
  });

  data.attendance[attKey] = dayRecords;
  persist();
  toast(`Attendance saved for ${date} (${cls.section})`);
}

function renderFacultyMonthlyAttendance() {
  const classId = $("facAttClassSelect")?.value;
  const cls = data.faculty.classes.find(c => c.id === classId);
  const tableBody = $("facAttendanceMonthlyTable");
  if (!tableBody || !cls) return;

  const students = data.students.filter(s => s.grade === cls.grade && s.section === cls.section);
  
  const studentStats = {};
  students.forEach(s => {
    studentStats[s.id] = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
  });

  Object.entries(data.attendance).forEach(([key, recs]) => {
    if (key.endsWith(`_${cls.id}`)) {
      Object.entries(recs).forEach(([sId, status]) => {
        if (studentStats[sId]) {
          studentStats[sId].total++;
          const st = (status || "").toLowerCase();
          if (st === "present") studentStats[sId].present++;
          else if (st === "late") studentStats[sId].late++;
          else if (st === "absent") studentStats[sId].absent++;
          else if (st === "excused") studentStats[sId].excused++;
        }
      });
    }
  });

  tableBody.innerHTML = students.map((s, idx) => {
    const stats = studentStats[s.id];
    const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 100;

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${esc(s.name)}</b></td>
        <td><span style="color:#2e7d32;font-weight:700;">${stats.present}</span></td>
        <td><span style="color:#b26a00;font-weight:700;">${stats.late}</span></td>
        <td><span style="color:#b91c1c;font-weight:700;">${stats.absent}</span></td>
        <td>${stats.excused}</td>
        <td><b>${rate}%</b></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="7">No records available.</td></tr>`;
}

// --------------------------------------------------
// 5. ANNOUNCEMENTS
// --------------------------------------------------
function deleteAnnouncement(id) {
  data.announcements = (data.announcements || []).filter(a => a.id !== id);
  persist();
  renderFacultyAnnouncements();
  renderAdminAnnouncements();
  if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
  toast("Announcement removed.");
}

const deleteFacultyAnnouncement = deleteAnnouncement;

function renderFacultyAnnouncements() {
  const listEl = $("facAnnouncementList");
  if (!listEl) return;

  listEl.innerHTML = (data.announcements || []).map(a => `
    <div class="fac-notice-item">
      <div class="fac-notice-header">
        <div>
          <h4 style="margin: 0; font-size: 16px; color: var(--primary-dark);">${esc(a.title)}</h4>
          <small style="color:var(--text-muted);"><i class="fa-solid fa-bullhorn"></i> Posted by ${esc(a.author)} &bull; ${esc(a.date)}</small>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="badge enrolled">${esc(a.target)}</span>
          <button class="secondary table-btn" style="color:var(--primary);" onclick="deleteAnnouncement('${a.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">${esc(a.content)}</p>
    </div>
  `).join("") || `<p style="color:var(--text-muted);">No active notices posted.</p>`;

  const targetSelect = $("facNoticeTarget");
  if (targetSelect) {
    targetSelect.innerHTML = `<option value="All Classes">All My Classes</option>` +
      data.faculty.classes.map(c => `<option value="${c.grade} - ${c.section}">${c.grade} - ${c.section} (${c.subject})</option>`).join("");
  }
}

function postFacultyAnnouncement() {
  const title = val("facNoticeTitle");
  const target = val("facNoticeTarget") || "All Classes";
  const content = val("facNoticeContent");

  if (!title || !content) return toast("Notice title and content are required.");

  const newNotice = {
    id: `ANN-${Date.now().toString().slice(-4)}`,
    title,
    target,
    author: data.faculty.name,
    date: new Date().toISOString().slice(0, 10),
    content
  };

  if (!data.announcements) data.announcements = [];
  data.announcements.unshift(newNotice);
  persist();

  $("facNoticeTitle").value = "";
  $("facNoticeContent").value = "";
  renderFacultyAnnouncements();
  if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
  toast("Announcement posted successfully.");
}

function renderAdminAnnouncements() {
  const listEl = $("adminAnnouncementList");
  if (listEl) {
    listEl.innerHTML = (data.announcements || []).map(a => `
      <div class="fac-notice-item">
        <div class="fac-notice-header">
          <div>
            <h4 style="margin: 0; font-size: 16px; color: var(--primary-dark);">${esc(a.title)}</h4>
            <small style="color:var(--text-muted);"><i class="fa-solid fa-bullhorn"></i> Posted by ${esc(a.author)} &bull; ${esc(a.date)}</small>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge enrolled">${esc(a.target)}</span>
            <button class="secondary table-btn" style="color:var(--primary);" onclick="deleteAnnouncement('${a.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">${esc(a.content)}</p>
      </div>
    `).join("") || `<p style="color:var(--text-muted);">No active notices posted.</p>`;
  }

  const targetSelect = $("adminNoticeTarget");
  if (targetSelect) {
    const classSet = new Set(data.students.map(s => `${s.grade} - ${s.section}`).filter(Boolean));
    targetSelect.innerHTML = `<option value="All Classes">All Classes</option>` +
      Array.from(classSet).map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  }
}

function postAdminAnnouncement() {
  const title = val("adminNoticeTitle");
  const target = val("adminNoticeTarget") || "All Classes";
  const content = val("adminNoticeContent");

  if (!title || !content) return toast("Notice title and content are required.");

  const newNotice = {
    id: `ANN-${Date.now().toString().slice(-4)}`,
    title,
    target,
    author: currentUser?.name || "Administrator",
    date: new Date().toISOString().slice(0, 10),
    content
  };

  if (!data.announcements) data.announcements = [];
  data.announcements.unshift(newNotice);
  persist();

  $("adminNoticeTitle").value = "";
  $("adminNoticeContent").value = "";
  renderAdminAnnouncements();
  if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
  toast("Announcement posted successfully.");
}

// --------------------------------------------------
// 6. REPORTS
// --------------------------------------------------
function renderFacultyReports() {
  const container = $("facReportsList");
  if (!container) return;

  const reports = [
    { title: "Class Grading Sheet", desc: "Quarterly and final grades summary for handled classes." },
    { title: "Class Attendance Log", desc: "Monthly attendance log and student participation rate." },
    { title: "Quarterly Subject Summary", desc: "Consolidated grade distribution and pass/fail statistics." }
  ];

  container.innerHTML = reports.map(r => `
    <div class="report">
      <div>
        <b>${esc(r.title)}</b>
        <div style="font-size:12px;color:var(--text-muted);">${esc(r.desc)}</div>
      </div>
      <div class="report-actions">
        <button class="secondary table-btn" onclick="viewFacultyReport('${r.title}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
        <button class="secondary table-btn" onclick="printFacultyReport('${r.title}')"><i class="fa-solid fa-print fa-fw"></i> Print</button>
        <button class="primary table-btn" onclick="downloadFacultyReportPDF('${r.title}')"><i class="fa-solid fa-file-pdf fa-fw"></i> Download (PDF)</button>
      </div>
    </div>
  `).join("");
}

function generateFacultyReportHTML(title) {
  const fac = data.faculty;
  const selectedClassId = $("facGradeClassSelect")?.value || $("facAttClassSelect")?.value || (fac.classes[0] && fac.classes[0].id);
  const primaryClass = fac.classes.find(c => c.id === selectedClassId) || fac.classes[0] || { id: "CLS-1", grade: "Grade 12", section: "STEM-A", subject: "Research", room: "Computer Lab 2" };
  const students = data.students.filter(s => s.grade === primaryClass.grade && s.section === primaryClass.section);

  let tableHeaderHTML = "";
  let tableRowsHTML = "";
  let summaryFootnoteHTML = "";

  if (title === "Class Attendance Log") {
    const studentStats = {};
    students.forEach(s => {
      studentStats[s.id] = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
    });

    Object.entries(data.attendance || {}).forEach(([key, recs]) => {
      if (key.endsWith(`_${primaryClass.id}`)) {
        Object.entries(recs).forEach(([sId, status]) => {
          if (studentStats[sId]) {
            studentStats[sId].total++;
            const st = (status || "").toLowerCase();
            if (st === "present") studentStats[sId].present++;
            else if (st === "late") studentStats[sId].late++;
            else if (st === "absent") studentStats[sId].absent++;
            else if (st === "excused") studentStats[sId].excused++;
          }
        });
      }
    });

    tableHeaderHTML = `
      <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">
        <th style="padding:8px;text-align:left;">#</th>
        <th style="padding:8px;text-align:left;">Student Name</th>
        <th style="padding:8px;text-align:center;">ID Number</th>
        <th style="padding:8px;text-align:center;color:#2e7d32;">Present</th>
        <th style="padding:8px;text-align:center;color:#b26a00;">Late</th>
        <th style="padding:8px;text-align:center;color:#b91c1c;">Absent</th>
        <th style="padding:8px;text-align:center;">Excused</th>
        <th style="padding:8px;text-align:center;">Attendance Rate</th>
      </tr>
    `;

    tableRowsHTML = students.map((s, idx) => {
      const st = studentStats[s.id] || { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
      const rate = st.total > 0 ? Math.round(((st.present + st.late) / st.total) * 100) : 100;
      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;color:#888;">${idx + 1}</td>
          <td style="padding:8px;"><b>${esc(s.name)}</b></td>
          <td style="padding:8px;text-align:center;">${esc(s.id)}</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#2e7d32;">${st.present}</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#b26a00;">${st.late}</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#b91c1c;">${st.absent}</td>
          <td style="padding:8px;text-align:center;">${st.excused}</td>
          <td style="padding:8px;text-align:center;font-weight:800;color:${rate >= 80 ? '#2e7d32' : '#b91c1c'};">${rate}%</td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="8" style="padding:12px;text-align:center;">No students enrolled.</td></tr>`;

  } else if (title === "Quarterly Subject Summary") {
    let totalScore = 0;
    let countedScores = 0;
    let passedCount = 0;
    let failedCount = 0;

    tableHeaderHTML = `
      <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">
        <th style="padding:8px;text-align:left;">#</th>
        <th style="padding:8px;text-align:left;">Student Name</th>
        <th style="padding:8px;text-align:center;">ID Number</th>
        <th style="padding:8px;text-align:center;">Final Grade</th>
        <th style="padding:8px;text-align:center;">Academic Standing</th>
      </tr>
    `;

    tableRowsHTML = students.map((s, idx) => {
      const gr = (data.grades[s.id] || []).find(g => g[0].toLowerCase() === primaryClass.subject.toLowerCase()) || [primaryClass.subject, "", "", "", ""];
      const finalVal = calc(gr);
      const st = statusOf(finalVal);

      if (typeof finalVal === "number") {
        totalScore += finalVal;
        countedScores++;
        if (finalVal >= 75) passedCount++; else failedCount++;
      }

      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;color:#888;">${idx + 1}</td>
          <td style="padding:8px;"><b>${esc(s.name)}</b></td>
          <td style="padding:8px;text-align:center;">${esc(s.id)}</td>
          <td style="padding:8px;text-align:center;font-weight:700;font-size:13px;">${finalVal}</td>
          <td style="padding:8px;text-align:center;"><span class="badge ${st.toLowerCase()}">${esc(st)}</span></td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="5" style="padding:12px;text-align:center;">No records available.</td></tr>`;

    const classAverage = countedScores > 0 ? (totalScore / countedScores).toFixed(2) : "0.00";
    summaryFootnoteHTML = `
      <div style="margin-top:14px;padding:10px 14px;background:#f8fafc;border-radius:6px;display:flex;justify-content:space-around;font-size:12.5px;border:1px solid #e2e8f0;">
        <div><b>Class Average:</b> <span style="color:#7d090f;font-weight:700;">${classAverage}</span></div>
        <div><b>Total Passed:</b> <span style="color:#2e7d32;font-weight:700;">${passedCount}</span></div>
        <div><b>Total Failed / Incomplete:</b> <span style="color:#b91c1c;font-weight:700;">${failedCount}</span></div>
      </div>
    `;

  } else {
    tableHeaderHTML = `
      <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">
        <th style="padding:8px;text-align:left;">#</th>
        <th style="padding:8px;text-align:left;">Student Name</th>
        <th style="padding:8px;text-align:center;">ID Number</th>
        <th style="padding:8px;text-align:center;">1st</th>
        <th style="padding:8px;text-align:center;">2nd</th>
        <th style="padding:8px;text-align:center;">3rd</th>
        <th style="padding:8px;text-align:center;">4th</th>
        <th style="padding:8px;text-align:center;">Final</th>
        <th style="padding:8px;text-align:center;">Remarks</th>
      </tr>
    `;

    tableRowsHTML = students.map((s, idx) => {
      const gr = (data.grades[s.id] || []).find(g => g[0].toLowerCase() === primaryClass.subject.toLowerCase()) || [primaryClass.subject, "", "", "", ""];
      const finalVal = calc(gr);
      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;color:#888;">${idx + 1}</td>
          <td style="padding:8px;"><b>${esc(s.name)}</b></td>
          <td style="padding:8px;text-align:center;">${esc(s.id)}</td>
          <td style="padding:8px;text-align:center;">${gr[1] ?? '—'}</td>
          <td style="padding:8px;text-align:center;">${gr[2] ?? '—'}</td>
          <td style="padding:8px;text-align:center;">${gr[3] ?? '—'}</td>
          <td style="padding:8px;text-align:center;">${gr[4] ?? '—'}</td>
          <td style="padding:8px;text-align:center;font-weight:700;">${finalVal}</td>
          <td style="padding:8px;text-align:center;">${statusOf(finalVal)}</td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="9" style="padding:12px;text-align:center;">No students enrolled.</td></tr>`;
  }

  return `
    <div class="report-paper" style="box-sizing: border-box; width: 100%; padding: 24px; background: #ffffff; color: #1f2937; font-family: 'Montserrat', Arial, sans-serif;">
      <div style="text-align:center;border-bottom:2px solid #7d090f;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="color:#7d090f;margin:0 0 4px 0;font-size:20px;">Escuela de Nuestra Señora de la Salette</h2>
        <div style="font-size:12px;color:#555;">Official Faculty Academic Record &bull; S.Y. 2026-2027</div>
        <h3 style="margin:12px 0 0 0;text-transform:uppercase;color:#1f2937;">${esc(title)}</h3>
        <div style="font-size:12px;color:#7d090f;font-weight:700;margin-top:4px;">
          Instructor: ${esc(fac.name)} &bull; ${esc(primaryClass.subject)} (${esc(primaryClass.grade)} - ${esc(primaryClass.section)}) &bull; ${esc(primaryClass.room || "Room 204")}
        </div>
      </div>

      <div class="report-table-wrap">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            ${tableHeaderHTML}
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
      </div>

      ${summaryFootnoteHTML}

      <div style="margin-top:28px;display:flex;justify-content:space-between;font-size:12px;color:#555;">
        <div>Date Generated: ${new Date().toLocaleDateString()}</div>
        <div style="border-top:1px solid #333;width:200px;text-align:center;padding-top:4px;">
          ${esc(fac.name)}<br><small>Subject Instructor</small>
        </div>
      </div>
    </div>
  `;
}

function viewFacultyReport(title) {
  $("modalReportTitle").textContent = title;
  $("modalReportContent").innerHTML = generateFacultyReportHTML(title);
  if ($("modalPrintBtn")) $("modalPrintBtn").onclick = () => printFacultyReport(title);
  if ($("modalDownloadPdfBtn")) $("modalDownloadPdfBtn").onclick = () => downloadFacultyReportPDF(title);
  $("reportViewModal").classList.remove("hidden");
}

function printFacultyReport(title) {
  executePrintWindow(title, generateFacultyReportHTML(title));
}

function downloadFacultyReportPDF(title) {
  const filename = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  executeAutomaticPDFDownload(filename, generateFacultyReportHTML(title));
}

// --------------------------------------------------
// 7. PROFILE & SETTINGS
// --------------------------------------------------
function renderFacultyProfile() {
  const fac = data.faculty;
  const item = (label, val) => `<div class="profile-item"><small>${esc(label)}</small><strong>${esc(val)}</strong></div>`;

  $("facultyProfileDetails").innerHTML =
    item("Faculty Employee ID", fac.id) +
    item("Full Name", fac.name) +
    item("Academic Department", fac.department) +
    item("Email Address", fac.email) +
    item("Contact Number", fac.contact) +
    item("Office / Room", fac.office);

  const classesList = $("facultyHandledClassesList");
  if (classesList) {
    classesList.innerHTML = fac.classes.map(c => `
      <div class="modal-pill" style="padding: 8px 12px; margin-bottom: 6px;">
        <i class="fa-solid fa-chalkboard-user" style="color:var(--primary)"></i> <b>${esc(c.subject)}</b> &bull; ${esc(c.grade)} (${esc(c.section)}) &bull; <small>${esc(c.schedule)}</small> &bull; <small><i class="fa-solid fa-location-dot"></i> <b>${esc(c.room || "Room 204")}</b></small>
      </div>
    `).join("");
  }

  $("facProfileEmail").value = fac.email;
  $("facProfileContact").value = fac.contact;
  $("facProfileOffice").value = fac.office;
}

function saveFacultyProfileSettings() {
  const email = val("facProfileEmail");
  const contact = val("facProfileContact");
  const office = val("facProfileOffice");

  if (!email || !contact) return toast("Email and contact number are required.");

  data.faculty.email = email;
  data.faculty.contact = contact;
  data.faculty.office = office;

  persist();
  renderFacultyProfile();
  toast("Profile information successfully updated.");
}