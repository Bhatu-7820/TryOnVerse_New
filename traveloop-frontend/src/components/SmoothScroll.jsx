/**
 * SmoothScroll.jsx
 * Native pass-through container. Lenis virtual scrolling has been removed
 * to prevent scroll freeze/stuck bugs and ensure 100% reliable native browser scrolling.
 */
export default function SmoothScroll({ children }) {
  return children;
}
