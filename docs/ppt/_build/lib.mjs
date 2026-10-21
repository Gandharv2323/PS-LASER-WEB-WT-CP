// Tiny block model -> HTML and DOCX renderers shared by both deliverables.
import fs from 'node:fs';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType,
  BorderStyle, ImageRun, SectionType, LevelFormat, PageOrientation, TabStopType, VerticalAlign,
} from 'docx';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- inline markup: **bold**, *italic*, `code`, ^sup^ -------------------------------------------------
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\^[^^]+\^|~[^~]+~)/g;
export function inlineHtml(s) {
  return esc(s).split(TOKEN).map((p) => {
    if (p.startsWith('**')) return `<b>${p.slice(2, -2)}</b>`;
    if (p.startsWith('*')) return `<i>${p.slice(1, -1)}</i>`;
    if (p.startsWith('`')) return `<code>${p.slice(1, -1)}</code>`;
    if (p.startsWith('^')) return `<sup>${p.slice(1, -1)}</sup>`;
    if (p.startsWith('~')) return `<sub>${p.slice(1, -1)}</sub>`;
    return p;
  }).join('');
}
export function inlineRuns(s, base = {}) {
  return String(s).split(TOKEN).filter((p) => p !== '').map((p) => {
    if (p.startsWith('**')) return new TextRun({ ...base, text: p.slice(2, -2), bold: true });
    if (p.startsWith('*')) return new TextRun({ ...base, text: p.slice(1, -1), italics: true });
    if (p.startsWith('`')) return new TextRun({ ...base, text: p.slice(1, -1), font: 'Courier New', size: Math.max(14, (base.size || 20) - 2) });
    if (p.startsWith('^')) return new TextRun({ ...base, text: p.slice(1, -1), superScript: true });
    if (p.startsWith('~')) return new TextRun({ ...base, text: p.slice(1, -1), subScript: true });
    return new TextRun({ ...base, text: p });
  });
}

const pngSize = (file) => {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

// ---- HTML ----------------------------------------------------------------------------------------------
export function blocksToHtml(blocks, { figDir }) {
  let out = '';
  for (const b of blocks) {
    switch (b.t) {
      case 'h1': out += `<h1>${inlineHtml(b.text)}</h1>`; break;
      case 'h2': out += `<h2>${inlineHtml(b.text)}</h2>`; break;
      case 'h3': out += `<h3>${inlineHtml(b.text)}</h3>`; break;
      case 'p': out += `<p>${inlineHtml(b.text)}</p>`; break;
      case 'note': out += `<p class="note">${inlineHtml(b.text)}</p>`; break;
      case 'ul': out += `<ul>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ul>`; break;
      case 'ol': out += `<ol>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ol>`; break;
      case 'eq': out += `<div class="eq"><span>${inlineHtml(b.text)}</span><span class="n">(${b.n})</span></div>`; break;
      case 'code': out += `<pre>${esc(b.text)}</pre>`; break;
      case 'table': {
        out += `<div class="tbl"><div class="cap">${inlineHtml(b.caption)}</div><table>`;
        out += `<colgroup>${b.widths.map((w) => `<col style="width:${w}%">`).join('')}</colgroup>`;
        out += `<thead><tr>${b.head.map((h) => `<th>${inlineHtml(h)}</th>`).join('')}</tr></thead><tbody>`;
        out += b.rows.map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join('')}</tr>`).join('');
        out += '</tbody></table></div>';
        break;
      }
      case 'fig': {
        const src = `file:///${figDir.replace(/\\/g, '/')}/${b.file}`;
        out += `<figure class="${b.wide ? 'wide' : ''}${b.landscape ? ' land' : ''}"><img src="${src}" style="width:${b.widthPct || 100}%"><figcaption>${inlineHtml(b.caption)}</figcaption></figure>`;
        break;
      }
      case 'pagebreak': out += '<div class="pb"></div>'; break;
      case 'refs': out += `<ol class="refs">${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</ol>`; break;
      case 'spacer': out += '<div style="height:6pt"></div>'; break;
      default: throw new Error('unknown block ' + b.t);
    }
  }
  return out;
}

// ---- DOCX ----------------------------------------------------------------------------------------------
const FONT = 'Times New Roman';
const NOB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOBORDERS = { top: NOB, bottom: NOB, left: NOB, right: NOB };

/**
 * opts: { bodySize (half-points), tableSize, contentWidth (DXA), headingStyle: 'ieee'|'report', figDir }
 * Returns array of Paragraph/Table children.
 */
