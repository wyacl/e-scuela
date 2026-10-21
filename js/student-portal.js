// Student Portal Views (Subject Status Removed)
function renderStudentPortal() {
  const s = currentStudent;
  if (!s) return;
  const grades = data.grades[s.id] || [];
  const enr = data.enrollments.find(e => e.student === s.id) || {
    schoolYear: "2026-2027", grade: s.grade, strand: "STEM",
    section: s.section, date: "2026-06-15", enrollmentStatus: "Enrolled"
  };

  $("studentWelcomeName").textContent = `Welcome, ${formatNameId(s)}`;

  const item = (label, v) => `<div class="profile-item"><small>${esc(label)}</small><strong>${esc(v)}</strong></div>`;
  $("studentProfile").innerHTML =
    item("Student", formatNameId(s)) +
    item("Grade Level", s.grade) +
    item("Section", s.section) +
    item("Academic Status", s.status) +
    item("Contact", s.contact || "N/A");

  $("myProfileDetails").innerHTML =
    item("Student ID (Login Username)", s.id) +
    item("Full Name", s.name) +
    item("Grade Level", s.grade) +
    item("Section", s.section) +
    item("Status", s.status) +
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

  // Subject schedule mappings with ICT set to 9:00 AM - 10:00 AM
  const schedulePresets = {
    "Mathematics": { day: "Monday", time: "8:00 AM - 9:00 AM" },
    "English": { day: "Tuesday", time: "9:00 AM - 10:00 AM" },
    "Science": { day: "Wednesday", time: "10:30 AM - 11:30 AM" },
    "Filipino": { day: "Thursday", time: "1:00 PM - 2:00 PM" },
    "PE": { day: "Friday", time: "2:00 PM - 3:00 PM" },
    "ICT": { day: "Monday", time: "9:00 AM - 10:00 AM" },
    "Research": { day: "Wednesday", time: "1:00 PM - 2:00 PM" },
    "History": { day: "Friday", time: "10:00 AM - 11:00 AM" }
  };

  const fallbackDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const fallbackTimes = ["8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:30 AM - 11:30 AM", "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM"];

  $("myScheduleTable").innerHTML = grades.map((g, i) => {
    const subjectName = g[0];
    const preset = schedulePresets[subjectName] || {
      day: fallbackDays[i % 5],
      time: fallbackTimes[i % 5]
    };

    return `
      <tr>
        <td>${esc(subjectName)}</td>
        <td>${esc(preset.day)}</td>
        <td>${esc(preset.time)}</td>
        <td>TBA</td>
        <td>TBA</td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="5">No schedule available.</td></tr>`;
}