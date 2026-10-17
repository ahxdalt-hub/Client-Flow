import assert from "node:assert/strict";
import { test } from "node:test";

import {
  adminCookieValue,
  isValidAdminCookie,
  isValidAdminSecret,
  safeEqual,
} from "../src/lib/admin-auth.ts";

/**
 * Pure-logic tests for the owner-dashboard auth helpers. Run: npm test
 */

test("adminCookieValue is deterministic and secret-dependent", () => {
  assert.equal(adminCookieValue("a-very-long-secret"), adminCookieValue("a-very-long-secret"));
  assert.notEqual(adminCookieValue("a-very-long-secret"), adminCookieValue("a-very-long-secret2"));
  assert.match(adminCookieValue("a-very-long-secret"), /^[a-f0-9]{64}$/);
});

test("safeEqual handles equal, different and length mismatch", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abd"), false);
  assert.equal(safeEqual("abc", "abcd"), false);
  assert.equal(safeEqual("", ""), true);
});

test("isValidAdminSecret requires a configured, long-enough secret", () => {
  const previous = process.env.ADMIN_SECRET;

  delete process.env.ADMIN_SECRET;
  assert.equal(isValidAdminSecret("anything"), false);

  process.env.ADMIN_SECRET = "short";
  assert.equal(isValidAdminSecret("short"), false); // under min length

  process.env.ADMIN_SECRET = "a-properly-long-admin-secret";
  assert.equal(isValidAdminSecret("a-properly-long-admin-secret"), true);
  assert.equal(isValidAdminSecret("wrong-secret-value-here"), false);

  if (previous === undefined) delete process.env.ADMIN_SECRET;
  else process.env.ADMIN_SECRET = previous;
});

test("isValidAdminCookie accepts only the derived cookie", () => {
  const previous = process.env.ADMIN_SECRET;
  process.env.ADMIN_SECRET = "a-properly-long-admin-secret";

  assert.equal(isValidAdminCookie(adminCookieValue("a-properly-long-admin-secret")), true);
  assert.equal(isValidAdminCookie("a-properly-long-admin-secret"), false); // raw secret, not the derivation
  assert.equal(isValidAdminCookie(undefined), false);
  assert.equal(isValidAdminCookie("deadbeef"), false);

  if (previous === undefined) delete process.env.ADMIN_SECRET;
  else process.env.ADMIN_SECRET = previous;
});
