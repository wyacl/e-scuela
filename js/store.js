const $ = id => document.getElementById(id);
const esc = str => String(str ?? "").replace(/[&<>'"]/g, t => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[t] || t));

// Standard format: Name (ID Number)
const formatNameId = s => s ? `${s.name} (${s.id})` : "";

// Student factory: Default status set to "Enrolled"
const S = (id, name, grade, section, status = "Enrolled") => ({
  id,
  name,
  username: id,
  password: id,
  grade,
  section: section || "Pending Enrollment",
  status,
  contact: "N/A",
  guardian: "N/A"
});

const gradeLevels = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
const availableSubjects = [
  "Mathematics", "English", "Science", "Filipino",
  "History", "PE", "ICT", "Research"
];

const defaultData = {
  students: [
    S("2026-001", "CATHERINE A. ROSARIO", "Grade 12", "STEM-A", "Enrolled"),
    S("2026-002", "ACHILLES NERO C. AGUILA", "Grade 11", "STEM-A", "Enrolled"),
    S("2026-003", "PRINCE CARL B. BARTOLOME", "Grade 12", "STEM-A", "Enrolled"),
    S("2026-004", "BLUE BARRON B. BAMBILLA", "Grade 11", "HUMSS-A", "Enrolled"),
    S("2026-005", "JAYSON J. ESQUEJO", "Grade 12", "STEM-A", "Enrolled"),
    S("2026-006", "CARL ANTHONY V. DE VERA", "Grade 12", "STEM-A", "Enrolled")
  ],
  enrollments: [
    { student: "2026-001", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-002", schoolYear: "2026-2027", grade: "Grade 11", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-003", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-004", schoolYear: "2026-2027", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-005", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-006", schoolYear: "2026-2027", grade: "Grade 12", strand: "STEM", section: "STEM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" }
  ],
  grades: {
    "2026-001": [["Mathematics",88,90,89,91],["English",91,90,92,93],["Science",90,91,89,92],["Filipino",92,91,90,93],["PE",95,94,96,95],["ICT",89,90,91,90],["Research",90,92,91,93],["History",78,80,79,81]],
    "2026-002": [["Mathematics",85,87,88,86],["English",90,91,92,91],["Science",88,89,90,91],["Filipino",91,90,92,93],["PE",94,95,94,96],["ICT",89,88,90,91],["History",86,87,88,89]],
    "2026-003": [["Mathematics",93,94,94,95],["English",92,93,93,94],["Science",94,95,94,95],["Filipino",91,92,93,93],["PE",95,96,96,96],["ICT",92,93,94,94]],
    "2026-004": [["Mathematics",84,85,86,87],["English",88,89,90,89],["Science",86,87,88,89],["Filipino",90,91,90,92],["PE",94,95,94,95],["ICT",87,88,89,90]],
    "2026-005": [["Mathematics",92,93,93,94],["English",91,92,93,93],["Science",93,94,93,94],["Filipino",92,93,93,94],["PE",95,96,95,96],["ICT",91,92,92,93]],
    "2026-006": [["Mathematics",90,91,91,92],["English",91,92,92,93],["Science",91,92,92,93],["Filipino",90,91,91,92],["PE",94,95,95,95],["ICT",90,91,91,92]]
  },
  announcements: [
    {
      id: "ANN-001",
      title: "2nd Quarter Examination Guidelines",
      target: "All Classes",
      author: "Prof. Maria Santos",
      date: "2026-11-05",
      content: "Please be reminded that the 2nd Quarter Examination schedules have been posted. Prepare all draft papers and research folios prior to Friday."
    },
    {
      id: "ANN-002",
      title: "STEM-A Research Consultation",
      target: "Grade 12 - STEM-A",
      author: "Prof. Maria Santos",
      date: "2026-11-08",
      content: "Research capstone draft consultations will take place this Wednesday at Computer Lab 2. Attendance is mandatory."
    }
  ]
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
  data.announcements = Array.isArray(data.announcements) ? data.announcements : defaultData.announcements;
}

// Automatically sync username and password to student ID & update "Regular" to "Enrolled"
data.students.forEach(s => {
  s.username = s.id;
  s.password = s.id;
  if (!s.status || s.status === "Regular") s.status = "Enrolled";
  if (!s.contact) s.contact = "N/A";
  if (!s.guardian) s.guardian = "N/A";
});

data.enrollments.forEach(e => {
  if (e.status === "Regular") e.status = "Enrolled";
  if (!e.enrollmentStatus || e.enrollmentStatus === "Regular") e.enrollmentStatus = "Enrolled";
});

function persist() {
  try {
    localStorage.setItem("eScuelaData", JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
persist();

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

const val = id => $(id) ? $(id).value.trim() : "";