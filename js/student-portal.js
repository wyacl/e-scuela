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
    schoolYear: "2026-2027", grade: s.grade, strand: "STEM",
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
    return `<tr><td>${esc(g[0])}</td><td>${g[1] ?? ''}</td><td>${g[2] ?? ''}</td><td>${g[3] ?? ''}</td><td>${g[4] ?? ''}</td><td><b>${finalScore}</b></td><td>${badge(statusOf(finalScore))}</td></tr>`;
  }).join("") || `<tr><td colspan="7">No grades recorded.</td></tr>`;

  $("myPerformanceSummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Academic Standing:</b> ${Number(avg) >= 75 ? "Good Standing" : "Needs Remediation"}</p>`;
  
  $("myPerformanceChart").innerHTML = grades.map(g => {
    const sc = typeof calc(g) === "number" ? calc(g) : 0;
    return `<div class="bar" style="height:${Math.max(15, (sc - 60) * 3.5)}px"><span>${esc(g[0].slice(0, 5))}</span></div>`;
  }).join("");

  // Presets mapping subjects to days, times, rooms, and assigned instructors
  const schedulePresets = {
    "Mathematics": { day: "Monday", time: "8:00 AM - 9:00 AM", room: "Room 301", instructor: "Prof. Maria Santos" },
    "English": { day: "Tuesday", time: "9:00 AM - 10:00 AM", room: "Room 204", instructor: "Mr. Juan Reyes" },
    "Science": { day: "Wednesday", time: "10:30 AM - 11:30 AM", room: "Science Lab", instructor: "Ms. Elena Cruz" },
    "Filipino": { day: "Thursday", time: "1:00 PM - 2:00 PM", room: "Room 202", instructor: "Mr. Ricardo Dalisay" },
    "History": { day: "Friday", time: "10:00 AM - 11:00 AM", room: "Room 205", instructor: "Prof. Maria Santos" },
    "PE": { day: "Friday", time: "2:00 PM - 3:00 PM", room: "Gymnasium", instructor: "Coach Gabriel Perez" },
    "ICT": { day: "Monday", time: "9:00 AM - 10:00 AM", room: "Computer Lab 1", instructor: "Prof. Maria Santos" },
    "Research": { day: "Wednesday", time: "1:00 PM - 2:00 PM", room: "Computer Lab 2", instructor: "Prof. Maria Santos" }
  };

  const fallbackDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const fallbackTimes = ["8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:30 AM - 11:30 AM", "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM"];
  const fallbackRooms = ["Room 101", "Room 102", "Room 201", "Room 203", "Room 205"];
  const fallbackInstructors = ["Prof. Maria Santos", "Mr. Juan Reyes", "Ms. Elena Cruz", "Mr. Ricardo Dalisay", "Coach Gabriel Perez"];

  $("myScheduleTable").innerHTML = grades.map((g, i) => {
    const subjectName = g[0];
    const preset = schedulePresets[subjectName] || {
      day: fallbackDays[i % fallbackDays.length],
      time: fallbackTimes[i % fallbackTimes.length],
      room: fallbackRooms[i % fallbackRooms.length],
      instructor: fallbackInstructors[i % fallbackInstructors.length]
    };

    return `
      <tr>
        <td>${esc(subjectName)}</td>
        <td>${esc(preset.day)}</td>
        <td>${esc(preset.time)}</td>
        <td><b>${esc(preset.room)}</b></td>
        <td>${esc(preset.instructor)}</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="5">No schedule available.</td></tr>`;

  renderStudentAnnouncements();
}