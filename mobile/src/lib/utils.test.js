import { truncateName, fmtDuration, fmtFeedDate } from './utils'

describe('truncateName', () => {
  it('leaves short names untouched', () => {
    expect(truncateName('alex')).toBe('alex')
  })

  it('truncates names longer than 10 characters with an ellipsis', () => {
    expect(truncateName('alexandria')).toBe('alexandria')
    expect(truncateName('alexandriaa')).toBe('alexandria…')
  })
})

describe('fmtDuration', () => {
  it('formats sub-minute durations as 0m', () => {
    expect(fmtDuration(0)).toBe('0m')
    expect(fmtDuration(59)).toBe('0m')
  })

  it('formats minutes-only durations', () => {
    expect(fmtDuration(60)).toBe('1m')
    expect(fmtDuration(150)).toBe('2m')
  })

  it('formats whole-hour durations without a minutes component', () => {
    expect(fmtDuration(3600)).toBe('1h')
    expect(fmtDuration(7200)).toBe('2h')
  })

  it('formats hours and minutes together', () => {
    expect(fmtDuration(3661)).toBe('1h 1m')
    expect(fmtDuration(9000)).toBe('2h 30m')
  })
})

describe('fmtFeedDate', () => {
  it('formats a date as a lowercase short month/day/year string', () => {
    expect(fmtFeedDate(new Date(2026, 0, 5))).toBe('jan 5, 2026')
    expect(fmtFeedDate(new Date(2026, 6, 21))).toBe('jul 21, 2026')
  })
})
