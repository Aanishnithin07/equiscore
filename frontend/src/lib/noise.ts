// frontend/src/lib/noise.ts

/**
 * Generates an SVG string representation of Perlin Noise directly mapping
 * into a base64 Data URL, allowing us to overlay physical tactile texture 
 * dynamically without importing static assets.
 */
export function generateNoiseTexture(): string {
  const svg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
    </svg>`;
  return `url("data:image/svg+xml;base64,${btoa(svg)}")`;
}

/**
 * Mounts the dynamic noise URL transparently mapping globally onto the :root
 * allowing .glass-noise components directly mapping --noise-texture safely.
 */
export function initNoisePattern() {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty('--noise-texture', generateNoiseTexture());
  }
}
