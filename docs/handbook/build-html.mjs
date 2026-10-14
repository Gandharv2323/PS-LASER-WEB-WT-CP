// Builds docs/handbook/index.html from WEBSITE_USER_HANDBOOK.md (no dependencies).
// Run from the project root:  node docs/handbook/build-html.mjs
import { readFileSync, writeFileSync } from "node:fs";

const here = new URL("./", import.meta.url);
const md = readFileSync(new URL("WEBSITE_USER_HANDBOOK.md", here), "utf8").replace(/\r\n/g, "\n");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slug = (s) =>
  s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");

function inline(text) {
  const codes = [];
  let t = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(`<code>${esc(c)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  t = esc(t);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const ext = /^https?:/.test(href);
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  // status badges
  t = t.replace(/\*?\*?(PASS|FAIL|BLOCKED|NOT TESTED)\*?\*?/g, (m, s) =>
    /<strong>/.test(m) ? m : m,
  );
  t = t.replace(/<strong>(PASS|FAIL|BLOCKED|NOT TESTED)<\/strong>/g, (_, s) => `<span class="badge b-${s.replace(" ", "-").toLowerCase()}">${s}</span>`);
  t = t.replace(/\[(verified|from code|agent-tested)\]/g, '<span class="tag">$1</span>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
}

const ARCH_SVG = `
<svg viewBox="0 0 980 560" role="img" aria-label="System architecture diagram" class="arch">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker>
  </defs>
  <style>
    .n{fill:var(--card);stroke:var(--line);stroke-width:1.5}
    .acc{stroke:var(--accent);stroke-width:2}
    .t{font:600 14px system-ui,sans-serif;fill:var(--fg)}
    .s{font:12px system-ui,sans-serif;fill:var(--muted)}
    .e{stroke:var(--muted);stroke-width:1.5;fill:none}
  </style>
  <text x="490" y="26" text-anchor="middle" class="t">Browser — customer / staff / you</text>
  <rect x="300" y="38" width="380" height="8" rx="4" class="n acc"/>
  <!-- row 1 -->
  <g><rect x="20"  y="90" width="170" height="82" rx="10" class="n acc"/><text x="105" y="120" text-anchor="middle" class="t">Next.js site</text><text x="105" y="140" text-anchor="middle" class="s">:3001 · 8 pages</text><text x="105" y="157" text-anchor="middle" class="s">/quote /track /dashboard</text></g>
  <g><rect x="215" y="90" width="170" height="82" rx="10" class="n"/><text x="300" y="120" text-anchor="middle" class="t">React portal</text><text x="300" y="140" text-anchor="middle" class="s">:5173 · Redux · Router</text></g>
  <g><rect x="410" y="90" width="170" height="82" rx="10" class="n"/><text x="495" y="120" text-anchor="middle" class="t">PHP estimator</text><text x="495" y="140" text-anchor="middle" class="s">:8000 · upload · enquiry</text></g>
  <g><rect x="605" y="90" width="170" height="82" rx="10" class="n"/><text x="690" y="120" text-anchor="middle" class="t">Laravel admin</text><text x="690" y="140" text-anchor="middle" class="s">:8001 · back office</text></g>
  <g><rect x="800" y="90" width="160" height="82" rx="10" class="n"/><text x="880" y="120" text-anchor="middle" class="t">Servlet / JSP</text><text x="880" y="140" text-anchor="middle" class="s">:8080/pslaser · Tomcat</text></g>
  <!-- row 2 -->
  <g><rect x="110" y="270" width="250" height="82" rx="10" class="n acc"/><text x="235" y="300" text-anchor="middle" class="t">Spring Boot REST API</text><text x="235" y="320" text-anchor="middle" class="s">:8081 · JWT · JPA · events</text></g>
  <g><rect x="420" y="270" width="220" height="82" rx="10" class="n"/><text x="530" y="300" text-anchor="middle" class="t">Node / Express API</text><text x="530" y="320" text-anchor="middle" class="s">:4000 · enquiry + drawing upload</text></g>
  <!-- row 3 -->
  <g><rect x="40" y="440" width="170" height="80" rx="10" class="n"/><text x="125" y="472" text-anchor="middle" class="t">MongoDB</text><text x="125" y="492" text-anchor="middle" class="s">:27017 · activity log</text></g>
  <g><rect x="300" y="440" width="560" height="80" rx="10" class="n acc"/><text x="580" y="472" text-anchor="middle" class="t">MySQL / MariaDB · database "pslaser" · :3306</text><text x="580" y="494" text-anchor="middle" class="s">users · machines · services · materials · rates · settings · enquiries · uploads · quotes · work_orders · events</text></g>
  <!-- edges -->
  <path d="M105 172 L200 270" class="e" marker-end="url(#ar)"/>
  <path d="M300 172 L260 270" class="e" marker-end="url(#ar)"/>
  <path d="M300 172 L470 270" class="e" marker-end="url(#ar)"/>
  <path d="M105 172 C 105 230, 420 230, 480 270" class="e" marker-end="url(#ar)"/>
  <path d="M235 352 L125 440" class="e" marker-end="url(#ar)"/>
  <path d="M235 352 L400 440" class="e" marker-end="url(#ar)"/>
  <path d="M530 352 L530 440" class="e" marker-end="url(#ar)"/>
  <path d="M495 172 L560 440" class="e" marker-end="url(#ar)"/>
  <path d="M690 172 L700 440" class="e" marker-end="url(#ar)"/>
  <path d="M880 172 L840 440" class="e" marker-end="url(#ar)"/>
  <text x="700" y="250" class="s">PHP, Laravel and Java talk to MySQL directly</text>
  <text x="700" y="268" class="s">Every "Get Quote" also opens WhatsApp +91 77199 76990</text>
</svg>`;

// ---- block parser -------------------------------------------------------------
const lines = md.split("\n");
const html = [];
const toc = [];
let i = 0;
let openSection = false;
let sectionNo = 0;
let archDone = false;

const closeSection = () => {
  if (openSection) html.push("</div></details>");
  openSection = false;
};

while (i < lines.length) {
  const line = lines[i];

  if (line.startsWith("```")) {
    const buf = [];
    i++;
    while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
    i++;
    const code = buf.join("\n");
    if (!archDone && /BROWSER/.test(code) && /MySQL/.test(code)) {
      archDone = true;
      html.push(`<figure class="diagram">${ARCH_SVG}<figcaption>Green-outlined boxes are the main path; arrows show who calls whom.</figcaption></figure>`);
      html.push(`<details class="ascii"><summary>Show text version of the diagram</summary><pre><code>${esc(code)}</code></pre></details>`);
    } else {
      html.push(`<div class="code"><button class="copy" type="button" aria-label="Copy code">Copy</button><pre><code>${esc(code)}</code></pre></div>`);
    }
    continue;
  }

  const h = /^(#{1,4})\s+(.*)$/.exec(line);
  if (h) {
    const level = h[1].length;
    const text = h[2];
    const id = slug(text.replace(/^\d+\.\s*/, (m) => m)) ;
    if (level === 1) {
      html.push(`<h1>${inline(text)}</h1>`);
    } else if (level === 2) {
      closeSection();
      sectionNo++;
      const isContents = /^Contents$/i.test(text);
      toc.push({ id, text });
      html.push(
        `<details class="sec" id="${id}" ${isContents ? "" : "open"}><summary><h2>${inline(text)}</h2></summary><div class="sec-body">`,
      );
      openSection = true;
    } else {
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
    }
    i++;
    continue;
  }

  if (/^---+$/.test(line.trim())) {
    html.push("<hr/>");
    i++;
    continue;
  }

  if (line.startsWith("|")) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
    const cells = (r) => r.replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    html.push(
      `<div class="tablewrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body
        .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table></div>`,
    );
    continue;
  }

  if (line.startsWith(">")) {
    const buf = [];
    while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
    html.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
    continue;
  }

  const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
  if (li) {
    const ordered = /\d+\./.test(li[2]);
    const items = [];
    while (i < lines.length) {
      const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
      if (m) {
        items.push({ indent: m[1].length, text: m[3] });
        i++;
      } else if (/^\s{2,}\S/.test(lines[i]) && items.length) {
        items[items.length - 1].text += " " + lines[i].trim();
        i++;
      } else break;
    }
    const tag = ordered ? "ol" : "ul";
    html.push(
      `<${tag}>${items.map((it) => `<li${it.indent ? ' class="sub"' : ""}>${inline(it.text)}</li>`).join("")}</${tag}>`,
    );
    continue;
  }

  if (line.trim() === "") {
    i++;
    continue;
  }

  const para = [];
  while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,4}\s|```|\||>|---+$|\s*([-*]|\d+\.)\s)/.test(lines[i])) {
    para.push(lines[i++]);
  }
  if (!para.length) {
    para.push(lines[i++]);
  }
  html.push(`<p>${inline(para.join(" "))}</p>`);
}
closeSection();

const tocHtml = toc
  .filter((t) => !/^Contents$/i.test(t.text))
  .map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`)
  .join("");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Website Operations &amp; User Handbook — PS Laser</title>
