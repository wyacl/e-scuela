function renderStudents() {
  const q = ($("studentSearch")?.value || "").toLowerCase();
  const gr = $("studentGrade")?.value || "";
  $("studentTable").innerHTML = data.students
    .filter(s => (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) && (!gr || s.grade === gr))
    .map(s => `<tr>
        <td><b>${esc(formatNameId(s))}</b></td>
        <td>${esc(s.grade)}</td>
        <td>${esc(s.section)}</td>
        <td><span class="badge ${esc(s.status.toLowerCase())}">${esc(s.status)}</span></td>
        <td style="white-space:nowrap;">
          <button class="secondary table-btn" onclick="viewStudentModal('${esc(s.id)}')"><i class="fa-solid fa-eye fa-fw"></i> View</button>
          <button class="secondary table-btn" style="color:var(--primary);margin-left:4px;" onclick="deleteStudent('${esc(s.id)}')"><i class="fa-solid fa-trash fa-fw"></i> Remove</button>
        </td>
      </tr>`).join("") || `<tr><td colspan="5">No students found.</td></tr>`;
}

function openStudentForm() { $("studentForm")?.classList.remove("hidden"); }
function closeStudentForm() { $("studentForm")?.classList.add("hidden"); }

function saveStudent() {
  const id = val("fId");
  const name = val("fName");
  if (!id || !name) return toast("Student ID and Name are required.");

  if (!/^\d{4}-\d{3}$/.test(id)) return toast("Student ID must follow 0000-000 format.");
  if (data.students.some(x => x.id === id)) return toast("Student ID already exists.");

  const s = {
    id,
    name,
    grade: val("fGrade") || "Grade 1",
    section: "Pending Enrollment",
    status: val("fStatus") || "Regular",
    contact: val("fContact") || "N/A",
    guardian: val("fGuardian") || "N/A",
    username: id,
    password: id // Standardized: Password is ID Number
  };

  data.students.push(s);
  data.grades[s.id] = [];
  persist();
  closeStudentForm();
  renderAll();
  toast(`Registered: ${formatNameId(s)}`);
}

function deleteStudent(id) {
  const s = data.students.find(x => x.id === id);
  if (!s || !confirm(`Remove ${formatNameId(s)}?`)) return;

  data.students = data.students.filter(x => x.id !== id);
  data.enrollments = data.enrollments.filter(e => e.student !== id);
  delete data.grades[id];
  persist();
  renderAll();
  toast(`Student ${id} removed.`);
}

function viewStudentModal(id) {
  const s = data.students.find(x => x.id === id);
  if (!s) return;

  const grades = data.grades[s.id] || [];
  const subjects = grades.map(g => g[0]);
  const enr = data.enrollments.find(e => e.student === s.id) || {};
  const gpa = avgOf(grades);

  $("modalStudentName").textContent = formatNameId(s);
  $("modalStudentID").textContent = `ID: ${s.id}`;

  $("modalStudentBody").innerHTML = `
    <div class="modal-grid">
      <div class="modal-item"><small>Full Name</small><strong>${esc(s.name)}</strong></div>
      <div class="modal-item"><small>Student ID Number</small><strong>${esc(s.id)}</strong></div>
      <div class="modal-item"><small>Grade &amp; Section</small><strong>${esc(s.grade)} - ${esc(s.section)}</strong></div>
      <div class="modal-item"><small>Academic Status</small><strong><span class="badge ${esc(s.status.toLowerCase())}">${esc(s.status)}</span></strong></div>
      <div class="modal-item"><small>Enrollment Status</small><strong><span class="badge ${esc((enr.enrollmentStatus || "Enrolled").toLowerCase())}">${esc(enr.enrollmentStatus || "Enrolled")}</span></strong></div>
      <div class="modal-item"><small>General Average</small><strong>${gpa}</strong></div>
      <div class="modal-item"><small>Contact Number</small><strong>${esc(s.contact || "N/A")}</strong></div>
      <div class="modal-item"><small>Guardian</small><strong>${esc(s.guardian || "N/A")}</strong></div>
    </div>
    <div class="field">
      <label>Enrolled Subjects (${subjects.length})</label>
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