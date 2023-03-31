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
    const mid = Math.ceil(count / 2);
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
/**
 * 8명 230 , 125
 */
const aspectRatio = 16 / 9;
const minCellWidth = 128;
const minCellHeight = minCellWidth / aspectRatio; // 256 /
const cellOffset = 5;
const maxCount = 25;
const maxRowsColumns = (width: number, height: number) => ({
  maxColumns: 6,
  maxRows: 1
});
export function maxViewportVideoCounts(width: number, height: number) {
  const { maxRows, maxColumns } = maxRowsColumns(width, height);
  return maxRows * maxColumns;
}

export function getVideoHorizonLayout(rootWidth: number, rootHeight: number, count: number): CellLayout[] {
  /**
   * [1,count]
   */
  if (count > maxCount || count === 0) {
    return [];
  }
  let { maxRows, maxColumns } = maxRowsColumns(rootWidth, rootHeight);
  maxRows = Math.min(maxRows, count);
  maxColumns = Math.min(maxColumns, count);
  const actualCount = Math.min(count, maxRows * maxColumns);
  const layoutOfCount = layoutCandidates[actualCount].filter(
    (item) => item.row <= maxRows && item.column <= maxColumns
  );
  const preferredLayout: Layout = layoutOfCount
    .map((item, index) => {
      const { column, row } = item;
      const canonical = 12;
      // cell size setup
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
  // 임시 요구사항
  /**
   * TODO: rootWidth, rootHeight 값에 따라 어떻게 mainCell을 규격을 잡을 것인지..
   */
  const newWidth = rootWidth / 2;
  const newHeight = newWidth * (9 / 16);
  const cellBoxWidth = newWidth + cellOffset * 2;
  const cellBoxHeight = newHeight + cellOffset * 2;

  // 수평
  const horizontalMargin = (rootWidth - cellBoxWidth * column) / 2 + cellOffset;
  // 수직
  // const verticalMargin = (rootHeight - cellBoxHeight * row) / 2 + cellOffset; // origin
  const verticalMargin = (rootHeight - cellBoxHeight * row) / 1 + cellOffset;

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

  const topWidth = (newWidth - cellOffset * 6) / 5;
  const topHeight = topWidth * (9 / 16);
  const topCellBoxWidth = topWidth + cellOffset * 2;
  const topCellBoxHeight = topHeight + cellOffset * 2;

  const leftMargin = 10;
  const mainCellTopMargin = 5;
  const rightMargin = rootWidth - (minCellWidth + cellOffset * 2) * maxColumns;
  const bottomMargin = 50 + cellOffset;
  for (let i = 0; i < maxRows; i++) {
    // column 으로 넣으면 자동 격자로 맞춰줌, maxColumns로 넣으면 열 고정
    for (let j = 0; j < maxColumns; j++) {
      if (j === 0) {
        console.log('MAIN 푸시');
        cellDimensions.push({
          width: cellBoxWidth,
          height: newHeight,
          x: 10,
          y: 60,
          quality
        });
      } else {
        console.log('TOP 푸시');
        cellDimensions.push({
          width: topWidth,
          height: topHeight,
          x: leftMargin + (j - 1) * topCellBoxWidth,
          y: bottomMargin + mainCellTopMargin + cellBoxHeight,
          quality
        });
      }
      console.log('cellDimensions', cellDimensions);
    }
  }
  return cellDimensions;
}
