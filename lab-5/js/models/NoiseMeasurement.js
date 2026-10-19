// Одне вимірювання рівня шуму в певний момент часу.
export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  isValid() {
    return Number.isFinite(this.value) && this.value >= 0 && this.value <= 200;
  }

  toString() {
    const time = this.measuredAt.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    return `${time} → ${this.value} dB`;
  }
}
