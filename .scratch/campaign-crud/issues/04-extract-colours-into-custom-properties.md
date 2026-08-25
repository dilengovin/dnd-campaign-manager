# 04: Extract colours into CSS custom properties

**What to build:** Nothing changes on screen. The colours currently hardcoded as
hex values throughout the component stylesheets move into custom properties in the
global stylesheet, so there is one place to change them.

The timing is the point: Phase 2 roughly triples the component count, and the
first colour repeated across four components is already repeated across two. Doing
this now means the new screens consume the properties instead of copying more hex
codes; doing it later means finding them all again.

No CSS framework. TailwindCSS was present before the Angular 21 re-scaffold and
was dropped by it — reinstating it is its own deliberate change, not something to
smuggle inside a feature.

**Blocked by:** 01. Independent of every other ticket — can run in parallel with 02 and 03.

**Status:** ready-for-agent

- [ ] Colour values are defined once in the global stylesheet as custom properties
- [ ] Component stylesheets reference those properties instead of literal hex values
- [ ] The app looks identical to before, screen for screen
- [ ] The property names describe roles, not the colours themselves, so a future theme change is a value change
- [ ] `npm run build` succeeds
