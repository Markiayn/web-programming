import { NoiseSensor } from "./NoiseSensor.js";

// Мобільний датчик Є РІЗНОВИДОМ NoiseSensor: та сама поведінка + стан батареї.
export class MobileNoiseSensor extends NoiseSensor {
  static LOW_BATTERY = 20;   // відсотків

  constructor(id, district, location, noiseLevel, batteryLevel) {
    super(id, district, location, noiseLevel);   // до super() звертатися до this не можна
    this.batteryLevel = batteryLevel;
  }

  needsCharging() {
    return this.batteryLevel < MobileNoiseSensor.LOW_BATTERY;
  }
}
