import { useEffect, type RefSignal, type Signal } from "sinho";

export function useLightDomReference(
  lightDomHref: Signal<string | null | undefined>,
  container: RefSignal<Element | undefined>,
): string {
  const shadowDomId = "shudan-lightdom-" + crypto.randomUUID();

  useEffect(() => {
    // Clone referenced light DOM elements into the shadow DOM so they can
    // be used in shadow DOM

    container()
      ?.querySelector("#" + shadowDomId)
      ?.remove();

    if (lightDomHref() == null) return;

    const lightDomElement = document.querySelector(lightDomHref()!);

    if (lightDomElement != null) {
      const clonedStone = lightDomElement.cloneNode(true) as Element;
      clonedStone.id = shadowDomId;

      container()?.appendChild(clonedStone);
    }
  });

  return shadowDomId;
}
