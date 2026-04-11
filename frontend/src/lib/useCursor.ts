// frontend/src/lib/useCursor.ts

/**
 * Empty interface as we execute standard DOM attributes natively.
 * To interact with the custom physical cursor:
 * 1. Add `data-magnetic="true"` to any element to make the cursor ring huge and snap.
 * 2. Add `data-cursor="text"` to make the ring morph into an I-beam.
 * 3. Add `data-cursor="loading"` to make the ring spin.
 */
export function useCursor() {
  // We can expose imperative triggers here if needed, but the cursor follower
  // relies mostly on document-wide event delegation tracking data-attributes natively
  // for performance (60fps without React render cycle intercepts).
  return {};
}
