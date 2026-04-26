import "@happy-dom/global-registrator/register.js";
import { Component, defineComponents, type Template } from "sinho";

class RenderContainer extends Component({}) {
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
    elements(): HTMLElement[] {
      return [...container.shadowRoot!.children] as HTMLElement[];
    },
    element(): HTMLElement | undefined {
      return this.elements()[0];
    },
    cleanup(): void {
      container.remove();
    },
  };
}
