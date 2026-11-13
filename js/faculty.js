// ==========================================================
// FACULTY & ANNOUNCEMENTS CONTROLLER
// ==========================================================

function bindActiveFaculty(facId) {
  const list = data.facultyList || [];
  const found = list.find(f => f.id === facId) || list[0];
  if (!found) return;

  data.faculty = {
    id: found.id,
    name: found.name,
    email: found.email || "faculty@salette.edu.ph",
    department: found.department || "Academic Faculty",
    contact: found.contact || "N/A",
    office: found.office || "Faculty Room",
    subjects: Array.isArray(found.subjects) ? [...found.subjects] : [],
    classes: []
  };
  syncFacultyClassesFromSchedules();
}

function syncFacultyClassesFromSchedules() {
  if (!data.faculty) return;
  const facSchedules = (data.schedules || []).filter(sch => sch.facultyId === data.faculty.id);

  // Deduplicate by grade + section + subject + semester so each handled class appears cleanly
  const classMap = new Map();
  facSchedules.forEach(sch => {
    const isSHS = sch.grade === "Grade 11" || sch.grade === "Grade 12";
    const semester = isSHS
      ? (sch.semester && sch.semester !== "N/A" ? sch.semester : getSubjectSemester(sch.subject, sch.grade))
      : "N/A";
    const key = `${sch.grade}|${sch.section}|${sch.subject}|${semester}`;

    if (!classMap.has(key)) {
      classMap.set(key, {
        id: sch.id,
        grade: sch.grade,
        section: sch.section,
        subject: sch.subject,
        semester,
        schedule: `${sch.day} ${sch.time}`,
        room: sch.room || "Room 204"
      });
    } else {
      const existing = classMap.get(key);
      existing.schedule += `, ${sch.day} ${sch.time}`;
    }
  });

  data.faculty.classes = Array.from(classMap.values());
}

function formatFacultyClassOption(c) {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
  const semTag = (c.semester && c.semester !== "N/A") ? ` (${c.semester})` : "";
  const rawSub = String(c.subject || "");

  if (isMobile) {
    const shortGrade = String(c.grade || "").replace(/^Grade\s+/i, "G");
    // Cut/truncate subject title if it exceeds 16 characters on mobile
    const subLabel = rawSub.length > 16 ? `${rawSub.slice(0, 15).trim()}…` : rawSub;
    return `${shortGrade} ${c.section} • ${subLabel}${semTag}`;
  }

  return `${c.grade} - ${c.section} • ${rawSub}${semTag} (${c.room || "Room 204"})`;
}

