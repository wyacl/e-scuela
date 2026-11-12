// Helper: Dynamically verify enrollment status (Enrolled, Pending, or Dropped)
function getStudentStatus(studentId) {
  const enr = data.enrollments.find(e => e.student === studentId);
  if (enr && enr.enrollmentStatus) return enr.enrollmentStatus;
  const s = data.students.find(x => x.id === studentId);
  return (s && s.status && s.status !== "Regular") ? s.status : "Pending";
}

function parseStudentNameParts(s) {
  if (s.lastName || s.firstName) {
    return {
      firstName: s.firstName || "",
      middleName: s.middleName || "",
      lastName: s.lastName || "",
      suffix: s.suffix || ""
    };
  }

  const tokens = String(s.name || "").trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return { firstName: "", middleName: "", lastName: "", suffix: "" };
  }

  let suffix = "";
  const suffixSet = new Set(["JR.", "JR", "SR.", "SR", "II", "III", "IV", "V"]);
  if (tokens.length > 2 && suffixSet.has(tokens[tokens.length - 1].toUpperCase())) {
    suffix = tokens.pop();
  }

  const midIdx = tokens.findIndex((t, idx) => idx > 0 && idx < tokens.length - 1 && /^[A-Za-z]\.?$/.test(t));
  if (midIdx !== -1) {
    return {
      firstName: tokens.slice(0, midIdx).join(" "),
      middleName: tokens[midIdx],
      lastName: tokens.slice(midIdx + 1).join(" "),
      suffix
    };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], middleName: "", lastName: "", suffix };
  }
  if (tokens.length === 2) {
    return { firstName: tokens[0], middleName: "", lastName: tokens[1], suffix };
  }

  return {
    firstName: tokens[0],
    middleName: tokens.slice(1, -1).join(" "),
    lastName: tokens[tokens.length - 1],
    suffix
  };
}

