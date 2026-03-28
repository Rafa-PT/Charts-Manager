document.addEventListener("DOMContentLoaded", () => {

const airports = {
  LPPT: {
    name: "Lisbon",
    charts: [
      {
        type: "GND",
        name: "Aerodrome Chart",
        url: "https://ais.nav.pt/wp-content/uploads/AIS_Files/eAIP_Current/eAIP/graphics/eAIP/LP_AD_2_LPPT_01-1_en.pdf"
      },

      { type: "SID", name: "RWY02 SID", url: "" },
      { type: "SID", name: "RWY20 SID", url: "" },

      { type: "STAR", name: "RWY02 STAR", url: "" },

      { type: "APP", name: "ILS RWY02", url: "" }
    ]
  }
};

const airportGrid = document.getElementById("airportGrid");
const panel = document.getElementById("panel");
const airportTitle = document.getElementById("airportTitle");
const tabs = document.getElementById("tabs");
const chartList = document.getElementById("chartList");

let currentAirport = null;

/* RENDER AIRPORTS */
function renderAirports() {
  Object.keys(airports).forEach(code => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h3>${code}</h3><p>${airports[code].name}</p>`;
    div.onclick = () => openAirport(code);
    airportGrid.appendChild(div);
  });
}

/* OPEN AIRPORT PANEL */
function openAirport(code) {
  currentAirport = airports[code];

  panel.classList.add("open");
  panel.style.display = "flex";

  airportTitle.innerText = `${code} — ${currentAirport.name}`;

  const categories = [...new Set(currentAirport.charts.map(c => c.type))];

  tabs.innerHTML = "";
  chartList.innerHTML = "";

  categories.forEach((cat, index) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (index === 0 ? " active" : "");
    tab.innerText = cat;
    tab.onclick = () => selectTab(cat, tab);
    tabs.appendChild(tab);
  });

  selectTab(categories[0], tabs.children[0]);
}

/* SELECT TAB */
function selectTab(type, el) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");

  chartList.innerHTML = "";

  currentAirport.charts
    .filter(c => c.type === type)
    .forEach(chart => {
      const div = document.createElement("div");
      div.className = "chart-card";
      div.innerHTML = `
        <div class="chart-title">${chart.name}</div>
        <div class="chart-meta">${type} • PDF</div>
      `;
      div.onclick = () => openChart(chart.url);
      chartList.appendChild(div);
    });
}

/* OPEN CHART */
function openChart(url) {
  if (!url) return;

  const viewer = document.getElementById("viewer");
  const frame = document.getElementById("frame");

  viewer.style.display = "flex";
  frame.src = url;
}

/* CLOSE VIEWER */
window.closeViewer = function () {
  document.getElementById("viewer").style.display = "none";
  document.getElementById("frame").src = "";
};

/* CLOSE PANEL WITH ANIMATION */
window.closePanel = function () {
  panel.classList.remove("open");
  panel.classList.add("closing");

  setTimeout(() => {
    panel.style.display = "none";
    panel.classList.remove("closing");
  }, 250);
};

renderAirports();

});
