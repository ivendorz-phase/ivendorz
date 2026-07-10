// Lazily-loaded Framer Motion feature bundle (Motion Standard §4.3). Lives in its own module so
// LazyMotion's dynamic import code-splits the animation engine out of the initial chunk.
export { domAnimation as default } from "framer-motion";
