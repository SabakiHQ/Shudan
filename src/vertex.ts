const vertexSym = Symbol("vertex");

export type Vertex = string & { [vertexSym]: true };

export function Vertex(x: number, y: number): Vertex {
  return `${x},${y}` as Vertex;
}

export function parseVertex(vertex: Vertex): [number, number] {
  return vertex.split(",").map(Number) as [number, number];
}
