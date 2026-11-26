const todayKey = new Date().toISOString().slice(0, 10);
const initial = [
  {
    id: "demo-1",
    name: "Mila Sample",
    group: "Sunbeams",
    guardian: "A. Sample",
    phone: "+27 00 000 0000",
    pickups: ["A. Sample", "T. Sample"],
    active: true,
  },
  {
    id: "demo-2",
    name: "Noah Example",
    group: "Little Stars",
    guardian: "B. Example",
    phone: "+27 00 000 0000",
    pickups: ["B. Example"],
    active: true,
  },
  {
    id: "demo-3",
    name: "Ava Demo",
    group: "Sunbeams",
    guardian: "C. Demo",
    phone: "+27 00 000 0000",
    pickups: ["C. Demo", "D. Demo"],
    active: true,
  },
];
let children = load("pp_children", initial);
let pickups = load("pp_pickups", []);
let pins = load("pp_pins", []);
let showArchived = false;
const $ = (id) => document.getElementById(id);
function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function save() {
  localStorage.setItem("pp_children", JSON.stringify(children));
  localStorage.setItem("pp_pickups", JSON.stringify(pickups));
  localStorage.setItem("pp_pins", JSON.stringify(pins));
}
function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0] || "")
    .join("")
    .toUpperCase();
}
function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function activeChildren() {
  return children.filter((c) => c.active);
}
function todaysPickups() {
  return pickups.filter((p) => p.day === todayKey);
}
function renderStats() {
  const active = activeChildren().length,
    done = todaysPickups().length,
    issued = pins.filter((p) => p.day === todayKey && !p.used).length;
  const cards = [
    ["Active children", active, "Enrolled in the registry", "👶"],
    ["PINs issued today", issued, "One-use demo codes", "🔐"],
    ["Handovers complete", done, "Recorded today", "✓"],
    [
      "Archived records",
      children.filter((c) => !c.active).length,
      "Kept out of active list",
      "▤",
    ],
  ];
  $("stats").innerHTML = cards
    .map(
      (a) =>
        `<div class="stat"><div class="stat-top">${a[0]}<span class="stat-icon">${a[3]}</span></div><div class="stat-num">${a[1]}</div><div class="stat-sub">${a[2]}</div></div>`,
    )
    .join("");
}
function renderChildren() {
  const q = ($("childSearch")?.value || "").toLowerCase();
  const list = children
    .filter((c) => c.active !== showArchived)
    .filter((c) =>
      `${c.name} ${c.guardian} ${c.group}`.toLowerCase().includes(q),
    );
  $("childRows").innerHTML = list.length
    ? list
        .map(
          (c) =>
            `<tr><td><div class="child"><span class="avatar">${esc(initials(c.name))}</span><span>${esc(c.name)}<span class="meta">${esc(c.group || "No group assigned")}</span></span></div></td><td>${esc(c.guardian)}</td><td>${esc(c.phone)}</td><td>${c.pickups.map(esc).join(", ")}</td><td><span class="pill ${c.active ? "" : "out"}">${c.active ? "Active" : "Archived"}</span></td><td><div class="actions">${c.active ? `<button class="linkbtn danger" onclick="archiveChild('${c.id}')">Archive</button>` : `<button class="linkbtn" onclick="restoreChild('${c.id}')">Restore</button>`}</div></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="6" class="empty">No children in this view.</td></tr>';
}
function renderPickup() {
  const q = ($("pickupSearch")?.value || "").toLowerCase();
  const list = activeChildren().filter((c) =>
    `${c.name} ${c.guardian}`.toLowerCase().includes(q),
  );
  $("pickupRows").innerHTML = list.length
    ? list
        .map((c) => {
          const p = pins.find(
            (x) => x.childId === c.id && x.day === todayKey && !x.used,
          );
          const completed = todaysPickups().some((x) => x.childId === c.id);
          return `<tr><td><div class="child"><span class="avatar">${esc(initials(c.name))}</span>${esc(c.name)}</div></td><td>${esc(c.guardian)}<span class="meta">${esc(c.phone)}</span></td><td>${c.pickups.map(esc).join(", ")}</td><td>${completed ? '<span class="pill out">Handed over</span>' : p ? '<span class="pill">PIN active</span>' : '<span class="pill out">No PIN yet</span>'}</td><td>${completed ? '<span class="meta">Completed today</span>' : `<button class="btn small" onclick="issuePin('${c.id}')">${p ? "Show PIN" : "Issue daily PIN"}</button>`}</td></tr>`;
        })
        .join("")
    : '<tr><td colspan="5" class="empty">No active children match your search.</td></tr>';
}
function renderActivity() {
  const list = todaysPickups().slice().reverse().slice(0, 6);
  $("activityRows").innerHTML = list.length
    ? list
        .map(
          (p) =>
            `<tr><td>${esc(p.childName)}</td><td>${esc(p.adult)}</td><td>${esc(p.time)}</td><td><span class="pill">Handed over</span></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="4" class="empty">No handovers have been recorded today.</td></tr>';
}
function render() {
  renderStats();
  renderChildren();
  renderPickup();
  renderActivity();
}
function showPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.toggle("hide", p.id !== page));
  document
    .querySelectorAll(".nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  $("crumb").textContent =
    page === "overview"
      ? "Overview"
      : page === "children"
        ? "Children"
        : "Pickup desk";
}
document
  .querySelectorAll(".nav button")
  .forEach((b) => b.addEventListener("click", () => showPage(b.dataset.page)));
