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
const shsStrands = ["ABM", "HUMSS"];

const defaultSubjects = [
  // Grades 1 to 10 Shared & Level-Specific Subjects
  { id: "SUB-01", name: "English", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },
  { id: "SUB-02", name: "Filipino", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },
  { id: "SUB-03", name: "Math", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"], strands: [] },
  { id: "SUB-04", name: "Mathematics", gradeLevels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },
  { id: "SUB-05", name: "Science", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },
  { id: "SUB-06", name: "Makabansa", gradeLevels: ["Grade 1", "Grade 2", "Grade 3"], strands: [] },
  { id: "SUB-07", name: "GMRC", gradeLevels: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"], strands: [] },
  { id: "SUB-08", name: "Araling Panlipunan", gradeLevels: ["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },
  { id: "SUB-09", name: "EPP", gradeLevels: ["Grade 4", "Grade 5", "Grade 6"], strands: [] },
  { id: "SUB-10", name: "MAPEH", gradeLevels: ["Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },
  { id: "SUB-11", name: "TLE", gradeLevels: ["Grade 7", "Grade 8", "Grade 9", "Grade 10"], strands: [] },

  // Grade 11 (Both Strands: ABM & HUMSS)
  { id: "SUB-12", name: "Oral Communication", gradeLevels: ["Grade 11"], strands: ["ABM", "HUMSS"] },
  { id: "SUB-13", name: "General Mathematics", gradeLevels: ["Grade 11"], strands: ["ABM", "HUMSS"] },

  // Grade 11 (ABM)
  { id: "SUB-14", name: "Business Mathematics", gradeLevels: ["Grade 11"], strands: ["ABM"] },
  { id: "SUB-15", name: "Organization and Management", gradeLevels: ["Grade 11"], strands: ["ABM"] },
  { id: "SUB-16", name: "FABM 1", gradeLevels: ["Grade 11"], strands: ["ABM"] },
  { id: "SUB-17", name: "Principles of Marketing", gradeLevels: ["Grade 11"], strands: ["ABM"] },

  // Grade 11 (HUMSS)
  { id: "SUB-18", name: "Disciplines and Ideas in the Social Sciences", gradeLevels: ["Grade 11"], strands: ["HUMSS"] },
  { id: "SUB-19", name: "Creative Writing", gradeLevels: ["Grade 11"], strands: ["HUMSS"] },
  { id: "SUB-20", name: "World Religions", gradeLevels: ["Grade 11"], strands: ["HUMSS"] },
  { id: "SUB-21", name: "Philippine Politics", gradeLevels: ["Grade 11"], strands: ["HUMSS"] },

  // Grade 12 (Both Strands: ABM & HUMSS)
  { id: "SUB-22", name: "21st Century Literature", gradeLevels: ["Grade 12"], strands: ["ABM", "HUMSS"] },
  { id: "SUB-23", name: "Media and Information Literacy", gradeLevels: ["Grade 12"], strands: ["ABM", "HUMSS"] },
  { id: "SUB-24", name: "Research 2", gradeLevels: ["Grade 12"], strands: ["ABM", "HUMSS"] },
  { id: "SUB-25", name: "3Is", gradeLevels: ["Grade 12"], strands: ["ABM", "HUMSS"] },
  { id: "SUB-26", name: "Entrepreneurship", gradeLevels: ["Grade 12"], strands: ["ABM", "HUMSS"] },
  { id: "SUB-27", name: "Work Immersion", gradeLevels: ["Grade 12"], strands: ["ABM", "HUMSS"] },

  // Grade 12 (ABM)
  { id: "SUB-28", name: "FABM 2", gradeLevels: ["Grade 12"], strands: ["ABM"] },
  { id: "SUB-29", name: "Business Finance", gradeLevels: ["Grade 12"], strands: ["ABM"] },
  { id: "SUB-30", name: "Applied Economics", gradeLevels: ["Grade 12"], strands: ["ABM"] },
  { id: "SUB-31", name: "Business Ethics", gradeLevels: ["Grade 12"], strands: ["ABM"] },

  // Grade 12 (HUMSS)
  { id: "SUB-32", name: "DIASS", gradeLevels: ["Grade 12"], strands: ["HUMSS"] },
  { id: "SUB-33", name: "Creative Nonfiction", gradeLevels: ["Grade 12"], strands: ["HUMSS"] },
  { id: "SUB-34", name: "Trends and Networks", gradeLevels: ["Grade 12"], strands: ["HUMSS"] },
  { id: "SUB-35", name: "CESC", gradeLevels: ["Grade 12"], strands: ["HUMSS"] }
];

const defaultFacultyList = [
  {
    id: "FAC-2026-01",
    username: "salette.maria",
    password: "maria123",
    name: "Prof. Maria Santos",
    department: "Senior High School - Research & Core",
    email: "m.santos@salette.edu.ph",
    contact: "0917-555-0199",
    office: "Faculty Room 204, St. Joseph Hall",
    status: "Active",
    subjects: ["Research 2", "3Is", "Media and Information Literacy", "Work Immersion"]
  },
  {
    id: "FAC-2026-02",
    username: "juan.reyes",
    password: "reyes123",
    name: "Mr. Juan Reyes",
    department: "Languages & Literature",
    email: "j.reyes@salette.edu.ph",
    contact: "0917-555-0142",
    office: "Faculty Room 201",
    status: "Active",
    subjects: ["Oral Communication", "21st Century Literature", "Creative Writing", "Creative Nonfiction", "English", "Filipino"]
  },
  {
    id: "FAC-2026-03",
    username: "elena.cruz",
    password: "cruz123",
    name: "Ms. Elena Cruz",
    department: "Mathematics & Science",
    email: "e.cruz@salette.edu.ph",
    contact: "0917-555-0188",
    office: "Science Faculty Room",
    status: "Active",
    subjects: ["General Mathematics", "Business Mathematics", "Mathematics", "Math", "Science"]
  },
  {
    id: "FAC-2026-04",
    username: "ricardo.dalisay",
    password: "dalisay123",
    name: "Mr. Ricardo Dalisay",
    department: "Accountancy, Business & Management (ABM)",
    email: "r.dalisay@salette.edu.ph",
    contact: "0917-555-0164",
    office: "Faculty Room 203, St. Joseph Hall",
    status: "Active",
    subjects: ["Organization and Management", "FABM 1", "FABM 2", "Principles of Marketing", "Business Finance", "Applied Economics", "Business Ethics", "Entrepreneurship"]
  },
  {
    id: "FAC-2026-05",
    username: "angelica.mendoza",
    password: "mendoza123",
    name: "Ms. Angelica Mendoza",
    department: "Humanities & Social Sciences (HUMSS)",
    email: "a.mendoza@salette.edu.ph",
    contact: "0917-555-0175",
    office: "Faculty Room 202",
    status: "Active",
    subjects: ["Disciplines and Ideas in the Social Sciences", "DIASS", "World Religions", "Philippine Politics", "Trends and Networks", "CESC", "Araling Panlipunan", "Makabansa", "GMRC"]
  },
  {
    id: "FAC-2026-06",
    username: "gabriel.perez",
    password: "perez123",
    name: "Coach Gabriel Perez",
    department: "MAPEH, EPP & Technical-Vocational",
    email: "g.perez@salette.edu.ph",
    contact: "0917-555-0153",
    office: "Gymnasium Faculty Office",
    status: "Active",
    subjects: ["MAPEH", "EPP", "TLE"]
  }
];

const defaultSchedules = [
  // ==================== GRADE 12 - ABM-A (10 SUBJECTS) ====================
  { id: "SCH-001", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "21st Century Literature", day: "Monday", time: "8:00 AM - 9:00 AM", room: "Room 301" },
  { id: "SCH-002", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Media and Information Literacy", day: "Monday", time: "9:00 AM - 10:00 AM", room: "Computer Lab 1" },
  { id: "SCH-003", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "FABM 2", day: "Monday", time: "10:30 AM - 11:30 AM", room: "Room 301" },
  { id: "SCH-004", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Business Finance", day: "Tuesday", time: "8:00 AM - 9:00 AM", room: "Room 301" },
  { id: "SCH-005", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Entrepreneurship", day: "Tuesday", time: "9:00 AM - 10:00 AM", room: "Room 301" },
  { id: "SCH-006", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "3Is", day: "Tuesday", time: "10:30 AM - 11:30 AM", room: "Computer Lab 2" },
  { id: "SCH-007", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Applied Economics", day: "Wednesday", time: "8:00 AM - 9:00 AM", room: "Room 301" },
  { id: "SCH-008", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Business Ethics", day: "Wednesday", time: "9:00 AM - 10:00 AM", room: "Room 301" },
  { id: "SCH-009", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Research 2", day: "Wednesday", time: "1:00 PM - 2:00 PM", room: "Computer Lab 2" },
  { id: "SCH-010", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "ABM", section: "ABM-A", subject: "Work Immersion", day: "Friday", time: "1:00 PM - 3:00 PM", room: "SHS Immersion Room" },

  // ==================== GRADE 11 - ABM-A (6 SUBJECTS) ====================
  { id: "SCH-011", facultyId: "FAC-2026-03", facultyName: "Ms. Elena Cruz", targetType: "section", studentId: "", grade: "Grade 11", strand: "ABM", section: "ABM-A", subject: "General Mathematics", day: "Monday", time: "8:00 AM - 9:00 AM", room: "Room 201" },
  { id: "SCH-012", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 11", strand: "ABM", section: "ABM-A", subject: "Oral Communication", day: "Monday", time: "9:00 AM - 10:00 AM", room: "Room 201" },
  { id: "SCH-013", facultyId: "FAC-2026-03", facultyName: "Ms. Elena Cruz", targetType: "section", studentId: "", grade: "Grade 11", strand: "ABM", section: "ABM-A", subject: "Business Mathematics", day: "Tuesday", time: "8:00 AM - 9:00 AM", room: "Room 201" },
  { id: "SCH-014", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 11", strand: "ABM", section: "ABM-A", subject: "Organization and Management", day: "Thursday", time: "8:00 AM - 9:00 AM", room: "Room 201" },
  { id: "SCH-015", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 11", strand: "ABM", section: "ABM-A", subject: "FABM 1", day: "Thursday", time: "9:00 AM - 10:00 AM", room: "Room 201" },
  { id: "SCH-016", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 11", strand: "ABM", section: "ABM-A", subject: "Principles of Marketing", day: "Friday", time: "8:00 AM - 9:00 AM", room: "Room 201" },

  // ==================== GRADE 11 - HUMSS-A (6 SUBJECTS) ====================
  { id: "SCH-017", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", subject: "Disciplines and Ideas in the Social Sciences", day: "Monday", time: "8:00 AM - 9:00 AM", room: "Room 205" },
  { id: "SCH-018", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", subject: "World Religions", day: "Monday", time: "9:00 AM - 10:00 AM", room: "Room 205" },
  { id: "SCH-019", facultyId: "FAC-2026-03", facultyName: "Ms. Elena Cruz", targetType: "section", studentId: "", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", subject: "General Mathematics", day: "Tuesday", time: "9:00 AM - 10:00 AM", room: "Room 205" },
  { id: "SCH-020", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", subject: "Oral Communication", day: "Wednesday", time: "8:00 AM - 9:00 AM", room: "Room 205" },
  { id: "SCH-021", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", subject: "Philippine Politics", day: "Thursday", time: "8:00 AM - 9:00 AM", room: "Room 205" },
  { id: "SCH-022", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", subject: "Creative Writing", day: "Friday", time: "10:00 AM - 11:00 AM", room: "Room 205" },

  // ==================== GRADE 12 - HUMSS-A (10 SUBJECTS) ====================
  { id: "SCH-023", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "DIASS", day: "Tuesday", time: "8:00 AM - 9:00 AM", room: "Room 304" },
  { id: "SCH-024", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "Creative Nonfiction", day: "Tuesday", time: "10:30 AM - 11:30 AM", room: "Room 304" },
  { id: "SCH-025", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "Trends and Networks", day: "Wednesday", time: "9:00 AM - 10:00 AM", room: "Room 304" },
  { id: "SCH-026", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "CESC", day: "Wednesday", time: "10:30 AM - 11:30 AM", room: "Room 304" },
  { id: "SCH-027", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "21st Century Literature", day: "Thursday", time: "8:00 AM - 9:00 AM", room: "Room 304" },
  { id: "SCH-028", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "Media and Information Literacy", day: "Thursday", time: "9:00 AM - 10:00 AM", room: "Computer Lab 1" },
  { id: "SCH-029", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "Research 2", day: "Thursday", time: "1:00 PM - 2:00 PM", room: "Computer Lab 2" },
  { id: "SCH-030", facultyId: "FAC-2026-01", facultyName: "Prof. Maria Santos", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "3Is", day: "Friday", time: "8:00 AM - 9:00 AM", room: "Computer Lab 2" },
  { id: "SCH-031", facultyId: "FAC-2026-04", facultyName: "Mr. Ricardo Dalisay", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "Entrepreneurship", day: "Friday", time: "9:00 AM - 10:00 AM", room: "Room 304" },
  { id: "SCH-032", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 12", strand: "HUMSS", section: "HUMSS-A", subject: "Work Immersion", day: "Friday", time: "1:00 PM - 3:00 PM", room: "Community Immersion Site" },

  // ==================== ELEMENTARY & JUNIOR HIGH SAMPLE SCHEDULES ====================
  { id: "SCH-033", facultyId: "FAC-2026-05", facultyName: "Ms. Angelica Mendoza", targetType: "section", studentId: "", grade: "Grade 1", strand: "N/A", section: "Section A", subject: "Makabansa", day: "Mon / Wed / Fri", time: "8:00 AM - 8:45 AM", room: "Room 101" },
  { id: "SCH-034", facultyId: "FAC-2026-03", facultyName: "Ms. Elena Cruz", targetType: "section", studentId: "", grade: "Grade 1", strand: "N/A", section: "Section A", subject: "Math", day: "Mon / Wed / Fri", time: "9:00 AM - 9:45 AM", room: "Room 101" },
  { id: "SCH-035", facultyId: "FAC-2026-02", facultyName: "Mr. Juan Reyes", targetType: "section", studentId: "", grade: "Grade 1", strand: "N/A", section: "Section A", subject: "English", day: "Tue / Thu", time: "8:00 AM - 8:45 AM", room: "Room 101" },
  { id: "SCH-036", facultyId: "FAC-2026-06", facultyName: "Coach Gabriel Perez", targetType: "section", studentId: "", grade: "Grade 4", strand: "N/A", section: "Section A", subject: "EPP", day: "Mon / Wed", time: "1:00 PM - 2:00 PM", room: "HE / ICT Lab" },
  { id: "SCH-037", facultyId: "FAC-2026-06", facultyName: "Coach Gabriel Perez", targetType: "section", studentId: "", grade: "Grade 7", strand: "N/A", section: "Section A", subject: "MAPEH", day: "Tue / Thu", time: "2:00 PM - 3:00 PM", room: "Gymnasium" },
  { id: "SCH-038", facultyId: "FAC-2026-06", facultyName: "Coach Gabriel Perez", targetType: "section", studentId: "", grade: "Grade 10", strand: "N/A", section: "Section A", subject: "TLE", day: "Mon / Wed", time: "2:00 PM - 3:00 PM", room: "TLE Workshop" },
  { id: "SCH-039", facultyId: "FAC-2026-03", facultyName: "Ms. Elena Cruz", targetType: "section", studentId: "", grade: "Grade 10", strand: "N/A", section: "Section A", subject: "Mathematics", day: "Mon / Wed / Fri", time: "10:30 AM - 11:30 AM", room: "Room 108" }
];

const defaultData = {
  curriculumVersion: 6,
  students: [
    S("2026-001", "CATHERINE A. ROSARIO", "Grade 12", "ABM-A", "Enrolled"),
    S("2026-002", "ACHILLES NERO C. AGUILA", "Grade 11", "ABM-A", "Enrolled"),
    S("2026-003", "PRINCE CARL B. BARTOLOME", "Grade 12", "ABM-A", "Enrolled"),
    S("2026-004", "BLUE BARRON B. BAMBILLA", "Grade 11", "HUMSS-A", "Enrolled"),
    S("2026-005", "JAYSON J. ESQUEJO", "Grade 12", "ABM-A", "Enrolled"),
    S("2026-006", "CARL ANTHONY V. DE VERA", "Grade 12", "ABM-A", "Enrolled")
  ],
  enrollments: [
    { student: "2026-001", schoolYear: "2026-2027", grade: "Grade 12", strand: "ABM", section: "ABM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-002", schoolYear: "2026-2027", grade: "Grade 11", strand: "ABM", section: "ABM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-003", schoolYear: "2026-2027", grade: "Grade 12", strand: "ABM", section: "ABM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-004", schoolYear: "2026-2027", grade: "Grade 11", strand: "HUMSS", section: "HUMSS-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-005", schoolYear: "2026-2027", grade: "Grade 12", strand: "ABM", section: "ABM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" },
    { student: "2026-006", schoolYear: "2026-2027", grade: "Grade 12", strand: "ABM", section: "ABM-A", date: "2026-06-15", status: "Enrolled", enrollmentStatus: "Enrolled" }
  ],
  grades: {
    "2026-001": [
      ["21st Century Literature", 88, 90, 89, 91],
      ["Media and Information Literacy", 91, 90, 92, 93],
      ["Research 2", 90, 91, 89, 92],
      ["3Is", 92, 91, 90, 93],
      ["Entrepreneurship", 95, 94, 96, 95],
      ["Work Immersion", 93, 94, 95, 95],
      ["FABM 2", 89, 90, 91, 90],
      ["Business Finance", 90, 92, 91, 93],
      ["Applied Economics", 85, 86, 87, 88],
      ["Business Ethics", 91, 92, 91, 93]
    ],
    "2026-002": [
      ["Oral Communication", 85, 87, 88, 86],
      ["General Mathematics", 90, 91, 92, 91],
      ["Business Mathematics", 91, 90, 92, 93],
      ["Organization and Management", 94, 95, 94, 96],
      ["FABM 1", 89, 88, 90, 91],
      ["Principles of Marketing", 86, 87, 88, 89]
    ],
    "2026-003": [
      ["21st Century Literature", 93, 94, 94, 95],
      ["Media and Information Literacy", 92, 93, 93, 94],
      ["Research 2", 94, 95, 94, 95],
      ["3Is", 91, 92, 93, 93],
      ["Entrepreneurship", 95, 96, 96, 96],
      ["Work Immersion", 94, 95, 95, 96],
      ["FABM 2", 92, 93, 94, 94],
      ["Business Finance", 91, 92, 93, 94],
      ["Applied Economics", 90, 91, 92, 92],
      ["Business Ethics", 93, 93, 94, 95]
    ],
    "2026-004": [
      ["Oral Communication", 84, 85, 86, 87],
      ["General Mathematics", 88, 89, 90, 89],
      ["Disciplines and Ideas in the Social Sciences", 90, 91, 90, 92],
      ["Creative Writing", 94, 95, 94, 95],
      ["World Religions", 87, 88, 89, 90],
      ["Philippine Politics", 88, 89, 89, 90]
    ],
    "2026-005": [
      ["21st Century Literature", 92, 93, 93, 94],
      ["Media and Information Literacy", 91, 92, 93, 93],
      ["Research 2", 93, 94, 93, 94],
      ["3Is", 92, 93, 93, 94],
      ["Entrepreneurship", 95, 96, 95, 96],
      ["Work Immersion", 94, 94, 95, 96],
      ["FABM 2", 90, 91, 92, 92],
      ["Business Finance", 91, 92, 92, 93],
      ["Applied Economics", 89, 90, 91, 91],
      ["Business Ethics", 92, 93, 93, 94]
    ],
    "2026-006": [
      ["21st Century Literature", 90, 91, 91, 92],
      ["Media and Information Literacy", 91, 92, 92, 93],
      ["Research 2", 91, 92, 92, 93],
      ["3Is", 90, 91, 91, 92],
      ["Entrepreneurship", 94, 95, 95, 95],
      ["Work Immersion", 93, 94, 94, 95],
      ["FABM 2", 89, 90, 91, 92],
      ["Business Finance", 90, 91, 92, 92],
      ["Applied Economics", 90, 91, 91, 92],
      ["Business Ethics", 91, 92, 92, 93]
    ]
  },
  subjects: JSON.parse(JSON.stringify(defaultSubjects)),
  facultyList: JSON.parse(JSON.stringify(defaultFacultyList)),
  schedules: JSON.parse(JSON.stringify(defaultSchedules)),
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
      title: "ABM-A Research 2 Consultation",
      target: "Grade 12 - ABM-A",
      author: "Prof. Maria Santos",
      date: "2026-11-08",
      content: "Research 2 capstone draft consultations will take place this Wednesday at Computer Lab 2. Attendance is mandatory."
    }
  ]
};

const legacyShsSubjects = new Set([
  "mathematics", "math", "english", "filipino", "pe", "ict", "science", "history", "research"
]);

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

  if ((data.curriculumVersion || 0) < 4) {
    const legacySubIds = new Set(["SUB-01", "SUB-02", "SUB-03", "SUB-04", "SUB-05", "SUB-06", "SUB-07", "SUB-08"]);
    const customSubjects = Array.isArray(data.subjects)
      ? data.subjects.filter(s => !legacySubIds.has(s.id) && !defaultSubjects.some(d => d.name.toLowerCase() === String(s.name || "").toLowerCase()))
      : [];
    data.subjects = [...JSON.parse(JSON.stringify(defaultSubjects)), ...customSubjects];

    const defaultFacIds = new Set(defaultFacultyList.map(f => f.id));
    const customFaculty = Array.isArray(data.facultyList)
      ? data.facultyList.filter(f => !defaultFacIds.has(f.id))
      : [];
    data.facultyList = [...JSON.parse(JSON.stringify(defaultFacultyList)), ...customFaculty];

    const customSchedules = Array.isArray(data.schedules)
      ? data.schedules.filter(sch => {
          const idNum = Number(String(sch.id || "").replace(/^SCH-/, ""));
          return isNaN(idNum) || idNum > 39;
        })
      : [];
    data.schedules = [...JSON.parse(JSON.stringify(defaultSchedules)), ...customSchedules];

    data.students.forEach(s => {
      if (s.grade === "Grade 11" || s.grade === "Grade 12") {
        const existing = Array.isArray(data.grades[s.id]) ? data.grades[s.id] : [];
        const cleaned = existing.filter(row => !legacyShsSubjects.has(String(row[0] || "").toLowerCase()));
        if (cleaned.length) {
          data.grades[s.id] = cleaned;
        } else if (defaultData.grades[s.id]) {
          data.grades[s.id] = JSON.parse(JSON.stringify(defaultData.grades[s.id]));
        } else {
          data.grades[s.id] = [];
        }
      }
    });
  }

  if (!Array.isArray(data.subjects) || !data.subjects.length) {
    data.subjects = JSON.parse(JSON.stringify(defaultSubjects));
  }
  if (!Array.isArray(data.facultyList) || !data.facultyList.length) {
    data.facultyList = JSON.parse(JSON.stringify(defaultFacultyList));
  }
  if (!Array.isArray(data.schedules)) {
    data.schedules = JSON.parse(JSON.stringify(defaultSchedules));
  }
}

// Always backfill any missing/blank quarters (1st–4th) across all students & subjects
Object.entries(data.grades).forEach(([stuId, rows]) => {
  if (!Array.isArray(rows)) return;
  const defRows = defaultData.grades[stuId] || [];
  rows.forEach(row => {
    if (!Array.isArray(row) || row.length < 5) return;
    const defMatch = defRows.find(d => String(d[0] || "").toLowerCase() === String(row[0] || "").toLowerCase());
    const existingNums = row.slice(1, 5)
      .filter(v => v !== "" && v !== null && v !== undefined && v !== "—")
      .map(Number)
      .filter(n => !isNaN(n));
    const fallback = existingNums.length
      ? Math.round(existingNums.reduce((a, b) => a + b, 0) / existingNums.length)
      : 90;

    for (let q = 1; q <= 4; q++) {
      const cell = row[q];
      if (cell === "" || cell === null || cell === undefined || cell === "—" || isNaN(Number(cell))) {
        row[q] = (defMatch && typeof defMatch[q] === "number") ? defMatch[q] : fallback;
      }
    }
  });
});
data.curriculumVersion = 6;

// Restore original group names if temporary names were cached, and remove STEM strand references
const restoreGroupNames = {
  "SOFIA ISABELLE R. CASTILLO": "CATHERINE A. ROSARIO",
  "GABRIEL MIGUEL T. MENDOZA": "ACHILLES NERO C. AGUILA",
  "ANDREA NICOLE M. BAUTISTA": "PRINCE CARL B. BARTOLOME",
  "RAFAEL ANTONIO L. TORRES": "BLUE BARRON B. BAMBILLA",
  "CAMILLE THERESE D. VILLANUEVA": "JAYSON J. ESQUEJO",
  "JOSHUA DANIEL P. NAVARRO": "CARL ANTHONY V. DE VERA"
};

data.students.forEach(s => {
  const upperName = String(s.name || "").toUpperCase();
  if (restoreGroupNames[upperName]) {
    s.name = restoreGroupNames[upperName];
  }
  if (typeof s.section === "string" && s.section.startsWith("STEM-")) {
    s.section = s.section.replace(/^STEM-/, "ABM-");
  }
  s.username = s.id;
  s.password = s.id;
  if (!s.status || s.status === "Regular") s.status = "Enrolled";
  if (!s.contact) s.contact = "N/A";
  if (!s.guardian) s.guardian = "N/A";
});

data.enrollments.forEach(e => {
  if (e.strand === "STEM") e.strand = "ABM";
  if (typeof e.section === "string" && e.section.startsWith("STEM-")) {
    e.section = e.section.replace(/^STEM-/, "ABM-");
  }
  if (e.status === "Regular") e.status = "Enrolled";
  if (!e.enrollmentStatus || e.enrollmentStatus === "Regular") e.enrollmentStatus = "Enrolled";
});

(data.schedules || []).forEach(sch => {
  if (sch.strand === "STEM") sch.strand = "ABM";
  if (typeof sch.section === "string" && sch.section.startsWith("STEM-")) {
    sch.section = sch.section.replace(/^STEM-/, "ABM-");
  }
});

(data.facultyList || []).forEach(f => {
  if (typeof f.department === "string" && f.department.includes("STEM")) {
    f.department = f.department.replace(/STEM/g, "ABM & HUMSS");
  }
  if (!f.status) f.status = "Active";
});

(data.announcements || []).forEach(a => {
  if (typeof a.title === "string" && a.title.includes("STEM")) {
    a.title = a.title.replace(/STEM/g, "ABM");
  }
  if (typeof a.target === "string" && a.target.includes("STEM")) {
    a.target = a.target.replace(/STEM/g, "ABM");
  }
});

// Helper: Retrieve subjects assigned to a specific grade level (and strand for Grade 11 & 12)
function getSubjectsForGrade(grade, strand = "") {
  const list = data.subjects || [];
  if (!grade) return list.map(s => s.name);

  const isSHS = grade === "Grade 11" || grade === "Grade 12";

  return list
    .filter(s => {
      if (!Array.isArray(s.gradeLevels) || !s.gradeLevels.includes(grade)) return false;
      if (isSHS && strand && strand !== "N/A") {
        const subStrands = Array.isArray(s.strands) ? s.strands : [];
        if (subStrands.length > 0 && !subStrands.includes(strand)) return false;
      }
      return true;
    })
    .map(s => s.name);
}

function persist() {
  try {
    localStorage.setItem("eScuelaData", JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
persist();

const formatQuarter = v => (v !== "" && v !== null && v !== undefined) ? esc(v) : "—";

const calc = g => {
  const scores = g.slice(1, 5)
    .filter(n => n !== "" && n !== null && n !== undefined)
    .map(Number)
    .filter(n => !isNaN(n));
  return scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : "—";
};

const statusOf = v => (v === null || v === "" || v === "—" || isNaN(v)) ? "Pending" : Number(v) >= 75 ? "Passed" : "Failed";
const badge = st => `<span class="badge ${esc(st.toLowerCase())}">${esc(st)}</span>`;

const avgOf = list => {
  const valid = list.map(calc).filter(v => typeof v === "number" && !isNaN(v));
  if (!valid.length) return "0.00";
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
};

const val = id => $(id) ? $(id).value.trim() : "";