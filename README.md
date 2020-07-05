# BLE Scale Yunchen

Read weight and body measurements via BLE from a yunchen digital weight scale.

## Usage

```typescript
const MAGIC_BYTES = 'a5012cab505a29'

await DiscoveryService.startScanning(scale => {
  const measurement = await scale.getMeasurement(MAGIC_BYTES)
  console.log(measurement)
})
```

## Magic Bytes

The magic bytes encode the physique of the measured person including gender, age, and height.
They can be determined by downloading the [KeepFit App](https://apps.apple.com/us/app/keep-fit/id973815749), entering your data there and reading the magic bytes from a device pretending to be a scale.
