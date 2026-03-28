document.addEventListener("DOMContentLoaded",()=>{

const airports={
  LPPT:{
    name:"Lisbon",
    GND:[{name:"Aerodrome Chart",url:"https://ais.nav.pt/wp-content/uploads/AIS_Files/eAIP_Current/eAIP/graphics/eAIP/LP_AD_2_LPPT_01-1_en.pdf",priority:true}],
    runways:{
      "02":{SID:[{name:"LISBOA 2A",url:""}], STAR:[{name:"XAMAX 1A",url:"",priority:true}], APP:[{name:"ILS RWY02",url:"",priority:true}]},
      "20":{SID:[{name:"LISBOA 1B",url:""}], STAR:[], APP:[]}
    }
  }
};

const airportGrid=document.getElementById("airportGrid");
const panel=document.getElementById("panel");
const airportTitle=document.getElementById("airportTitle");
const tabs=document.getElementById("tabs");
const chartList=document.getElementById("chartList");
const runwaySelect=document.getElementById("runwaySelect");
const search=document.getElementById("search");

let currentAirport=null;
let currentRunway=null;

/* Render Airports */
function renderAirports(){
  Object.keys(airports).forEach(code=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`<h3>${code}</h3><p>${airports[code].name}</p>`;
    div.onclick=()=>openAirport(code);
    airportGrid.appendChild(div);
  });
}

/* Open Airport */
function openAirport(code){
  currentAirport=airports[code];
  panel.style.display="flex";
  panel.classList.add("open");
  airportTitle.innerText=`${code} — ${currentAirport.name}`;
  setupRunways();
  renderTabs();
}

/* Setup Runways */
function setupRunways(){
  runwaySelect.innerHTML="";
  const runways=Object.keys(currentAirport.runways);
  runways.forEach(rwy=>{
    const opt=document.createElement("option");
    opt.value=rwy;
    opt.textContent=rwy;
    runwaySelect.appendChild(opt);
  });
  currentRunway=runways[0];
  runwaySelect.onchange=()=>{currentRunway=runwaySelect.value; renderTabs();}
}

/* Tabs */
function renderTabs(){
  tabs.innerHTML="";
  ["GND","SID","STAR","APP"].forEach((type,i)=>{
    const tab=document.createElement("div");
    tab.className="tab"+(i===0?" active":"");
    tab.innerText=type;
    tab.onclick=()=>selectTab(type,tab);
    tabs.appendChild(tab);
  });
  selectTab("GND",tabs.children[0]);
}

/* Select Tab */
function selectTab(type,el){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  el.classList.add("active");
  chartList.querySelectorAll(".chart-card").forEach(c=>c.remove());

  const charts=type==="GND"?currentAirport.GND:(currentAirport.runways[currentRunway][type]||[]);
  charts.forEach(chart=>{
    const div=document.createElement("div");
    div.className="chart-card"+(chart.priority?" priority":"");
    div.innerHTML=`<div class="chart-title">${chart.name}</div><div class="chart-meta">${type} • RWY ${currentRunway||""}</div>`;
    div.onclick=()=>openChart(chart.url);
    chartList.appendChild(div);
  });
}

/* Chart Viewer */
function openChart(url){
  if(!url) return;
  const viewer=document.getElementById("viewer");
  const frame=document.getElementById("frame");
  viewer.style.display="flex";
  frame.src=url;
}

/* Close Functions */
window.closeViewer=()=>{document.getElementById("viewer").style.display="none"; document.getElementById("frame").src="";}
window.closePanel=()=>{panel.style.display="none";}

/* Search */
search.addEventListener("input",()=>{
  const q=search.value.toLowerCase();
  document.querySelectorAll(".chart-card").forEach(card=>{
    card.style.display=card.innerText.toLowerCase().includes(q)?"flex":"none";
  });
});

/* ESC */
document.addEventListener("keydown",e=>{if(e.key==="Escape") closeViewer();});

renderAirports();
});

const svgContainer = document.getElementById("svgContainer");
const airportSVG = document.getElementById("airportSVG");

let scale = 1;
const minScale = 1;   // cannot zoom out beyond original size
const maxScale = 3;   // max zoom in
const scaleStep = 0.1;

svgContainer.addEventListener("wheel", (e) => {
  e.preventDefault();

  if (e.deltaY < 0) {
    // Zoom in
    scale = Math.min(scale + scaleStep, maxScale);
  } else {
    // Zoom out
    scale = Math.max(scale - scaleStep, minScale);
  }

  airportSVG.style.transform = `scale(${scale})`;
  airportSVG.style.transformOrigin = "center center";
});
