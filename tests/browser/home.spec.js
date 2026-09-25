import { test, expect } from "@playwright/test";

// Synthetic players: fixtures only, never shipped as real NBA data.
const players = [
  {
    player_id: "900001",
    player_name: "Test Guard",
    team: "New York Knicks",
    position: "PG",
    ppg: 24,
    rpg: 4,
    apg: 8,
  },
  {
    player_id: "900002",
    player_name: "Test Center",
    team: "Brooklyn Nets",
    position: "C",
    ppg: 18,
    rpg: 12,
    apg: 3,
  },
];

async function fixtureFeed(page, { failure = false } = {}) {
  await page.route("http://127.0.0.1:54321/**", async (route) => {
    const url = new URL(route.request().url());
    const table = url.pathname.split("/").at(-1);
    if (failure)
      return route.fulfill({ status: 403, json: { message: "Offline test" } });
    let data = [];
    if (table === "featured_players")
      data = players.map((p, i) => ({
        player_id: p.player_id,
        display_order: i,
      }));
    if (table === "player_stats") {
      const id = url.searchParams.get("player_id")?.replace("eq.", "");
      data = id ? players.find((p) => p.player_id === id) : players;
    }
    await route.fulfill({ json: data });
  });
}

test("save, persist, filter, sort and remove a player stack", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await fixtureFeed(page);
  await page.goto("/");
  const cards = page.locator(".stax-player-card");
  await expect(cards).toHaveCount(2);
  await page.getByLabel("Sort", { exact: true }).selectOption("rpg");
  await expect(cards.first()).toContainText("Test Center");
  await page
    .getByLabel("Team", { exact: true })
    .selectOption("New York Knicks");
  await expect(cards).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save Test Guard to My Stack", exact: true })
    .click();
  await page.getByRole("button", { name: "My Stack 1", exact: true }).click();
  await expect(cards).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "My Stack 1", exact: true }).click();
  await expect(cards).toContainText("Test Guard");
  await page
    .getByRole("button", { name: "Remove Test Guard from My Stack" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next favorite starts here" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard search opens the selected profile", async ({ page }) => {
  await fixtureFeed(page);
  await page.goto("/");
  const search = page.getByRole("combobox", { name: "Search NBA players" });
  await search.fill("Test");
  await expect(page.getByRole("option", { name: /Test Guard/ })).toBeVisible();
  await search.press("ArrowDown");
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/player\/900002$/);
});

test("mobile navigation responds to resize and closes with Escape", async ({
  page,
}) => {
  await fixtureFeed(page);
  await page.goto("/");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Compare" })
    .click();
  await expect(page).toHaveURL(/\/compare$/);
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("failed feed offers recovery and preserves access to the stack", async ({
  page,
}) => {
  await fixtureFeed(page, { failure: true });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "The player feed is unavailable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View My Stack" }).click();
  await expect(
    page.getByRole("heading", { name: "Your next favorite starts here" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Featured", exact: true }).click();
  await page.unroute("http://127.0.0.1:54321/**");
  await fixtureFeed(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".stax-player-card")).toHaveCount(2);
});

test("late search responses cannot overwrite the latest query", async ({
  page,
}) => {
  await fixtureFeed(page);
  let firstRequested;
  const started = new Promise((resolve) => {
    firstRequested = resolve;
  });
  let releaseFirst;
  const released = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  await page.route("**/rest/v1/player_stats?**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get(
      "player_name",
    );
    if (!query) return route.fallback();
    if (query.includes("Guard")) {
      firstRequested();
      await released;
    }
    await route.fulfill({
      json: [query.includes("Guard") ? players[0] : players[1]],
    });
  });
  await page.goto("/");
  const search = page.getByRole("combobox", { name: "Search NBA players" });
  await search.fill("Guard");
  await started;
  await search.fill("Center");
  await expect(page.getByRole("option", { name: /Test Center/ })).toBeVisible();
  releaseFirst();
  await expect(page.getByRole("option", { name: /Test Guard/ })).toHaveCount(0);
  await expect(page.getByRole("option", { name: /Test Center/ })).toBeVisible();
});
