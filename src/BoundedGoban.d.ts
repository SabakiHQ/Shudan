import type { ComponentClass } from "preact";
import type { GobanProps } from "./Goban";

export type BoundedGobanProps = Omit<GobanProps, "vertexSize"> & {
  maxWidth: number;
  maxHeight: number;
  maxVertexSize?: number;

  onResized?: () => void;
};

declare const BoundedGoban: ComponentClass<BoundedGobanProps>;

export default BoundedGoban;
