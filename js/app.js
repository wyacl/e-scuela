// --- UTILITY & SANITIZATION ---
const $ = id => document.getElementById(id);
const esc = str => String(str ?? "").replace(/[&<>'"]/g, tag => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[tag] || tag));

const S = (id, name, user, pass, grade, section, status = "Regular") => ({
  id, name, username: user, password: pass, grade, section: section || "Pending Enrollment",
  status, contact: "N/A", guardian: "N/A"
});

// Programmatic Grade Levels & Student Statuses
const gradeLevels = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
const studentStatuses = ["Regular", "Irregular"];

// Master Curriculum Subjects for Enrollment Enlistment
const availableSubjects = [
  "Mathematics",
  "English",
  "Science",
  "Filipino",
  "History",
  "PE",
  "ICT",
  "Research"
];

// --- MOBILE DRAWER NAVIGATION CONTROLLERS ---
function openDrawer() {
  const sidebar = $("sidebar");
  const overlay = $("drawerOverlay");
  sidebar?.classList.add("drawer-open");
  overlay?.classList.add("active");
  document.body.classList.add("drawer-locked");
}

function closeDrawer() {
  const sidebar = $("sidebar");
  const overlay = $("drawerOverlay");
  sidebar?.classList.remove("drawer-open");
  overlay?.classList.remove("active");
  document.body.classList.remove("drawer-locked");
}

function toggleDrawer() {
  const sidebar = $("sidebar");
  if (sidebar?.classList.contains("drawer-open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

// --- DEFAULT DATA & INITIALIZATION ---
const defaultData = {
  students: [
    S("2026-001", "CATHERINE A. ROSARIO", "catherine", "cath123", "Grade 12", "STEM-A", "Regular"),
    S("2026-002", "ACHILLES NERO C. AGUILA", "achilles", "ach123", "Grade 11", "STEM-A", "Regular"),
    S("2026-003", "PRINCE CARL B. BARTOLOME", "prince", "prince123", "Grade 12", "STEM-A", "Regular"),
    S("2026-004", "BLUE BARRON B. BAMBILLA", "blue", "blue123", "Grade 11", "HUMSS-A", "Regular"),
    S("2026-005", "JAYSON J. ESQUEJO", "jayson", "jayson123", "Grade 12", "STEM-A", "Regular"),
    S("2026-006", "CARL ANTHONY V. DE VERA", "carl", "carl123", "Grade 12", "STEM-A", "Regular")
  ],
  enrollments: [
    { student: "2026-001", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Regular", enrollmentStatus: "Enrolled" },
    { student: "2026-002", schoolYear: "2026-2027", grade: "Grade 11", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Regular", enrollmentStatus: "Enrolled" },
    { student: "2026-003", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Regular", enrollmentStatus: "Enrolled" },
    { student: "2026-004", schoolYear: "2026-2027", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", date: "2026-06-15", status: "Regular", enrollmentStatus: "Enrolled" },
    { student: "2026-005", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Regular", enrollmentStatus: "Enrolled" },
    { student: "2026-006", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Regular", enrollmentStatus: "Enrolled" }
  ],
  grades: {
    "2026-001": [["Mathematics",88,90,89,91],["English",91,90,92,93],["Science",90,91,89,92],["Filipino",92,91,90,93],["PE",95,94,96,95],["ICT",89,90,91,90],["Research",90,92,91,93],["History",78,80,79,81]],
    "2026-002": [["Mathematics",85,87,88,86],["English",90,91,92,91],["Science",88,89,90,91],["Filipino",91,90,92,93],["PE",94,95,94,96],["ICT",89,88,90,91],["History",86,87,88,89]],
    "2026-003": [["Mathematics",92,91,93,94],["English",90,92,91,93],["Science",94,93,95,94],["Filipino",91,92,90,93],["PE",96,95,97,96],["ICT",93,92,94,95]],
    "2026-004": [["Mathematics",84,85,86,87],["English",88,89,90,89],["Science",86,87,88,89],["Filipino",90,91,90,92],["PE",94,95,94,95],["ICT",87,88,89,90]],
    "2026-005": [["Mathematics",90,91,92,93],["English",89,90,91,92],["Science",91,92,93,94],["Filipino",92,91,93,94],["PE",95,96,95,97],["ICT",90,91,92,93]],
    "2026-006": [["Mathematics",87,89,88,90],["English",91,92,90,93],["Science",89,90,91,92],["Filipino",90,91,92,93],["PE",94,95,96,95],["ICT",88,90,89,91]]
  }
};

let data;
try {
  const stored = localStorage.getItem("eScuelaData");
  data = stored ? JSON.parse(stored) : null;
} catch (e) {
  data = null;
}

if (!data || typeof data !== "object") {
  data = JSON.parse(JSON.stringify(defaultData));
} else {
  data.students = Array.isArray(data.students) ? data.students : [];
  data.enrollments = Array.isArray(data.enrollments) ? data.enrollments : [];
  data.grades = (data.grades && typeof data.grades === "object") ? data.grades : {};
}

// Retroactive clean-up: convert legacy statuses to Regular and sanitize fields
data.students.forEach(s => {
  if (s.status === "Active" || s.status === "Transferee" || !s.status) s.status = "Regular";
  if (!s.contact || s.contact === "—" || s.contact === "Contact Number") s.contact = "N/A";
  if (!s.guardian || s.guardian === "Parent / Guardian" || s.guardian === "—") s.guardian = "N/A";
});

// Auto-backfill enrollment records for existing students with assigned sections
data.students.forEach(s => {
  const hasRecord = data.enrollments.some(e => e.student === s.id);
  if (!hasRecord && s.section && s.section !== "Pending Enrollment" && s.section !== "Dropped") {
    const isSHS = s.grade === "Grade 11" || s.grade === "Grade 12";
    data.enrollments.push({
      student: s.id,
      schoolYear: "2026-2027",
      grade: s.grade,
      strand: isSHS ? (s.section.startsWith("HUMSS") ? "HUMSS" : s.section.startsWith("ABM") ? "ABM" : "STEM") : "N/A",
      section: s.section,
      date: "2026-06-15",
      status: s.status || "Regular",
      enrollmentStatus: "Enrolled"
    });
  }
});

data.enrollments.forEach(e => {
  if (!e.enrollmentStatus) {
    e.enrollmentStatus = (e.status === "Dropped") ? "Dropped" : "Enrolled";
  }
  if (e.status === "Transferee") {
    e.status = "Regular";
  }
});

// Deduplicate existing enrollment records (keeps the latest record per student)
const dedupedEnrollments = [];
const seenStudents = new Set();
for (let i = data.enrollments.length - 1; i >= 0; i--) {
  const e = data.enrollments[i];
  if (!seenStudents.has(e.student)) {
    seenStudents.add(e.student);
    dedupedEnrollments.unshift(e);
  }
}
data.enrollments = dedupedEnrollments;

function persist() {
  try {
    localStorage.setItem("eScuelaData", JSON.stringify(data));
  } catch (e) {
    console.error("Storage save failed:", e);
  }
}
persist();

// --- POPULATE DROPDOWNS ---
function populateGradeDropdowns() {
  const filterGrade = $("studentGrade");
  if (filterGrade) {
    const cur = filterGrade.value;
    filterGrade.innerHTML = `<option value="">All Grade Levels</option>` +
      gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    if (cur) filterGrade.value = cur;
  }

  const fGrade = $("fGrade");
  if (fGrade) {
    const cur = fGrade.value;
    fGrade.innerHTML = gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    if (cur && gradeLevels.includes(cur)) fGrade.value = cur;
  }

  const fStatus = $("fStatus");
  if (fStatus) {
    const cur = fStatus.value;
    fStatus.innerHTML = studentStatuses.map(st => `<option value="${st}">${st}</option>`).join("");
    if (cur && studentStatuses.includes(cur)) fStatus.value = cur;
  }
}

// --- POPULATE YEAR LEVEL FILTER ---
function populateGradeFilters() {
  const yearEl = $("gradeFilterYear");
  if (yearEl) {
    const curYear = yearEl.value;
    yearEl.innerHTML = `<option value="">All Year Levels</option>` +
      gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    if (curYear) yearEl.value = curYear;
  }
}

// --- DYNAMICALLY LINK STRAND & SECTION BASED ON SELECTED YEAR & STRAND ---
function updateGradeFilterDependencies() {
  const year = $("gradeFilterYear")?.value || "";
  const strandEl = $("gradeFilterStrand");
  const sectionEl = $("gradeFilterSection");
  if (!strandEl || !sectionEl) return;

  const isSHS = year === "Grade 11" || year === "Grade 12";
  const isJHS = year !== "" && !isSHS; // Grade 1 to Grade 10

  // 1. Hide Strand dropdown when Grade 1-10 is selected; show for SHS or "All"
  if (isJHS) {
    strandEl.style.display = "none";
    strandEl.value = ""; // Clear selected strand when hidden
  } else {
    strandEl.style.display = "";
  }

  const strand = strandEl.value;
  const previousSection = sectionEl.value;

  // 2. Only show connected sections
  let connectedSections = [];

  if (isJHS) {
    // Junior High / Elementary standard sections
    connectedSections = ["Section A", "Section B", "Section C"];
  } else if (isSHS) {
    // Senior High Strand-specific sections
    if (strand === "STEM") {
      connectedSections = ["STEM-A", "STEM-B"];
    } else if (strand === "ABM") {
      connectedSections = ["ABM-A", "ABM-B"];
    } else if (strand === "HUMSS") {
      connectedSections = ["HUMSS-A", "HUMSS-B"];
    } else {
      connectedSections = ["STEM-A", "STEM-B", "ABM-A", "ABM-B", "HUMSS-A", "HUMSS-B"];
    }
  } else {
    // All Year Levels
    if (strand === "STEM") {
      connectedSections = ["STEM-A", "STEM-B"];
    } else if (strand === "ABM") {
      connectedSections = ["ABM-A", "ABM-B"];
    } else if (strand === "HUMSS") {
      connectedSections = ["HUMSS-A", "HUMSS-B"];
    } else {
      connectedSections = [
        "STEM-A", "STEM-B",
        "ABM-A", "ABM-B",
        "HUMSS-A", "HUMSS-B",
        "Section A", "Section B", "Section C"
      ];
    }
  }

  // Populate Section options
  sectionEl.innerHTML = `<option value="">All Sections</option>` +
    connectedSections.map(sec => `<option value="${esc(sec)}">${esc(sec)}</option>`).join("");

  // Retain selection if still valid under the new filter, else reset
  if (previousSection && connectedSections.includes(previousSection)) {
    sectionEl.value = previousSection;
  } else {
    sectionEl.value = "";
  }
}

// --- FILTER CHANGE HANDLERS ---
function handleGradeYearChange() {
  updateGradeFilterDependencies();
  filterGradeStudents();
}

function handleGradeStrandChange() {
  updateGradeFilterDependencies();
  filterGradeStudents();
}

// --- DYNAMICALLY FILTER STUDENTS FOR GRADES MANAGEMENT ---
function filterGradeStudents() {
  const year = $("gradeFilterYear")?.value || "";
  const strand = $("gradeFilterStrand")?.value || "";
  const section = $("gradeFilterSection")?.value || "";
  const studentEl = $("gradeStudent");

  if (!studentEl) return;

  const filtered = data.students.filter(s => {
    // 1. Filter Year Level
    if (year && s.grade !== year) return false;

    // 2. Filter Section
    if (section && s.section !== section) return false;

    // 3. Filter Strand
    if (strand) {
      const enr = data.enrollments.find(e => e.student === s.id);
      const studentStrand = enr ? enr.strand : (s.section.startsWith(strand) ? strand : "");
      if (studentStrand !== strand) return false;
    }

    return true;
  });

  if (filtered.length > 0) {
    studentEl.disabled = false;
    studentEl.innerHTML = filtered.map(s => 
      `<option value="${esc(s.id)}">${esc(s.id)} — ${esc(s.name)}</option>`
    ).join("");
    
    studentEl.value = filtered[0].id;
    renderGrades();
  } else {
    studentEl.disabled = true;
    studentEl.innerHTML = `<option value="">No matching students found</option>`;
    $("gradeTable").innerHTML = `<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--text-muted);">No students found matching the selected filters.</td></tr>`;
  }
}

// --- STATE & AUTHENTICATION (WITH SESSION PERSISTENCE) ---
let loginType = "faculty";
let currentUser = null;
let currentStudent = null;

function saveSession() {
  try {
    sessionStorage.setItem("eScuelaSession", JSON.stringify({
      currentUser,
      currentStudent,
      loginType
    }));
  } catch (e) {}
}

function clearSession() {
  try {
    sessionStorage.removeItem("eScuelaSession");
  } catch (e) {}
}

function restoreSession() {
  try {
    const raw = sessionStorage.getItem("eScuelaSession");
    if (!raw) return false;
    const sess = JSON.parse(raw);
    if (sess && sess.currentUser) {
      currentUser = sess.currentUser;
      loginType = sess.loginType || "faculty";
      openFaculty();
      return true;
    } else if (sess && sess.currentStudent) {
      currentStudent = sess.currentStudent;
      loginType = sess.loginType || "student";
      openStudent();
      return true;
    }
  } catch (e) {}
  return false;
}

function selectLoginType(type) {
  loginType = type;
  $("facultyBtn")?.classList.toggle("active", type === "faculty");
  $("studentBtn")?.classList.toggle("active", type === "student");
  
  // Toggles the sliding selector pill
  $("loginTypeToggle")?.classList.toggle("student-selected", type === "student");

  $("username").value = "";
  $("password").value = "";
  $("loginError").textContent = "";
}

function login() {
  const u = $("username").value.trim().toLowerCase();
  const p = $("password").value.trim();
  if (!u || !p) {
    $("loginError").textContent = "Please enter your username and password.";
    return;
  }

  if (loginType === "faculty") {
    if (u === "admin" && p === "admin123") {
      currentUser = { name: "Administrator", role: "Administrator" };
      saveSession();
      return openFaculty();
    }
    if (u === "faculty" && p === "faculty123") {
      currentUser = { name: "Faculty", role: "Faculty" };
      saveSession();
      return openFaculty();
    }
  } else {
    const s = data.students.find(x => String(x.username).trim().toLowerCase() === u && String(x.password).trim() === p);
    if (s) {
      currentStudent = s;
      saveSession();
      return openStudent();
    }
  }
  $("loginError").textContent = "Invalid username or password.";
}

function logout() {
  closeDrawer();
  clearSession();
  currentUser = null;
  currentStudent = null;
  $("app").classList.add("hidden");
  $("login").classList.remove("hidden");
  selectLoginType("faculty");
}

function enterApp(label, role) {
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("loggedUser").textContent = label;
  $("systemRole").textContent = role;
}

function buildNav(items) {
  $("navigation").innerHTML = items.map(i =>
    `<button data-page="${esc(i[0])}" onclick="showPage('${esc(i[0])}')"><i class="${esc(i[1])}"></i> <span>${esc(i[2])}</span></button>`
  ).join("") + `<button class="logout" onclick="logout()"><i class="fa-solid fa-arrow-right-from-bracket fa-fw"></i> <span>Logout</span></button>`;
}

function openFaculty() {
  enterApp(`${currentUser.name} (${currentUser.role})`, currentUser.role);
  buildNav([
    ["dashboard", "fa-solid fa-table-columns fa-fw", "Dashboard"],
    ["students", "fa-solid fa-user-graduate fa-fw", "Student Information"],
    ["enrollment", "fa-solid fa-id-card fa-fw", "Enrollment"],
    ["grades", "fa-solid fa-check fa-fw", "Grades"],
    ["performance", "fa-solid fa-chart-line fa-fw", "Academic Performance"],
    ["status", "fa-solid fa-circle-dot fa-fw", "Subject Status"],
    ["reports", "fa-solid fa-file-lines fa-fw", "Reports"],
    ["users", "fa-solid fa-users-gear fa-fw", "User Management"],
    ["settings", "fa-solid fa-gear fa-fw", "Settings"]
  ]);
  showPage("dashboard");
}

function openStudent() {
  enterApp(currentStudent.name, "Student Portal");
  buildNav([
    ["studentHome", "fa-solid fa-table-columns fa-fw", "My Dashboard"],
    ["studentProfilePage", "fa-solid fa-user fa-fw", "My Profile"],
    ["studentEnrollment", "fa-solid fa-id-card fa-fw", "My Enrollment"],
    ["studentSubjects", "fa-solid fa-book-open fa-fw", "My Subjects"],
    ["studentGrades", "fa-solid fa-check fa-fw", "My Grades"],
    ["studentPerformance", "fa-solid fa-chart-line fa-fw", "Academic Performance"],
    ["studentStatus", "fa-solid fa-circle-dot fa-fw", "Subject Status"],
    ["studentSchedule", "fa-solid fa-calendar-days fa-fw", "Class Schedule"],
    ["studentReports", "fa-solid fa-file-lines fa-fw", "Reports"]
  ]);
  showPage("studentHome");
}

const titles = {
  dashboard:"Dashboard", students:"Student Information", enrollment:"Enrollment", grades:"Grades",
  performance:"Academic Performance", status:"Subject Status", reports:"Reports", users:"User Management", settings:"Settings",
  studentHome:"My Dashboard", studentProfilePage:"My Profile", studentEnrollment:"My Enrollment", studentSubjects:"My Subjects",
  studentGrades:"My Grades", studentPerformance:"My Academic Performance", studentStatus:"My Subject Status",
  studentSchedule:"Class Schedule", studentReports:"Reports"
};

function showPage(page) {
  closeDrawer();
  document.querySelectorAll(".page").forEach(x => x.classList.add("hidden"));
  const el = $(page);
  if (el) el.classList.remove("hidden");
  $("pageTitle").textContent = titles[page] || "Dashboard";
  document.querySelectorAll(".nav button").forEach(x => x.classList.toggle("active", x.dataset.page === page));
  if (loginType === "faculty") renderAll(); else renderStudentPortal();
}

// --- LOGO CLICK HANDLER (REFRESH IF ON DASHBOARD, NAVIGATE IF NOT) ---
function goHome() {
  const isFacultyDashboard = currentUser && !$("dashboard")?.classList.contains("hidden");
  const isStudentDashboard = currentStudent && !$("studentHome")?.classList.contains("hidden");

  if (isFacultyDashboard || isStudentDashboard) {
    window.location.reload();
  } else if (currentUser) {
    showPage("dashboard");
  } else if (currentStudent) {
    showPage("studentHome");
  }
}

// --- ACADEMIC COMPUTATION HELPERS ---
const calc = g => {
  const scores = g.slice(1).filter(n => n !== "" && n !== null && n !== undefined).map(Number).filter(n => !isNaN(n));
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "—";
};

const statusOf = v => (v === null || v === "" || v === "—" || isNaN(v)) ? "Pending" : Number(v) >= 75 ? "Passed" : "Failed";
const badge = st => `<span class="badge ${esc(st.toLowerCase())}">${esc(st)}</span>`;

const avgOf = list => {
  const valid = list.map(calc).filter(v => typeof v === "number" && !isNaN(v));
  if (!valid.length) return "0.00";
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
};

const bars = list => list.map(g => {
  const score = typeof calc(g) === "number" ? calc(g) : 0;
  return `<div class="bar" style="height:${Math.max(10, (score - 65) * 3)}px" title="${esc(g[0])}: ${score}"><span>${esc(g[0].slice(0, 5))}</span></div>`;
}).join("");

const val = id => $(id) ?$(id).value.trim() : "";

// --- ENROLLMENT SYNC & DYNAMIC FIELDS ---
function syncEnrollmentStudentData() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  if (!s) return;

  if ($("eGrade")) $("eGrade").value = s.grade || "Grade 1";

  if ($("eStatus")) {
    const statusVal = s.status || "Regular";
    $("eStatus").value = statusVal;
    $("eStatus").style.color = statusVal === "Regular" ? "#2e7d32" : "#b26a00";
  }

  const existingEnrollment = data.enrollments.find(e => e.student === sId);
  if ($("eEnrollmentStatus")) {
    $("eEnrollmentStatus").value = existingEnrollment ? (existingEnrollment.enrollmentStatus || "Enrolled") : "Enrolled";
  }

  updateEnrollmentFields();

  if (existingEnrollment && existingEnrollment.section && $("eSection")) {
    $("eSection").value = existingEnrollment.section;
  }

  renderEnrollmentSubjects(sId);
}

function updateEnrollmentFields() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  const grade = s ? s.grade : ($("eGrade")?.value || "");

  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const strandField = $("eStrand")?.closest(".field");
  const strandSelect = $("eStrand");

  if (strandField) {
    strandField.style.display = isSHS ? "" : "none";
  }

  if (strandSelect) {
    if (!isSHS) {
      strandSelect.value = "None";
    } else if (strandSelect.value === "None" || !strandSelect.value) {
      strandSelect.value = "STEM";
    }
  }

  updateSectionOptions();
}

function updateSectionOptions() {
  const sId = $("eStudent")?.value;
  const s = data.students.find(x => x.id === sId);
  const grade = s ? s.grade : ($("eGrade")?.value || "");
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const sectionSelect = $("eSection");
  if (!sectionSelect) return;

  if (isSHS) {
    const strand = $("eStrand")?.value || "STEM";
    let sections = [];
    if (strand === "STEM") {
      sections = ["STEM-A", "STEM-B"];
    } else if (strand === "ABM") {
      sections = ["ABM-A", "ABM-B"];
    } else if (strand === "HUMSS") {
      sections = ["HUMSS-A", "HUMSS-B"];
    } else {
      sections = ["STEM-A", "STEM-B"];
    }

    sectionSelect.innerHTML = sections.map(sec => `<option value="${sec}">${sec}</option>`).join("");
    sectionSelect.value = sections[0];
  } else {
    sectionSelect.innerHTML = `
      <option value="Section A">Section A</option>
      <option value="Section B">Section B</option>
      <option value="Section C">Section C</option>
    `;
    sectionSelect.value = "Section A";
  }
}

function renderEnrollmentSubjects(studentId) {
  const container = $("enrollmentSubjects");
  if (!container) return;

  const currentGrades = data.grades[studentId] || [];
  const existingSubjectNames = currentGrades.map(g => g[0]);

  container.innerHTML = availableSubjects.map(sub => {
    const isChecked = existingSubjectNames.length > 0
      ? existingSubjectNames.includes(sub)
      : ["Mathematics", "English", "Science", "Filipino", "PE", "ICT"].includes(sub);

    return `
      <label class="subject-checkbox-label">
        <input type="checkbox" name="enrollSubject" value="${esc(sub)}" ${isChecked ? "checked" : ""}>
        <span>${esc(sub)}</span>
      </label>
    `;
  }).join("");
}

function renderDashboard() {
  const droppedIds = new Set(
    data.enrollments.filter(e => e.enrollmentStatus === "Dropped").map(e => e.student)
  );

  const enrolledRecordIds = new Set(
    data.enrollments.filter(e => e.enrollmentStatus === "Enrolled").map(e => e.student)
  );

  const enrolledCount = data.students.filter(s => {
    if (droppedIds.has(s.id) || s.section === "Dropped" || s.section === "Pending Enrollment") {
      return false;
    }
    return enrolledRecordIds.has(s.id) || (s.section && s.section !== "Pending Enrollment");
  }).length;

  const droppedCount = data.students.filter(s => 
    droppedIds.has(s.id) || s.section === "Dropped"
  ).length;

  $("totalStudents").textContent = data.students.length;
  $("enrolledStudents").textContent = enrolledCount;
  $("graduatingStudents").textContent = data.students.filter(s => s.grade === "Grade 12").length;
  $("failedCount").textContent = Object.values(data.grades).flat().filter(g => statusOf(calc(g)) === "Failed").length;
  $("droppedCount").textContent = droppedCount;
  $("recentStudents").innerHTML = data.students.slice(0, 6).map(s =>
    `<p><b>${esc(s.name)}</b><br><small>${esc(s.id)} • ${esc(s.grade)} • ${esc(s.section)}</small></p>`
  ).join("");
}

function renderStudents() {
  const q = ($("studentSearch")?.value || "").toLowerCase();
  const gr = $("studentGrade")?.value || "";
  $("studentTable").innerHTML = data.students
    .filter(s => (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) && (!gr || s.grade === gr))
    .map(s => {
      const statusClass = (s.status || "regular").toLowerCase();
      return `<tr>
        <td><b>${esc(s.id)}</b></td>
        <td>${esc(s.name)}</td>
        <td>${esc(s.grade)}</td>
        <td>${esc(s.section)}</td>
        <td><span class="badge ${esc(statusClass)}">${esc(s.status)}</span></td>
        <td style="white-space:nowrap;">
          <button class="secondary table-btn" onclick="viewStudent('${esc(s.id)}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
          <button class="secondary table-btn" style="color:var(--primary);margin-left:4px;" onclick="deleteStudent('${esc(s.id)}')"><i class="fa-solid fa-trash fa-fw"></i> Remove</button>
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="6">No students found.</td></tr>`;
}

function openStudentForm() { 
  $("studentForm").classList.remove("hidden");
  const idInput = $("fId");
  if (idInput) {
    idInput.value = "";
    idInput.focus();
  }
  if ($("fName")) $("fName").value = "";
  if ($("fStatus")) $("fStatus").value = "Regular";
  if ($("fContact")) $("fContact").value = "";
  if ($("fGuardian")) $("fGuardian").value = "";
}

function closeStudentForm() { 
  $("studentForm").classList.add("hidden"); 
  if ($("fId")) $("fId").value = "";
  if ($("fName")) $("fName").value = "";
  if ($("fContact")) $("fContact").value = "";
  if ($("fGuardian")) $("fGuardian").value = "";
}

function saveStudent() {
  const id = val("fId");
  const name = val("fName");

  if (!id || !name) return toast("Student ID and name are required.");

  const idPattern = /^\d{4}-\d{3}$/;
  if (!idPattern.test(id)) {
    return toast("Student ID must be numbers in 0000-000 format.");
  }

  if (data.students.some(x => x.id === id)) return toast("That Student ID already exists.");

  const grade = val("fGrade") || "Grade 1";
  const status = val("fStatus") || "Regular";
  const contact = val("fContact") || "N/A";
  const guardian = val("fGuardian") || "N/A";

  const s = {
    id,
    name,
    grade,
    section: "Pending Enrollment",
    status,
    contact,
    guardian,
    username: id.toLowerCase(),
    password: "student123"
  };
  
  data.students.push(s);
  data.grades[s.id] = [];

  persist();
  closeStudentForm();
  renderAll();
  toast("Student registered. Please proceed to Enrollment to choose section & subjects.");
}

function viewStudent(id) {
  const s = data.students.find(x => x.id === id);
  if (!s) return;
  const subjects = (data.grades[s.id] || []).map(g => g[0]).join(", ") || "No subjects enrolled yet";
  
  const contactDisplay = (!s.contact || s.contact === "—" || s.contact === "Contact Number") ? "N/A" : s.contact;
  const guardianDisplay = (!s.guardian || s.guardian === "Parent / Guardian" || s.guardian === "—") ? "N/A" : s.guardian;

  alert(
    `Student Profile\n\n` +
    `ID: ${s.id}\n` +
    `Name: ${s.name}\n` +
    `Grade: ${s.grade}\n` +
    `Section: ${s.section}\n` +
    `Academic Status: ${s.status}\n` +
    `Contact: ${contactDisplay}\n` +
    `Guardian: ${guardianDisplay}\n` +
    `Subjects Enrolled: ${subjects}\n\n` +
    `Login Username: ${s.username}`
  );
}

function deleteStudent(id) {
  const s = data.students.find(x => x.id === id);
  if (!s) return;

  const confirmed = confirm(`Are you sure you want to remove ${s.name} (${s.id})?\n\nThis will permanently delete their grades and enrollment records.`);
  if (!confirmed) return;

  data.students = data.students.filter(x => x.id !== id);
  data.enrollments = data.enrollments.filter(e => e.student !== id);
  delete data.grades[id];

  persist();
  renderAll();
  toast(`Student ${id} removed.`);
}

function populateSelects() {
  const el = $("eStudent");
  if (el) {
    const old = el.value;
    el.innerHTML = data.students.map(s => `<option value="${esc(s.id)}">${esc(s.id)} — ${esc(s.name)}</option>`).join("");
    if (old && data.students.some(s => s.id === old)) el.value = old;
  }

  if ($("eDate") && !$("eDate").value) {
    $("eDate").value = new Date().toISOString().slice(0, 10);
  }

  syncEnrollmentStudentData();
}

function saveEnrollment() {
  const id = val("eStudent");
  const s = data.students.find(x => x.id === id);
  if (!s) return toast("Please select a student.");

  const grade = s.grade;
  const isSHS = grade === "Grade 11" || grade === "Grade 12";
  const section = val("eSection");
  const date = val("eDate") || new Date().toISOString().slice(0, 10);
  const status = s.status || "Regular";
  const enrollmentStatus = val("eEnrollmentStatus") || "Enrolled";

  const checkedBoxes = Array.from(document.querySelectorAll("input[name='enrollSubject']:checked"));
  if (checkedBoxes.length === 0 && enrollmentStatus === "Enrolled") {
    return toast("Please check at least one subject to take.");
  }

  const selectedSubjectNames = checkedBoxes.map(cb => cb.value);

  const currentGrades = data.grades[id] || [];
  const gradeMap = new Map(currentGrades.map(g => [g[0], g]));

  data.grades[id] = selectedSubjectNames.map(subName => {
    return gradeMap.has(subName) ? gradeMap.get(subName) : [subName, "", "", "", ""];
  });

  const enrollmentRecord = {
    student: id, 
    schoolYear: val("eSY") || "2026-2027", 
    grade: grade, 
    strand: isSHS ? val("eStrand") : "N/A",
    section: section, 
    date: date, 
    status: status,
    enrollmentStatus: enrollmentStatus
  };

  const existingIndex = data.enrollments.findIndex(e => e.student === id);

  if (existingIndex !== -1) {
    data.enrollments[existingIndex] = enrollmentRecord;
  } else {
    data.enrollments.push(enrollmentRecord);
  }

  s.section = enrollmentStatus === "Dropped" ? "Dropped" : section;

  persist();
  renderAll();
  toast(`Enrollment updated for ${s.name}.`);
}

function renderEnrollments() {
  $("enrollmentTable").innerHTML = data.enrollments.map(e => {
    const s = data.students.find(x => x.id === e.student);
    const statusVal = e.status || (s ? s.status : "Regular");
    const enrollStatus = e.enrollmentStatus || "Enrolled";
    const statusClass = statusVal.toLowerCase();
    const enrollClass = enrollStatus.toLowerCase();

    return `<tr>
      <td>${esc(s ? s.name : e.student)}</td>
      <td>${esc(e.schoolYear)}</td>
      <td>${esc(e.grade)}</td>
      <td>${esc(e.strand)}</td>
      <td>${esc(e.section)}</td>
      <td><span class="badge ${esc(statusClass)}">${esc(statusVal)}</span></td>
      <td><span class="badge ${esc(enrollClass)}">${esc(enrollStatus)}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="7">No enrollment records yet.</td></tr>`;
}

// --- RENDER GRADES TABLE ---
function renderGrades() {
  const studentEl = $("gradeStudent");
  const id = studentEl?.value;

  if (!id) {
    $("gradeTable").innerHTML = `<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--text-muted);">Please select a student.</td></tr>`;
    return;
  }

  if (!data.grades[id]) {
    data.grades[id] = [];
    persist();
  }

  const arr = data.grades[id] || [];
  $("gradeTable").innerHTML = arr.map((g, i) => {
    const finalScore = calc(g);

    return `<tr>
      <td>${esc(g[0])}</td>
      ${[1, 2, 3, 4].map(j => `<td><input type="number" min="0" max="100" value="${g[j] ?? ''}" data-subject-idx="${i}" data-period="${j}" class="grade-input"></td>`).join("")}
      <td>${finalScore}</td>
      <td>${badge(statusOf(finalScore))}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="7">No subjects enlisted for this student. Please enroll subjects in the Enrollment tab.</td></tr>`;
}

function saveGrades() {
  const id = $("gradeStudent")?.value;
  if (!id) return toast("No student selected.");

  const arr = data.grades[id] || [];
  document.querySelectorAll("[data-subject-idx]").forEach(inp => {
    const i = Number(inp.dataset.subjectIdx);
    const j = Number(inp.dataset.period);
    const rawVal = inp.value.trim();
    const num = rawVal === "" ? "" : Math.min(100, Math.max(0, Number(rawVal) || 0));
    if (arr[i]) arr[i][j] = num;
  });
  data.grades[id] = arr;
  persist();
  renderAll();
  toast("Grades updated.");
}

function renderPerformance() {
  const all = Object.values(data.grades).flat();
  const count = st => all.filter(g => statusOf(calc(g)) === st).length;
  $("performanceSummary").innerHTML = `
    <p><b>General Average:</b> ${avgOf(all)}</p>
    <p><b>Passed Subject Records:</b> ${count("Passed")}</p>
    <p><b>Failed Subject Records:</b> ${count("Failed")}</p>
    <p><b>Dropped Subjects:</b> 0</p>`;

  const subjectTotals = {};
  all.forEach(g => {
    const sub = g[0];
    const score = calc(g);
    if (typeof score === "number") {
      if (!subjectTotals[sub]) subjectTotals[sub] = [];
      subjectTotals[sub].push(score);
    }
  });
  const subjectAverages = Object.entries(subjectTotals).map(([sub, sc]) => [
    sub, Math.round(sc.reduce((a, b) => a + b, 0) / sc.length)
  ]);
  $("performanceChart").innerHTML = bars(subjectAverages);
}

function populateStatusSubjects() {
  const set = [...new Set(Object.values(data.grades).flat().map(g => g[0]))];
  const el = $("statusSubject");
  if (!el) return;
  const old = el.value;
  el.innerHTML = "<option value=''>All Subjects</option>" + set.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join("");
  el.value = old;
}

function renderStatus() {
  const sf = $("statusFilter")?.value || "";
  const sub = $("statusSubject")?.value || "";
  const rows = [];

  for (const id in data.grades) {
    const s = data.students.find(x => x.id === id);
    for (const g of data.grades[id]) {
      const st = statusOf(calc(g));
      if ((!sf || st === sf) && (!sub || g[0] === sub)) {
        rows.push(`<tr><td>${esc(s ? s.name : id)}</td><td>${esc(g[0])}</td><td>${calc(g)}</td><td>${badge(st)}</td></tr>`);
      }
    }
  }
  $("statusTable").innerHTML = rows.join("") || `<tr><td colspan="4">No matching records.</td></tr>`;
}

// --- STUDENT PORTAL VIEWS ---
function getEnrollment(s) {
  const recs = data.enrollments.filter(e => e.student === s.id);
  if (recs.length) return recs[recs.length - 1];
  return {
    student: s.id, schoolYear: "2026-2027", grade: s.grade || "—",
    strand: (s.section || "").toUpperCase().startsWith("HUMSS") ? "HUMSS" : "STEM",
    section: s.section || "—", date: "Not recorded",
    status: s.status || "Regular",
    enrollmentStatus: "Enrolled"
  };
}

const item = (label, v) => `<div class="profile-item"><small>${esc(label)}</small><strong>${esc(v)}</strong></div>`;

function renderStudentPortal() {
  const s = currentStudent;
  if (!s) return;
  const grades = data.grades[s.id] || [];
  const e = getEnrollment(s);

  $("studentWelcomeName").textContent = "Welcome, " + s.name;
  $("studentProfile").innerHTML = item("Student ID", s.id) + item("Full Name", s.name) + item("Grade Level", s.grade) +
    item("Section", s.section) + item("Academic Status", s.status) + item("Contact", s.contact || "N/A");

  $("myProfileDetails").innerHTML = item("Student ID", s.id) + item("Full Name", s.name) + item("Username", s.username) +
    item("Grade Level", s.grade) + item("Section", s.section) + item("Academic Status", s.status) +
    item("Contact", s.contact || "N/A") + item("Guardian", s.guardian || "N/A");

  const pc = (l, v) => `<div class="portal-card"><small>${esc(l)}</small><strong>${esc(v || "—")}</strong></div>`;
  $("myEnrollmentDetails").innerHTML = pc("School Year", e.schoolYear) + pc("Student ID", s.id) + pc("Grade Level", e.grade) +
    pc("Strand", e.strand) + pc("Section", e.section) + pc("Enrollment Date", e.date) + pc("Enrollment Status", e.enrollmentStatus || "Enrolled");

  const avg = avgOf(grades);
  const passed = grades.filter(g => statusOf(calc(g)) === "Passed").length;
  const failed = grades.filter(g => statusOf(calc(g)) === "Failed").length;

  $("mySummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Total Subjects:</b> ${grades.length}</p>
    <p><b>Passed:</b> ${passed}</p><p><b>Failed:</b> ${failed}</p><p><b>School Year:</b> 2026-2027</p>`;

  $("mySubjectsTable").innerHTML = grades.map(g => `<tr><td>${esc(g[0])}</td><td>${calc(g)}</td><td>${badge(statusOf(calc(g)))}</td></tr>`).join("")
    || `<tr><td colspan="3">No subjects available.</td></tr>`;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "7:30 AM - 8:30 AM", "8:30 AM - 9:30 AM", "9:30 AM - 10:30 AM", "10:30 AM - 11:30 AM",
    "1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM"
  ];
  $("myScheduleTable").innerHTML = grades.map((g, i) => `<tr>
    <td>${esc(g[0])}</td><td>${days[i % 5]}</td><td>${times[i % 8]}</td><td>${esc(s.section || "TBA")}</td><td>To be assigned</td>
  </tr>`).join("") || `<tr><td colspan="5">No class schedule available.</td></tr>`;

  $("myGradeTable").innerHTML = grades.map(g => {
    const finalScore = calc(g);

    return `<tr>
      <td>${esc(g[0])}</td><td>${g[1] ?? ''}</td><td>${g[2] ?? ''}</td><td>${g[3] ?? ''}</td><td>${g[4] ?? ''}</td>
      <td>${finalScore}</td><td>${badge(statusOf(finalScore))}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="7">No grades available.</td></tr>`;

  $("myPerformanceSummary").innerHTML = `<p><b>General Average:</b> ${avg}</p><p><b>Passed Subjects:</b> ${passed}</p>
    <p><b>Failed Subjects:</b> ${failed}</p><p><b>Academic Status:</b> ${Number(avg) >= 75 ? "Good Standing" : "Needs Improvement"}</p>`;
  $("myPerformanceChart").innerHTML = bars(grades);

  $("myStatusTable").innerHTML = grades.map(g => `<tr><td>${esc(g[0])}</td><td>${calc(g)}</td><td>${badge(statusOf(calc(g)))}</td></tr>`).join("")
    || `<tr><td colspan="3">No subject records available.</td></tr>`;
}

// --- DYNAMIC REPORT PRINTING ENGINE ---
function openPrint(title, body) {
  const w = window.open("", "_blank");
  if (!w) return toast("Please allow pop-ups to print reports.");
  const style = `
    body { font-family: Arial, sans-serif; padding: 30px; color: #303030; }
    h1, h2 { color: #a90912; margin: 0 0 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
    th { background: #f9f9f9; }
    .box { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
    .box div { padding: 10px; border: 1px solid #ddd; }
  `;
  w.document.write(`<html><head><title>${esc(title)}</title><style>${style}</style></head><body>${body}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

function printStudentReport(name) {
  const s = currentStudent;
  if (!s) return;
  const grades = data.grades[s.id] || [];
  const e = getEnrollment(s);
  let html = `<h1>e-scuela</h1><h2>${esc(name)}</h2><p>Escuela de Nuestra Señora de la Salette</p>
    <p><b>Student:</b> ${esc(s.name)} &nbsp; <b>ID:</b> ${esc(s.id)}</p><p><b>School Year:</b> ${esc(e.schoolYear)}</p>`;

  if (name === "My Enrollment Report") {
    html += `<div class="box">
      <div><b>Grade Level</b><br>${esc(e.grade)}</div><div><b>Strand</b><br>${esc(e.strand)}</div>
      <div><b>Section</b><br>${esc(e.section)}</div><div><b>Enrollment Date</b><br>${esc(e.date)}</div>
      <div><b>Enrollment Status</b><br>${esc(e.enrollmentStatus || "Enrolled")}</div>
    </div>`;
  } else {
    html += `<table><tr><th>Subject</th><th>1st</th><th>2nd</th><th>3rd</th><th>4th</th><th>Final</th><th>Status</th></tr>` +
      grades.map(g => `<tr><td>${esc(g[0])}</td><td>${g[1]}</td><td>${g[2]}</td><td>${g[3]}</td><td>${g[4]}</td><td>${calc(g)}</td><td>${statusOf(calc(g))}</td></tr>`).join("") +
      `</table><p><b>General Average:</b> ${avgOf(grades)}</p>`;
  }
  openPrint(name, html);
}

function printReport(name) {
  let content = `<h1>e-scuela</h1><h2>${esc(name)}</h2><p>Escuela de Nuestra Señora de la Salette</p><p>School Year 2026-2027</p>`;

  if (name === "Enrollment Report") {
    content += `<table><tr><th>Student</th><th>SY</th><th>Grade</th><th>Strand</th><th>Section</th><th>Status</th><th>Enrollment Status</th></tr>` +
      (data.enrollments.map(e => {
        const s = data.students.find(x => x.id === e.student);
        const statusVal = e.status || (s ? s.status : "Regular");
        const enrollStatus = e.enrollmentStatus || "Enrolled";
        return `<tr><td>${esc(s ? s.name : e.student)}</td><td>${esc(e.schoolYear)}</td><td>${esc(e.grade)}</td><td>${esc(e.strand)}</td><td>${esc(e.section)}</td><td>${esc(statusVal)}</td><td>${esc(enrollStatus)}</td></tr>`;
      }).join("") || `<tr><td colspan="7">No enrollment records available.</td></tr>`) + `</table>`;

  } else if (name === "Grade Report" || name === "Student Academic Report") {
    content += `<table><tr><th>Student</th><th>Grade</th><th>Subjects Count</th><th>General Average</th><th>Status</th></tr>` +
      data.students.map(s => {
        const gr = data.grades[s.id] || [];
        const avg = avgOf(gr);
        return `<tr><td>${esc(s.name)}</td><td>${esc(s.grade)}</td><td>${gr.length}</td><td>${avg}</td><td>${Number(avg) >= 75 ? "Passed" : "Conditional"}</td></tr>`;
      }).join("") + `</table>`;

  } else if (name === "Subject Status Report") {
    content += `<table><tr><th>Student</th><th>Subject</th><th>Final Grade</th><th>Status</th></tr>`;
    let rows = "";
    for (const id in data.grades) {
      const s = data.students.find(x => x.id === id);
      for (const g of data.grades[id]) {
        rows += `<tr><td>${esc(s ? s.name : id)}</td><td>${esc(g[0])}</td><td>${calc(g)}</td><td>${badge(statusOf(calc(g)))}</td></tr>`;
      }
    }
    content += (rows || `<tr><td colspan="4">No grade records available.</td></tr>`) + `</table>`;

  } else {
    content += `<table><tr><th>ID</th><th>Student</th><th>Grade</th><th>Section</th><th>Contact</th><th>Status</th></tr>` +
      data.students.map(s => `<tr><td>${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.grade)}</td><td>${esc(s.section)}</td><td>${esc(s.contact || "N/A")}</td><td>${esc(s.status)}</td></tr>`).join("") +
      `</table>`;
  }

  openPrint(name, content);
}

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function renderAll() {
  populateGradeDropdowns();
  populateGradeFilters();
  renderDashboard();
  renderStudents();
  populateSelects();
  filterGradeStudents();
  renderEnrollments();
  renderPerformance();
  populateStatusSubjects();
  renderStatus();
}

// --- ATTACH EVENT LISTENERS & RUN ---
document.addEventListener("DOMContentLoaded", () => {
  $("gradeStudent")?.addEventListener("change", renderGrades);
  $("studentSearch")?.addEventListener("input", renderStudents);
  $("studentGrade")?.addEventListener("change", renderStudents);
  $("statusFilter")?.addEventListener("change", renderStatus);
  $("statusSubject")?.addEventListener("change", renderStatus);

  $("eStudent")?.addEventListener("change", syncEnrollmentStudentData);
  $("eStrand")?.addEventListener("change", updateSectionOptions);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeDrawer();
  });

  ["username", "password"].forEach(id => {
    $(id)?.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  });

  document.querySelectorAll(".brand-left, .brand .logo").forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", e => {
      e.stopPropagation();
      closeDrawer();
      goHome();
    });
  });

  const studentIdInput = $("fId");
  if (studentIdInput) {
    studentIdInput.placeholder = "0000-000";
    studentIdInput.maxLength = 8;

    studentIdInput.addEventListener("input", e => {
      let digits = e.target.value.replace(/\D/g, "").slice(0, 7);
      if (digits.length > 4) {
        e.target.value = digits.slice(0, 4) + "-" + digits.slice(4);
      } else {
        e.target.value = digits;
      }
    });

    studentIdInput.addEventListener("keydown", e => {
      if (e.key === "Backspace" && e.target.value.endsWith("-")) {
        e.target.value = e.target.value.slice(0, -2);
        e.preventDefault();
      }
    });
  }

  if ($("reportList")) {
    $("reportList").innerHTML = [
      "Student Academic Report", "Enrollment Report", "Grade Report",
      "Subject Status Report", "Student Masterlist"
    ].map(n => `
      <div class="report">
        <span>${esc(n)}</span>
        <button class="secondary" onclick="printReport('${esc(n)}')">View / Print</button>
      </div>`
    ).join("");
  }

  if (!restoreSession()) {
    renderAll();
  }
});