function initFacultyData() {
  const activeId = currentUser?.id || data.faculty?.id || "FAC-2026-01";
  bindActiveFaculty(activeId);

  if (!data.attendance) {
    data.attendance = {};
  }

  if (!data.announcements || !Array.isArray(data.announcements)) {
    data.announcements = defaultData.announcements;
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
    schedEl.innerHTML = fac.classes.map(c => {
      const semTag = (c.semester && c.semester !== "N/A")
        ? ` &bull; <span class="badge ${c.semester === "2nd Sem" ? "silver" : "enrolled"}" style="font-size:10px;padding:2px 6px;">${esc(c.semester)}</span>`
        : "";
      return `
        <div class="fac-schedule-item">
          <div class="fac-sched-time">
            <i class="fa-solid fa-clock"></i> ${esc(c.schedule)} &bull; <i class="fa-solid fa-location-dot"></i> <b>${esc(c.room || "Room 204")}</b>${semTag}
          </div>
          <div class="fac-sched-title"><b>${esc(c.subject)}</b> &bull; ${esc(c.grade)} (${esc(c.section)})</div>
        </div>
      `;
    }).join("") || `<p style="color:var(--text-muted);font-size:13px;">No class schedules assigned yet.</p>`;
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
    const semBadge = (c.semester && c.semester !== "N/A")
      ? `<span class="badge ${c.semester === "2nd Sem" ? "silver" : "enrolled"}">${esc(c.semester)}</span>`
      : "";
    return `
      <div class="card faculty-class-card">
        <div class="fac-class-header" style="flex-wrap:wrap;gap:6px;">
          <span class="badge enrolled">${esc(c.grade)}</span>
          <span class="badge gold">${esc(c.section)}</span>
          ${semBadge}
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
  }).join("") || `<p style="color:var(--text-muted);">No classes assigned to your account yet.</p>`;
}

function openClassStudentList(classId) {
  activeClassId = classId;
  const cls = data.faculty.classes.find(c => c.id === classId);
  if (!cls) return;

  const semLabel = (cls.semester && cls.semester !== "N/A") ? ` [${cls.semester}]` : "";
  $("facultyClassTitle").textContent = `${cls.subject}${semLabel} — ${cls.grade} (${cls.section}) • ${cls.room || "Room 204"}`;
  const students = data.students.filter(s => s.grade === cls.grade && s.section === cls.section);

  const tableBody = $("facultyClassStudentsTable");
  if (tableBody) {
    tableBody.innerHTML = students.map((s, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${esc(s.name)}</b></td>
        <td>${esc(s.id)}</td>
        <td><span class="badge regular">${esc(s.status || "Enrolled")}</span></td>
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
  sel.innerHTML = data.faculty.classes.map(c =>
    `<option value="${esc(c.id)}">${esc(formatFacultyClassOption(c))}</option>`
  ).join("");
  if (current && data.faculty.classes.some(c => c.id === current)) sel.value = current;
}

function renderFacultyGrades(highlightStudentId = null) {
  const classId = $("facGradeClassSelect")?.value;
  const cls = data.faculty.classes.find(c => c.id === classId);
  const tableBody = $("facGradesEntryTable");
  if (!tableBody) return;
  if (!cls) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:16px;">No assigned classes found.</td></tr>`;
    return;
  }

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
        <td style="text-align: center;"><input type="number" min="0" max="100" id="facGrade_${esc(s.id)}_q1" name="facGrade_${esc(s.id)}_q1" aria-label="${esc(s.name)} Quarter 1" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="1" value="${subjectRow[1] ?? ''}"></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" id="facGrade_${esc(s.id)}_q2" name="facGrade_${esc(s.id)}_q2" aria-label="${esc(s.name)} Quarter 2" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="2" value="${subjectRow[2] ?? ''}"></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" id="facGrade_${esc(s.id)}_q3" name="facGrade_${esc(s.id)}_q3" aria-label="${esc(s.name)} Quarter 3" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="3" value="${subjectRow[3] ?? ''}"></td>
        <td style="text-align: center;"><input type="number" min="0" max="100" id="facGrade_${esc(s.id)}_q4" name="facGrade_${esc(s.id)}_q4" aria-label="${esc(s.name)} Quarter 4" class="grade-input fac-grade-q" data-sid="${s.id}" data-q="4" value="${subjectRow[4] ?? ''}"></td>
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
  sel.innerHTML = data.faculty.classes.map(c =>
    `<option value="${esc(c.id)}">${esc(formatFacultyClassOption(c))}</option>`
  ).join("");
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
  if (!tableBody) return;
  if (!cls) {
    tableBody.innerHTML = `<tr><td colspan="4">No assigned classes found.</td></tr>`;
    return;
  }

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
    const rate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;

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
  if (val("adminNoticeEditId") === id) resetAdminAnnouncementForm();
  if (val("facNoticeEditId") === id) resetFacultyAnnouncementForm();
  renderFacultyAnnouncements();
  renderAdminAnnouncements();
  if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
  toast("Announcement removed.");
}

const deleteFacultyAnnouncement = deleteAnnouncement;

function resetFacultyAnnouncementForm() {
  if ($("facNoticeEditId")) $("facNoticeEditId").value = "";
  if ($("facNoticeFormTitle")) $("facNoticeFormTitle").textContent = "Post Class Announcement";
  if ($("facNoticeTitle")) $("facNoticeTitle").value = "";
  if ($("facNoticeContent")) $("facNoticeContent").value = "";
  if ($("facNoticeTarget") && $("facNoticeTarget").options.length) {
    $("facNoticeTarget").selectedIndex = 0;
  }
  if ($("facNoticeSaveBtn")) {
    $("facNoticeSaveBtn").innerHTML = `<i class="fa-solid fa-paper-plane fa-fw"></i> Post Announcement`;
  }
  $("facNoticeCancelBtn")?.classList.add("hidden");
}

