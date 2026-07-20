'use strict';

/*
 * Stubbed data layer for the demo app. It does NOT connect to a real database —
 * it just echoes the (unsafely built) query back so the SQL-injection sink in
 * server.js is reachable and reviewable without external infrastructure.
 */

// [VULN-02 cont.] The caller passes a fully concatenated SQL string; a safe
// implementation would accept a parameterized query + bound values instead.
function getUserByName(rawQuery, callback) {
  // Simulated result set. In a real sink this string would hit the DB driver.
  const fakeRows = [{ id: 1, name: 'demo', query_executed: rawQuery }];
  process.nextTick(() => callback(null, fakeRows));
}

module.exports = { getUserByName };
