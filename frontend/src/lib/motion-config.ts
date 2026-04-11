// frontend/src/lib/motion-config.ts

// Framer Motion global configurations mirroring our physical motion principles

export const spring = {
  gentle:  { type: 'spring', stiffness: 120, damping: 20, mass: 1 },
  snappy:  { type: 'spring', stiffness: 280, damping: 26, mass: 1 },
  bouncy:  { type: 'spring', stiffness: 360, damping: 18, mass: 0.8 },
  stiff:   { type: 'spring', stiffness: 500, damping: 30, mass: 1 },
  slow:    { type: 'spring', stiffness: 80,  damping: 20, mass: 1.2 },
};

export const fadeUpVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring.snappy },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

export const scaleVariants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: spring.bouncy },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
};

export const slideRightVariants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: spring.snappy },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.18 } },
};

export const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