function renderStudents() {
  const q = ($("studentSearch")?.value || "").toLowerCase();
  const gr = $("studentGrade")?.value || "";
  $("studentTable").innerHTML = data.students
    .filter(s => (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) && (!gr || s.grade === gr))
    .map(s => {
      const status = getStudentStatus(s.id);
      const badgeClass = status.toLowerCase();

      return `<tr>
        <td><b>${esc(s.name)}</b></td>
        <td>${esc(s.id)}</td>
        <td>${esc(s.grade)}</td>
        <td><span class="badge ${esc(badgeClass)}">${esc(status)}</span></td>
        <td style="white-space:nowrap;">
          <button class="secondary table-btn" onclick="viewStudentModal('${esc(s.id)}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
          <button class="secondary table-btn" style="margin-left:4px;" onclick="editStudent('${esc(s.id)}')"><i class="fa-solid fa-pen-to-square fa-fw"></i> Edit</button>
          <button class="secondary table-btn" style="color:var(--primary);margin-left:4px;" onclick="promptDeleteStudent('${esc(s.id)}')"><i class="fa-solid fa-trash fa-fw"></i> Remove</button>
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="5">No students found.</td></tr>`;
}

function resetStudentFormFields() {
  if ($("fEditId")) $("fEditId").value = "";
  if ($("studentFormTitle")) $("studentFormTitle").textContent = "Add Student";
  if ($("studentSaveBtn")) $("studentSaveBtn").textContent = "Save Student";

  const idInput = $("fId");
  if (idInput) {
    idInput.value = "";
    idInput.readOnly = false;
    idInput.style.background = "";
    idInput.style.cursor = "";
  }

  if ($("fGrade") && $("fGrade").options.length) {
    $("fGrade").selectedIndex = 0;
  }

  ["fLastName", "fFirstName", "fMiddleName", "fSuffix", "fContact", "fGuardian"].forEach(id => {
    if ($(id)) $(id).value = "";
  });
}

function openStudentForm() {
  resetStudentFormFields();
  $("studentForm")?.classList.remove("hidden");
  $("studentForm")?.scrollIntoView({ behavior: "smooth" });
}

function editStudent(id) {
  const s = data.students.find(x => x.id === id);
  if (!s) return;

  const parts = parseStudentNameParts(s);

  if ($("fEditId")) $("fEditId").value = s.id;
  if ($("studentFormTitle")) $("studentFormTitle").textContent = `Edit Student — ${s.name}`;
  if ($("studentSaveBtn")) $("studentSaveBtn").textContent = "Update Student";

  const idInput = $("fId");
  if (idInput) {
    idInput.value = s.id;
    idInput.readOnly = true;
    idInput.style.background = "#f8fafc";
    idInput.style.cursor = "not-allowed";
  }

  if ($("fGrade")) $("fGrade").value = s.grade || "Grade 1";
  if ($("fLastName")) $("fLastName").value = parts.lastName;
  if ($("fFirstName")) $("fFirstName").value = parts.firstName;
  if ($("fMiddleName")) $("fMiddleName").value = parts.middleName;
  if ($("fSuffix")) $("fSuffix").value = parts.suffix;
  if ($("fContact")) $("fContact").value = (s.contact && s.contact !== "N/A") ? s.contact : "";
  if ($("fGuardian")) $("fGuardian").value = (s.guardian && s.guardian !== "N/A") ? s.guardian : "";

  $("studentForm")?.classList.remove("hidden");
  $("studentForm")?.scrollIntoView({ behavior: "smooth" });
}

function closeStudentForm() {
  $("studentForm")?.classList.add("hidden");
  resetStudentFormFields();
}

function saveStudent() {
  const editId = val("fEditId");
  const id = val("fId");
  const lastName = val("fLastName");
  const firstName = val("fFirstName");
  const middleName = val("fMiddleName");
  const suffix = val("fSuffix");
  const grade = val("fGrade") || "Grade 1";
  const contact = val("fContact") || "N/A";
  const guardian = val("fGuardian") || "N/A";

  if (!id || !lastName || !firstName) {
    return toast("Student ID, Last Name, and First Name are required.");
  }

  const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ").toUpperCase();

  if (editId) {
    const idx = data.students.findIndex(x => x.id === editId);
    if (idx === -1) return;

    const existing = data.students[idx];
    const isSHS = grade === "Grade 11" || grade === "Grade 12";
    let updatedSection = existing.section || "Pending Enrollment";

    if (!updatedSection.startsWith("Pending") && updatedSection !== "Dropped") {
      if (isSHS && !updatedSection.includes("-")) {
        updatedSection = "ABM-A";
      } else if (!isSHS && updatedSection.includes("-")) {
        updatedSection = "Section A";
      }
    }

    data.students[idx] = {
      ...existing,
      name: fullName,
      lastName,
      firstName,
      middleName: middleName || "",
      suffix: suffix || "",
      grade,
      section: updatedSection,
      contact,
      guardian
    };

    const enr = data.enrollments.find(e => e.student === editId);
    if (enr) {
      enr.grade = grade;
      enr.section = updatedSection;
      if (isSHS) {
        if (!enr.strand || enr.strand === "N/A") enr.strand = "ABM";
      } else {
        enr.strand = "N/A";
      }
    }

    persist();
    closeStudentForm();
    renderAll();
    toast(`Updated: ${formatNameId(data.students[idx])}`);
    return;
  }

  if (!/^\d{4}-\d{3}$/.test(id)) return toast("Student ID must follow 0000-000 format.");
  if (data.students.some(x => x.id === id)) return toast("Student ID already exists.");

  const s = {
    id,
    name: fullName,
    lastName,
    firstName,
    middleName: middleName || "",
    suffix: suffix || "",
    grade,
    section: "Pending Enrollment",
    status: "Pending",
    contact,
    guardian,
    username: id,
    password: id
  };

  data.students.push(s);
  data.grades[s.id] = [];
  persist();
  closeStudentForm();
  renderAll();
  toast(`Registered: ${formatNameId(s)}`);
}

// ==================== REMOVE CONFIRMATION MODAL ====================
let studentToDeleteId = null;

function promptDeleteStudent(id) {
  const s = data.students.find(x => x.id === id);
  if (!s) return;
  studentToDeleteId = id;
  $("deleteStudentName").textContent = formatNameId(s);
  $("deleteStudentID").textContent = `ID: ${s.id}`;
  $("studentDeleteModal")?.classList.remove("hidden");
}

function closeDeleteModal(e) {
  if (!e || e.target === $("studentDeleteModal") || e.type === "click") {
    $("studentDeleteModal")?.classList.add("hidden");
    studentToDeleteId = null;
  }
}

function confirmDeleteStudent() {
  if (!studentToDeleteId) return;
  const id = studentToDeleteId;
  closeDeleteModal();

  if (val("fEditId") === id) closeStudentForm();

  data.students = data.students.filter(x => x.id !== id);
  data.enrollments = data.enrollments.filter(e => e.student !== id);
  delete data.grades[id];

  persist();
  renderAll();
  toast(`Student ${id} removed.`);
}

// ==================== VIEW MODAL ====================
function viewStudentModal(id) {
  const s = data.students.find(x => x.id === id);
  if (!s) return;

  const grades = data.grades[s.id] || [];
  const subjects = grades.map(g => g[0]);
  const gpa = avgOf(grades);
  const currentStatus = getStudentStatus(s.id);
  const statusBadgeClass = currentStatus.toLowerCase();

  $("modalStudentName").textContent = formatNameId(s);
  $("modalStudentID").textContent = `ID: ${s.id}`;

  $("modalStudentBody").innerHTML = `
    <div class="modal-grid">
      <div class="modal-item"><small>Full Name</small><strong>${esc(s.name)}</strong></div>
      <div class="modal-item"><small>Student ID Number</small><strong>${esc(s.id)}</strong></div>
      <div class="modal-item"><small>Grade &amp; Section</small><strong>${esc(s.grade)} - ${esc(s.section)}</strong></div>
      <div class="modal-item"><small>Status</small><strong><span class="badge ${esc(statusBadgeClass)}">${esc(currentStatus)}</span></strong></div>
      <div class="modal-item"><small>General Average</small><strong>${gpa}</strong></div>
      <div class="modal-item"><small>Contact Number</small><strong>${esc(s.contact || "N/A")}</strong></div>
      <div class="modal-item"><small>Guardian</small><strong>${esc(s.guardian || "N/A")}</strong></div>
    </div>
    <div class="field">
      <div class="field-group-label">Enrolled Subjects (${subjects.length})</div>
      <div class="modal-pills">
        ${subjects.map(sub => `<span class="modal-pill"><i class="fa-solid fa-book fa-fw" style="color:var(--primary)"></i> ${esc(sub)}</span>`).join("") || `<span style="color:var(--text-muted);font-size:12px;">No subjects enrolled yet.</span>`}
      </div>
    </div>
  `;

  $("studentViewModal")?.classList.remove("hidden");
}

function closeStudentModal(e) {
  if (!e || e.target === $("studentViewModal") || e.type === "click") {
    $("studentViewModal")?.classList.add("hidden");
  }
}