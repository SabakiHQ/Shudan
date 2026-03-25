import { Component } from "sinho";
import type { Goban } from "./goban.tsx";

export class Layer extends Component("layer", {}) {
  get goban(): Goban | null {
    return this.parentElement?.closest("shudan-goban") ?? null;
  }

  render() {
    return <></>;
  }
}
