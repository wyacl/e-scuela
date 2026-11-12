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
      usernameInput.placeholder = "Enter ID Number (e.g. 2026-000)";
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
    // 1. Administrator Account
    if (u === "admin" && p === "admin123") {
      currentUser = { name: "Administrator", role: "Administrator" };
      return openFaculty();
    }

    // 2. Dynamic Faculty Account from data.facultyList
    const fac = (data.facultyList || []).find(f =>
      String(f.username || "").toLowerCase() === u &&
      String(f.password || "").toLowerCase() === p
    );

    if (fac) {
      if ((fac.status || "Active") === "Inactive") {
        $("loginError").textContent = "This faculty account is inactive. Please contact the administrator.";
        return;
      }
      currentUser = {
        id: fac.id,
        name: fac.name,
        role: "Faculty"
      };
      if (typeof bindActiveFaculty === "function") {
        bindActiveFaculty(fac.id);
      }
      return openFacultyPortal();
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

  $("loginError").textContent = "Invalid credentials. Check your username and password.";
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

function openFindAccountModal() {
  if ($("findAccountQuery")) $("findAccountQuery").value = "";
  if ($("findAccountResults")) {
    $("findAccountResults").innerHTML = `<p style="margin:0;font-size:12.5px;color:var(--text-muted);text-align:center;padding:12px 0;">Search by name, ID number, or institutional email.</p>`;
  }
  $("findAccountModal")?.classList.remove("hidden");
  setTimeout(() => $("findAccountQuery")?.focus(), 50);
}

function closeFindAccountModal(e) {
  if (!e || e.target === $("findAccountModal") || e.type === "click") {
    $("findAccountModal")?.classList.add("hidden");
  }
}

function searchFindAccount() {
  const q = val("findAccountQuery").toLowerCase();
  const resultsEl = $("findAccountResults");
  if (!resultsEl) return;

  if (!q) {
    resultsEl.innerHTML = `<p style="margin:0;font-size:12.5px;color:#b91c1c;font-weight:600;">Please enter a name, ID number, or email to search.</p>`;
    return;
  }

  const matchedStudents = (data.students || []).filter(s =>
    String(s.name || "").toLowerCase().includes(q) ||
    String(s.id || "").toLowerCase().includes(q) ||
    String(s.username || "").toLowerCase().includes(q)
  );

  const matchedFaculty = (data.facultyList || []).filter(f =>
    String(f.name || "").toLowerCase().includes(q) ||
    String(f.id || "").toLowerCase().includes(q) ||
    String(f.username || "").toLowerCase().includes(q) ||
    String(f.email || "").toLowerCase().includes(q)
  );

  if (!matchedStudents.length && !matchedFaculty.length) {
    resultsEl.innerHTML = `<div style="padding:14px;border:1px solid var(--border);border-radius:10px;background:#fafafa;text-align:center;font-size:13px;color:var(--text-muted);">No matching student or faculty account found for <b>"${esc(val("findAccountQuery"))}"</b>.</div>`;
    return;
  }

  const studentCards = matchedStudents.map(s => `
    <div style="padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:#ffffff;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div style="min-width:0;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <strong style="font-size:13.5px;color:var(--primary-dark);">${esc(s.name)}</strong>
          <span class="badge enrolled">Student</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${esc(s.grade)} &bull; ${esc(s.section)}</div>
        <div style="font-size:12px;margin-top:4px;">ID / Username: <code>${esc(s.id)}</code> &bull; <span style="color:var(--text-muted);">Default Password: Student ID</span></div>
      </div>
      <button type="button" class="primary table-btn" onclick="useFoundAccount('student', '${esc(s.id)}')">Use ID</button>
    </div>
  `).join("");

  const facultyCards = matchedFaculty.map(f => {
    const isInactive = (f.status || "Active") === "Inactive";
    return `
      <div style="padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:#ffffff;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <strong style="font-size:13.5px;color:var(--primary-dark);">${esc(f.name)}</strong>
            <span class="badge gold">Faculty</span>
            ${isInactive ? `<span class="badge dropped">Inactive</span>` : ""}
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${esc(f.department || "Faculty")}</div>
          <div style="font-size:12px;margin-top:4px;">Username: <code>${esc(f.username)}</code></div>
        </div>
        <button type="button" class="primary table-btn" onclick="useFoundAccount('faculty', '${esc(f.username)}')">Use Account</button>
      </div>
    `;
  }).join("");

  resultsEl.innerHTML = studentCards + facultyCards;
}

function useFoundAccount(roleType, loginId) {
  selectLoginType(roleType);
  if ($("username")) $("username").value = loginId;
  closeFindAccountModal();
  $("password")?.focus();
  toast(`Filled ${roleType === "student" ? "Student ID" : "Username"}: ${loginId}`);
}