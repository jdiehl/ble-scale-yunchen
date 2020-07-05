import noble from '@abandonware/noble'
import { YunchenScale } from './YunchenScale'

let clientListener: ((scale: YunchenScale) => void) | undefined
let discoveredScales: Record<string, YunchenScale> = {}

noble.on('discover', peripheral => {
  const { id } = peripheral
  if (!discoveredScales[id]) {
    discoveredScales[id] = new YunchenScale(peripheral)
    if (clientListener) clientListener(discoveredScales[id])
    // allow rediscovery 10 seconds after disconnect
    discoveredScales[id].on('disconnect', () => {
      setTimeout(() => delete discoveredScales[id], 10000)
    })
  }
})

export const DiscoveryService = {

  async startScanning(listener: (scale: YunchenScale) => void): Promise<void> {
    clientListener = listener
    await noble.startScanningAsync(YunchenScale.serviceUUIDs, true)
  },

  async stopScanning(): Promise<void> {
    discoveredScales = {}
    await noble.stopScanningAsync()
  },

  get discoveredScales(): YunchenScale[] {
    return Object.values(discoveredScales)
  }

}
