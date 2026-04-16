import { useEffect, type RefSignal, type Signal } from "sinho";

export function useExternalReference(
  rootElement: Element,
  externalHref: Signal<string | null | undefined>,
  container: RefSignal<Element | undefined>,
): string {
  const shadowDomId = "shudan-lightdom-" + crypto.randomUUID();

  useEffect(() => {
    // Clone referenced light DOM elements into the shadow DOM so they can
    // be used in shadow DOM

    container()
      ?.querySelector("#" + shadowDomId)
      ?.remove();

    if (externalHref() == null) return;

    const externalElement = rootElement.querySelector(externalHref()!);

    if (externalElement != null) {
      const clonedStone = externalElement.cloneNode(true) as Element;
      clonedStone.id = shadowDomId;

      container()?.appendChild(clonedStone);
    }
  });

  return shadowDomId;
}
