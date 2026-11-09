function openDrawer() {
  $("sidebar")?.classList.add("drawer-open");
  $("drawerOverlay")?.classList.add("active");
  document.body.classList.add("drawer-locked");
}

function closeDrawer() {
  $("sidebar")?.classList.remove("drawer-open");
  $("drawerOverlay")?.classList.remove("active");
  document.body.classList.remove("drawer-locked");
}

function toggleDrawer() {
  $("sidebar")?.classList.contains("drawer-open") ? closeDrawer() : openDrawer();
}

function buildNav(items) {
  $("navigation").innerHTML = items.map(i =>
    `<button data-page="${esc(i[0])}" onclick="showPage('${esc(i[0])}')"><i class="${esc(i[1])}"></i> <span>${esc(i[2])}</span></button>`
  ).join("") + `<button class="logout" onclick="logout()"><i class="fa-solid fa-arrow-right-from-bracket fa-fw"></i> <span>Logout</span></button>`;
}

// 1. Administrator Navigation
function openFaculty() {
  enterApp(`${currentUser.name} (${currentUser.role})`, currentUser.role);
  buildNav([
    ["dashboard", "fa-solid fa-table-columns fa-fw", "Dashboard"],
    ["students", "fa-solid fa-user-graduate fa-fw", "Student Information"],
    ["enrollment", "fa-solid fa-id-card fa-fw", "Enrollment"],
    ["grades", "fa-solid fa-check fa-fw", "Grades"],
    ["performance", "fa-solid fa-chart-line fa-fw", "Academic Performance"],
    ["status", "fa-solid fa-circle-dot fa-fw", "Subject Status"],
    ["adminAnnouncements", "fa-solid fa-bullhorn fa-fw", "Announcements"],
    ["reports", "fa-solid fa-file-lines fa-fw", "Reports"],
    ["users", "fa-solid fa-users-gear fa-fw", "User Management"],
    ["settings", "fa-solid fa-gear fa-fw", "Settings"]
  ]);
  showPage("dashboard");
}

// 2. Faculty Portal Navigation
function openFacultyPortal() {
  enterApp(`${currentUser.name} (Faculty)`, "Faculty Portal");
  buildNav([
    ["facultyDashboard", "fa-solid fa-table-columns fa-fw", "Dashboard"],
    ["facultyClasses", "fa-solid fa-chalkboard-user fa-fw", "My Classes"],
    ["facultyGrades", "fa-solid fa-pen-to-square fa-fw", "Grades Entry"],
    ["facultyAttendance", "fa-solid fa-clipboard-user fa-fw", "Attendance"],
    ["facultyAnnouncements", "fa-solid fa-bullhorn fa-fw", "Announcements"],
    ["facultyReports", "fa-solid fa-file-pdf fa-fw", "Reports"],
    ["facultyProfile", "fa-solid fa-user-tie fa-fw", "Profile"]
  ]);
  showPage("facultyDashboard");
}

// 3. Student Portal Navigation
function openStudent() {
  enterApp(formatNameId(currentStudent), "Student Portal");
  buildNav([
    ["studentHome", "fa-solid fa-table-columns fa-fw", "My Dashboard"],
    ["studentProfilePage", "fa-solid fa-user fa-fw", "My Profile"],
    ["studentAnnouncements", "fa-solid fa-bullhorn fa-fw", "Announcements"],
    ["studentEnrollment", "fa-solid fa-id-card fa-fw", "My Enrollment"],
    ["studentSubjects", "fa-solid fa-book-open fa-fw", "My Subjects"],
    ["studentGrades", "fa-solid fa-check fa-fw", "My Grades"],
    ["studentPerformance", "fa-solid fa-chart-line fa-fw", "Academic Performance"],
    ["studentSchedule", "fa-solid fa-calendar-days fa-fw", "Class Schedule"],
    ["studentReports", "fa-solid fa-file-lines fa-fw", "Reports"]
  ]);
  showPage("studentHome");
}

const titles = {
  // Administrator Pages
  dashboard: "Dashboard",
  students: "Student Information",
  enrollment: "Enrollment",
  grades: "Grades",
  performance: "Academic Performance",
  status: "Subject Status",
  adminAnnouncements: "Announcements",
  reports: "Reports",
  users: "User Management",
  settings: "Settings",

  // Faculty Portal Pages
  facultyDashboard: "Faculty Dashboard",
  facultyClasses: "My Classes",
  facultyGrades: "Grades Entry",
  facultyAttendance: "Attendance Marking",
  facultyAnnouncements: "Announcements",
  facultyReports: "Faculty Reports",
  facultyProfile: "Faculty Profile & Settings",

  // Student Portal Pages
  studentHome: "My Dashboard",
  studentProfilePage: "My Profile",
  studentAnnouncements: "Class Announcements",
  studentEnrollment: "My Enrollment",
  studentSubjects: "My Subjects",
  studentGrades: "My Grades",
  studentPerformance: "My Academic Performance",
  studentSchedule: "Class Schedule",
  studentReports: "Reports"
};

function showPage(page) {
  closeDrawer();
  document.querySelectorAll(".page").forEach(x => x.classList.add("hidden"));
  const el = $(page);
  if (el) {
    el.classList.remove("hidden");
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "";
  }
  $("pageTitle").textContent = titles[page] || "Dashboard";
  document.querySelectorAll(".nav button").forEach(x => x.classList.toggle("active", x.dataset.page === page));

  if (loginType === "faculty") {
    if (currentUser && currentUser.role === "Faculty") {
      renderFacultyPortal(page);
    } else {
      renderAll();
      if (page === "adminAnnouncements") renderAdminAnnouncements();
    }
  } else {
    renderStudentPortal();
  }
}

function goHome() {
  if (currentUser) {
    if (currentUser.role === "Faculty") {
      showPage("facultyDashboard");
    } else {
      showPage("dashboard");
    }
  } else if (currentStudent) {
    showPage("studentHome");
  }
}