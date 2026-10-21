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
  enterApp(formatNameId(currentStudent), "Student Portal");
  buildNav([
    ["studentHome", "fa-solid fa-table-columns fa-fw", "My Dashboard"],
    ["studentProfilePage", "fa-solid fa-user fa-fw", "My Profile"],
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
  dashboard:"Dashboard", students:"Student Information", enrollment:"Enrollment", grades:"Grades",
  performance:"Academic Performance", status:"Subject Status", reports:"Reports", users:"User Management", settings:"Settings",
  studentHome:"My Dashboard", studentProfilePage:"My Profile", studentEnrollment:"My Enrollment", studentSubjects:"My Subjects",
  studentGrades:"My Grades", studentPerformance:"My Academic Performance",
  studentSchedule:"Class Schedule", studentReports:"Reports"
};

function showPage(page) {
  closeDrawer();
  document.querySelectorAll(".page").forEach(x => x.classList.add("hidden"));
  const el = $(page);
  if (el) {
    el.classList.remove("hidden");
    // Trigger keyframe fade-in animation on switch
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "";
  }
  $("pageTitle").textContent = titles[page] || "Dashboard";
  document.querySelectorAll(".nav button").forEach(x => x.classList.toggle("active", x.dataset.page === page));
  if (loginType === "faculty") renderAll(); else renderStudentPortal();
}

function goHome() {
  if (currentUser) showPage("dashboard");
  else if (currentStudent) showPage("studentHome");
}