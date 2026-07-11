// The location/sync logic logs verbosely by design (useful on-device),
// but that's just noise in test output.
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'warn').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})
