import { NOISE_LIMITS } from "./noiseLimits.js";
import { NoiseMeasurement } from "./NoiseMeasurement.js";

// Фізичний датчик шуму в конкретній точці міста.
export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new Error(`Некоректний рівень шуму для ${id}: ${noiseLevel}`);
    }
    // власні властивості кожного екземпляра
    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = [];        // окрема історія для кожного датчика
  }

  // Статус за централізованими межами NOISE_LIMITS
  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
      return "normal";
    }
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
      return "warning";
    }
    return "critical";
  }

  // Спочатку перевірка, лише потім зміна стану
  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new Error(`Некоректний рівень шуму: ${value}`);
    }
    this.noiseLevel = value;
  }

  // Композиція: датчик містить масив NoiseMeasurement
  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new Error("Очікується об'єкт NoiseMeasurement");
    }
    this.updateNoiseLevel(measurement.value);
    this.measurements.push(measurement);
  }

  // static: перевірка не залежить від стану конкретного датчика
  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= 0 && value <= 200;
  }

  // static-фабрика: plain object → екземпляр NoiseSensor
  static fromObject(data) {
    const required = ["id", "district", "location", "noiseLevel"];
    for (const field of required) {
      if (data[field] === undefined) {
        throw new Error(`У даних сенсора немає поля «${field}»`);
      }
    }
    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
  }
}
