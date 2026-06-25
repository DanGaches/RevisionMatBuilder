export const PAGE_MM = {
  A4: { portrait: [210, 297], landscape: [297, 210] },
  A3: { portrait: [297, 420], landscape: [420, 297] },
}

export const MM_TO_SCREEN_PX = 3

export function getPageSize(pageSize, orientation) {
  const [widthMm, heightMm] = PAGE_MM[pageSize][orientation]
  return {
    widthMm,
    heightMm,
    widthPx: widthMm * MM_TO_SCREEN_PX,
    heightPx: heightMm * MM_TO_SCREEN_PX,
  }
}
