import type { Vertex } from "./vertex.ts";

export class VertexEvent extends Event {
  vertex: Vertex;

  constructor(type: string, vertex: Vertex) {
    super(type);

    this.vertex = vertex;
  }
}
