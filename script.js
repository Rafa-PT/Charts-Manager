document.addEventListener("DOMContentLoaded", () => {

/* =========================
   DATA
========================= */
const airports = {
  LPPT: {
    name: "Lisbon",
    GND: [
      {
        name: "Aerodrome Chart",
        url: "https://ais.nav.pt/wp-content/uploads/AIS_Files/eAIP_Current/eAIP/graphics/eAIP/LP_AD_2_LPPT_01-1_en.pdf",
        priority: true
      }
    ],
    runways: {
      "02": {
        SID: [{ name: "LISBOA 2A", url: "" }],
        STAR: [{ name: "XAMAX 1A", url: "", priority: true }],
        APP: [{ name: "ILS RWY02", url: "", priority: true }]
      },
      "20": {
        SID: [{ name: "LISBOA 1B", url: "" }],
        STAR: [],
        APP: []
      }
    }
  }
};

/* =========================
   ELEMENTS
========================= */
const airportGrid = document.getElementById("airportGrid");
const panel = document.getElementById("panel");
const airportTitle = document.getElementById("airportTitle");
const tabs = document.getElementById("tabs");
const chartList = document.getElementById("chartList");
const runwaySelect = document.getElementById("runwaySelect");
const search = document.getElementById("search");

const svgContainer = document.getElementById("svgContainer");
const airportSVG = document.getElementById("airportSVG");

/* =========================
   STATE
========================= */
let currentAirport = null;
let currentRunway = null;

/* =========================
   AIRPORT UI
========================= */
function renderAirports() {
  Object.keys(airports).forEach(code => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h3>${code}</h3><p>${airports[code].name}</p>`;
    div.onclick = () => openAirport(code);
    airportGrid.appendChild(div);
  });
}

function openAirport(code) {
  currentAirport = airports[code];
  panel.style.display = "flex";
  panel.classList.add("open");
  airportTitle.innerText = `${code} — ${currentAirport.name}`;
  setupRunways();
  renderTabs();
}

function setupRunways() {
  runwaySelect.innerHTML = "";
  const runways = Object.keys(currentAirport.runways);

  runways.forEach(rwy => {
    const opt = document.createElement("option");
    opt.value = rwy;
    opt.textContent = rwy;
    runwaySelect.appendChild(opt);
  });

  currentRunway = runways[0];

  runwaySelect.onchange = () => {
    currentRunway = runwaySelect.value;
    renderTabs();
  };
}

function renderTabs() {
  tabs.innerHTML = "";

  ["GND","SID","STAR","APP"].forEach((type,i) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (i === 0 ? " active" : "");
    tab.innerText = type;
    tab.onclick = () => selectTab(type, tab);
    tabs.appendChild(tab);
  });

  selectTab("GND", tabs.children[0]);
}

function selectTab(type, el) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");

  chartList.querySelectorAll(".chart-card").forEach(c => c.remove());

  const charts = type === "GND"
    ? currentAirport.GND
    : (currentAirport.runways[currentRunway][type] || []);

  charts.forEach(chart => {
    const div = document.createElement("div");
    div.className = "chart-card" + (chart.priority ? " priority" : "");
    div.innerHTML = `
      <div class="chart-title">${chart.name}</div>
      <div class="chart-meta">${type} • RWY ${currentRunway || ""}</div>
    `;
    div.onclick = () => openChart(chart.url);
    chartList.appendChild(div);
  });
}

/* =========================
   VIEWER
========================= */
function openChart(url) {
  if (!url) return;
  const viewer = document.getElementById("viewer");
  const frame = document.getElementById("frame");
  viewer.style.display = "flex";
  frame.src = url;
}

window.closeViewer = () => {
  document.getElementById("viewer").style.display = "none";
  document.getElementById("frame").src = "";
};

window.closePanel = () => {
  panel.style.display = "none";
};

/* =========================
   SEARCH
========================= */
search.addEventListener("input", () => {
  const q = search.value.toLowerCase();
  document.querySelectorAll(".chart-card").forEach(card => {
    card.style.display =
      card.innerText.toLowerCase().includes(q) ? "flex" : "none";
  });
});

/* =========================
   KEYBOARD
========================= */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeViewer();
});

/* =========================
   ZOOM + PAN (FIXED)
========================= */
let scale = 1;
let posX = 0;
let posY = 0;

const minScale = 1;
const maxScale = 3;
const scaleStep = 0.1;

let isPanning = false;
let startX = 0;
let startY = 0;

function updateTransform() {
  airportSVG.style.transform =
    `translate(${posX}px, ${posY}px) scale(${scale})`;
}

/* ZOOM */
svgContainer.addEventListener("wheel", (e) => {
  e.preventDefault();

  if (e.deltaY < 0) {
    scale = Math.min(scale + scaleStep, maxScale);
  } else {
    scale = Math.max(scale - scaleStep, minScale);
  }

  updateTransform();
});

/* RIGHT CLICK PAN */
svgContainer.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    isPanning = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;

  posX = e.clientX - startX;
  posY = e.clientY - startY;

  updateTransform();
});

window.addEventListener("mouseup", () => {
  isPanning = false;
});

/* DISABLE RIGHT CLICK MENU */
svgContainer.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

/* INIT */
renderAirports();

});
