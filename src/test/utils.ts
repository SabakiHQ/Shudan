import "@happy-dom/global-registrator/register.js";
import { Component, defineComponents, type Template } from "sinho";
import type { Goban } from "../goban.tsx";

class RenderContainer extends Component() {
  template: Template;

  constructor(template?: Template) {
    super();

    if (template == null)
      throw new Error("Template is required for RenderContainer");
    this.template = template;
  }

  render() {
    return this.template;
  }
}

defineComponents(RenderContainer);

export function render(template: Template) {
  const container = new RenderContainer(template);
  document.body.append(container);

  return {
    container,
    elements: () => [...container.shadowRoot!.children] as HTMLElement[],
    element: () => container.shadowRoot!.firstElementChild as HTMLElement,
    cleanup: () => container.remove(),
  };
}

export function renderGoban(template: Template) {
  const result = render(template);
  const goban = () =>
    result.container.shadowRoot!.querySelector<Goban>("shudan-goban")!;

  return {
    container: result.container,
    goban,
    svg: () => goban().shadowRoot!.querySelector("svg")!,
    layers: () => [...goban().querySelectorAll<HTMLElement>("*")],
    cleanup: result.cleanup,
  };
}
