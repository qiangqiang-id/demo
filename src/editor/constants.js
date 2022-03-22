// 初始指针角度
export const INIT_ANGLE = [0, 45, 90, 135]


// 角度范围对应的指针样式
export const ANGLE_CURSOR = [
  { start: 0, end: 23, cursor: 'nwse-resize' },
  { start: 338, end: 360, cursor: 'nwse-resize' },
  { start: 23, end: 68, cursor: 'ns-resize' },
  { start: 68, end: 113, cursor: 'nesw-resize' },
  { start: 113, end: 158, cursor: 'ew-resize' },
  { start: 158, end: 203, cursor: 'nwse-resize' },
  { start: 203, end: 248, cursor: 'ns-resize' },
  { start: 248, end: 293, cursor: 'nesw-resize' },
  { start: 293, end: 338, cursor: 'ew-resize' }
]



export const POSITION = {
  leftTop: "leftTop",
  leftBottom: "leftBottom",
  rightTop: "rightTop",
  rightBottom: "rightBottom",
  topCenter: "topCenter",
  bottomCenter: "bottomCenter",
  leftCenter: "leftCenter",
  rightCenter: "rightCenter",
  rotate: "rotate",
};

export const pointList = [
  {
    type: POSITION.leftTop,
    cursorType: 0,
    position: { x: 0, y: 0 },
  },
  {
    type: POSITION.leftCenter,
    cursorType: 3,
    position: { x: 0, y: 0.5 },
  },
  {
    type: POSITION.leftBottom,
    cursorType: 2,
    position: { x: 0, y: 1 },
  },
  {
    type: POSITION.rightTop,
    cursorType: 2,
    position: { x: 1, y: 0 },
  },
  {
    type: POSITION.rightCenter,
    cursorType: 3,
    position: { x: 1, y: 0.5 },
  },
  {
    type: POSITION.rightBottom,
    cursorType: 0,
    position: { x: 1, y: 1 },
  },
  {
    type: POSITION.topCenter,
    cursorType: 1,
    position: { x: 0.5, y: 0 },
  },
  {
    type: POSITION.bottomCenter,
    cursorType: 1,
    position: { x: 0.5, y: 1 },
  },
];


