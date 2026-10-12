# kakadelaser.in clone: QA notes (2026-10-12)

## Method
The in-app browser couldn't reach https://kakadelaser.in (its policy check kept failing), so the comparison ran through a
headless Chromium driven over CDP (Playwright's `chrome-headless-shell`). Both pages were loaded at the same
viewport, scrolled top-to-bottom to fire AOS, then captured as full-page screenshots and measured with a
DOM-metrics script (section top/height, scrollWidth, overflowing elements). Interactive states were scripted
the same way on both pages: scrolled header, Engineering and Architectural dropdowns, company-profile modal,
mobile nav, and the mobile Engineering and Architectural dropdowns.

Noise floor: capturing the source twice gives about 28k differing pixels in the capability grid (AOS zoom-in
timing) and about 60k in testimonials (autoplay timing).

## Comparison 1: desktop 1440x900, full page (`qa/desktop-1440-top.png` shows hero to specs bar)
Columns: source, clone, diff mask.
- Document height is 8558 on both. All 13 header/section/footer boxes match in top, height and width.
- Header, nav carets, hero copy, trusted-by sprites, about, specs bar, why-us, get-in-touch, blogs and footer
  show no pixel differences beyond the noise floor. The hero diff comes from the carousel being on a different
  slide plus the Next dev badge, which only appears in dev.
- Probed geometry is identical for capability cards (for example `#bending` at 387,2126 315x605), the
  testimonial stage, the dropdown menu (517.5,97.5 against Popper's 517.6,98) and the modal dialog
  (420,33.6 600x832.8).

## Comparison 2: mobile 375x812, full page (`qa/mobile-375-testimonials-whyus.png`)
Columns: source, clone.
- Document height is 17096 on both, scrollWidth is 375 and every section box matches.
- In 800px bands, every band from 800 to 17096 has zero differing pixels. The 0-800 band differs only
  because of the hero slide timing and the dev badge.
- The blog thumbnails overflow to the right (right edge 387.5) on both pages. The source does the same.
- Mobile Engineering dropdown: menu at 20,212 302x338 on both. Mobile Architectural dropdown: pinned to
  the nav's top-left (15,70) on both.

## Fixed in this pass
- Downloaded the missing blog video `video/idea-to-product-manufacturing-kakade-laser-pune.mp4` (7.6 MB)
  and removed `preload="none"`, so the first frame and the 0:46 duration show as on the source.
- Restored whitespace that the source's markup renders and JSX dropped: the gap before the
  Engineering, Architectural and Mfg. at Glance carets, "Engineering & Sheet" in the hero h1, the spaces
  between footer social icons, and the spaces around the testimonial quote icons.
- First capability card: matched the source quirk of an empty `<h5>` and no `align-items-stretch`.
  This made it 10px taller, which shifted every later section.
- Rebuilt the testimonials as an owl-style stage. All slides sit side by side, so the stage is as tall as
  the tallest quote, with loop clones, a 250ms slide, 5s autoplay and dots. Mobile height went from
  368 to 752, matching the source.
- Mobile nav dropdowns now sit where Popper puts them on the source.
- Dropdowns close on an outside click or Escape, as Bootstrap's do.
- The hero carousel pauses on hover (Bootstrap's default).

## Known remaining differences
- When Bootstrap opens a dropdown, it focuses the toggle, which draws a focus ring after a scripted click.
  The clone doesn't move focus.
- The testimonials carousel has no mouse or touch drag (owl `owl-drag`). The source's `.ogg` fallback
  source isn't included; the MP4 plays everywhere.
- There's a 0.5px difference in desktop dropdown top (95.5 against Popper's rounded 96).
- IcoFont: the source never loads an IcoFont stylesheet, so the `font-family: IcoFont` rules fall back on
  both pages. Nothing was downloaded for it.
