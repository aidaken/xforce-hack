// Assembles the .dc.html artboards into one standalone presenter file.
// Re-run after editing any artboard:  node build-deck.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "rechapter-deck.html");

const canvas = JSON.parse(readFileSync(resolve(here, "canvas.json"), "utf8"));
const pageOrder = canvas.pages.map((p) => p.id);
const boards = [...canvas.artboards].sort(
  (a, b) => pageOrder.indexOf(a.page) - pageOrder.indexOf(b.page)
);

const slides = boards.map((b) => {
  const src = readFileSync(resolve(here, b.file), "utf8");

  const xdc = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/);
  if (!xdc) throw new Error(`${b.file}: no <x-dc> block`);
  const markup = xdc[1].replace(/<helmet>[\s\S]*?<\/helmet>/, "").trim();

  const logicM = src.match(/<script data-dc-script[^>]*>([\s\S]*?)<\/script>/);
  const logic = logicM ? logicM[1].trim() : null;

  if (logic && /<\/script/i.test(logic)) throw new Error(`${b.file}: logic contains </script`);

  return {
    id: b.file.replace(/\.dc\.html$/, ""),
    title: b.title || b.file,
    live: !!logic,
    markup,
    logic,
  };
});

const liveCount = slides.filter((s) => s.live).length;

const sections = slides
  .map((s, i) => {
    const attrs = `class="slide" data-i="${i}" data-title="${s.title.replace(/"/g, "&quot;")}"`;
    if (!s.live) return `<section ${attrs}>\n${s.markup}\n</section>`;
    return `<section ${attrs} data-live="${s.id}">\n<div class="mount"></div>\n<template>\n${s.markup}\n</template>\n</section>`;
  })
  .join("\n\n");

const logicBlocks = slides
  .filter((s) => s.live)
  .map((s) => `DC.register(${JSON.stringify(s.id)}, (function () {\n${s.logic}\nreturn Component;\n})());`)
  .join("\n\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rechapter &mdash; Tapia 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: #17140F; }
  body { font-family: 'Atkinson Hyperlegible', Verdana, sans-serif; -webkit-font-smoothing: antialiased; }

  #stage { position: fixed; inset: 0; display: grid; place-items: center; }
  #deck { width: 1440px; height: 900px; position: relative; transform-origin: center center;
          box-shadow: 0 24px 80px rgba(0,0,0,.55); }
  .slide { position: absolute; inset: 0; width: 1440px; height: 900px; display: none; }
  .slide.on { display: block; }
  .slide > div, .mount > div { width: 1440px; height: 900px; }

  #bar { position: fixed; left: 0; bottom: 0; height: 3px; background: #C1643C; width: 0;
         transition: width .18s ease; z-index: 5; }

  #hud { position: fixed; right: 18px; bottom: 16px; z-index: 6; display: flex; align-items: center; gap: 14px;
         font-family: 'Lexend', 'Trebuchet MS', sans-serif; font-size: 13px; color: #8C8071;
         background: rgba(23,20,15,.82); padding: 8px 14px; border-radius: 20px;
         opacity: 0; transition: opacity .25s ease; pointer-events: none; }
  #hud.show { opacity: 1; }
  #hud b { color: #F7F2E9; font-weight: 600; }
  #hud .live { color: #E0906C; }

  #menu { position: fixed; inset: 0; z-index: 10; background: rgba(23,20,15,.97); display: none;
          padding: 56px 64px; overflow-y: auto; }
  #menu.on { display: block; }
  #menu h2 { font-family: 'Lexend', 'Trebuchet MS', sans-serif; font-size: 13px; font-weight: 600;
             letter-spacing: .18em; text-transform: uppercase; color: #8C8071; margin: 0 0 28px; }
  #menu ol { list-style: none; margin: 0; padding: 0; display: grid;
             grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 48px; }
  #menu li { display: flex; align-items: baseline; gap: 16px; padding: 11px 16px; border-radius: 6px;
             cursor: pointer; color: #C9BCA7; font-size: 17px; line-height: 1.5; }
  #menu li:hover { background: #241F19; color: #F7F2E9; }
  #menu li.cur { background: #241F19; color: #F7F2E9; box-shadow: inset 3px 0 0 #C1643C; }
  #menu li .n { font-family: 'Lexend', 'Trebuchet MS', sans-serif; font-size: 13px; font-weight: 600;
                color: #6B6155; width: 22px; flex-shrink: 0; }
  #menu li .tag { font-family: 'Lexend', 'Trebuchet MS', sans-serif; font-size: 11px; font-weight: 600;
                  letter-spacing: .1em; color: #C1643C; margin-left: auto; flex-shrink: 0; }
  #menu .keys { margin-top: 40px; padding-top: 24px; border-top: 1px solid #332C24;
                color: #6B6155; font-size: 15px; line-height: 2; }
  #menu .keys kbd { font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: #C9BCA7;
                    background: #241F19; border: 1px solid #3A322A; border-radius: 4px; padding: 2px 7px; }
