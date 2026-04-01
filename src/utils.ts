import { Vertex } from "./vertex.ts";

export function unit(value: number | string = 1): string {
  return `calc(${value} * var(--_shudan-vertex-size))`;
}

export function unitSvg(value: number = 1): number {
  return value * 60;
}

export function getHoshis(width: number, height: number): Vertex[] {
  if (Math.min(width, height) <= 6) return [];

  let [nearX, nearY] = [width, height].map((x) => (x >= 13 ? 3 : 2));
  let [farX, farY] = [width - nearX - 1, height - nearY - 1];
  let [middleX, middleY] = [width, height].map((x) => (x - 1) / 2);

  let result = [
    Vertex(nearX, farY),
    Vertex(farX, nearY),
    Vertex(farX, farY),
    Vertex(nearX, nearY),
  ];

  if (width % 2 !== 0 && height % 2 !== 0 && width !== 7 && height !== 7)
    result.push(Vertex(middleX, middleY));
  if (width % 2 !== 0 && width !== 7)
    result.push(Vertex(middleX, nearY), Vertex(middleX, farY));
  if (height % 2 !== 0 && height !== 7)
    result.push(Vertex(nearX, middleY), Vertex(farX, middleY));

  return result;
}
