"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryService = void 0;
const noble_1 = __importDefault(require("@abandonware/noble"));
const YunchenScale_1 = require("./YunchenScale");
let clientListener;
let discoveredScales = {};
noble_1.default.on('discover', peripheral => {
    const { id } = peripheral;
    if (!discoveredScales[id]) {
        discoveredScales[id] = new YunchenScale_1.YunchenScale(peripheral);
        if (clientListener)
            clientListener(discoveredScales[id]);
        // allow rediscovery 10 seconds after disconnect
        discoveredScales[id].on('disconnect', () => {
            setTimeout(() => delete discoveredScales[id], 10000);
        });
    }
});
exports.DiscoveryService = {
    async startScanning(listener) {
        clientListener = listener;
        await noble_1.default.startScanningAsync(YunchenScale_1.YunchenScale.serviceUUIDs, true);
    },
    async stopScanning() {
        discoveredScales = {};
        await noble_1.default.stopScanningAsync();
    },
    get discoveredScales() {
        return Object.values(discoveredScales);
    }
};