</style>
</head>
<body>

<div id="stage"><div id="deck">
${sections}
</div></div>

<div id="bar"></div>
<div id="hud"><span><b id="cur">1</b> / ${slides.length}</span><span id="livetag"></span></div>

<div id="menu">
  <h2>Rechapter &mdash; ${slides.length} slides, ${liveCount} live</h2>
  <ol id="menulist"></ol>
  <div class="keys">
    <kbd>&rarr;</kbd> <kbd>space</kbd> next &nbsp;&middot;&nbsp;
    <kbd>&larr;</kbd> back &nbsp;&middot;&nbsp;
    <kbd>1</kbd>&ndash;<kbd>9</kbd> jump &nbsp;&middot;&nbsp;
    <kbd>g</kbd> this menu &nbsp;&middot;&nbsp;
    <kbd>f</kbd> fullscreen &nbsp;&middot;&nbsp;
    <kbd>esc</kbd> close
  </div>
</div>

<script>
/* ---- minimal Design-Component runtime: dotted holes, sc-for, sc-if, onClick ---- */
var DC = (function () {
  var registry = {};

  function DCLogic() { this.props = {}; this.state = undefined; this._host = null; }
  DCLogic.prototype.setState = function (patch) {
    var next = {}, k;
    for (k in (this.state || {})) next[k] = this.state[k];
    for (k in patch) next[k] = patch[k];
    this.state = next;
    if (this._host) this._host.render();
  };
  DCLogic.prototype.forceUpdate = function () { if (this._host) this._host.render(); };
  window.DCLogic = DCLogic;

  function lookup(path, scope) {
    var parts = String(path).trim().split("."), v = scope, i;
    for (i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }

  function interpText(str, scope) {
    return str.replace(/\\{\\{([^}]+)\\}\\}/g, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? "" : String(v);
    });
  }

  function resolve(str, scope) {
    var whole = /^\\s*\\{\\{([^}]+)\\}\\}\\s*$/.exec(str);
    if (whole) {
      var t = whole[1].trim();
      if (t === "true") return true;
      if (t === "false") return false;
      return lookup(t, scope);
    }
    return str.replace(/\\{\\{([^}]+)\\}\\}/g, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? "" : String(v);
    });
  }

  function build(node, scope, out) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      if (t.indexOf("{{") === -1) { out.appendChild(document.createTextNode(t)); return; }
      out.appendChild(document.createTextNode(interpText(t, scope)));
      return;
    }
    if (node.nodeType !== 1) return;

    var tag = node.localName.toLowerCase();

    if (tag === "sc-for") {
      var list = resolve(node.getAttribute("list") || "", scope);
      var as = node.getAttribute("as") || "item";
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var s = Object.create(scope);
        s[as] = list[i];
        s.$index = i;
        for (var c = node.firstChild; c; c = c.nextSibling) build(c, s, out);
      }
      return;
    }

    if (tag === "sc-if") {
      if (!resolve(node.getAttribute("value") || "", scope)) return;
      for (var c2 = node.firstChild; c2; c2 = c2.nextSibling) build(c2, scope, out);
      return;
    }

    var el = node.cloneNode(false);
    var attrs = Array.prototype.slice.call(el.attributes);
    for (var a = 0; a < attrs.length; a++) {
      var name = attrs[a].name, val = attrs[a].value;
      if (name.slice(0, 2).toLowerCase() === "on") {
        el.removeAttribute(name);
        var fn = resolve(val, scope);
        if (typeof fn === "function") el.addEventListener(name.slice(2).toLowerCase(), fn);
        continue;
      }
      if (name.indexOf("hint-") === 0) { el.removeAttribute(name); continue; }
      if (val.indexOf("{{") === -1) continue;
      var rv = resolve(val, scope);
      el.setAttribute(name, rv == null ? "" : String(rv));
    }
    for (var c3 = node.firstChild; c3; c3 = c3.nextSibling) build(c3, scope, el);
    out.appendChild(el);
  }

  return {
    register: function (id, Comp) { registry[id] = Comp; },
    mount: function (id, tpl, host) {
      var Comp = registry[id];
      if (!Comp) { console.warn("no component:", id); return; }
      var inst = new Comp();
      inst._host = {
        render: function () {
          var vals = inst.renderVals ? inst.renderVals() : {};
          var frag = document.createDocumentFragment();
          for (var c = tpl.content.firstChild; c; c = c.nextSibling) build(c, vals, frag);
          while (host.firstChild) host.removeChild(host.firstChild);
          host.appendChild(frag);
        }
      };
      inst._host.render();
    }
  };
})();

