export type ReadingMode = 'page' | 'vertical' | 'cinematic'

export class ReadingModes {
  static getVisiblePageIndex(
    currentIndex: number,
    _mode: ReadingMode,
    _totalPages: number,
    _direction: 'ltr' | 'rtl'
  ): number {
    return currentIndex
  }

  static getPagesForRender(
    currentIndex: number,
    _mode: ReadingMode,
    _totalPages: number,
    _direction: 'ltr' | 'rtl'
  ): number[] {
    return [currentIndex]
  }

  static isDoublePage(_index: number): boolean {
    return false
  }

  static nextPage(
    current: number,
    total: number,
    _mode: ReadingMode,
    direction: 'ltr' | 'rtl'
  ): number {
    const delta = direction === 'rtl' ? -1 : 1
    const next = current + delta
    if (next < 0) return current
    if (next >= total) return current
    return next
  }

  static prevPage(
    current: number,
    total: number,
    _mode: ReadingMode,
    direction: 'ltr' | 'rtl'
  ): number {
    const delta = direction === 'rtl' ? -1 : 1
    const prev = current - delta
    if (prev < 0) return current
    if (prev >= total) return current
    return prev
  }
}