function editFacultyAnnouncement(id) {
  const notice = (data.announcements || []).find(a => a.id === id);
  if (!notice) return;

  if ($("facNoticeEditId")) $("facNoticeEditId").value = notice.id;
  if ($("facNoticeFormTitle")) $("facNoticeFormTitle").textContent = "Edit Class Announcement";
  if ($("facNoticeTitle")) $("facNoticeTitle").value = notice.title;
  if ($("facNoticeContent")) $("facNoticeContent").value = notice.content;

  const targetSelect = $("facNoticeTarget");
  if (targetSelect) {
    const hasOption = Array.from(targetSelect.options).some(opt => opt.value === notice.target);
    if (!hasOption && notice.target) {
      const opt = document.createElement("option");
      opt.value = notice.target;
      opt.textContent = notice.target;
      targetSelect.appendChild(opt);
    }
    targetSelect.value = notice.target;
  }

  if ($("facNoticeSaveBtn")) {
    $("facNoticeSaveBtn").innerHTML = `<i class="fa-solid fa-floppy-disk fa-fw"></i> Update Announcement`;
  }
  $("facNoticeCancelBtn")?.classList.remove("hidden");
  $("facultyAnnouncements")?.scrollIntoView({ behavior: "smooth" });
}

function renderFacultyAnnouncements() {
  const listEl = $("facAnnouncementList");
  if (!listEl) return;

  listEl.innerHTML = (data.announcements || []).map(a => `
    <div class="fac-notice-item" draggable="false">
      <div class="fac-notice-header">
        <div>
          <h4 style="margin: 0; font-size: 16px; color: var(--primary-dark);">${esc(a.title)}</h4>
          <small style="color:var(--text-muted);"><i class="fa-solid fa-bullhorn"></i> Posted by ${esc(a.author)} &bull; ${esc(a.date)}</small>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="badge enrolled">${esc(a.target)}</span>
          <button class="secondary table-btn" title="Edit Announcement" onclick="editFacultyAnnouncement('${esc(a.id)}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="secondary table-btn" title="Delete Announcement" style="color:var(--primary);" onclick="deleteAnnouncement('${esc(a.id)}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">${esc(a.content)}</p>
    </div>
  `).join("") || `<p style="color:var(--text-muted);">No active notices posted.</p>`;

  const targetSelect = $("facNoticeTarget");
  if (targetSelect) {
    const currentTarget = targetSelect.value;
    targetSelect.innerHTML = `<option value="All Classes">All My Classes</option>` +
      data.faculty.classes.map(c => `<option value="${esc(c.grade)} - ${esc(c.section)}">${esc(c.grade)} - ${esc(c.section)} (${esc(c.subject)})</option>`).join("");
    if (currentTarget && Array.from(targetSelect.options).some(o => o.value === currentTarget)) {
      targetSelect.value = currentTarget;
    }
  }
}

function postFacultyAnnouncement() {
  const editId = val("facNoticeEditId");
  const title = val("facNoticeTitle");
  const target = val("facNoticeTarget") || "All Classes";
  const content = val("facNoticeContent");

  if (!title || !content) return toast("Notice title and content are required.");

  if (!data.announcements) data.announcements = [];

  if (editId) {
    const idx = data.announcements.findIndex(a => a.id === editId);
    if (idx !== -1) {
      data.announcements[idx] = {
        ...data.announcements[idx],
        title,
        target,
        content
      };
    }
    persist();
    resetFacultyAnnouncementForm();
    renderFacultyAnnouncements();
    if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
    toast("Announcement updated successfully.");
    return;
  }

  const newNotice = {
    id: `ANN-${Date.now().toString().slice(-4)}`,
    title,
    target,
    author: data.faculty.name,
    date: new Date().toISOString().slice(0, 10),
    content
  };

  data.announcements.unshift(newNotice);
  persist();

  resetFacultyAnnouncementForm();
  renderFacultyAnnouncements();
  if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
  toast("Announcement posted successfully.");
}

