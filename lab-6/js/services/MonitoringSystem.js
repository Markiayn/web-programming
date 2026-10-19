import { NoiseSensor } from "../models/NoiseSensor.js";

// Керує колекцією датчиків: додавання, пошук, фільтрація, агрегація.
export class MonitoringSystem {
  constructor() {
    this.sensors = [];   // композиція: MonitoringSystem → NoiseSensor[]
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new Error("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.findSensorById(sensor.id)) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
  }

  // undefined, якщо датчика з таким id немає
  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id);
  }

  // новий масив, вихідна колекція не змінюється
  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  // правило класифікації бере sensor.getStatus(), тут чисел 55/70 немає
  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === "critical");
  }

  // null для порожньої колекції
  getAverageNoiseLevel() {
    if (this.sensors.length === 0) {
      return null;
    }
    const sum = this.sensors.reduce((total, sensor) => total + sensor.noiseLevel, 0);
    return sum / this.sensors.length;
  }
}
