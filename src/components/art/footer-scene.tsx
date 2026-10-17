/**
 * The footer's closing scene — a backdrop designed entirely from CSS
 * gradients and a little SVG (no photography): warm dusk light, three
 * colour fields drifting very slowly, and concentric "signal" arcs
 * rising from the horizon.
 *
 * Atmospheric only — aria-hidden throughout. All the styling lives in
 * `globals.css` under "Footer scene", mirroring the ambient art system.
 */
export function FooterScene() {
  return (
    <div aria-hidden="true" className="footer-scene">
      <span className="footer-glow footer-glow--peach" />
      <span className="footer-glow footer-glow--dusk" />
      <span className="footer-glow footer-glow--shade" />

      <svg
        className="footer-arcs"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax meet"
      >
        <circle cx="600" cy="400" r="205" />
        <circle cx="600" cy="400" r="320" />
        <circle cx="600" cy="440" r="430" />
      </svg>
    </div>
  );
}