function resetAdminAnnouncementForm() {
  if ($("adminNoticeEditId")) $("adminNoticeEditId").value = "";
  if ($("adminNoticeFormTitle")) $("adminNoticeFormTitle").textContent = "Post Announcement";
  if ($("adminNoticeTitle")) $("adminNoticeTitle").value = "";
  if ($("adminNoticeContent")) $("adminNoticeContent").value = "";
  if ($("adminNoticeTarget") && $("adminNoticeTarget").options.length) {
    $("adminNoticeTarget").selectedIndex = 0;
  }
  if ($("adminNoticeSaveBtn")) {
    $("adminNoticeSaveBtn").innerHTML = `<i class="fa-solid fa-paper-plane fa-fw"></i> Post Announcement`;
  }
  $("adminNoticeCancelBtn")?.classList.add("hidden");
}

function editAdminAnnouncement(id) {
  const notice = (data.announcements || []).find(a => a.id === id);
  if (!notice) return;

  if ($("adminNoticeEditId")) $("adminNoticeEditId").value = notice.id;
  if ($("adminNoticeFormTitle")) $("adminNoticeFormTitle").textContent = "Edit Announcement";
  if ($("adminNoticeTitle")) $("adminNoticeTitle").value = notice.title;
  if ($("adminNoticeContent")) $("adminNoticeContent").value = notice.content;

  const targetSelect = $("adminNoticeTarget");
  if (targetSelect) {
    const hasOption = Array.from(targetSelect.options).some(opt => opt.value === notice.target);
    if (!hasOption && notice.target) {
      const opt = document.createElement("option");
      opt.value = notice.target;
      opt.textContent = notice.target;
      targetSelect.appendChild(opt);
    }
    targetSelect.value = notice.target;
  }

  if ($("adminNoticeSaveBtn")) {
    $("adminNoticeSaveBtn").innerHTML = `<i class="fa-solid fa-floppy-disk fa-fw"></i> Update Announcement`;
  }
  $("adminNoticeCancelBtn")?.classList.remove("hidden");
  $("adminAnnouncements")?.scrollIntoView({ behavior: "smooth" });
}

function renderAdminAnnouncements() {
  const listEl = $("adminAnnouncementList");
  if (listEl) {
    listEl.innerHTML = (data.announcements || []).map(a => `
      <div class="fac-notice-item" draggable="false">
        <div class="fac-notice-header">
          <div>
            <h4 style="margin: 0; font-size: 16px; color: var(--primary-dark);">${esc(a.title)}</h4>
            <small style="color:var(--text-muted);"><i class="fa-solid fa-bullhorn"></i> Posted by ${esc(a.author)} &bull; ${esc(a.date)}</small>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="badge enrolled">${esc(a.target)}</span>
            <button class="secondary table-btn" title="Edit Announcement" onclick="editAdminAnnouncement('${esc(a.id)}')"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="secondary table-btn" title="Delete Announcement" style="color:var(--primary);" onclick="deleteAnnouncement('${esc(a.id)}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">${esc(a.content)}</p>
      </div>
    `).join("") || `<p style="color:var(--text-muted);">No active notices posted.</p>`;
  }

  const targetSelect = $("adminNoticeTarget");
  if (targetSelect) {
    const currentTarget = targetSelect.value;
    const classSet = new Set(data.students.map(s => `${s.grade} - ${s.section}`).filter(Boolean));
    targetSelect.innerHTML = `<option value="All Classes">All Classes</option>` +
      Array.from(classSet).map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    if (currentTarget && Array.from(targetSelect.options).some(o => o.value === currentTarget)) {
      targetSelect.value = currentTarget;
    }
  }
}

function postAdminAnnouncement() {
  const editId = val("adminNoticeEditId");
  const title = val("adminNoticeTitle");
  const target = val("adminNoticeTarget") || "All Classes";
  const content = val("adminNoticeContent");

  if (!title || !content) return toast("Notice title and content are required.");

  if (!data.announcements) data.announcements = [];

  if (editId) {
    const idx = data.announcements.findIndex(a => a.id === editId);
    if (idx !== -1) {
      data.announcements[idx] = {
        ...data.announcements[idx],
        title,
        target,
        content
      };
    }
    persist();
    resetAdminAnnouncementForm();
    renderAdminAnnouncements();
    if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
    toast("Announcement updated successfully.");
    return;
  }

  const newNotice = {
    id: `ANN-${Date.now().toString().slice(-4)}`,
    title,
    target,
    author: currentUser?.name || "Administrator",
    date: new Date().toISOString().slice(0, 10),
    content
  };

  data.announcements.unshift(newNotice);
  persist();

  resetAdminAnnouncementForm();
  renderAdminAnnouncements();
  if (typeof renderAdminDashboardAnnouncements === "function") renderAdminDashboardAnnouncements();
  toast("Announcement posted successfully.");
}

