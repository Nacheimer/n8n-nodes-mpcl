// Load jsdom at runtime. Use require to avoid TypeScript module resolution error when types are missing.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { JSDOM } = require('jsdom');

export type TenderResult = {
  id: string;
  title: string;
  description: string | null;
  monto: string | null;
  fechaPublicacion: string | null;
  fechaCierre: string | null;
  organismo: string | null;
  estado: string | null;
  link: string | null;
};

export function parseSearchHtml(html: string): TenderResult[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const results: TenderResult[] = [];

  // The page places each result inside .lic-bloq-wrap
  const nodeList = doc.querySelectorAll('.lic-bloq-wrap');
  // use any for elements to avoid requiring DOM lib in tsconfig for this small utility
  const items = Array.from(nodeList) as any[];

  for (const item of items) {
    try {
      const idNode = item.querySelector('.id-licitacion span');
      const id = idNode ? (idNode.textContent || '').trim() : '';

      const titleNode = item.querySelector('h2');
      const title = titleNode ? (titleNode.textContent || '').trim() : '';

      const descNode = item.querySelector('.lic-block-body p.text-weight-light');
      const description = descNode ? (descNode.textContent || '').trim() : null;

      // monto may appear as .campo-numerico-punto-coma or .monto-no-publico
      const montoNode = item.querySelector('.campo-numerico-punto-coma, .monto-no-publico');
      const monto = montoNode ? (montoNode.textContent || '').trim() : null;

      // Dates: try more specific selectors first, then fallback to regex
      let fechaPublicacion: string | null = null;
      let fechaCierre: string | null = null;

      // Try to find dates with more specific selectors to avoid picking up monetary values
      // Look for spans with specific date patterns within the lic-block-body
      const pubDateNode = item.querySelector('.lic-block-body .col-md-4:nth-of-type(1) .highlight-text');
      const closeDateNode = item.querySelector('.lic-block-body .col-md-4:nth-of-type(2) .highlight-text');

      if (pubDateNode) {
        const pubText = (pubDateNode.textContent || '').trim();
        // Validate it's a date format DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(pubText)) {
          fechaPublicacion = pubText;
        }
      }

      if (closeDateNode) {
        const closeText = (closeDateNode.textContent || '').trim();
        // Validate it's a date format DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(closeText)) {
          fechaCierre = closeText;
        }
      }

      // Fallback to regex if specific selectors fail
      if (!fechaPublicacion || !fechaCierre) {
        const text = item.textContent || '';
        const pubMatch = text.match(/Fecha de publicaci[oó]n\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i);
        const closeMatch = text.match(/Fecha de cierre\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i);
        if (pubMatch && !fechaPublicacion) fechaPublicacion = pubMatch[1];
        if (closeMatch && !fechaCierre) fechaCierre = closeMatch[1];
      }

      const organismoNode = item.querySelector('.lic-bloq-footer .col-md-4 strong');
      const organismo = organismoNode ? (organismoNode.textContent || '').trim() : null;

      const estadoNode = item.querySelector('.estado-texto');
      const estado = estadoNode ? (estadoNode.textContent || '').trim() : null;

      const linkNode = item.querySelector('a[onclick]');
      let link: string | null = null;
      if (linkNode) {
        const onclick = linkNode.getAttribute('onclick') || '';
        const m = onclick.match(/verFicha\('([^']+)'\)/);
        if (m) link = m[1];
      }

      results.push({ id, title, description, monto, fechaPublicacion, fechaCierre, organismo, estado, link });
    } catch (err) {
      // skip malformed item
    }
  }

  return results;
}
