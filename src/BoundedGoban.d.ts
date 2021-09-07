import type { ComponentClass } from "preact";
import type { GobanProps } from "./Goban";

export interface BoundedGobanProps extends GobanProps {
  maxWidth: number;
  maxHeight: number;
  maxVertexSize?: number;

  onResized: () => void;
}

declare const BoundedGoban: ComponentClass<BoundedGobanProps>;

export default BoundedGoban;
