// Ініціалізація та інтеграція класів зі сторінкою «Акустична варта».
import { NoiseSensor } from "./models/NoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
  { id: "NS-01", district: "Галицький", location: "просп. Свободи", noiseLevel: 58 },
  { id: "NS-02", district: "Франківський", location: "вул. Наукова", noiseLevel: 74 },
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола", noiseLevel: 83 },
];

// plain objects → екземпляри NoiseSensor через static-фабрику (з перевіркою полів)
const system = new MonitoringSystem();
sensorsData.map(NoiseSensor.fromObject).forEach(sensor => system.addSensor(sensor));

// ---------------- Представлення (не методи моделі) ----------------
const STATUS_LABELS = { normal: "Норма", warning: "Попередження", critical: "Критичний" };

function renderSensorCard(sensor) {
  const status = sensor.getStatus();          // правила 55 / 70 тут не дублюються
  const card = document.createElement("article");
  card.className = `sensor-card ${status}`;

  const head = document.createElement("div");
  head.className = "sensor-card__head";
  const title = document.createElement("h3");
  title.textContent = sensor.id;
  const badge = document.createElement("span");
  badge.className = "sensor-card__status";
  badge.textContent = `${STATUS_LABELS[status]} · ${status}`;
  head.append(title, badge);

  const level = document.createElement("p");
  level.className = "sensor-card__level";
  level.textContent = `${sensor.noiseLevel} дБ`;

  const district = document.createElement("p");
  district.textContent = `Район: ${sensor.district}`;
  const location = document.createElement("p");
  location.textContent = `Адреса: ${sensor.location}`;
  const history = document.createElement("p");
  history.className = "sensor-card__meta";
  history.textContent = `Вимірювань в історії: ${sensor.measurements.length}`;

  card.append(head, level, district, location, history);
  return card;
}

const sensorList = document.querySelector("#sensor-list");
const averageOutput = document.querySelector("#sensors-average");
const criticalOutput = document.querySelector("#sensors-critical");

function renderSystem() {
  sensorList.replaceChildren(...system.sensors.map(renderSensorCard));
  averageOutput.textContent = `${system.getAverageNoiseLevel().toFixed(2)} дБ`;
  criticalOutput.textContent = system.getCriticalSensors().map(sensor => sensor.id).join(", ") || "немає";
}

renderSystem();

// Нове вимірювання для NS-01 → змінюється noiseLevel і статус → повторний рендеринг
const demoValues = [49, 66, 77];
let demoStep = 0;
const addButton = document.querySelector("#add-measurement");
const measurementLog = document.querySelector("#measurement-log");

addButton.addEventListener("click", () => {
  const sensor = system.findSensorById("NS-01");
  const measurement = new NoiseMeasurement(demoValues[demoStep % demoValues.length]);
  demoStep++;
  sensor.addMeasurement(measurement);
  measurementLog.textContent = `NS-01: ${measurement.toString()}, статус — ${sensor.getStatus()}`;
  renderSystem();
});

// ---------------- Експерименти в Console ----------------
console.group("ЛР5 — система класів");
console.log("Сенсори в системі:", system.sensors);
console.log("Статуси:", system.sensors.map(sensor => `${sensor.id}: ${sensor.getStatus()}`).join(", "));
console.log("findSensorById('NS-02'):", system.findSensorById("NS-02"));
console.log("findSensorById('NS-99'):", system.findSensorById("NS-99"));
console.log("getSensorsByDistrict('Галицький'):", system.getSensorsByDistrict("Галицький"));
console.log("getCriticalSensors():", system.getCriticalSensors().map(sensor => sensor.id));
console.log("getAverageNoiseLevel():", system.getAverageNoiseLevel().toFixed(2));
console.log("Порожня система, середнє:", new MonitoringSystem().getAverageNoiseLevel());

// два екземпляри мають незалежний стан
const sensorA = new NoiseSensor("T-A", "Галицький", "вул. Тестова, 1", 50);
const sensorB = new NoiseSensor("T-B", "Галицький", "вул. Тестова, 2", 50);
sensorA.updateNoiseLevel(80);
console.log("sensorA.noiseLevel =", sensorA.noiseLevel, "| sensorB.noiseLevel =", sensorB.noiseLevel);

// prototype: метод спільний, властивість — власна
console.log("sensorA.getStatus === sensorB.getStatus:", sensorA.getStatus === sensorB.getStatus);
console.log("Object.hasOwn(sensorA, 'noiseLevel'):", Object.hasOwn(sensorA, "noiseLevel"));
console.log("Object.hasOwn(sensorA, 'getStatus'):", Object.hasOwn(sensorA, "getStatus"));
console.log("getStatus у NoiseSensor.prototype:", Object.hasOwn(NoiseSensor.prototype, "getStatus"));

// static викликається через клас
console.log("NoiseSensor.isValidNoiseLevel(74):", NoiseSensor.isValidNoiseLevel(74));
console.log("NoiseSensor.isValidNoiseLevel(-5):", NoiseSensor.isValidNoiseLevel(-5));
console.log("sensorA.isValidNoiseLevel:", sensorA.isValidNoiseLevel);   // undefined — static не на екземплярі

// помилки валідації
try {
  system.addSensor(NoiseSensor.fromObject(sensorsData[0]));
} catch (error) {
  console.warn("Дубль id:", error.message);
}
try {
  sensorA.updateNoiseLevel(500);
} catch (error) {
  console.warn("updateNoiseLevel(500):", error.message);
}

// наслідування: MobileNoiseSensor є різновидом NoiseSensor
const mobile = new MobileNoiseSensor("MNS-01", "Личаківський", "пл. Ринок (мобільний пост)", 64, 15);
console.log("MobileNoiseSensor:", mobile.getStatus(), "| needsCharging:", mobile.needsCharging(),
  "| instanceof NoiseSensor:", mobile instanceof NoiseSensor);

// втрата this при відриві методу від об'єкта
const detached = sensorA.getStatus;
try {
  detached();
} catch (error) {
  console.warn("const fn = sensor.getStatus; fn() →", error.name, error.message);
}
console.groupEnd();
