import { Component } from "sinho";
import { type Goban } from "./goban.tsx";

export class Layer extends Component("layer", {}) {
  get goban(): Goban {
    return (
      this.closest("shudan-goban") ??
      ((this.getRootNode() as ShadowRoot).host as Goban)
    );
  }

  render() {
    return <></>;
  }
}
