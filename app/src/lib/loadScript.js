/** Load a script once. Charlotte's widgets are vanilla custom elements. */
const pending = new Map();

export function loadScript(src) {
  if (document.querySelector(`script[data-addy-src="${src}"]`)) {
    return Promise.resolve();
  }
  if (pending.has(src)) return pending.get(src);
  const p = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.dataset.addySrc = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(s);
  });
  pending.set(src, p);
  return p;
}
