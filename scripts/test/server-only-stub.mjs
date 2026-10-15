/**
 * Stand-in for the `server-only` marker package under `node --test`. The real
 * package throws outside React's `react-server` condition; tests only need the
 * import to be a no-op.
 */

export {};
