import { Vertex } from "./vertex.ts";

/**
 * An event that carries a vertex, emitted when the focused vertex changes.
 */
export class VertexEvent extends Event {
  /**
   * The vertex associated with the event.
   */
  vertex: Vertex;

  constructor(type: string, vertex: Vertex) {
    super(type);

    this.vertex = vertex;
  }
}

/**
 * A pointer event that also carries the board vertex the pointer was over.
 */
export class VertexPointerEvent extends PointerEvent {
  /**
   * The vertex the pointer was over when the event was fired.
   */
  vertex: Vertex;
  /**
   * The original DOM pointer event that triggered this event.
   */
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
