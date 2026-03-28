const vertexSym = Symbol("vertex");

export type Vertex = string & { [vertexSym]: true };

export function Vertex(vertex: string): Vertex;
export function Vertex(x: number, y: number): Vertex;
export function Vertex(x: number | string, y?: number): Vertex {
  if (typeof x === "string") {
    return Vertex.parse(x as Vertex).join(",") as Vertex;
  } else {
    return `${x},${y}` as Vertex;
  }
}

Vertex.parse = function (vertex: Vertex): [number, number] {
  return vertex.split(",").map(Number) as [number, number];
};
