// Comparison Document — DETERMINISTIC page composition (MAJOR-2). Browser print CSS cannot reliably
// compute a total page count for flowing content, so the document is paginated APP-SIDE here: a fixed
// number of item rows per page, with real `pageNumber` / `pageCount` on every page. Both the on-screen
// preview and the print output render the exact same page set.

import type { CsLineItem } from "../comparative-statement/cs-view-models";

/** ~14 item rows per landscape page — never a shrunken font; more items add pages. */
export const ITEMS_PER_PAGE = 14;

interface PageBase {
  pageNumber: number;
  pageCount: number;
}

export type ComparisonDocumentPage =
  | ({ kind: "cover" } & PageBase)
  | ({
      kind: "items";
      items: CsLineItem[];
      fromSl: number;
      toSl: number;
      withTotals: boolean;
    } & PageBase)
  | ({ kind: "final" } & PageBase);

export function composeDocumentPages(
  items: CsLineItem[],
  itemsPerPage: number = ITEMS_PER_PAGE,
): ComparisonDocumentPage[] {
  const chunks: CsLineItem[][] = [];
  for (let i = 0; i < items.length; i += itemsPerPage) {
    chunks.push(items.slice(i, i + itemsPerPage));
  }
  if (chunks.length === 0) chunks.push([]);

  const pageCount = 1 + chunks.length + 1; // cover + item pages + final
  const pages: ComparisonDocumentPage[] = [];
  let pageNumber = 1;

  pages.push({ kind: "cover", pageNumber: pageNumber++, pageCount });
  chunks.forEach((chunk, ci) => {
    pages.push({
      kind: "items",
      items: chunk,
      fromSl: chunk[0]?.sl ?? 0,
      toSl: chunk[chunk.length - 1]?.sl ?? 0,
      withTotals: ci === chunks.length - 1,
      pageNumber: pageNumber++,
      pageCount,
    });
  });
  pages.push({ kind: "final", pageNumber: pageNumber++, pageCount });

  return pages;
}
