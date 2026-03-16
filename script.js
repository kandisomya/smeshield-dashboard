/* SME Shield Dashboard - Logic & Simulation */
 
// 1. SCENARIOS & DATA
const scenarios = [
  { name:"Ransomware", user:"rahul@company.com", device:"FINANCE-PC-07",
    logs:["Mass file encryption detected","Shadow copy deletion attempt","500+ files modified"],
    risk:"HIGH", actions:["Device isolated","Process terminated","Account suspended"] },
  { name:"Phishing Login", user:"anita@company.com", device:"HR-LAPTOP-02",
    logs:["Suspicious email link clicked","Login from Vietnam","Credential reuse detected"],
    risk:"MEDIUM", actions:["Session terminated","Password reset","Admin notified"] },
  { name:"Brute Force", user:"system", device:"WEB-SERVER-01",
    logs:["Multiple failed logins","Malicious IP flagged","Port scan detected"],
    risk:"MEDIUM", actions:["IP blocked","Firewall updated","Admin notified"] },
  { name:"Insider Exfiltration", user:"gazel@company.com", device:"SALES-PC-03",
    logs:["Large USB data transfer","Restricted folder access","After-hours activity"],
    risk:"HIGH", actions:["USB disabled","Account suspended","Transfer blocked"] },
  { name:"Impossible Travel", user:"neha@company.com", device:"MARKETING-LAPTOP-05",
    logs:["Login from India","Login from Germany in 5 mins","UEBA anomaly"],
    risk:"LOW", actions:["User verification","Admin notified"] }
];

const devices = [
  { device:"FINANCE-PC-07", user:"rahul", status:"LOW" },
  { device:"HR-LAPTOP-02", user:"anita", status:"LOW" },
  { device:"WEB-SERVER-01", user:"system", status:"LOW" },
  { device:"SALES-PC-03", user:"gazel", status:"LOW" },
  { device:"MARKETING-LAPTOP-05", user:"neha", status:"LOW" }
];

let threatCounter = 0;
let totalDetectTime = 0;
let totalContainTime = 0;
let simulationCount = 0;

/* ---------- 2. THEME TOGGLE LOGIC ---------- */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// Check for saved theme
if (localStorage.getItem('theme') === 'light') {
  enableLightMode();
}

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('light-mode')) {
    enableDarkMode();
  } else {
    enableLightMode();
  }
});

function enableLightMode() {
  body.classList.add('light-mode');
  themeIcon.textContent = '☀️';
  localStorage.setItem('theme', 'light');
  updateGaugeBackground('#e2e8f0'); // Light grey background
}

function enableDarkMode() {
  body.classList.remove('light-mode');
  themeIcon.textContent = '🌙';
  localStorage.setItem('theme', 'dark');
  updateGaugeBackground('#1e293b'); // Dark blue-grey background
}

function updateGaugeBackground(color) {
  if (riskGauge) {
    riskGauge.data.datasets[0].backgroundColor[1] = color;
    riskGauge.update();
  }
}

/* ---------- 3. RISK GAUGE (CHART.JS) ---------- */
const ctx = document.getElementById("riskGauge").getContext("2d");
const riskGauge = new Chart(ctx, {
  type: "doughnut",
  data: {
    datasets: [{
      data: [0, 100],
      backgroundColor: ["#22c55e", body.classList.contains('light-mode') ? "#e2e8f0" : "#1e293b"],
      borderWidth: 0
    }]
  },
  options: {
    cutout: "82%",
    responsive: true,
    maintainAspectRatio: true,
    plugins: { tooltip: { enabled: false } }
  }
});

function updateGauge(risk) {
  const value = risk === "HIGH" ? 92 : risk === "MEDIUM" ? 64 : 28;
  const color = risk === "HIGH" ? "#ef4444" : risk === "MEDIUM" ? "#eab308" : "#22c55e";
  
  riskGauge.data.datasets[0].data = [value, 100 - value];
  riskGauge.data.datasets[0].backgroundColor[0] = color;
  riskGauge.update();

  const textEl = document.getElementById("riskPercent");
  textEl.textContent = `${value}%`;
  textEl.style.color = color;
}

/* ---------- 4. DASHBOARD RENDERERS ---------- */
function renderDevices() {
  const table = document.getElementById("deviceTable");
  table.innerHTML = "";
  devices.forEach(d => {
    const row = `<tr>
      <td>${d.device}</td>
      <td>${d.user}</td>
      <td class="status-text ${d.status.toLowerCase()}">${d.status}</td>
    </tr>`;
    table.innerHTML += row;
  });
}

function addLog(message) {
  const logStream = document.getElementById("logStream");
  const li = document.createElement("li");
  li.textContent = `> ${message}`;
  logStream.appendChild(li);
  logStream.scrollTop = logStream.scrollHeight;
}

function activateStep(stepId) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(stepId).classList.add("active");
}

function updateMetrics(detectTime, containTime) {
  simulationCount++;
  totalDetectTime += detectTime;
  totalContainTime += containTime;
  document.getElementById("mttd").textContent = (totalDetectTime / simulationCount).toFixed(1);
  document.getElementById("mttc").textContent = (totalContainTime / simulationCount).toFixed(1);
}

/* ---------- 5. ATTACK SIMULATION ENGINE ---------- */
function simulateAttack() {
  // Reset logs and select random threat
  document.getElementById("logStream").innerHTML = "";
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  threatCounter++;
  document.getElementById("threatCount").textContent = threatCounter;

  // Generate random performance metrics
  const detectTime = parseFloat((Math.random() * 2 + 1).toFixed(1));
  const containTime = parseFloat((Math.random() * 2 + 3).toFixed(1));

  let step = 1;
  const pipelineSteps = ["step1","step2","step3","step4","step5","step6"];

  // Visual Pipeline Animation
  const interval = setInterval(() => {
    if (step <= pipelineSteps.length) {
      activateStep(pipelineSteps[step - 1]);
      if (scenario.logs[step - 1]) addLog(scenario.logs[step - 1]);
      step++;
    } else {
      clearInterval(interval);
      finishSimulation(scenario, detectTime, containTime);
    }
  }, 600);
}

function finishSimulation(scenario, detectTime, containTime) {
  activateStep("step7");
  
  // Update UI Status Labels
  const riskLabel = document.getElementById("riskLevel");
  riskLabel.textContent = scenario.risk;
  riskLabel.className = `value status-text ${scenario.risk.toLowerCase()}`;
  
  // Update Analytics
  updateGauge(scenario.risk);
  updateMetrics(detectTime, containTime);

  // Update Table Data
  devices.forEach(d => { if (d.device === scenario.device) d.status = scenario.risk; });
  renderDevices();

  // Populate Incident Panel
  const actions = scenario.actions.map(a => `<li>✅ ${a}</li>`).join("");
  document.getElementById("incidentBox").innerHTML = `
    <div style="border-left: 4px solid var(--danger); padding-left: 10px;">
      <p style="margin: 0;"><strong>Incident:</strong> ${scenario.name}</p>
      <p style="margin: 5px 0;"><strong>Source:</strong> ${scenario.device}</p>
      <ul style="padding-left: 20px; margin: 10px 0;">${actions}</ul>
    </div>
  `;
}

// Initial Run
renderDevices();
