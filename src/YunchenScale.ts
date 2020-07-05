import { EventEmitter } from 'events'
import { Service, Peripheral, Characteristic } from '@abandonware/noble'
import { YunchenScaleMeasurement } from './YunchenScaleMeasurement'

// Doc: https://github.com/oliexdev/openScale/blob/master/android_app/app/src/main/java/com/health/openscale/core/bluetooth/BluetoothHesley.java

function mapByUUID<T>(items: T[]) {
  const index: Record<string, T> = {}
  for (const item of items) {
    index[(item as any).uuid] = item
  }
  return index
}

function getUInt16(buf: Buffer, index: number) {
  return ((buf[index] & 0xFF) << 8) | (buf[index + 1] & 0xFF)
}

const WEIGHT_MEASUREMENT_SERVICE = 'fff0'
const WEIGHT_MEASUREMENT_CHARACTERISTIC = 'fff4'
const CMD_MEASUREMENT_CHARACTERISTIC = 'fff1'

export class YunchenScale extends EventEmitter {

  static serviceUUIDs = [WEIGHT_MEASUREMENT_SERVICE]
  
  protected services: Record<string, Service> = {}
  protected characteristics: Record<string, Characteristic> = {}
  protected sendId: any

  constructor(protected peripheral: Peripheral) {
    super()
  }

  get id(): string {
    return this.peripheral.id
  }

  get name(): string {
    return this.peripheral.advertisement.localName
  }

  async getMeasurement(bytes: string): Promise<YunchenScaleMeasurement> {
    await this.connect()
    await this.discoverServicesAndCharacteristics()
    await this.subscribeToWeightMeasurements()
    this.sendMagicBytes(bytes)
    const measurement = await this.waitForDefiniteWeightMeasurement()
    await this.disconnect()
    return measurement
  }

  protected get serviceUUIDs(): string[] {
    return [WEIGHT_MEASUREMENT_SERVICE]
  }

  protected get characteristicsUUIDs(): string[] {
    return [WEIGHT_MEASUREMENT_CHARACTERISTIC, CMD_MEASUREMENT_CHARACTERISTIC]
  }

  // connect to the device
  protected async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.peripheral.connect(err => {
        err ? reject(err) : resolve()
      })
    })
  }

  // disconnect from the device
  protected async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.sendId) clearInterval(this.sendId)
      this.peripheral.disconnect(() => resolve())
      this.emit('disconnect')
    })
  }

  // discover required services and characteristics
  protected async discoverServicesAndCharacteristics(): Promise<void> {
    return new Promise<any>((resolve, reject) => {
      this.peripheral.discoverSomeServicesAndCharacteristics(this.serviceUUIDs, this.characteristicsUUIDs, (err, services, characteristics) => {
      if (err) return reject(err)
        this.services = mapByUUID(services)
        this.characteristics = mapByUUID(characteristics)
        resolve()
      })
    })
  }

  // subscribe to weight measurements
  // start emitting 'measurement'
  protected async subscribeToWeightMeasurements(): Promise<void> {
    return new Promise((resolve, reject) => {
      const c = this.characteristics[WEIGHT_MEASUREMENT_CHARACTERISTIC]
      c.on('read', buf => {
        this.emit('measurement', this.parseWeightMeasurement(buf))
      })
      c.subscribe(err => {
        err ? reject(err) : resolve()
      })
    })
  }

  // send magic bytes
  protected sendMagicBytes(bytes: string): void {
    // a5 [male=00,female=01] [age] [height] 50 5a [??]
    const buf = Buffer.from(bytes, 'hex')
    const c = this.characteristics[CMD_MEASUREMENT_CHARACTERISTIC]
    this.sendId = setInterval(() => c.write(buf, false), 1000)
  }

  // wait for a definite measurement
  protected async waitForDefiniteWeightMeasurement(): Promise<YunchenScaleMeasurement> {
    return new Promise((resolve) => {
      const listener = (measurement: any) => {
        if (measurement.bodyage) {
          this.off('measurement', listener)
          resolve(measurement)
        }
      }
      this.on('measurement', listener)
    })
  }

  protected parseWeightMeasurement(buf: Buffer): YunchenScaleMeasurement {
    return {
      bodyage: buf[17],
      weight: getUInt16(buf, 2) / 100.0,
      fat: getUInt16(buf, 4) / 10.0,
      water: getUInt16(buf, 8) / 10.0,
      muscle: getUInt16(buf, 10) / 10.0,
      bone: getUInt16(buf, 12) / 10.0,
      calories: getUInt16(buf, 14),
    }
  }

}
