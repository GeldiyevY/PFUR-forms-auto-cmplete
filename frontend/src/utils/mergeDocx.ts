import PizZip from 'pizzip';

const DOCUMENT_XML = 'word/document.xml';

/**
 * Split a document.xml into its body inner content and its trailing section
 * properties. In OOXML the body-level trailing <w:sectPr> defines the final
 * section (page size / orientation / margins / headers). Earlier sections are
 * defined by <w:sectPr> inside a paragraph's <w:pPr> (a "pPr sectPr"), which
 * describes the section that ENDS at that paragraph.
 */
function splitBody(xml: string): { inner: string; sectPr: string } {
  const bodyOpen = xml.indexOf('<w:body');
  const bodyClose = xml.lastIndexOf('</w:body>');
  if (bodyOpen === -1 || bodyClose === -1 || bodyClose < bodyOpen) {
    return { inner: xml, sectPr: '' };
  }
  const bodyStart = xml.indexOf('>', bodyOpen) + 1;
  let inner = xml.slice(bodyStart, bodyClose);

  // Drop a leading sectPr if the doc carries one at the top of its body.
  inner = inner.replace(/^\s*<w:sectPr[\s\S]*?<\/w:sectPr>/, '');

  // Extract the LAST sectPr (the body-level section properties).
  const lastIdx = inner.lastIndexOf('<w:sectPr');
  if (lastIdx === -1) {
    return { inner, sectPr: '' };
  }
  const endIdx = inner.indexOf('</w:sectPr>', lastIdx);
  if (endIdx === -1) {
    return { inner, sectPr: '' };
  }
  const sectPr = inner.slice(lastIdx, endIdx + '</w:sectPr>'.length);
  inner = inner.slice(0, lastIdx) + inner.slice(endIdx + '</w:sectPr>'.length);
  return { inner, sectPr };
}

/** Wrap a section's <w:sectPr> as a paragraph-level section break. */
function makeSectionBreak(sectPr: string): string {
  return sectPr ? `<w:p><w:pPr>${sectPr}</w:pPr></w:p>` : '';
}

/**
 * Merge several .docx buffers into one, preserving each template's page
 * orientation (and other section properties) as real section breaks.
 *
 * Every template i's content is followed by a section-break paragraph carrying
 * template i's own <w:sectPr>. The primary (buffer[0]) document's sectPr is
 * kept both as a break after its content and as the final body-level sectPr, so
 * its headers/footers/numbering and the closing section are preserved.
 *
 * Only word/document.xml is modified; all other parts (headers, footers,
 * relationships, media) stay in the primary zip, so references remain valid.
 */
export function mergeDocxBuffers(buffers: Uint8Array[]): Uint8Array {
  if (buffers.length === 0) {
    throw new Error('Нет шаблонов для объединения');
  }
  if (buffers.length === 1) return buffers[0];

  const primary = new PizZip(buffers[0]);
  const primaryXml = primary.file(DOCUMENT_XML)?.asText() ?? '';

  const { inner: primaryInner, sectPr: primarySect } = splitBody(primaryXml);

  let result = primaryInner + makeSectionBreak(primarySect);

  for (let i = 1; i < buffers.length; i++) {
    const zip = new PizZip(buffers[i]);
    const xml = zip.file(DOCUMENT_XML)?.asText() ?? '';
    const { inner, sectPr } = splitBody(xml);
    result += inner + makeSectionBreak(sectPr);
  }

  // Rebuild document.xml: keep everything up to the body open tag, then inject
  // the merged body, then re-append the primary's trailing sectPr and close.
  const bodyOpen = primaryXml.indexOf('<w:body');
  const bodyOpenEnd = primaryXml.indexOf('>', bodyOpen) + 1;
  const bodyClose = primaryXml.lastIndexOf('</w:body>');
  const head = primaryXml.slice(0, bodyOpenEnd);
  const tail = primaryXml.slice(bodyClose); // includes </w:body></w:document>
  // tail starts at </w:body>; ensure the primary's sectPr is the final section.
  const newXml = head + result + primarySect + tail;

  primary.file(DOCUMENT_XML, newXml);
  return primary.generate({ type: 'uint8array' });
}
