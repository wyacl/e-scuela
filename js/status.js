function renderStatus() {
  const sf = $("statusFilter")?.value || "";
  const sub = $("statusSubject")?.value || "";
  const rows = [];

  for (const id in data.grades) {
    const s = data.students.find(x => x.id === id);
    for (const g of data.grades[id]) {
      const st = statusOf(calc(g));
      if ((!sf || st === sf) && (!sub || g[0] === sub)) {
        rows.push(`<tr>
          <td><b>${esc(s ? formatNameId(s) : id)}</b></td>
          <td>${esc(g[0])}</td>
          <td>${calc(g)}</td>
          <td>${badge(st)}</td>
        </tr>`);
      }
    }
  }
  $("statusTable").innerHTML = rows.join("") || `<tr><td colspan="4">No matching records.</td></tr>`;
}

function populateStatusSubjects() {
  const set = [...new Set(Object.values(data.grades).flat().map(g => g[0]))];
  const el = $("statusSubject");
  if (!el) return;
  const old = el.value;
  el.innerHTML = "<option value=''>All Subjects</option>" + set.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join("");
  el.value = old;
}