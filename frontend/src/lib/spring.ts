// frontend/src/lib/spring.ts

/**
 * A minimal custom spring physics mathematical engine bypassing external dependencies
 * specifically used for high frequency interactions (cursor loops, magnetism math) natively.
 */
export function createSpring(config: {stiffness: number, damping: number, mass: number}) {
  let pos = 0, vel = 0, target = 0;
  
  return {
    setTarget: (t: number) => { 
        target = t; 
    },
    step: (dt: number) => {
        const force = -config.stiffness * (pos - target);
        const damping = -config.damping * vel;
        const acc = (force + damping) / config.mass;
        vel += acc * dt;
        pos += vel * dt;
        return pos;
    },
    isSettled: () => Math.abs(vel) < 0.001 && Math.abs(pos - target) < 0.001,
    getPos: () => pos,
    setPos: (p: number) => {
        pos = p;
        target = p;
        vel = 0;
    }
  };
}