${logicBlocks}

/* ---- presenter shell ---- */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var deck = document.getElementById("deck");
  var bar = document.getElementById("bar");
  var hud = document.getElementById("hud");
  var cur = document.getElementById("cur");
  var livetag = document.getElementById("livetag");
  var menu = document.getElementById("menu");
  var menulist = document.getElementById("menulist");
  var i = 0, hudTimer;

  slides.forEach(function (s) {
    var id = s.getAttribute("data-live");
    if (id) DC.mount(id, s.querySelector("template"), s.querySelector(".mount"));
  });

  slides.forEach(function (s, n) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="n">' + (n + 1) + '</span><span>' + s.getAttribute("data-title") + '</span>' +
      (s.getAttribute("data-live") ? '<span class="tag">LIVE</span>' : '');
    li.addEventListener("click", function () { go(n); closeMenu(); });
    menulist.appendChild(li);
  });
  var lis = Array.prototype.slice.call(menulist.children);

  function fit() {
    var s = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
    deck.style.transform = "scale(" + s + ")";
  }

  function flashHud() {
    hud.classList.add("show");
    clearTimeout(hudTimer);
    hudTimer = setTimeout(function () { hud.classList.remove("show"); }, 1800);
  }

  function go(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle("on", k === i); });
    lis.forEach(function (li, k) { li.classList.toggle("cur", k === i); });
    cur.textContent = i + 1;
    livetag.textContent = slides[i].getAttribute("data-live") ? "\\u00b7 live \\u2014 click it" : "";
    livetag.className = slides[i].getAttribute("data-live") ? "live" : "";
    bar.style.width = ((i + 1) / slides.length * 100) + "%";
    location.hash = String(i + 1);
    flashHud();
  }

  function openMenu() { menu.classList.add("on"); }
  function closeMenu() { menu.classList.remove("on"); }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === "Escape") { closeMenu(); return; }
    if (k === "g" || k === "G") { e.preventDefault(); menu.classList.toggle("on"); return; }
    if (k === "f" || k === "F") {
      e.preventDefault();
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      return;
    }
    if (k >= "1" && k <= "9") { e.preventDefault(); go(parseInt(k, 10) - 1); closeMenu(); return; }
    if (k === "0") { e.preventDefault(); go(9); closeMenu(); return; }
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " " || k === "Enter") {
      e.preventDefault(); go(i + 1); return;
    }
    if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || k === "Backspace") {
      e.preventDefault(); go(i - 1); return;
    }
    if (k === "Home") { e.preventDefault(); go(0); return; }
    if (k === "End") { e.preventDefault(); go(slides.length - 1); return; }
  });

  window.addEventListener("resize", fit);
  document.addEventListener("mousemove", flashHud);

  fit();
  var start = parseInt((location.hash || "").slice(1), 10);
  go(isNaN(start) ? 0 : start - 1);
})();
</script>
</body>
</html>
`;

writeFileSync(OUT, html, "utf8");
console.log(
  `wrote rechapter-deck.html — ${slides.length} slides (${liveCount} interactive), ${(html.length / 1024).toFixed(0)} KB`
);
