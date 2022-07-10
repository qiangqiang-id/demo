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

export const ALIGNMENT_TYPE = {
  horizontal: 'horizontal',
  vertical: 'vertical'
}

export const POINT_LIST = [
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


export const ACTOR_LIST = [
  {
    id: 1,
    x: 100,
    y: 100,
    width: 168,
    height: 112,
    rotate: 0,
    url: "https://st0.dancf.com/gaoding-material/0/images/223463/20191107-203726-aUYH9.jpg",
    scale: {
      x: 1,
      y: 1,
    },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    mask: {
      x: 0,
      y: 0,
      width: 168,
      height: 112,
    },
  },
  {
    id: 2,
    x: 200,
    y: 200,
    width: 168,
    height: 112,
    rotate: 0,
    url: "https://st0.dancf.com/gaoding-material/0/images/354048/20200108-213111-jqakQ.jpg",
    scale: {
      x: 1,
      y: 1,
    },
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    mask: {
      x: 0,
      y: 0,
      width: 168,
      height: 112,
    },
  },
  // {
  //   id: 3,
  //   x: 300,
  //   y: 300,
  //   width: 168,
  //   height: 112,
  //   rotate: 0,
  //   url: "https://st0.dancf.com/gaoding-material/0/images/232980/20191108-002232-MrAfZ.jpg",
  //   scale: {
  //     x: 1,
  //     y: 1,
  //   },
  //   anchor: {
  //     x: 0.5,
  //     y: 0.5,
  //   },
  //   mask: {
  //     x: 0,
  //     y: 0,
  //     width: 168,
  //     height: 112,
  //   },
  // },
  // {
  //   id: 4,
  //   x: 400,
  //   y: 400,
  //   width: 168,
  //   height: 112,
  //   rotate: 0,
  //   url: "https://st0.dancf.com/gaoding-material/0/images/354321/20200108-213429-GpISr.jpg",
  //   scale: {
  //     x: 1,
  //     y: 1,
  //   },
  //   anchor: {
  //     x: 0.5,
  //     y: 0.5,
  //   },
  //   mask: {
  //     x: 0,
  //     y: 0,
  //     width: 168,
  //     height: 112,
  //   },
  // },
];


