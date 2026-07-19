/**
 * scroll-wrap.css.ts — lets tall pages scroll.
 *
 * The base layout pins body to the viewport; pages with long content opt out by
 * rendering a .friends-wrap / .selfies-wrap container. These rules used to live
 * in pages/cool-people.css, but /guestbook renders .friends-wrap too and lost
 * the ability to scroll when page CSS stopped loading everywhere — so they are
 * shared, and genuinely cross-page.
 *
 * Ported from public/css/shared/scroll-wrap.css.
 *
 * Note the selectors target `html` and `body` directly. That is only possible
 * with globalStyle — style() generates a class and can't reach up to ancestors
 * it doesn't own. Any rule styling html/body has to stay global permanently.
 */
import { globalStyle } from "@vanilla-extract/css";

/** Containers whose presence should make the page scrollable. */
const WRAPS = [".friends-wrap", ".selfies-wrap"];

for (const wrap of WRAPS) {
  globalStyle(`html:has(${wrap}), body:has(${wrap})`, {
    height: "auto",
    minHeight: "100dvh",
    overflowY: "auto",
  });
}

globalStyle("body:has(.friends-wrap)", {
  alignItems: "flex-start",
});
