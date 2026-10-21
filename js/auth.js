let loginType = "faculty";
let currentUser = null;
let currentStudent = null;

function selectLoginType(type) {
  loginType = type;
  $("facultyBtn")?.classList.toggle("active", type === "faculty");
  $("studentBtn")?.classList.toggle("active", type === "student");
  $("loginTypeToggle")?.classList.toggle("student-selected", type === "student");

  const usernameInput = $("username");
  const usernameLabel = $("usernameLabel");
  const passwordInput = $("password");

  if (usernameInput && usernameLabel && passwordInput) {
    if (type === "student") {
      usernameLabel.textContent = "Student ID Number";
      usernameInput.placeholder = "Enter ID Number (e.g. 2026-001)";
      passwordInput.placeholder = "Enter password";
    } else {
      usernameLabel.textContent = "Username";
      usernameInput.placeholder = "Enter username";
      passwordInput.placeholder = "Enter password";
    }
  }

  $("username").value = "";
  $("password").value = "";
  $("loginError").textContent = "";
}

function login() {
  const u = $("username").value.trim().toLowerCase();
  const p = $("password").value.trim().toLowerCase();
  if (!u || !p) {
    $("loginError").textContent = "Please enter your username/ID and password.";
    return;
  }

  if (loginType === "faculty") {
    if (u === "admin" && p === "admin123") {
      currentUser = { name: "Administrator", role: "Administrator" };
      return openFaculty();
    }
    if (u === "faculty" && p === "faculty123") {
      currentUser = { name: "Faculty", role: "Faculty" };
      return openFaculty();
    }
  } else {
    // Student logs in using their ID Number as both Username and Password
    const s = data.students.find(x =>
      (String(x.username).toLowerCase() === u || String(x.id).toLowerCase() === u) &&
      (String(x.password).toLowerCase() === p || String(x.id).toLowerCase() === p)
    );
    if (s) {
      currentStudent = s;
      return openStudent();
    }
  }
  $("loginError").textContent = "Invalid credentials. Student username and password are their ID Number.";
}

function logout() {
  closeDrawer();
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