import type { Vertex } from "./vertex.ts";

export interface VertexEventInit extends EventInit {
  vertex: Vertex;
}

/**
 * An event that carries a vertex, emitted when the focused vertex changes.
 */
export class VertexEvent extends Event {
  /**
   * The vertex associated with the event.
   */
  vertex: Vertex;

  constructor(type: string, init: VertexEventInit) {
    super(type, init);

    this.vertex = init.vertex;
  }
}

export interface VertexPointerEventInit extends VertexEventInit {
  pointerEvent: PointerEvent;
}

/**
 * A pointer event that also carries the board vertex the pointer was over.
 */
export class VertexPointerEvent extends VertexEvent {
  /**
   * The original DOM pointer event that triggered this event.
   */
  pointerEvent: PointerEvent;

  constructor(type: string, init: VertexPointerEventInit) {
    super(type, init);

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