export function blocksToDocx(blocks, opts) {
  const { bodySize, tableSize, contentWidth, headingStyle, figDir } = opts;
  const out = [];
  const bodyRun = { font: FONT, size: bodySize };
  for (const b of blocks) {
    switch (b.t) {
      case 'h1':
        out.push(new Paragraph({
          alignment: headingStyle === 'ieee' ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: headingStyle === 'ieee' ? 160 : 320, after: headingStyle === 'ieee' ? 80 : 120 },
          keepNext: true,
          outlineLevel: 0,
          children: [new TextRun({ text: headingStyle === 'ieee' ? b.text.toUpperCase() : b.text, font: FONT, size: headingStyle === 'ieee' ? 18 : 30, bold: headingStyle !== 'ieee', smallCaps: false })],
        }));
        break;
      case 'h2':
        out.push(new Paragraph({
          spacing: { before: 100, after: 40 }, keepNext: true, outlineLevel: 1,
          children: [new TextRun({ text: b.text, font: FONT, size: headingStyle === 'ieee' ? 20 : 24, italics: headingStyle === 'ieee', bold: headingStyle !== 'ieee' })],
        }));
        break;
      case 'h3':
        out.push(new Paragraph({ spacing: { before: 80, after: 30 }, keepNext: true, children: [new TextRun({ text: b.text, font: FONT, size: bodySize, bold: true, italics: true })] }));
        break;
      case 'p':
        out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 70 }, children: inlineRuns(b.text, bodyRun) }));
        break;
      case 'note':
        out.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 70 }, shading: { type: ShadingType.CLEAR, fill: 'FFF4E0' }, children: inlineRuns(b.text, { ...bodyRun, italics: true }) }));
        break;
      case 'ul':
        b.items.forEach((i) => out.push(new Paragraph({ numbering: { reference: 'bul', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 30 }, children: inlineRuns(i, bodyRun) })));
        break;
      case 'ol':
        b.items.forEach((i) => out.push(new Paragraph({ numbering: { reference: 'num', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 30 }, children: inlineRuns(i, bodyRun) })));
        break;
      case 'eq':
        out.push(new Paragraph({
          tabStops: [{ type: TabStopType.CENTER, position: Math.round(contentWidth / 2) }, { type: TabStopType.RIGHT, position: contentWidth }],
          spacing: { before: 40, after: 60 },
          children: [new TextRun({ text: '\t', ...bodyRun }), ...inlineRuns(b.text, { ...bodyRun, italics: true }), new TextRun({ text: `\t(${b.n})`, ...bodyRun })],
        }));
        break;
      case 'code':
        b.text.split('\n').forEach((l) => out.push(new Paragraph({ spacing: { after: 0 }, shading: { type: ShadingType.CLEAR, fill: 'F2F2F2' }, children: [new TextRun({ text: l || ' ', font: 'Courier New', size: 16 })] })));
        out.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
        break;
      case 'table': {
        const total = contentWidth;
        const cw = b.widths.map((w) => Math.floor((total * w) / 100));
        cw[cw.length - 1] += total - cw.reduce((a, c) => a + c, 0);
        const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
        const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
        const mk = (txt, i, head) => new TableCell({
          width: { size: cw[i], type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.TOP,
          margins: { top: 30, bottom: 30, left: 60, right: 60 },
          shading: head ? { type: ShadingType.CLEAR, fill: 'E7E7E7' } : undefined,
          children: [new Paragraph({ spacing: { after: 0 }, children: inlineRuns(txt, { font: FONT, size: tableSize, bold: head }) })],
        });
        out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 50 }, keepNext: true, children: inlineRuns(b.caption, { font: FONT, size: tableSize + 2, smallCaps: headingStyle === 'ieee' }) }));
        out.push(new Table({
          width: { size: total, type: WidthType.DXA }, columnWidths: cw,
          rows: [new TableRow({ tableHeader: true, children: b.head.map((h, i) => mk(h, i, true)) }),
            ...b.rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => mk(c, i, false)) }))],
        }));
        out.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
        break;
      }
      case 'fig': {
        const file = `${figDir}\\${b.file}`;
        const { w, h } = pngSize(file);
        const maxW = Math.round(((b.maxWidthPx) || (contentWidth / 15)) * (b.widthPct || 100) / 100); // px at 96 dpi (1 DXA = 1/15 px)
        const dw = maxW, dh = Math.round((h / w) * dw);
        out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 }, keepNext: true, children: [new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: dw, height: dh }, altText: { title: b.caption.slice(0, 40), description: b.caption, name: b.file } })] }));
        out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: inlineRuns(b.caption, { font: FONT, size: tableSize + 2 }) }));
        break;
      }
      case 'refs':
        b.items.forEach((i, k) => out.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: { after: 30 }, indent: { left: 360, hanging: 360 },
          children: [new TextRun({ text: `[${k + 1}]\t`, font: FONT, size: tableSize + 2 }), ...inlineRuns(i, { font: FONT, size: tableSize + 2 })],
          tabStops: [{ type: TabStopType.LEFT, position: 360 }],
        })));
        break;
      case 'pagebreak': out.push(new Paragraph({ pageBreakBefore: true, children: [] })); break;
      case 'spacer': out.push(new Paragraph({ spacing: { after: 80 }, children: [] })); break;
      default: throw new Error('unknown block ' + b.t);
    }
  }
  return out;
}

export const numberingConfig = (size) => ({
  config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { font: FONT, size } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } }, run: { font: FONT, size } } }] },
  ],
});

export { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType, BorderStyle, ImageRun, SectionType, PageOrientation, NOBORDERS, FONT, VerticalAlign };
