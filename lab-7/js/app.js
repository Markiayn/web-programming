// ЛР7 — завантаження сенсорів з MockAPI та відображення на сторінці.
// MockAPI → fetch() → response.json() → масив sensors → renderSensors(sensors) → картки
import { classifyNoise } from "./models/noiseLimits.js";

const API_URL = "https://6ad55b4548476c0785d97467.mockapi.io/api/v1/sensors";

const container = document.querySelector("#sensors-list");
const stateMessage = document.querySelector("#sensors-state");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");
const sensorCount = document.querySelector("#sensor-count");

let sensors = [];   // дані з API; у коді більше немає готового масиву

// ---------------- Завантаження (тільки отримання даних) ----------------
async function loadSensors() {
  showState("Завантаження даних…");
  try {
    const response = await fetch(API_URL);            // 1-й await: HTTP-відповідь (Response)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    sensors = await response.json();                  // 2-й await: тіло JSON → масив
    console.log(`GET ${API_URL} → ${response.status}, сенсорів: ${sensors.length}`);
    fillDistrictOptions(sensors);
    hideState();
    renderSensors(sensors);
  } catch (error) {
    console.error("Не вдалося завантажити сенсори:", error);
    container.replaceChildren();
    showState("Не вдалося завантажити дані. Перевірте з’єднання та оновіть сторінку.", true);
  }
}

// ---------------- Відображення (без fetch) ----------------
function renderSensors(sensorArray) {
  container.innerHTML = "";
  sensorArray.forEach((sensor) => {
    container.append(createSensorCard(sensor));
  });
  sensorCount.textContent = `Показано: ${sensorArray.length} з ${sensors.length}`;
  if (sensors.length > 0 && sensorArray.length === 0) {
    showState("За вибраними умовами сенсорів немає.");
  } else {
    hideState();
  }
}

function createSensorCard(sensor) {
  const noise = classifyNoise(sensor.noiseLevel);

  const card = document.createElement("article");
  card.classList.add("sensor-card", `sensor-card--${noise}`);
  if (sensor.status === "inactive") {
    card.classList.add("sensor-card--inactive");
  }

  // textContent замість innerHTML для даних з API — захист від вставки розмітки
  const head = document.createElement("div");
  head.classList.add("sensor-card__head");
  const title = document.createElement("h3");
  title.textContent = sensor.name;
  const badge = document.createElement("span");
  badge.classList.add("sensor-card__status");
  badge.textContent = sensor.status;
  head.append(title, badge);

  const level = document.createElement("p");
  level.classList.add("sensor-card__level");
  level.textContent = `${sensor.noiseLevel} дБ`;

  const district = document.createElement("p");
  district.textContent = `Район: ${sensor.district}`;

  const meta = document.createElement("p");
  meta.classList.add("sensor-card__meta");
  meta.textContent = `ID ${sensor.id} · рівень шуму: ${noise}`;

  card.append(head, level, district, meta);
  return card;
}

// ---------------- Фільтри (з ЛР6), райони беруться з отриманих даних ----------------
function fillDistrictOptions(sensorArray) {
  const districts = [...new Set(sensorArray.map(sensor => sensor.district))].sort((a, b) => a.localeCompare(b, "uk"));
  districts.forEach((district) => {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    districtFilter.append(option);
  });
}

function applyFilters() {
  const selectedDistrict = districtFilter.value;
  const criticalOnly = criticalFilter.checked;
  const filtered = sensors.filter((sensor) => {
    const matchesDistrict = selectedDistrict === "all" || sensor.district === selectedDistrict;
    const matchesStatus = !criticalOnly || classifyNoise(sensor.noiseLevel) === "critical";
    return matchesDistrict && matchesStatus;
  });
  renderSensors(filtered);
}

// ---------------- Стан завантаження / помилки ----------------
function showState(text, isError = false) {
  stateMessage.textContent = text;
  stateMessage.hidden = false;
  stateMessage.classList.toggle("sensors__state--error", isError);
}

function hideState() {
  stateMessage.hidden = true;
}

districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);

loadSensors();
