/// <reference types="node" />
import { EventEmitter } from 'events';
import { Service, Peripheral, Characteristic } from '@abandonware/noble';
import { YunchenScaleMeasurement } from './YunchenScaleMeasurement';
import { YunchenScaleProfile } from './YunchenScaleProfile';
export declare class YunchenScale extends EventEmitter {
    protected peripheral: Peripheral;
    static serviceUUIDs: string[];
    protected services: Record<string, Service>;
    protected characteristics: Record<string, Characteristic>;
    protected sendId: any;
    constructor(peripheral: Peripheral);
    get id(): string;
    get name(): string;
    getMeasurement(profile: YunchenScaleProfile): Promise<YunchenScaleMeasurement>;
    protected get serviceUUIDs(): string[];
    protected get characteristicsUUIDs(): string[];
    protected connect(): Promise<void>;
    protected disconnect(): Promise<void>;
    protected discoverServicesAndCharacteristics(): Promise<void>;
    protected subscribeToWeightMeasurements(): Promise<void>;
    protected computeMagicBytes(profile: YunchenScaleProfile): Buffer;
    protected sendMagicBytes(profile: YunchenScaleProfile): void;
    protected waitForDefiniteWeightMeasurement(): Promise<YunchenScaleMeasurement>;
    protected parseWeightMeasurement(buf: Buffer): YunchenScaleMeasurement;
}
//# sourceMappingURL=YunchenScale.d.ts.map