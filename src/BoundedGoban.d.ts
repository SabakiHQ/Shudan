import type { Component } from "preact";
import type { GobanProps } from "./Goban";

export interface BoundedGobanProps extends GobanProps {
  maxWidth: number;
  maxHeight: number;
  maxVertexSize?: number;

  onResized: () => void;
}

export default class BoundedGoban extends Component<BoundedGobanProps> {}
