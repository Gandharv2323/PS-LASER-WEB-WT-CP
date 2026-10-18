// Builds both deliverables as DOCX (editable) and HTML (-> PDF via Edge headless).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,
  SectionType, PageOrientation, NOBORDERS, FONT, blocksToDocx, blocksToHtml, numberingConfig, inlineRuns, inlineHtml, esc,
} from './lib.mjs';
import { Footer, PageNumber } from 'docx';
import * as paper from './content-paper.mjs';
import * as srs from './content-srs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');
const FIG = HERE;

// =============================================================== PAPER (US Letter, IEEE two-column)
const LETTER = { width: 12240, height: 15840 };
const PM = { top: 1080, bottom: 1440, left: 1080, right: 1080 };       // 0.75in sides, 1in bottom
const COLGAP = 360;                                                      // 0.25in
const COLW = Math.floor((LETTER.width - PM.left - PM.right - COLGAP) / 2);

function paperDocx() {
  const opt = { bodySize: 20, tableSize: 16, contentWidth: COLW, headingStyle: 'ieee', figDir: FIG };
  const wideOpt = { ...opt, contentWidth: LETTER.width - PM.left - PM.right };
  const mkSection = (children, { cols, type }) => ({
    properties: { type, page: { size: LETTER, margin: PM }, column: cols ? { count: 2, space: COLGAP, equalWidth: true } : undefined },
    children,
  });
  // title block
  const head = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [new TextRun({ text: paper.title, font: FONT, size: 40 })] }),
  ];
  const cell = (a) => new TableCell({
    width: { size: Math.floor((LETTER.width - PM.left - PM.right) / 3), type: WidthType.DXA }, borders: NOBORDERS,
    children: a ? [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: a.name, font: FONT, size: 22 })] }),
      ...paper.affiliation.map((l) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: l, font: FONT, size: 18, italics: true })] })),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: a.email, font: FONT, size: 18 })] }),
    ] : [new Paragraph({ children: [] })],
  });
  const tw = LETTER.width - PM.left - PM.right;
  const cw = [Math.floor(tw / 3), Math.floor(tw / 3), tw - 2 * Math.floor(tw / 3)];
  const rows = [paper.authors.slice(0, 3), paper.authors.slice(3)].map((r) => new TableRow({ children: [0, 1, 2].map((i) => cell(r[i])) }));
  head.push(new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: cw, rows }));
  head.push(new Paragraph({ spacing: { after: 120 }, children: [] }));

  const abs = [
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 80 }, children: [new TextRun({ text: 'Abstract—', bold: true, italics: true, font: FONT, size: 18 }), new TextRun({ text: paper.abstract, bold: true, font: FONT, size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 100 }, children: [new TextRun({ text: 'Index Terms—', bold: true, italics: true, font: FONT, size: 18 }), new TextRun({ text: paper.keywords, bold: true, font: FONT, size: 18 })] }),
  ];

  // split body at wide figures
  const sections = [mkSection(head, { cols: false, type: SectionType.CONTINUOUS })];
  let chunk = []; let first = true;
  const flush = () => { if (chunk.length) { sections.push(mkSection(chunk, { cols: true, type: SectionType.CONTINUOUS })); chunk = []; } };
  chunk.push(...abs);
  for (const b of paper.body) {
    if (b.t === 'fig' && b.wide) {
      flush();
      sections.push(mkSection(blocksToDocx([b], wideOpt), { cols: false, type: SectionType.CONTINUOUS }));
    } else chunk.push(...blocksToDocx([b], opt));
  }
  chunk.push(...blocksToDocx([{ t: 'h1', text: 'References' }, { t: 'refs', items: paper.references }], opt));
  flush();
  return new Document({
    creator: 'PS Laser project team', title: paper.title,
    numbering: numberingConfig(20),
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections,
  });
}

function paperHtml() {
  const authorCell = (a) => a ? `<div class="au"><div class="nm">${esc(a.name)}</div>${paper.affiliation.map((l) => `<div class="af">${esc(l)}</div>`).join('')}<div class="em">${esc(a.email)}</div></div>` : '<div></div>';
  const bodyHtml = blocksToHtml(paper.body, { figDir: FIG })
    + `<h1>References</h1>${blocksToHtml([{ t: 'refs', items: paper.references }], { figDir: FIG })}`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(paper.title)}</title><style>
