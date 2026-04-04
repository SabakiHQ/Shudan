import { Vertex } from "./vertex.ts";

export class VertexEvent extends Event {
  vertex: Vertex;

  constructor(type: string, vertex: Vertex) {
    super(type);

    this.vertex = vertex;
  }
}

export class VertexPointerEvent extends PointerEvent {
  vertex: Vertex;
  originalEvent: PointerEvent;

  constructor(
    type: string,
    init: {
      vertex: Vertex;
      originalEvent: PointerEvent;
    },
  ) {
    super(type, init.originalEvent);

    this.vertex = init.vertex;
    this.originalEvent = init.originalEvent;
  }

  preventDefault(): void {
    super.preventDefault();
    this.originalEvent.preventDefault();
  }

  stopPropagation(): void {
    super.stopPropagation();
    this.originalEvent.stopPropagation();
  }

  stopImmediatePropagation(): void {
    super.stopImmediatePropagation();
    this.originalEvent.stopImmediatePropagation();
  }
}