function openChildModal() {
  $("childModal").classList.add("show");
  $("childName").focus();
}
function closeChildModal() {
  $("childModal").classList.remove("show");
  $("childForm").reset();
}
function closePinModal() {
  $("pinModal").classList.remove("show");
}
$("childModal").addEventListener("click", (e) => {
  if (e.target === $("childModal")) closeChildModal();
});
$("pinModal").addEventListener("click", (e) => {
  if (e.target === $("pinModal")) closePinModal();
});
$("childForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const child = {
    id: crypto.randomUUID(),
    name: $("childName").value.trim(),
    group: $("groupName").value.trim(),
    guardian: $("guardianName").value.trim(),
    phone: $("guardianPhone").value.trim(),
    pickups: $("pickupNames")
      .value.split(",")
      .map((n) => n.trim())
      .filter(Boolean),
    active: true,
  };
  children.push(child);
  save();
  render();
  closeChildModal();
  toast("Child added to demo registry.");
});
function archiveChild(id) {
  const c = children.find((x) => x.id === id);
  if (
    c &&
    confirm(
      `Archive ${c.name}? Their record will be hidden from active pickup lists.`,
    )
  ) {
    c.active = false;
    save();
    render();
    toast("Child archived; record retained in demo.");
  }
}
function restoreChild(id) {
  const c = children.find((x) => x.id === id);
  if (c) {
    c.active = true;
    save();
    render();
    toast("Child restored to active registry.");
  }
}
function toggleArchived() {
  showArchived = !showArchived;
  $("archivedToggle").textContent = showArchived
    ? "Show active"
    : "Show archived";
  renderChildren();
}
function issuePin(id) {
  let p = pins.find((x) => x.childId === id && x.day === todayKey && !x.used);
  if (!p) {
    const child = children.find((x) => x.id === id);
    p = {
      id: crypto.randomUUID(),
      childId: id,
      childName: child.name,
      guardian: child.guardian,
      day: todayKey,
      code: String(Math.floor(100000 + Math.random() * 900000)),
      used: false,
    };
    pins.push(p);
    save();
    render();
  }
  $("pinDescription").textContent =
    `For ${p.childName} · send to ${p.guardian} (${children.find((x) => x.id === id)?.phone || "guardian mobile"})`;
  $("pinValue").textContent = p.code;
  $("pinModal").classList.add("show");
}
$("verifyForm").addEventListener("submit", (e) => {
  e.preventDefault();

    const codeInput = $("verifyPin");
  const adultInput = $("verifyAdult");

  // Check required fields
  let valid = true;

  [codeInput, adultInput].forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("input-danger");
      valid = false;
    } else {
      input.classList.remove("input-danger");
    }
  });

  if (!valid) {
    toast("Please complete all required fields.");
    return;
  }

  ["verifyPin", "verifyAdult"].forEach((id) => {
  $(id).addEventListener("input", function () {
    if (this.value.trim()) {
      this.classList.remove("input-danger");
    }
  });
});

  const code = $("verifyPin").value.trim(),
    adult = $("verifyAdult").value.trim();
  const pin = pins.find(
    (p) => p.code === code && p.day === todayKey && !p.used,
  );
  if (!pin) {
    toast("Code not found, expired, or already used.");
    return;
  }
  const child = children.find((c) => c.id === pin.childId);
  if (!child || !child.active) {
    toast("This child is not active in the registry.");
    return;
  }
  const match = child.pickups.some(
    (n) => n.toLowerCase() === adult.toLowerCase(),
  );
  if (!match) {
    toast("That adult is not on this child’s approved pickup list.");
    return;
  }
  pin.used = true;
  const now = new Date();
  pickups.push({
    childId: child.id,
    childName: child.name,
    adult,
    day: todayKey,
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  });
  save();
  render();
  $("verifyForm").reset();
  toast(`Handover recorded for ${child.name}.`);
});
function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2800);
}
$("today").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
render();
