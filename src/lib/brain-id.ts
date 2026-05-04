// Per-instance counter shared by all <Brain /> renders. Module state lives for
// the lifetime of one SSR pass, so two <Brain /> on the same page get distinct
// gradient/filter ids without using Math.random (which would byte-shift HTML
// every request and break edge caching).
let counter = 0;
export const nextBrainId = () => ++counter;
