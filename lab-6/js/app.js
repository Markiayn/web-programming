// ЛР6 — відображення та фільтрація сенсорів у DOM.
import { NoiseSensor } from "./models/NoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
  { id: "NS-01", district: "Галицький", location: "просп. Свободи, 1", noiseLevel: 52 },
  { id: "NS-02", district: "Франківський", location: "вул. Наукова, 10", noiseLevel: 68 },
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола, 20", noiseLevel: 83 },
  { id: "NS-04", district: "Галицький", location: "вул. Городоцька, 15", noiseLevel: 79 },
];

// Готові об'єкти NoiseSensor з ЛР5: статус обчислює sensor.getStatus()
const system = new MonitoringSystem();
sensorsData.map(NoiseSensor.fromObject).forEach(sensor => system.addSensor(sensor));
const sensors = system.sensors;

// ---------------- Пошук DOM-елементів ----------------
const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");
const sensorCount = document.querySelector("#sensor-count");

// ---------------- Картка одного сенсора ----------------
function createSensorCard(sensor) {
  const status = sensor.getStatus();

  const card = document.createElement("article");
  card.classList.add("sensor-card");
  card.classList.add(`sensor-card--${status}`);

  const head = document.createElement("div");
  head.classList.add("sensor-card__head");

  const title = document.createElement("h3");
  title.textContent = sensor.id;

  const badge = document.createElement("span");
  badge.classList.add("sensor-card__status");
  badge.textContent = `Статус: ${status}`;

  head.append(title, badge);

  const level = document.createElement("p");
  level.classList.add("sensor-card__level");
  level.textContent = `${sensor.noiseLevel} дБ`;

  const district = document.createElement("p");
  district.textContent = `Район: ${sensor.district}`;

  const location = document.createElement("p");
  location.textContent = `Локація: ${sensor.location}`;

  card.append(head, level, district, location);
  return card;
}

// ---------------- Відображення масиву сенсорів ----------------
function renderSensors(sensorArray) {
  sensorList.replaceChildren();          // очищаємо попередні картки
  sensorArray.forEach((sensor) => {
    const card = createSensorCard(sensor);
    sensorList.append(card);
  });
  sensorCount.textContent = `Показано: ${sensorArray.length} з ${sensors.length}`;
}

// ---------------- Фільтрація ----------------
function applyFilters() {
  const selectedDistrict = districtFilter.value;
  const criticalOnly = criticalFilter.checked;

  const filteredSensors = sensors.filter((sensor) => {
    const matchesDistrict =
      selectedDistrict === "all" ||
      sensor.district === selectedDistrict;
    const matchesStatus =
      !criticalOnly ||
      sensor.getStatus() === "critical";
    return matchesDistrict && matchesStatus;
  });

  renderSensors(filteredSensors);
}

districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);

renderSensors(sensors);
