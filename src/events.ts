import type { Vertex } from "./vertex.ts";

/**
 * An event that carries a vertex, emitted when the focused vertex changes.
 */
export class VertexEvent extends Event {
  /**
   * The vertex associated with the event.
   */
  vertex: Vertex;

  constructor(type: string, vertex: Vertex) {
    super(type, { cancelable: true });

    this.vertex = vertex;
  }
}

/**
 * A pointer event that also carries the board vertex the pointer was over.
 */
export class VertexPointerEvent extends Event {
  /**
   * The vertex the pointer was over when the event was fired.
   */
  vertex: Vertex;
  /**
   * The original DOM pointer event that triggered this event.
   */
  pointerEvent: PointerEvent;

  constructor(
    type: string,
    init: {
      vertex: Vertex;
      pointerEvent: PointerEvent;
      cancelable?: boolean;
      bubbles?: boolean;
      composed?: boolean;
    },
  ) {
    super(type, {
      cancelable: init.cancelable,
      bubbles: init.bubbles,
      composed: init.composed,
    });

    this.vertex = init.vertex;
    this.pointerEvent = init.pointerEvent;
  }

  preventDefault(): void {
    super.preventDefault();
    this.pointerEvent.preventDefault();
  }

  stopPropagation(): void {
    super.stopPropagation();
    this.pointerEvent.stopPropagation();
  }

  stopImmediatePropagation(): void {
    super.stopImmediatePropagation();
    this.pointerEvent.stopImmediatePropagation();
  }
}
