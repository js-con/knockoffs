import { pLimit } from '.';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'

function asyncFun(val, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(val)
    }, delay);
    vi.advanceTimersByTimeAsync(delay)
    // vi.advanceTimersByTime(delay)
    // vi.runAllTimers()
  })
}

describe('p-limit', async () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('finish all tasks by order', async () => {
    const limit = pLimit(2)
    const arr = [
      limit(() => asyncFun('aaa', 2000)),
      limit(() => asyncFun('bbb', 2000)),
      limit(() => asyncFun('ccc', 1000)),
      limit(() => asyncFun('ccc', 1000)),
      limit(() => asyncFun('ccc', 1000)),
    ]
    const result = await Promise.all(arr)
    expect(result).toStrictEqual(['aaa', 'bbb', 'ccc', 'ccc', 'ccc'])
  })

  it('concurrency 4', async () => {
    const limit = pLimit(4)
    const arr = [
      limit(() => asyncFun('aaa', 1000)),
      limit(() => asyncFun('aaa', 1000)),
      limit(() => asyncFun('aaa', 1000)),
      limit(() => asyncFun('aaa', 2000)),
      limit(() => asyncFun('bbb', 3000)),
    ]

    // should complete in 4000ms
    const startTime = new Date().getTime()
    const result = await Promise.all(arr)
    const endTime = new Date().getTime()

    expect(endTime - startTime).equal(4000)
  })
})
