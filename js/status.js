function handleStatusYearChange() {
  populateStatusSubjects();
  renderStatus();
}

function renderStatus() {
  populateStatusSubjects();

  const yf = $("statusYear")?.value || "";
  const sf = $("statusFilter")?.value || "";
  const sub = $("statusSubject")?.value || "";
  const rows = [];

  for (const id in data.grades) {
    const s = data.students.find(x => x.id === id);
    if (yf && s?.grade !== yf) continue;

    for (const g of data.grades[id]) {
      const st = statusOf(calc(g));
      if ((!sf || st === sf) && (!sub || g[0] === sub)) {
        rows.push(`<tr>
          <td><b>${esc(s ? formatNameId(s) : id)}</b></td>
          <td>${esc(s?.grade || "N/A")}</td>
          <td>${esc(g[0])}</td>
          <td>${calc(g)}</td>
          <td>${badge(st)}</td>
        </tr>`);
      }
    }
  }
  $("statusTable").innerHTML = rows.join("") || `<tr><td colspan="5">No matching records.</td></tr>`;
}

function populateStatusSubjects() {
  const yearEl = $("statusYear");
  if (yearEl) {
    const oldYear = yearEl.value;
    yearEl.innerHTML = `<option value="">All Year Levels</option>` +
      gradeLevels.map(g => `<option value="${g}">${g}</option>`).join("");
    yearEl.value = oldYear;
  }

  const selectedYear = yearEl?.value || "";

  let configuredSubs = [];
  let gradeSubs = [];

  if (selectedYear) {
    configuredSubs = getSubjectsForGrade(selectedYear);
    gradeSubs = Object.entries(data.grades)
      .filter(([id]) => {
        const s = data.students.find(x => x.id === id);
        return s && s.grade === selectedYear;
      })
      .flatMap(([, subs]) => subs.map(g => g[0]));
  } else {
    configuredSubs = (data.subjects || []).map(s => s.name);
    gradeSubs = Object.values(data.grades).flat().map(g => g[0]);
  }

  const set = [...new Set([...configuredSubs, ...gradeSubs])];

  const el = $("statusSubject");
  if (!el) return;
  const old = el.value;
  el.innerHTML = "<option value=''>All Subjects</option>" + set.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join("");
  el.value = (old && set.includes(old)) ? old : "";
}