// --------------------------------------------------
// 6. REPORTS
// --------------------------------------------------
function normalizeFacSem(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s || s === "n/a") return "";
  if (s.startsWith("1")) return "1st";
  if (s.startsWith("2")) return "2nd";
  return s;
}

function populateFacultyReportFilters() {
  const fac = data.faculty;
  if (!fac) return;

  const classes = fac.classes || [];
  const hasShsClasses = classes.some(c => normalizeFacSem(c.semester) !== "");
  const semSel = $("facReportSemFilter");
  const clsSel = $("facReportClassSelect");

  if (semSel) {
    semSel.style.display = hasShsClasses ? "" : "none";
    if (!hasShsClasses) semSel.value = "";
  }

  const semKey = hasShsClasses ? normalizeFacSem(semSel?.value) : "";
  const filteredClasses = classes.filter(c => !semKey || normalizeFacSem(c.semester) === semKey);

  if (clsSel) {
    const prevVal = clsSel.value;
    if (filteredClasses.length) {
      clsSel.disabled = false;
      clsSel.innerHTML = filteredClasses.map(c =>
        `<option value="${esc(c.id)}">${esc(formatFacultyClassOption(c))}</option>`
      ).join("");
      if (prevVal && filteredClasses.some(c => c.id === prevVal)) {
        clsSel.value = prevVal;
      }
    } else {
      clsSel.disabled = true;
      clsSel.innerHTML = `<option value="">No classes for this semester</option>`;
    }
  }
}

function handleFacReportSemChange() {
  populateFacultyReportFilters();
}

