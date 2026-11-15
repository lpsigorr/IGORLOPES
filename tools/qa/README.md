# Checks

Scripts that test the built site in a real browser (Python with Playwright and Chrome).
Run `npm run build && npm run preview` first; the scripts read http://localhost:4321/IGORLOPES/.

- `audit.py`: every page, 12 screen sizes, 3 languages. Reports cut, oversized, enlarged or broken pictures,
  anything wider than the screen, broken words, tiny text, small touch targets, console errors.
- `fly.py`: the home sequence. Every piece must stay whole on screen, one word at a time.
- `hover.py`: display type may widen on hover, never re-wrap or touch its neighbour.
- `perf.py`: scrolls with the processor slowed 4x and times every frame.
