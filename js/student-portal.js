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

function renderStudentPortal() {
  const s = currentStudent;
  if (!s) return;
  const grades = data.grades[s.id] || [];
  const enr = data.enrollments.find(e => e.student === s.id) || {
    schoolYear: "2026-2027", grade: s.grade, strand: "ABM",
    section: s.section, date: "2026-06-15", enrollmentStatus: "Enrolled"
  };

  const displayStatus = (s.status === "Regular" ? "Enrolled" : (s.status || "Enrolled"));

  $("studentWelcomeName").textContent = `Welcome, ${formatNameId(s)}`;

  const item = (label, v) => `<div class="profile-item"><small>${esc(label)}</small><strong>${esc(v)}</strong></div>`;
  $("studentProfile").innerHTML =
    item("Student", formatNameId(s)) +
    item("Grade Level", s.grade) +
    item("Section", s.section) +
    item("Status", displayStatus) +
    item("Contact", s.contact || "N/A");

  $("myProfileDetails").innerHTML =
    item("Student ID (Login Username)", s.id) +
    item("Full Name", s.name) +
    item("Grade Level", s.grade) +
    item("Section", s.section) +
    item("Status", displayStatus) +
    item("Guardian", s.guardian || "N/A");

  const pc = (l, v) => `<div class="portal-card"><small>${esc(l)}</small><strong>${esc(v || "—")}</strong></div>`;
  $("myEnrollmentDetails").innerHTML =
    pc("School Year", enr.schoolYear) +
    pc("Student ID", s.id) +
    pc("Grade Level", enr.grade) +
    pc("Strand", enr.strand) +
    pc("Section", enr.section) +
    pc("Enrollment Date", enr.date || "2026-06-15") +
    pc("Enrollment Status", enr.enrollmentStatus || "Enrolled");

  const avg = avgOf(grades);
  const passed = grades.filter(g => statusOf(calc(g)) === "Passed").length;
  const failed = grades.filter(g => statusOf(calc(g)) === "Failed").length;

  $("mySummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Enrolled Subjects:</b> ${grades.length}</p><p><b>Passed:</b> ${passed}</p><p><b>Failed:</b> ${failed}</p>`;

  $("mySubjectsTable").innerHTML = grades.map(g =>
    `<tr><td>${esc(g[0])}</td><td>${calc(g)}</td><td>${badge(statusOf(calc(g)))}</td></tr>`
  ).join("") || `<tr><td colspan="3">No subjects enrolled.</td></tr>`;

  $("myGradeTable").innerHTML = grades.map(g => {
    const finalScore = calc(g);
    return `<tr><td>${esc(g[0])}</td><td>${formatQuarter(g[1])}</td><td>${formatQuarter(g[2])}</td><td>${formatQuarter(g[3])}</td><td>${formatQuarter(g[4])}</td><td><b>${finalScore}</b></td><td>${badge(statusOf(finalScore))}</td></tr>`;
  }).join("") || `<tr><td colspan="7">No grades recorded.</td></tr>`;

  const hasCompleted = grades.some(g => typeof calc(g) === "number");
  const standingText = !hasCompleted
    ? "Pending (Incomplete Quarters)"
    : (Number(avg) >= 75 ? "Good Standing" : "Needs Remediation");

  $("myPerformanceSummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Academic Standing:</b> ${standingText}</p>`;
  
  $("myPerformanceChart").innerHTML = grades.map(g => {
    const sc = typeof calc(g) === "number" ? calc(g) : 0;
    return `<div class="bar" style="height:${Math.max(15, (sc - 60) * 3.5)}px"><span>${esc(g[0].slice(0, 5))}</span></div>`;
  }).join("");

  // Pull schedules assigned by Admin for this student's class section or individual student ID
  const studentSchedules = (data.schedules || []).filter(sch =>
    (sch.targetType === "student" && sch.studentId === s.id) ||
    (sch.targetType !== "student" && sch.grade === s.grade && sch.section === s.section)
  );

  $("myScheduleTable").innerHTML = studentSchedules.map(sch => `
    <tr>
      <td><b>${esc(sch.subject)}</b></td>
      <td>${esc(sch.day)}</td>
      <td>${esc(sch.time)}</td>
      <td><b>${esc(sch.room)}</b></td>
      <td>${esc(sch.facultyName)}</td>
    </tr>
  `).join("") || `<tr><td colspan="5">No class schedule assigned yet.</td></tr>`;

  renderStudentAnnouncements();
}