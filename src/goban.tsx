import { Component, css, defineComponents, prop, Style } from "sinho";
import { COMPONENT_PREFIX } from "./constants.ts";

export class Goban extends Component("goban", {
  width: prop<number>(19, { attribute: Number }),
  height: prop<number>(19, { attribute: Number }),
}) {
  render() {
    return (
      <>
        <Style>{css`
          :host {
          }
        `}</Style>
      </>
    );
  }
}

defineComponents(COMPONENT_PREFIX, Goban);
