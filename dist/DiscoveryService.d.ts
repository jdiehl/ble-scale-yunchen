import { YunchenScale } from './YunchenScale';
export declare const DiscoveryService: {
    startScanning(listener: (scale: YunchenScale) => void): Promise<void>;
    stopScanning(): Promise<void>;
    readonly discoveredScales: YunchenScale[];
};
//# sourceMappingURL=DiscoveryService.d.ts.map