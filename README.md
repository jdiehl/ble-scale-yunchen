# BLE Scale Yunchen

Read weight and body measurements via BLE from a yunchen digital weight scale.

## Usage

```typescript
const profile: YunchenScaleProfile = {
  gender: YunchenScaleProfileGender.Male,
  age: 30,
  height: 180,
  waistCircumference: 80,
  hipCircumference: 90
}

await DiscoveryService.startScanning(scale => {
  const measurement = await scale.getMeasurement(profile)
  console.log(measurement)
})
```

## Example Server

Run the example server that automatically discovers, connects, and reads measurements:

```bash
npm run example
```

The server logs scale discoveries, connections, and measurements to the console.
