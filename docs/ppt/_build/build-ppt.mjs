import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Footer, PageNumber } from 'docx';
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, SectionType, PageOrientation,
  FONT, blocksToDocx, blocksToHtml, numberingConfig, esc,
} from './lib.mjs';
import * as C from './content-ppt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');
const FIG = HERE;
const A4 = { width: 11906, height: 16838 };
const M = { top: 1200, bottom: 1200, left: 1200, right: 1200 };
const CW = A4.width - M.left - M.right;

const all = [...C.intro, ...C.slides, { t: 'h1', text: 'References' }, { t: 'refs', items: C.references }, ...C.extra];

// slide index (for cross-checking numbers in the text)
const idx = all.filter((b) => b.t === 'h2' && b.text.startsWith('Slide ')).map((b) => b.text);
fs.writeFileSync(path.join(HERE, 'slide-index.txt'), idx.join('\n'));

const meta = C.meta;
function docx() {
  const opt = { bodySize: 21, tableSize: 17, contentWidth: CW, headingStyle: 'report', figDir: FIG };
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PS Laser Web Platform — PPT Content Guide · page ', font: FONT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] });
  const cover = [
    new Paragraph({ spacing: { before: 2200, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.institute, font: FONT, size: 24 })] }),
    new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.course, font: FONT, size: 22, italics: true })] }),
    new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.title, font: FONT, size: 52, bold: true })] }),
    new Paragraph({ spacing: { after: 500 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.subtitle, font: FONT, size: 30, color: 'B35900' })] }),
    ...meta.authors.map((a) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [new TextRun({ text: a, font: FONT, size: 24 })] })),
    new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.date, font: FONT, size: 22 })] }),
  ];
  const portrait = (children) => ({ properties: { type: SectionType.NEXT_PAGE, page: { size: A4, margin: M } }, footers: { default: footer }, children });
  const landscape = (children) => ({ properties: { type: SectionType.NEXT_PAGE, page: { size: { width: A4.width, height: A4.height, orientation: PageOrientation.LANDSCAPE }, margin: { top: 800, bottom: 800, left: 800, right: 800 } } }, footers: { default: footer }, children });
  const sections = [portrait(cover)];
  let cur = [];
  const flush = () => { if (cur.length) { sections.push(portrait(cur)); cur = []; } };
  for (const b of all) {
    if (b.t === 'fig' && b.landscape) { flush(); sections.push(landscape(blocksToDocx([b], { ...opt, contentWidth: A4.height - 1600 }))); }
    else cur.push(...blocksToDocx([b], opt));
  }
  flush();
  return new Document({ creator: 'PS Laser project team', title: 'PS Laser Web Platform — PPT Content Guide', numbering: numberingConfig(21), styles: { default: { document: { run: { font: FONT, size: 21 } } } }, sections });
}

function html() {
  const body = blocksToHtml(all, { figDir: FIG });
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(meta.title)} - PS Laser</title><style>
@page { size: A4; margin: 0.8in; @bottom-center { content: "PS Laser Web Platform — PPT Content Guide · page " counter(page); font: 8pt 'Times New Roman'; } }
@page land { size: A4 landscape; margin: 0.5in; }
body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; text-align: justify; }
.cover { text-align: center; padding-top: 130pt; break-after: page; } .cover .t { font-size: 28pt; font-weight: bold; margin: 18pt 0 6pt; } .cover .s { font-size: 16pt; color: #b35900; margin-bottom: 30pt; } .cover div { margin: 2pt 0; }
h1 { font-size: 15pt; margin: 18pt 0 6pt; break-after: avoid; border-bottom: 1px solid #999; } h2 { font-size: 12pt; margin: 14pt 0 3pt; break-after: avoid; background: #fbf3e9; padding: 2pt 4pt; } h3 { font-size: 10.5pt; font-style: italic; margin: 6pt 0 2pt; break-after: avoid; }
p { margin: 0 0 5pt; line-height: 1.22; } .note { background: #fff4e0; padding: 3pt 5pt; font-style: italic; } ul, ol { margin: 0 0 5pt; padding-left: 18pt; } li { margin-bottom: 2pt; line-height: 1.2; }
code { font-family: 'Courier New', monospace; font-size: 9pt; } .tbl { margin: 5pt 0 8pt; } .cap { text-align: center; font-size: 9pt; margin-bottom: 2pt; break-after: avoid; }
table { border-collapse: collapse; width: 100%; font-size: 8.5pt; text-align: left; } th, td { border: .5pt solid #808080; padding: 1.5pt 3pt; vertical-align: top; } th { background: #e7e7e7; } tr { break-inside: avoid; }
figure { margin: 0; text-align: center; } figure.land { page: land; break-before: page; break-after: page; } figcaption { font-size: 9pt; margin-top: 3pt; } .refs { font-size: 9pt; }
</style></head><body>
<div class="cover"><div>${esc(meta.institute)}</div><div><i>${esc(meta.course)}</i></div><div class="t">${esc(meta.title)}</div><div class="s">${esc(meta.subtitle)}</div>${meta.authors.map((a) => `<div>${esc(a)}</div>`).join('')}<div style="margin-top:20pt">${esc(meta.date)}</div></div>
${body}</body></html>`;
}
fs.writeFileSync(path.join(HERE, 'ppt-guide.html'), html());
fs.writeFileSync(path.join(OUT, 'PSLaser_PPT_Content_Guide.docx'), await Packer.toBuffer(docx()));
console.log('built', idx.length, 'slides');
