function renderStudentAnnouncements() {
  const s = currentStudent;
  if (!s) return;

  const studentSectionTarget = `${s.grade} - ${s.section}`;
  const notices = (data.announcements || []).filter(a =>
    a.target === "All Classes" ||
    a.target === studentSectionTarget ||
    a.target === s.grade
  );

  const countEl = $("studentNoticeCount");
  if (countEl) countEl.textContent = `${notices.length} Active`;

  const html = notices.map(a => `
    <div class="fac-notice-item">
      <div class="fac-notice-header">
        <div>
          <h4 style="margin: 0; font-size: 15.5px; color: var(--primary-dark);">${esc(a.title)}</h4>
          <small style="color:var(--text-muted);"><i class="fa-solid fa-bullhorn"></i> Posted by ${esc(a.author)} &bull; ${esc(a.date)}</small>
        </div>
        <span class="badge ${a.target === 'All Classes' ? 'enrolled' : 'gold'}">${esc(a.target)}</span>
      </div>
      <p style="margin: 10px 0 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-main);">${esc(a.content)}</p>
    </div>
  `).join("") || `<p style="color:var(--text-muted);margin:0;">No active announcements for your class.</p>`;

  if ($("studentAnnouncementsList")) $("studentAnnouncementsList").innerHTML = html;
  if ($("studentAnnouncementsFullList")) $("studentAnnouncementsFullList").innerHTML = html;
}

function normalizeSemKey(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s || s === "all" || s === "all semesters" || s === "n/a") return "";
  if (s.startsWith("1")) return "1st";
  if (s.startsWith("2")) return "2nd";
  return s;
}

function getStudentFilterSelect(primaryId, sectionId) {
  const el = $(primaryId) || document.querySelector(`#${sectionId} select`);
  if (el && !el.dataset.semBound) {
    el.addEventListener("change", () => renderStudentPortal());
    el.dataset.semBound = "1";
  }
  return el;
}

