export const alpha = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
export const vertexEvents = [
  "Click",
  "MouseDown",
  "MouseUp",
  "MouseMove",
  "MouseEnter",
  "MouseLeave",
  "PointerDown",
  "PointerUp",
  "PointerMove",
  "PointerEnter",
  "PointerLeave",
];

export const avg = (xs) =>
  xs.length === 0 ? 0 : xs.reduce((sum, x) => sum + x, 0) / xs.length;

export const range = (n) =>
  Array(n)
    .fill(0)
    .map((_, i) => i);

export const random = (n) => Math.floor(Math.random() * (n + 1));

export const neighborhood = ([x, y]) => [
  [x, y],
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x, y + 1],
];

export const vertexEquals = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2;

export const lineEquals = ([v1, w1], [v2, w2]) =>
  vertexEquals(v1, v2) && vertexEquals(w1, w2);

export const signEquals = (...xs) =>
  xs.length === 0 ? true : xs.every((x) => Math.sign(x) === Math.sign(xs[0]));

export function getHoshis(width, height) {
  if (Math.min(width, height) <= 6) return [];

  let [nearX, nearY] = [width, height].map((x) => (x >= 13 ? 3 : 2));
  let [farX, farY] = [width - nearX - 1, height - nearY - 1];
  let [middleX, middleY] = [width, height].map((x) => (x - 1) / 2);

  let result = [
    [nearX, farY],
    [farX, nearY],
    [farX, farY],
    [nearX, nearY],
  ];

  if (width % 2 !== 0 && height % 2 !== 0 && width !== 7 && height !== 7)
    result.push([middleX, middleY]);
  if (width % 2 !== 0 && width !== 7)
    result.push([middleX, nearY], [middleX, farY]);
  if (height % 2 !== 0 && height !== 7)
    result.push([nearX, middleY], [farX, middleY]);

  return result;
}

export function readjustShifts(shiftMap, vertex = null) {
  if (vertex == null) {
    for (let y = 0; y < shiftMap.length; y++) {
      for (let x = 0; x < shiftMap[0].length; x++) {
        readjustShifts(shiftMap, [x, y]);
      }
    }
  } else {
    let [x, y] = vertex;
    let direction = shiftMap[y][x];

    let data = [
      // Left
      [
        [1, 5, 8],
        [x - 1, y],
        [3, 7, 6],
      ],
      // Top
      [
        [2, 5, 6],
        [x, y - 1],
        [4, 7, 8],
      ],
      // Right
      [
        [3, 7, 6],
        [x + 1, y],
        [1, 5, 8],
      ],
      // Bottom
      [
        [4, 7, 8],
        [x, y + 1],
        [2, 5, 6],
      ],
    ];

    for (let [directions, [qx, qy], removeShifts] of data) {
      if (!directions.includes(direction)) continue;

      if (shiftMap[qy] && removeShifts.includes(shiftMap[qy][qx])) {
        shiftMap[qy][qx] = 0;
      }
    }
  }

  return shiftMap;
}

export function diffSignMap(before, after) {
  if (
    before === after ||
    before.length === 0 ||
    before.length !== after.length ||
    before[0].length !== after[0].length
  ) {
    return [];
  }

  let result = [];

  for (let y = 0; y < before.length; y++) {
    for (let x = 0; x < before[0].length; x++) {
      if (before[y][x] === 0 && after[y] != null && after[y][x]) {
        result.push([x, y]);
      }
    }
  }

  return result;
}
