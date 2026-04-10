import { useContext } from "sinho";
import { Layer } from "./layer.tsx";
import { GobanContext } from "../main.ts";

export class LineLayer extends Layer({}) {
  renderContent() {
    const height = useContext(GobanContext.height);

    return <></>;
  }
}
