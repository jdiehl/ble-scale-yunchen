"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YunchenScale = void 0;
const events_1 = require("events");
// Doc: https://github.com/oliexdev/openScale/blob/master/android_app/app/src/main/java/com/health/openscale/core/bluetooth/BluetoothHesley.java
function mapByUUID(items) {
    const index = {};
    for (const item of items) {
        index[item.uuid] = item;
    }
    return index;
}
function getUInt16(buf, index) {
    return ((buf[index] & 0xFF) << 8) | (buf[index + 1] & 0xFF);
}
const WEIGHT_MEASUREMENT_SERVICE = 'fff0';
const WEIGHT_MEASUREMENT_CHARACTERISTIC = 'fff4';
const CMD_MEASUREMENT_CHARACTERISTIC = 'fff1';
class YunchenScale extends events_1.EventEmitter {
    constructor(peripheral) {
        super();
        this.peripheral = peripheral;
        this.services = {};
        this.characteristics = {};
    }
    get id() {
        return this.peripheral.id;
    }
    get name() {
        return this.peripheral.advertisement.localName;
    }
    async getMeasurement(bytes) {
        await this.connect();
        await this.discoverServicesAndCharacteristics();
        await this.subscribeToWeightMeasurements();
        this.sendMagicBytes(bytes);
        const measurement = await this.waitForDefiniteWeightMeasurement();
        await this.disconnect();
        return measurement;
    }
    get serviceUUIDs() {
        return [WEIGHT_MEASUREMENT_SERVICE];
    }
    get characteristicsUUIDs() {
        return [WEIGHT_MEASUREMENT_CHARACTERISTIC, CMD_MEASUREMENT_CHARACTERISTIC];
    }
    // connect to the device
    async connect() {
        return new Promise((resolve, reject) => {
            this.peripheral.connect(err => {
                err ? reject(err) : resolve();
            });
        });
    }
    // disconnect from the device
    async disconnect() {
        return new Promise((resolve) => {
            if (this.sendId)
                clearInterval(this.sendId);
            this.peripheral.disconnect(() => resolve());
            this.emit('disconnect');
        });
    }
    // discover required services and characteristics
    async discoverServicesAndCharacteristics() {
        return new Promise((resolve, reject) => {
            this.peripheral.discoverSomeServicesAndCharacteristics(this.serviceUUIDs, this.characteristicsUUIDs, (err, services, characteristics) => {
                if (err)
                    return reject(err);
                this.services = mapByUUID(services);
                this.characteristics = mapByUUID(characteristics);
                resolve();
            });
        });
    }
    // subscribe to weight measurements
    // start emitting 'measurement'
    async subscribeToWeightMeasurements() {
        return new Promise((resolve, reject) => {
            const c = this.characteristics[WEIGHT_MEASUREMENT_CHARACTERISTIC];
            c.on('read', buf => {
                this.emit('measurement', this.parseWeightMeasurement(buf));
            });
            c.subscribe(err => {
                err ? reject(err) : resolve();
            });
        });
    }
    // send magic bytes
    sendMagicBytes(bytes) {
        // a5 [male=00,female=01] [age] [height] 50 5a [??]
        const buf = Buffer.from(bytes, 'hex');
        const c = this.characteristics[CMD_MEASUREMENT_CHARACTERISTIC];
        this.sendId = setInterval(() => c.write(buf, false), 1000);
    }
    // wait for a definite measurement
    async waitForDefiniteWeightMeasurement() {
        return new Promise((resolve) => {
            const listener = (measurement) => {
                if (measurement.bodyage) {
                    this.off('measurement', listener);
                    resolve(measurement);
                }
            };
            this.on('measurement', listener);
        });
    }
    parseWeightMeasurement(buf) {
        return {
            bodyage: buf[17],
            weight: getUInt16(buf, 2) / 100.0,
            fat: getUInt16(buf, 4) / 10.0,
            water: getUInt16(buf, 8) / 10.0,
            muscle: getUInt16(buf, 10) / 10.0,
            bone: getUInt16(buf, 12) / 10.0,
            calories: getUInt16(buf, 14),
        };
    }
}
exports.YunchenScale = YunchenScale;
YunchenScale.serviceUUIDs = [WEIGHT_MEASUREMENT_SERVICE];