function renderStudentPortal() {
  const s = currentStudent;
  if (!s) return;
  const grades = data.grades[s.id] || [];
  const isSHS = s.grade === "Grade 11" || s.grade === "Grade 12";
  const displayStatus = (s.status === "Regular" ? "Enrolled" : (s.status || "Enrolled"));

  const enr = data.enrollments.find(e => e.student === s.id) || {
    schoolYear: "2026-2027",
    grade: s.grade,
    strand: isSHS ? "ABM" : "N/A",
    semester: isSHS ? "1st Sem" : "N/A",
    section: s.section,
    date: displayStatus === "Pending" ? "Pending" : "2026-06-15",
    enrollmentStatus: displayStatus
  };

  const activeSem = isSHS
    ? (enr.semester && enr.semester !== "N/A" ? enr.semester : "1st Sem")
    : "N/A";

  const subFilterEl = getStudentFilterSelect("studentSubjectsSemFilter", "studentSubjects");
  const gradeFilterEl = getStudentFilterSelect("studentGradesSemFilter", "studentGrades");
  const schedFilterEl = getStudentFilterSelect("studentScheduleSemFilter", "studentSchedule");

  // Show semester filter dropdowns only for Senior High School (Grade 11 & 12)
  [subFilterEl, gradeFilterEl, schedFilterEl].forEach(el => {
    if (!el) return;
    el.style.display = isSHS ? "" : "none";
    if (!isSHS) el.value = "";
  });

  $("studentWelcomeName").textContent = `Welcome, ${formatNameId(s)}`;

  const item = (label, v, full = false) =>
    `<div class="profile-item${full ? " span-2" : ""}"><small>${esc(label)}</small><strong>${esc(v || "—")}</strong></div>`;

  $("studentProfile").innerHTML =
    item("Student", formatNameId(s)) +
    item("Grade Level", s.grade) +
    item("Section", s.section) +
    item("Status", displayStatus) +
    item("Contact", s.contact || "N/A");

  $("myProfileDetails").innerHTML =
    item("Full Name", s.name, true) +
    item("Student ID (Login Username)", s.id) +
    item("Grade Level", s.grade) +
    item("Section", s.section) +
    item("Status", displayStatus) +
    item("Guardian", s.guardian || "N/A") +
    item("Contact Number", s.contact || "N/A");

  $("myEnrollmentDetails").innerHTML =
    item("Student ID Number", s.id) +
    item("Grade Level", enr.grade || s.grade) +
    item("Strand", enr.strand || (isSHS ? "ABM" : "N/A")) +
    item("Semester", activeSem) +
    item("Section", enr.section || s.section) +
    item("Date Enrolled", enr.date || (displayStatus === "Pending" ? "Pending" : "2026-06-15")) +
    item("School Year", enr.schoolYear || "2026-2027") +
    item("Enrollment Status", enr.enrollmentStatus || displayStatus);

  const avg = avgOf(grades);
  const passed = grades.filter(g => statusOf(calc(g)) === "Passed").length;
  const failed = grades.filter(g => statusOf(calc(g)) === "Failed").length;

  $("mySummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Enrolled Subjects:</b> ${grades.length}</p><p><b>Passed:</b> ${passed}</p><p><b>Failed:</b> ${failed}</p>`;

  const resolveSem = subjectName =>
    typeof getSubjectSemester === "function" ? getSubjectSemester(subjectName, s.grade) : "N/A";

  const formatSemBadge = sem => {
    if (!isSHS || !sem || sem === "N/A") {
      return `<span style="color:var(--text-muted);font-size:12px;">N/A</span>`;
    }
    const isSecond = normalizeSemKey(sem) === "2nd";
    return `<span class="badge ${isSecond ? "silver" : "enrolled"}">${esc(sem)}</span>`;
  };

  // My Subjects (Filtered by Semester)
  const subSemKey = isSHS ? normalizeSemKey(subFilterEl?.value) : "";
  const filteredSubjects = grades.filter(g => !subSemKey || normalizeSemKey(resolveSem(g[0])) === subSemKey);

  $("mySubjectsTable").innerHTML = filteredSubjects.map(g => {
    const sem = resolveSem(g[0]);
    return `<tr>
      <td><b>${esc(g[0])}</b></td>
      <td>${formatSemBadge(sem)}</td>
      <td>${calc(g)}</td>
      <td>${badge(statusOf(calc(g)))}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="4">${grades.length ? "No subjects found for this semester." : "No subjects enrolled."}</td></tr>`;

  // My Grades (Filtered by Semester)
  const gradeSemKey = isSHS ? normalizeSemKey(gradeFilterEl?.value) : "";
  const filteredGrades = grades.filter(g => !gradeSemKey || normalizeSemKey(resolveSem(g[0])) === gradeSemKey);

  $("myGradeTable").innerHTML = filteredGrades.map(g => {
    const finalScore = calc(g);
    const sem = resolveSem(g[0]);
    return `<tr>
      <td><b>${esc(g[0])}</b></td>
      <td>${formatSemBadge(sem)}</td>
      <td>${formatQuarter(g[1])}</td>
      <td>${formatQuarter(g[2])}</td>
      <td>${formatQuarter(g[3])}</td>
      <td>${formatQuarter(g[4])}</td>
      <td><b>${finalScore}</b></td>
      <td>${badge(statusOf(finalScore))}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="8">${grades.length ? "No grades recorded for this semester." : "No grades recorded."}</td></tr>`;

  const hasCompleted = grades.some(g => typeof calc(g) === "number");
  const standingText = !hasCompleted
    ? "Pending (Incomplete Quarters)"
    : (Number(avg) >= 75 ? "Good Standing" : "Needs Remediation");

  $("myPerformanceSummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Academic Standing:</b> ${standingText}</p>`;

  $("myPerformanceChart").innerHTML = grades.map(g => {
    const sc = typeof calc(g) === "number" ? calc(g) : 0;
    return `<div class="bar" style="height:${Math.max(15, (sc - 60) * 3.5)}px"><span>${esc(g[0].slice(0, 5))}</span></div>`;
  }).join("");

  // Class Schedule (Filtered by Semester)
  const schedSemKey = isSHS ? normalizeSemKey(schedFilterEl?.value) : "";
  const studentSchedules = (data.schedules || [])
    .filter(sch =>
      (sch.targetType === "student" && sch.studentId === s.id) ||
      (sch.targetType !== "student" && sch.grade === s.grade && sch.section === s.section)
    )
    .filter(sch => {
      if (!schedSemKey) return true;
      const schSem = sch.semester && sch.semester !== "N/A" ? sch.semester : resolveSem(sch.subject);
      return normalizeSemKey(schSem) === schedSemKey;
    });

  $("myScheduleTable").innerHTML = studentSchedules.map(sch => {
    const schSem = isSHS
      ? (sch.semester && sch.semester !== "N/A" ? sch.semester : resolveSem(sch.subject))
      : "N/A";
    return `
      <tr>
        <td><b>${esc(sch.subject)}</b></td>
        <td>${formatSemBadge(schSem)}</td>
        <td>${esc(sch.day)}</td>
        <td>${esc(sch.time)}</td>
        <td><b>${esc(sch.room)}</b></td>
        <td>${esc(sch.facultyName)}</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="6">No class schedule assigned for this selection.</td></tr>`;

  renderStudentAnnouncements();
}

document.addEventListener("DOMContentLoaded", () => {
  getStudentFilterSelect("studentSubjectsSemFilter", "studentSubjects");
  getStudentFilterSelect("studentGradesSemFilter", "studentGrades");
  getStudentFilterSelect("studentScheduleSemFilter", "studentSchedule");
});