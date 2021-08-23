export function setStyle(
  elm: HTMLElement,
  style: { [key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key] }
) {
  for (const key in style) {
    let v = style[key]
    elm.style[key] = style[key];
  }
}