@page { size: letter; margin: 0.75in 0.75in 1in 0.75in; }
body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; color: #000; margin: 0; }
h0, .title { font-size: 20pt; text-align: center; line-height: 1.15; margin: 0 0 10pt; font-weight: 400; }
.authors { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6pt 10pt; margin-bottom: 8pt; }
.au { text-align: center; } .nm { font-size: 11pt; } .af { font-size: 9pt; font-style: italic; } .em { font-size: 9pt; }
.cols { column-count: 2; column-gap: 0.25in; text-align: justify; }
.abs { font-size: 9pt; font-weight: bold; margin: 0 0 6pt; } .abs i { font-weight: bold; }
h1 { font-size: 9pt; text-transform: uppercase; text-align: center; font-weight: 400; margin: 9pt 0 4pt; break-after: avoid; letter-spacing: .02em; }
h2 { font-size: 10pt; font-style: italic; font-weight: 400; margin: 6pt 0 2pt; break-after: avoid; }
p { margin: 0 0 4pt; line-height: 1.12; } .note { background: #fff4e0; padding: 2pt 3pt; font-style: italic; }
ul, ol { margin: 0 0 4pt; padding-left: 15pt; } li { margin: 0 0 1.5pt; line-height: 1.12; }
.eq { display: flex; justify-content: space-between; margin: 2pt 0 3pt; font-style: italic; } .eq span:first-child { flex: 1; text-align: center; }
code { font-family: 'Courier New', monospace; font-size: 8.5pt; }
.tbl { break-inside: avoid; margin: 4pt 0 6pt; } .cap { font-size: 8pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
table { border-collapse: collapse; width: 100%; font-size: 8pt; text-align: left; } th, td { border: 0.5pt solid #777; padding: 1.2pt 2.5pt; vertical-align: top; } th { background: #e7e7e7; }
figure { margin: 4pt 0 6pt; text-align: center; break-inside: avoid; } figure.wide { column-span: all; } figcaption { font-size: 8pt; margin-top: 2pt; text-align: center; }
figure img { max-width: 100%; }
.refs { font-size: 8pt; padding-left: 16pt; } .refs li { line-height: 1.08; }
</style></head><body>
<div class="title">${esc(paper.title)}</div>
<div class="authors">${paper.authors.map(authorCell).join('')}</div>
<div class="cols">
<p class="abs"><i>Abstract—</i>${esc(paper.abstract)}</p>
<p class="abs"><i>Index Terms—</i>${esc(paper.keywords)}</p>
${bodyHtml}
</div></body></html>`;
}

// =============================================================== SRS (A4, single column, landscape figure)
const A4 = { width: 11906, height: 16838 };
const SM = { top: 1300, bottom: 1300, left: 1300, right: 1300 };
const SW = A4.width - SM.left - SM.right;

function srsDocx() {
  const opt = { bodySize: 21, tableSize: 18, contentWidth: SW, headingStyle: 'report', figDir: FIG };
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PS Laser — System Requirements and Architecture Specification · page ', font: FONT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] });
  const cover = [
    new Paragraph({ spacing: { before: 1800, after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: srs.meta.institute, font: FONT, size: 24 })] }),
    new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: srs.meta.course, font: FONT, size: 22, italics: true })] }),
    new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: srs.meta.title, font: FONT, size: 48, bold: true })] }),
    new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: srs.meta.subtitle, font: FONT, size: 32, color: 'B35900' })] }),
    new Paragraph({ spacing: { after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Prepared by', font: FONT, size: 20, italics: true })] }),
    ...srs.meta.authors.map((a) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [new TextRun({ text: a, font: FONT, size: 24 })] })),
    new Paragraph({ spacing: { before: 400, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Version ${srs.meta.version}`, font: FONT, size: 22 })] }),
    new Paragraph({ spacing: { after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: srs.meta.date, font: FONT, size: 22 })] }),
    ...blocksToDocx([{ t: 'table', ...srs.control }], { ...opt, tableSize: 18 }),
    new Paragraph({ pageBreakBefore: true, spacing: { after: 160 }, children: [new TextRun({ text: 'Contents', font: FONT, size: 30, bold: true })] }),
    ...srs.body.filter((b) => b.t === 'h1').map((b) => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: b.text, font: FONT, size: 22 })] })),
  ];
  const portrait = (children, type) => ({ properties: { type, page: { size: A4, margin: SM } }, footers: { default: footer }, children });
  const landscape = (children) => ({ properties: { type: SectionType.NEXT_PAGE, page: { size: { width: A4.width, height: A4.height, orientation: PageOrientation.LANDSCAPE }, margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, footers: { default: footer }, children });
  const sections = [portrait(cover, SectionType.NEXT_PAGE)];
  let cur = []; let first = true;
  const flush = () => { if (cur.length) { sections.push(portrait(cur, SectionType.NEXT_PAGE)); cur = []; } };
  for (const b of srs.body) {
    if (b.t === 'fig' && b.landscape) { flush(); sections.push(landscape(blocksToDocx([b], { ...opt, contentWidth: A4.height - 1800 }))); }
    else {
      if (b.t === 'h1' && first) { first = false; }
      cur.push(...blocksToDocx([b], opt));
    }
  }
  flush();
  return new Document({ creator: 'PS Laser project team', title: `${srs.meta.title} — PS Laser`, numbering: numberingConfig(21), styles: { default: { document: { run: { font: FONT, size: 21 } } } }, sections });
}

function srsHtml() {
  const m = srs.meta;
  const ctl = blocksToHtml([{ t: 'table', ...srs.control }], { figDir: FIG });
  const toc = srs.body.filter((b) => b.t === 'h1').map((b) => `<div>${esc(b.text)}</div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(m.title)} - PS Laser</title><style>
@page { size: A4; margin: 0.9in; @bottom-center { content: "PS Laser — System Requirements and Architecture Specification · page " counter(page); font: 8pt 'Times New Roman'; } }
@page land { size: A4 landscape; margin: 0.6in; }
body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; color: #000; text-align: justify; }
.cover { text-align: center; padding-top: 80pt; break-after: page; } .cover .inst { font-size: 12pt; } .cover .course { font-style: italic; margin: 6pt 0 40pt; }
.cover h1.t { font-size: 24pt; margin: 0 0 6pt; border: 0; } .cover .sub { font-size: 16pt; color: #b35900; margin-bottom: 40pt; } .cover .au { font-size: 12pt; }
.toc { break-after: page; font-size: 11pt; text-align: left; } .toc h1 { margin-top: 0; }
h1 { font-size: 15pt; margin: 16pt 0 6pt; break-after: avoid; } h2 { font-size: 12pt; margin: 10pt 0 3pt; break-after: avoid; }
p { margin: 0 0 6pt; line-height: 1.25; } ul, ol { margin: 0 0 6pt; padding-left: 20pt; } li { margin-bottom: 2pt; line-height: 1.22; }
code { font-family: 'Courier New', monospace; font-size: 9pt; } pre { background: #f2f2f2; padding: 6pt; font: 8.5pt 'Courier New', monospace; white-space: pre-wrap; break-inside: avoid; }
.tbl { margin: 6pt 0 10pt; } .cap { text-align: center; font-size: 9.5pt; margin-bottom: 3pt; break-after: avoid; }
table { border-collapse: collapse; width: 100%; font-size: 9pt; text-align: left; } th, td { border: 0.5pt solid #808080; padding: 2pt 4pt; vertical-align: top; } th { background: #e7e7e7; } tr { break-inside: avoid; }
figure { margin: 0; text-align: center; } figure.land { page: land; break-before: page; break-after: page; padding-top: 10pt; } figcaption { font-size: 9.5pt; margin-top: 4pt; }
.refs { font-size: 9.5pt; }
</style></head><body>
<div class="cover"><div class="inst">${esc(m.institute)}</div><div class="course">${esc(m.course)}</div>
<h1 class="t">${esc(m.title)}</h1><div class="sub">${esc(m.subtitle)}</div>
<div><i>Prepared by</i></div>${m.authors.map((a) => `<div class="au">${esc(a)}</div>`).join('')}
<div style="margin-top:20pt">Version ${esc(m.version)}</div><div style="margin-bottom:20pt">${esc(m.date)}</div>${ctl}</div>
<div class="toc"><h1>Contents</h1>${toc}</div>
${blocksToHtml(srs.body, { figDir: FIG })}
</body></html>`;
}

// =============================================================== write everything
const stamp = 'PSLaser_FINAL';
fs.writeFileSync(path.join(HERE, 'paper.html'), paperHtml());
fs.writeFileSync(path.join(HERE, 'srs.html'), srsHtml());
fs.writeFileSync(path.join(OUT, `${stamp}_IEEE_Research_Paper.docx`), await Packer.toBuffer(paperDocx()));
fs.writeFileSync(path.join(OUT, `${stamp}_System_Requirements_and_Architecture.docx`), await Packer.toBuffer(srsDocx()));
console.log('built');
