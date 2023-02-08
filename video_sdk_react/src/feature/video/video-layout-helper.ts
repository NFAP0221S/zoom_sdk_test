import { CellLayout, Position } from './video-types';
import { VideoQuality } from '@zoom/videosdk';
interface Grid {
  row: number;
  column: number;
}
interface Layout {
  cellWidth: number;
  cellHeight: number;
  cellArea: number;
  column: number;
  row: number;
}
const layoutCandidates: { [key: number]: Grid[] } = Array.from({ length: 25 })
  .map((value, index) => {
    const count = index + 1;
    const mid = Math.ceil(count / 2); // 올림
    const candidates = Array.from({ length: mid })
      .map((v, i) => {
        const row = i + 1;
        const column = Math.ceil(count / row);
        if (row < column) {
          return [
            {
              row,
              column
            },
            {
              row: column,
              column: row
            }
          ];
        }
        if (row === column) {
          return [
            {
              row,
              column
            }
          ];
        }
        return [];
      })
      .reduce((prev, curr) => [...prev, ...curr], []);
    return { count, candidates };
  })
  .reduce((prev, curr) => ({ ...prev, [curr.count]: curr.candidates }), {});

const aspectRatio = 16 / 9;
// const aspectRatio = 5 / 3; // 1.33, 1.77, 2.33
const minCellWidth = 256;
// const minCellWidth = 512;
const minCellHeight = minCellWidth / aspectRatio; // 256 /
const cellOffset = 5;
// const maxCount = 9;
const maxCount = 25;
// width 는 최소 2610 나와야됨
const maxRowsColumns = (width: number, height: number) => ({
  maxColumns: Math.max(1, Math.floor(width / (minCellWidth + cellOffset * 2))),
  maxRows: Math.max(1, Math.floor(height / (minCellHeight + cellOffset * 2)))
  // maxColumns: 5,
  // maxRows: 5
});
export function maxViewportVideoCounts(width: number, height: number) {
  console.log('floor', Math.floor(width / (minCellWidth + cellOffset * 2)));
  console.log('xxx', minCellWidth + cellOffset * 2);

  const { maxRows, maxColumns } = maxRowsColumns(width, height);
  console.log('maxViewportVideoCounts', maxRows, maxColumns);
  return maxRows * maxColumns;
}

export function getVideoLayout(rootWidth: number, rootHeight: number, count: number): CellLayout[] {
  /**
   * [1,count]
   */
  if (count > maxCount || count === 0) {
    return [];
  }
  let { maxRows, maxColumns } = maxRowsColumns(rootWidth, rootHeight);
  console.log('getVideoLayout maxRowsColumns', maxRows, maxColumns);
  maxRows = Math.min(maxRows, count);
  maxColumns = Math.min(maxColumns, count);
  console.log('max row, col:', maxRows, maxColumns);
  const actualCount = Math.min(count, maxRows * maxColumns);
  const layoutOfCount = layoutCandidates[actualCount].filter(
    (item) => item.row <= maxRows && item.column <= maxColumns
  );
  console.log('actualCount', actualCount);
  console.log('layoutOfCount', layoutOfCount);
  const preferredLayout: Layout = layoutOfCount
    .map((item) => {
      const { column, row } = item;
      const canonical = Math.floor(Math.min(rootWidth / (16 * column), rootHeight / (9 * row)));
      const cellWidth = canonical * 16 - cellOffset * 2;
      const cellHeight = canonical * 9 - cellOffset * 2;
      return {
        cellWidth,
        cellHeight,
        cellArea: cellWidth * cellHeight,
        column,
        row
      };
    })
    .reduce(
      (prev, curr) => {
        if (curr.cellArea > prev.cellArea) {
          return curr;
        }
        return prev;
      },
      { cellArea: 0, cellHeight: 0, cellWidth: 0, column: 0, row: 0 }
    );
  const { cellWidth, cellHeight, column, row } = preferredLayout;
  const cellBoxWidth = cellWidth + cellOffset * 2;
  const cellBoxHeight = cellHeight + cellOffset * 2;
  const horizontalMargin = (rootWidth - cellBoxWidth * column) / 2 + cellOffset;
  const verticalMargin = (rootHeight - cellBoxHeight * row) / 2 + cellOffset;
  const cellDimensions = [];
  const lastRowColumns = column - ((column * row) % actualCount);
  const lastRowMargin = (rootWidth - cellBoxWidth * lastRowColumns) / 2 + cellOffset;
  let quality = VideoQuality.Video_90P;

  if (actualCount <= 4 && cellBoxHeight >= 510) {
    // GROUP HD
    quality = VideoQuality.Video_720P;
  } else if (actualCount <= 4 && cellHeight >= 270) {
    quality = VideoQuality.Video_360P;
  } else if (actualCount > 4 && cellHeight >= 180) {
    quality = VideoQuality.Video_180P;
  }
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      const leftMargin = i !== row - 1 ? horizontalMargin : lastRowMargin;
      if (i * column + j < actualCount) {
        cellDimensions.push({
          width: cellWidth,
          height: cellHeight,
          x: Math.floor(leftMargin + j * cellBoxWidth),
          y: Math.floor(verticalMargin + (row - i - 1) * cellBoxHeight),
          quality
        });
      }
    }
  }
  return cellDimensions;
}
