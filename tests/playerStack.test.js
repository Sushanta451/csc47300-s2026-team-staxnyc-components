import test from "node:test";
import assert from "node:assert/strict";
import {
  readStack,
  toggleStack,
  selectPlayers,
} from "../src/lib/playerStack.js";

test("stack tolerates corrupt or unavailable browser storage", () => {
  for (const value of ["invalid", "{}", "null", '[null,{}, {"player_id":1}]']) {
    assert.deepEqual(readStack({ getItem: () => value }), []);
  }
  assert.deepEqual(
    readStack({
      getItem() {
        throw new Error("blocked");
      },
    }),
    [],
  );
});
test("saved identity is deduplicated and toggles across numeric/string IDs", () => {
  const player = { player_id: 1, player_name: "Player One", ppg: 42 };
  const saved = toggleStack([], player);
  assert.equal(saved[0].ppg, undefined);
  assert.deepEqual(toggleStack(saved, { ...player, player_id: "1" }), []);
  assert.equal(
    readStack({ getItem: () => JSON.stringify([player, player]) }).length,
    1,
  );
});
test("filtering and sorting preserve the original board and retain valid zero stats", () => {
  const players = [
    { player_name: "B", team: "NY", ppg: null },
    { player_name: "A", team: "NY", ppg: 0 },
    { player_name: "C", team: "LA", ppg: 20 },
  ];
  assert.deepEqual(
    selectPlayers(players, { team: "NY", sort: "ppg" }).map(
      (p) => p.player_name,
    ),
    ["A", "B"],
  );
  assert.deepEqual(
    selectPlayers(players, { sort: "name" }).map((p) => p.player_name),
    ["A", "B", "C"],
  );
  assert.deepEqual(
    players.map((p) => p.player_name),
    ["B", "A", "C"],
  );
});
