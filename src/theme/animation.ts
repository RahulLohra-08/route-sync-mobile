// theme/animation.ts
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  spring: {
    damping: 18,
    stiffness: 180,
    mass: 0.8,
  },

  scale: {
    pressed: 0.97,
    normal: 1,
  },
} as const;