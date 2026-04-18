import { useEffect, useSignal, type RefSignal, type Signal } from "sinho";

export function unitCSS(value: number | string = 1): string {
  return `calc((${value}) * var(--_shudan-vertex-size))`;
}

export function useExternalReference(
  rootElement: Element,
  externalHref: Signal<string | null | undefined>,
  container: RefSignal<Element | undefined>,
): Signal<string | undefined> {
  const shadowDomId = "shudan-lightdom-" + crypto.randomUUID();
  const [result, setResult] = useSignal<string>();

  useEffect(() => {
    // Clone referenced light DOM elements into the shadow DOM so they can
    // be used in shadow DOM

    if (externalHref() == null) {
      setResult(undefined);
      return;
    }

    const externalElement = rootElement.querySelector(externalHref()!);

    if (externalElement != null) {
      const clonedStone = externalElement.cloneNode(true) as Element;
      clonedStone.id = shadowDomId;

      container()?.appendChild(clonedStone);
      setResult(shadowDomId);
    }

    return () => {
      container()
        ?.querySelector("#" + shadowDomId)
        ?.remove();
    };
  });

  return result;
}
