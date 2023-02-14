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
        console.log('candidates row', row);
        const column = Math.ceil(count / row);
        console.log('candidates column', column);
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
    console.log('candidates count', count);
    console.log('candidates candidates', candidates);
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
let testNum = 0;
const maxRowsColumns = (width: number, height: number) => ({
  // maxColumns: Math.max(1, Math.floor(width / (minCellWidth + cellOffset * 2))),
  // maxRows: Math.max(1, Math.floor(height / (minCellHeight + cellOffset * 2)))
  maxColumns: 11,
  maxRows: 1
  // maxRows: testNum < 5 ? 1 : 2
});
export function maxViewportVideoCounts(width: number, height: number) {
  console.log('floor', Math.floor(width / (minCellWidth + cellOffset * 2)));
  console.log('xxx', minCellWidth + cellOffset * 2);

  const { maxRows, maxColumns } = maxRowsColumns(width, height);
  console.log('maxViewportVideoCounts', maxRows, maxColumns);
  return maxRows * maxColumns;
}

export function getVideoLayout_2(rootWidth: number, rootHeight: number, count: number): CellLayout[] {
  /**
   * [1,count]
   */
  if (count > maxCount || count === 0) {
    return [];
  }
  let { maxRows, maxColumns } = maxRowsColumns(rootWidth, rootHeight);
  console.log('getVideoLayout_maxRowsColumns', maxRows, maxColumns);
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
    .map((item, index) => {
      const { column, row } = item;
      // const { column, row } = colrow[index];
      console.log('item col', column);
      console.log('item row', row);
      // const canonical = Math.floor(Math.min(rootWidth / (16 * column), rootHeight / (9 * row)));
      const canonical = 12;
      // cell size setup
      // let canonical;
      // if (actualCount === 1) {
      //   canonical = Math.floor(Math.min(rootWidth / (16 * column), rootHeight / (9 * row)));
      // } else {
      //   canonical = 12;
      // }
      console.log('canonical', canonical);
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
        console.log('reduce prev', prev.cellArea);
        console.log('reduce curr', curr.cellArea);
        if (curr.cellArea > prev.cellArea) {
          return curr;
        }
        return prev;
      },
      { cellArea: 0, cellHeight: 0, cellWidth: 0, column: 0, row: 0 }
    );
  const { cellWidth, cellHeight, column, row } = preferredLayout;
  console.log('preferredLayout', preferredLayout);
  // const cellBoxWidth = 230 + cellOffset * 2;
  // const cellBoxHeight = 125 + cellOffset * 2;
  // const mainCellBoxWidth = cellWidth * 3 + cellOffset * 2;
  // const mainCellBoxHeight = cellHeight * 3 + cellOffset * 2;
  // const cellBoxWidth = cellWidth + cellOffset * 2; // ㄱ자 origin
  // const cellBoxHeight = cellHeight + cellOffset * 2; //  ㄱ자 origin
  // 임시 요구사항
  const cellBoxWidth = rootWidth / 1.5 / 4 - cellOffset - 2.5 + cellOffset * 2;
  const cellBoxHeight = (cellBoxWidth / 16) * 9 - 5 + cellOffset * 2;
  // 수평
  const horizontalMargin = (rootWidth - cellBoxWidth * column) / 2 + cellOffset;
  // 수직
  // const verticalMargin = (rootHeight - cellBoxHeight * row) / 2 + cellOffset; // origin
  const verticalMargin = (rootHeight - cellBoxHeight * row) / 1 + cellOffset;
  console.log('verticalMargin vM', rootHeight, ' - ', cellBoxHeight, 'x', row, ' = ', verticalMargin);

  const cellDimensions = [];
  const lastRowColumns = column - ((column * row) % actualCount);
  const lastRowMargin = (rootWidth - cellBoxWidth * lastRowColumns) / 2 + cellOffset;
  let quality = VideoQuality.Video_90P;
  console.log('cellBoxWidth', cellBoxWidth);
  console.log('cellBoxHeight', cellBoxHeight);
  console.log('horizontalMargin', horizontalMargin);
  console.log('verticalMargin', verticalMargin);
  console.log('lastRowColumns', lastRowColumns);
  console.log('lastRowMargin', lastRowMargin);
  console.log('rootW:', rootWidth);
  console.log('rootH:', rootHeight);
  if (actualCount <= 4 && cellBoxHeight >= 510) {
    // GROUP HD
    quality = VideoQuality.Video_720P;
  } else if (actualCount <= 4 && cellHeight >= 270) {
    quality = VideoQuality.Video_360P;
  } else if (actualCount > 4 && cellHeight >= 180) {
    quality = VideoQuality.Video_180P;
  }
  // const arr = [
  //   [1, 1, 1, 1, 1],
  //   [0, 0, 0, 0, 1],
  //   [0, 0, 0, 0, 1],
  //   [0, 0, 0, 0, 1],
  //   [0, 0, 0, 0, 1]
  // ];
  const w = rootWidth / 1.5 / 4 - cellOffset - 2.5;
  // 수동으로 한다면, 여기서 for문 제어해서 좌표값 조정 가능할 것 같음
  // for (let i = 0; i < row; i++) {
  for (let i = 0; i < maxRows; i++) {
    let col = 0;
    if (i > 0) {
      col = 4;
    }
    // column 으로 넣으면 자동 격자로 맞춰줌, maxColumns로 넣으면 열 고정
    // for (let j = 0; j < maxColumns - col; j++) {
    for (let j = 0; j < maxColumns; j++) {
      console.log('forcol', maxColumns);
      // const leftMargin = i !== row - 1 ? horizontalMargin : lastRowMargin;
      const leftMargin = 10;
      const mainCellTopMargin = 10;
      const rightMargin = rootWidth - (minCellWidth + cellOffset * 2) * maxColumns;
      // const leftMargin = 5;
      // if (i > 1) {
      //   i += 1;
      // }

      console.log('leftMargin', leftMargin);
      console.log('rightMargin', rightMargin);
      // const index = i * column + j;
      // const index = i
      console.log('idx', j);
      if (j === 0) {
        cellDimensions.push({
          // x: (rootWidth - cellBoxWidth * 3) / 2,
          x: 10,
          // y: (rootHeight - cellBoxHeight * 3) / 2,
          y: 60,
          // width: cellWidth * 3,
          width: rootWidth / 1.5,
          height: rootHeight / 1.5,
          quality
        });
        // } else if (i * column + j < actualCount) {
      } else if (j < actualCount) {
        // }
        // if (rightMargin < 10) {
        // let y_axis = j <= 4 ? Math.floor(verticalMargin + (row - i - 1) * cellBoxHeight) : 700;
        // let y_axis = 5 * (j + 1);
        // console.log('y_axis', y_axis);
        // console.log('top', top[j]);
        console.log('iii', i);
        console.log('jjj', j);
        console.log('rrr', row);
        // ///
        if (j >= 6) {
          console.log('if에서 푸시');
          console.log('yyy', verticalMargin - cellBoxHeight * (j - 5));
          console.log('w:', cellWidth);
          console.log('h:', cellHeight);
          console.log('x:', leftMargin + 4 * cellBoxWidth);
          console.log('y:', verticalMargin - cellBoxHeight * (j - 5));
          console.log('q:', quality);
          cellDimensions.push({
            width: w,
            height: (w / 16) * 9,
            x: leftMargin + 4 * cellBoxWidth,
            y: 60 + mainCellTopMargin + rootHeight / 1.5 - cellBoxHeight * (j - 5),
            quality
          });
          // break;
        }
        // ///
        else {
          console.log('그냥 푸시');
          cellDimensions.push({
            // width: 230,
            // height: 125,
            width: w,
            height: (w / 16) * 9,
            // width: cellWidth,
            // height: cellHeight,
            x: Math.floor(j <= 5 ? leftMargin + (j - 1) * cellBoxWidth : leftMargin + 5 * cellBoxWidth), // ㄱ자 origin
            // x: Math.floor(cellDimensions.length < 5 ? leftMargin + (j - 1) * cellBoxWidth : fiveX),
            y: Math.floor(
              // i <= 1 ? verticalMargin + (row - i - 1) * cellBoxHeight : verticalMargin + (j - i - 1) * cellBoxHeight
              // verticalMargin + (row - i - 1) * cellBoxHeight // ㄱ자 origin
              60 + mainCellTopMargin + rootHeight / 1.5
            ),
            // x: leftArr[j],
            // y: top[j],
            // y: y_axis,
            quality
          });
        }
        testNum = cellDimensions.length;
        console.log('testNum', testNum);
      }
      // fivX 변수명은 임시, 지정한 컬럼 위치에서 y축 내림
      // if (cellDimensions.length === maxColumns) {
      //   fiveX = Math.floor(leftMargin + j * cellBoxWidth);
      // }
      // if (cellDimensions.length >= maxColumns) {
      //   twoY = verticalMargin + (1 - i - 1) * cellBoxHeight * 2;
      //   // twoY = (1 - i - 1) * cellBoxHeight * 2;
      // }
      console.log('cellDimensions', cellDimensions);
    }
  }

  return cellDimensions;
}
