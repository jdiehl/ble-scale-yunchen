import { DiscoveryService, YunchenScale, YunchenScaleProfile, YunchenScaleProfileGender } from './src'

// Configure user profile for accurate measurements
const profile: YunchenScaleProfile = {
  gender: YunchenScaleProfileGender.Male,
  age: 30,
  height: 175,
  waistCircumference: 80,
  hipCircumference: 90
}

console.log('Starting BLE scale discovery...')

// Start scanning for scales
DiscoveryService.startScanning(async (scale: YunchenScale) => {
  console.log(`\n[DISCOVERY] Found scale: ${scale.name} (${scale.id})`)
  console.log('[DISCOVERY] Connecting...')

  scale.on('disconnect', () => {
    console.log(`[DISCONNECT] Scale ${scale.name} disconnected`)
  })

  try {
    console.log('[MEASUREMENT] Querying measurement...')
    const measurement = await scale.getMeasurement(profile)
    
    console.log('[MEASUREMENT] Received:')
    console.log(`  Weight: ${measurement.weight} kg`)
    console.log(`  Body Fat: ${measurement.fat}%`)
    console.log(`  Water: ${measurement.water}%`)
    console.log(`  Muscle: ${measurement.muscle}%`)
    console.log(`  Bone Mass: ${measurement.bone}`)
    console.log(`  Calories: ${measurement.calories} kcal`)
    console.log(`  Body Age: ${measurement.bodyage} years`)
  } catch (error) {
    console.error('[ERROR] Failed to get measurement:', error)
  }
}).catch(err => {
  console.error('[ERROR] Failed to start scanning:', err)
  process.exit(1)
})

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...')
  await DiscoveryService.stopScanning()
  process.exit(0)
})

console.log('Scanning for BLE scales. Press Ctrl+C to stop.')
