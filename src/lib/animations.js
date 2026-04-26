export const easing = [0.25, 0.1, 0.25, 1]; // Premium custom easing bezier
export const smoothBezier = [0.16, 1, 0.3, 1]; // Deep fluid motion

// Page load animation: smooth fade in with upward motion and depth scale
export const pageLoadVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: smoothBezier,
    },
  },
};

// Stagger parent for displaying lists (e.g. products)
export const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Item variant to be used inside the staggerContainer
export const staggerItemVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: smoothBezier,
    },
  },
};

// Hover scaling for product cards (combines with dynamic physics layer)
export const cardHoverVariant = {
  rest: {
    scale: 1,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.4, ease: smoothBezier },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 25px 45px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.4, ease: smoothBezier },
  },
};

// Image load animation: start zoomed heavily and blurred
export const imageRevealVariant = {
  hidden: { scale: 1.1, filter: "blur(8px)", opacity: 0.3 },
  visible: {
    scale: 1,
    filter: "blur(0px)",
    opacity: 1,
    transition: { duration: 0.7, ease: smoothBezier },
  },
};

// Spring Layouts for interactive elements
export const buttonMicroVariant = {
  rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
  hover: { scale: 1.05, boxShadow: "0px 6px 15px rgba(0,0,0,0.15)" },
  tap: { scale: 0.95, boxShadow: "0px 2px 5px rgba(0,0,0,0.1)" },
};

export const springConfig = { type: "spring", stiffness: 300, damping: 20 };
export const magneticSpringConfig = { stiffness: 150, damping: 15, mass: 0.1 };