<style>
:root{--bg:#f6f4f0;--card:#fff;--fg:#1d1d1b;--muted:#5d5d58;--line:#dcd8d0;--accent:#ef7d00;--accent-ink:#141414;--code:#14161a;--codefg:#e8e6e1}
@media (prefers-color-scheme:dark){:root{--bg:#121212;--card:#1b1b1a;--fg:#ecebe8;--muted:#a5a39d;--line:#34332f;--code:#0b0c0e}}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:16px}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.layout{display:grid;grid-template-columns:280px minmax(0,1fr);gap:0;max-width:1400px;margin:0 auto}
nav.toc{position:sticky;top:0;align-self:start;height:100vh;overflow:auto;padding:24px 18px;border-right:1px solid var(--line)}
nav.toc .brand{font-weight:800;font-size:15px;letter-spacing:.02em;margin-bottom:4px}
nav.toc .brand span{color:var(--accent)}
nav.toc small{color:var(--muted)}
nav.toc ol{list-style:none;margin:16px 0 0;padding:0}
nav.toc li a{display:block;padding:6px 10px;border-radius:6px;color:var(--fg);text-decoration:none;font-size:14px}
nav.toc li a:hover{background:var(--card)}
nav.toc li a.on{background:var(--accent);color:var(--accent-ink);font-weight:600}
.tools{margin-top:16px;display:flex;gap:8px;flex-wrap:wrap}
.tools button{font:inherit;font-size:13px;padding:6px 10px;border-radius:6px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}
main{padding:32px clamp(16px,4vw,56px) 96px;min-width:0}
h1{font-size:clamp(28px,4vw,40px);line-height:1.15;margin:0 0 12px}
h2{font-size:22px;margin:0;line-height:1.3}
h3{font-size:18px;margin:28px 0 8px}
h4{font-size:16px;margin:20px 0 6px}
details.sec{background:var(--card);border:1px solid var(--line);border-radius:12px;margin:18px 0}
details.sec>summary{cursor:pointer;list-style:none;padding:16px 20px;display:flex;align-items:center;gap:10px}
details.sec>summary::-webkit-details-marker{display:none}
details.sec>summary::before{content:"▸";color:var(--accent);transition:transform .2s}
details.sec[open]>summary::before{transform:rotate(90deg)}
.sec-body{padding:0 20px 18px}
a{color:#b85c00}
@media (prefers-color-scheme:dark){a{color:#ffa43a}}
code{font:13px ui-monospace,Consolas,monospace;background:rgba(127,127,127,.15);padding:1px 5px;border-radius:4px;word-break:break-word}
.code{position:relative;margin:12px 0}
.code pre,details.ascii pre{margin:0;background:var(--code);color:var(--codefg);padding:14px 16px;border-radius:10px;overflow:auto}
.code pre code,details.ascii pre code{background:none;padding:0;color:inherit;font-size:13px;word-break:normal;white-space:pre}
.copy{position:absolute;top:8px;right:8px;font-size:12px;padding:4px 8px;border-radius:6px;border:1px solid #444;background:#26282c;color:#eee;cursor:pointer}
.copy.done{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.tablewrap{overflow-x:auto;margin:14px 0;border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{background:rgba(127,127,127,.12);white-space:nowrap}
tr:last-child td{border-bottom:0}
blockquote{margin:14px 0;padding:10px 16px;border-left:4px solid var(--accent);background:rgba(239,125,0,.08);border-radius:0 8px 8px 0}
hr{border:0;border-top:1px solid var(--line);margin:24px 0}
.badge{display:inline-block;font-weight:700;font-size:12px;padding:2px 8px;border-radius:999px;white-space:nowrap}
.b-pass{background:#d9f2dd;color:#14532d}.b-fail{background:#fde0de;color:#8a1c14}
.b-blocked{background:#ffe9c2;color:#7a4a00}.b-not-tested{background:#e4e4e1;color:#3c3c39}
@media (prefers-color-scheme:dark){.b-pass{background:#17381f;color:#8ee0a0}.b-fail{background:#4a1c18;color:#ffa8a0}.b-blocked{background:#47330a;color:#ffd27a}.b-not-tested{background:#2f2f2c;color:#cfcfca}}
.tag{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;padding:1px 6px;border-radius:4px;background:rgba(127,127,127,.18);color:var(--muted)}
figure.diagram{margin:16px 0;padding:12px;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow-x:auto}
svg.arch{width:100%;min-width:760px;height:auto}
figcaption{font-size:13px;color:var(--muted);margin-top:6px}
details.ascii{margin:8px 0}
details.ascii summary{cursor:pointer;color:var(--muted);font-size:14px;margin-bottom:8px}
li.sub{margin-left:20px}
@media (max-width:900px){.layout{grid-template-columns:1fr}nav.toc{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}}
@media print{nav.toc,.copy,.tools{display:none}.layout{display:block}details.sec{break-inside:avoid-page}}
</style>
</head>
<body>
<div class="layout">
<nav class="toc" aria-label="Table of contents">
  <div class="brand">PS <span>LASER</span> · Handbook</div>
  <small>Operations &amp; User Handbook v1.0</small>
  <div class="tools"><button id="openAll" type="button">Expand all</button><button id="closeAll" type="button">Collapse all</button></div>
  <ol>${tocHtml}</ol>
</nav>
<main id="top">
${html.join("\n")}
</main>
</div>
<script>
document.querySelectorAll('.copy').forEach(function(b){
  b.addEventListener('click',function(){
    var t=b.parentElement.querySelector('code').innerText;
    var done=function(){b.textContent='Copied';b.classList.add('done');setTimeout(function(){b.textContent='Copy';b.classList.remove('done')},1400)};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fallback(t);done()})}else{fallback(t);done()}
  });
});
function fallback(t){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}
document.getElementById('openAll').onclick=function(){document.querySelectorAll('details.sec').forEach(function(d){d.open=true})};
document.getElementById('closeAll').onclick=function(){document.querySelectorAll('details.sec').forEach(function(d){d.open=false})};
// open the section a link points to
function openTarget(){var h=location.hash.slice(1);if(!h)return;var el=document.getElementById(h);if(!el)return;var d=el.closest('details.sec');if(d)d.open=true;el.scrollIntoView()}
window.addEventListener('hashchange',openTarget);openTarget();
// highlight current section in the TOC
var links=[].slice.call(document.querySelectorAll('nav.toc li a'));
var secs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1))});
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-10% 0px -80% 0px'});
  secs.forEach(function(s){if(s)io.observe(s)});
}
</script>
</body>
</html>`;

writeFileSync(new URL("index.html", here), page);
console.log("index.html written —", html.length, "blocks,", toc.length, "sections");