function renderFacultyReports() {
  populateFacultyReportFilters();
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
  const semSel = $("facReportSemFilter");
  const semKey = normalizeFacSem(semSel?.value);
  const matchingClasses = (fac.classes || []).filter(c => !semKey || normalizeFacSem(c.semester) === semKey);

  const selectedClassId = $("facReportClassSelect")?.value || $("facGradeClassSelect")?.value || $("facAttClassSelect")?.value || (matchingClasses[0] && matchingClasses[0].id);
  const primaryClass = matchingClasses.find(c => c.id === selectedClassId)
    || matchingClasses[0]
    || { id: "NONE", grade: "N/A", section: "N/A", subject: "No Class Assigned", semester: semSel?.value || "N/A", room: "N/A" };
  const students = primaryClass.id === "NONE"
    ? []
    : data.students.filter(s => s.grade === primaryClass.grade && s.section === primaryClass.section);
  const semSubtitle = (primaryClass.semester && primaryClass.semester !== "N/A") ? ` &bull; ${esc(primaryClass.semester)}` : "";

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
      const rate = st.total > 0 ? Math.round(((st.present + st.late) / st.total) * 100) : 0;
      return `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;color:#888;">${idx + 1}</td>
          <td style="padding:8px;"><b>${esc(s.name)}</b></td>
          <td style="padding:8px;text-align:center;">${esc(s.id)}</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#2e7d32;">${st.present}</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#b26a00;">${st.late}</td>
          <td style="padding:8px;text-align:center;font-weight:700;color:#b91c1c;">${st.absent}</td>
          <td style="padding:8px;text-align:center;">${st.excused}</td>
          <td style="padding:8px;text-align:center;font-weight:800;color:${rate >= 80 ? '#2e7d32' : (rate === 0 ? '#64748b' : '#b91c1c')};">${rate}%</td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="8" style="padding:12px;text-align:center;">No students enrolled for this selection.</td></tr>`;

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
    }).join("") || `<tr><td colspan="5" style="padding:12px;text-align:center;">No records available for this selection.</td></tr>`;

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
          <td style="padding:8px;text-align:center;">${formatQuarter(gr[1])}</td>
          <td style="padding:8px;text-align:center;">${formatQuarter(gr[2])}</td>
          <td style="padding:8px;text-align:center;">${formatQuarter(gr[3])}</td>
          <td style="padding:8px;text-align:center;">${formatQuarter(gr[4])}</td>
          <td style="padding:8px;text-align:center;font-weight:700;">${finalVal}</td>
          <td style="padding:8px;text-align:center;">${statusOf(finalVal)}</td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="9" style="padding:12px;text-align:center;">No students enrolled for this selection.</td></tr>`;
  }

  return `
    <div class="report-paper" style="box-sizing: border-box; width: 100%; padding: 24px; background: #ffffff; color: #1f2937; font-family: 'Montserrat', Arial, sans-serif;">
      <div style="text-align:center;border-bottom:2px solid #7d090f;padding-bottom:12px;margin-bottom:16px;">
        <h2 style="color:#7d090f;margin:0 0 4px 0;font-size:20px;">Escuela de Nuestra Señora de la Salette</h2>
        <div style="font-size:12px;color:#555;">Official Faculty Academic Record &bull; S.Y. 2026-2027</div>
        <h3 style="margin:12px 0 0 0;text-transform:uppercase;color:#1f2937;">${esc(title)}</h3>
        <div style="font-size:12px;color:#7d090f;font-weight:700;margin-top:4px;">
          Instructor: ${esc(fac.name)} &bull; ${esc(primaryClass.subject)} (${esc(primaryClass.grade)} - ${esc(primaryClass.section)})${semSubtitle} &bull; ${esc(primaryClass.room || "Room 204")}
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
  const sem = $("facReportSemFilter")?.value || "";
  const semTag = sem ? `_${sem.replace(/\s+/g, "_")}` : "";
  const filename = `${title.replace(/\s+/g, '_')}${semTag}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
    const assignedSubjectsHTML = (fac.subjects || []).length
      ? `<div style="margin-bottom:12px;">
          <small style="display:block;color:var(--text-muted);font-weight:700;margin-bottom:6px;">ASSIGNED SUBJECTS (${fac.subjects.length})</small>
          <div class="modal-pills" style="margin-top:0;">
            ${fac.subjects.map(sub => `<span class="modal-pill"><i class="fa-solid fa-book fa-fw" style="color:var(--primary)"></i> ${esc(sub)}</span>`).join("")}
          </div>
        </div>`
      : "";

    const scheduledClassesHTML = fac.classes.length
      ? `<div>
          <small style="display:block;color:var(--text-muted);font-weight:700;margin-bottom:6px;">SCHEDULED CLASS SECTIONS (${fac.classes.length})</small>
          ${fac.classes.map(c => {
            const semBadge = (c.semester && c.semester !== "N/A")
              ? ` &bull; <span class="badge ${c.semester === "2nd Sem" ? "silver" : "enrolled"}" style="font-size:10px;padding:2px 6px;">${esc(c.semester)}</span>`
              : "";
            return `
              <div class="modal-pill" style="padding: 8px 12px; margin-bottom: 6px; display: block;">
                <i class="fa-solid fa-chalkboard-user" style="color:var(--primary)"></i> <b>${esc(c.subject)}</b> &bull; ${esc(c.grade)} (${esc(c.section)})${semBadge} &bull; <small>${esc(c.schedule)}</small> &bull; <small><i class="fa-solid fa-location-dot"></i> <b>${esc(c.room || "Room 204")}</b></small>
              </div>
            `;
          }).join("")}
        </div>`
      : `<p style="color:var(--text-muted);font-size:13px;">No classes scheduled yet.</p>`;

    classesList.innerHTML = assignedSubjectsHTML + scheduledClassesHTML;
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

  const idx = (data.facultyList || []).findIndex(f => f.id === data.faculty.id);
  if (idx !== -1) {
    data.facultyList[idx].email = email;
    data.facultyList[idx].contact = contact;
    data.facultyList[idx].office = office;
  }

  persist();
  renderFacultyProfile();
  toast("Profile information successfully updated.");
}

// Re-sync compact mobile dropdown labels if viewport crosses 640px
let lastFacMobileMode = typeof window !== "undefined" && window.innerWidth <= 640;
window.addEventListener("resize", () => {
  const isNowMobile = window.innerWidth <= 640;
  if (isNowMobile !== lastFacMobileMode) {
    lastFacMobileMode = isNowMobile;
    populateFacultyGradesFilters();
    populateFacultyAttendanceFilters();
    populateFacultyReportFilters();
  }
});