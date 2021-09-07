import type { ComponentClass, JSX } from "preact";

export type Vertex = [x: number, y: number];

export type Map<T> = T[][];

export interface Marker {
  type?:
    | "circle"
    | "cross"
    | "triangle"
    | "square"
    | "point"
    | "loader"
    | "label"
    | null;
  label?: string | null;
}

export interface GhostStone {
  sign: 0 | -1 | 1;
  type?: "good" | "interesting" | "doubtful" | "bad" | null;
  faint?: boolean | null;
}

export interface HeatVertex {
  strength: number;
  text?: string | null;
}

export interface LineMarker {
  v1: Vertex;
  v2: Vertex;
  type?: "line" | "arrow";
}

export interface GobanProps {
  id?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  innerProps?: JSX.HTMLAttributes;

  busy?: boolean;
  vertexSize?: number;
  rangeX?: [start: number, stop: number];
  rangeY?: [start: number, stop: number];

  showCoordinates?: boolean;
  coordX?: (x: number) => string | number;
  coordY?: (y: number) => string | number;

  fuzzyStonePlacement?: boolean;
  animateStonePlacement?: boolean;

  signMap?: Map<0 | 1 | -1>;
  markerMap?: Map<Marker | null>;
  paintMap?: Map<0 | 1 | -1>;
  ghostStoneMap?: Map<GhostStone | null>;
  heatMap?: Map<HeatVertex | null>;

  selectedVertices?: Vertex[];
  dimmedVertices?: Vertex[];
  lines?: LineMarker[];

  onVertexClick?: (evt: MouseEvent, vertex: Vertex) => void;
  onVertexMouseUp?: (evt: MouseEvent, vertex: Vertex) => void;
  onVertexMouseDown?: (evt: MouseEvent, vertex: Vertex) => void;
  onVertexMouseMove?: (evt: MouseEvent, vertex: Vertex) => void;
  onVertexMouseEnter?: (evt: MouseEvent, vertex: Vertex) => void;
  onVertexMouseLeave?: (evt: MouseEvent, vertex: Vertex) => void;
  onVertexPointerUp?: (evt: PointerEvent, vertex: Vertex) => void;
  onVertexPointerDown?: (evt: PointerEvent, vertex: Vertex) => void;
  onVertexPointerMove?: (evt: PointerEvent, vertex: Vertex) => void;
  onVertexPointerEnter?: (evt: PointerEvent, vertex: Vertex) => void;
  onVertexPointerLeave?: (evt: PointerEvent, vertex: Vertex) => void;
}

declare const Goban: ComponentClass<GobanProps>;

export default Goban;
