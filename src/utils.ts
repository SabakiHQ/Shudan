import { useEffect, useSignal, type RefSignal, type Signal } from "sinho";

export function unitCSS(value: number | string = 1): string {
  return `calc((${value}) * var(--_shudan-vertex-size))`;
}

export function useExternalReference(
  externalRoot: Element,
  externalHref: Signal<string | null | undefined>,
  container: RefSignal<Element | undefined>,
): Signal<string | undefined> {
  const shadowDomId = "shudan-lightdom-" + crypto.randomUUID();
  const [result, setResult] = useSignal<string>();

  useEffect(() => {
    // Clone referenced light DOM elements into the shadow DOM so they can
    // be used in shadow DOM

    if (container() == null || externalHref() == null) {
      setResult(undefined);
      return;
    }

    const externalElement = externalRoot.querySelector(externalHref()!);

    if (externalElement != null) {
      const clonedStone = externalElement.cloneNode(true) as Element;
      clonedStone.id = shadowDomId;

      container()!.appendChild(clonedStone);
      setResult(shadowDomId);

      return () => clonedStone.remove();
    }
  });

  return result;
}
