import { test, expect } from "@playwright/test";
import sharp from "sharp";
async function nav(page: import("@playwright/test").Page, name: string) {
  await page
    .locator(".sidebar")
    .getByRole("button", { name, exact: true })
    .click();
}
test("daily experience, design CRUD, exact PNG export, and journal persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make room for the sacred." }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/scripture-landing.png", fullPage: true });
  await page
    .getByRole("button", { name: "Start creating", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A moment with God." }),
  ).toBeVisible();
  const verse = await page.locator(".daily-card h2").innerText();
  await page.reload();
  await expect(page.locator(".daily-card h2")).toHaveText(verse);
  await page.screenshot({ path: "/tmp/scripture-today.png", fullPage: true });
  await page.getByRole("button", { name: "Create this design" }).click();
  await expect(page.locator(".canvas-wrap canvas")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".canvas-wrap canvas")
        .evaluate((c) => (c as HTMLCanvasElement).width),
    )
    .toBe(1080);
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByLabel("Design name").fill("Peace for today");
  await page
    .getByLabel("Scripture or your own words")
    .fill("Be still, and know that I am God.");
  await page
    .getByLabel("Reference & translation")
    .fill("Psalm 46:10 · WEB · excerpt");
  await page.getByRole("button", { name: "Style", exact: true }).click();
  await page.getByLabel("Text color").fill("#523c20");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Text color")).toHaveValue("#292c25");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.getByLabel("Text color")).toHaveValue("#523c20");
  await page.getByLabel("Aspect ratio").selectOption("4:5");
  await expect
    .poll(() =>
      page
        .locator(".canvas-wrap canvas")
        .evaluate((c) => (c as HTMLCanvasElement).height),
    )
    .toBe(1350);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Design saved");
  const preview = await page
    .locator(".canvas-wrap canvas")
    .evaluate((c) => (c as HTMLCanvasElement).toDataURL());
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PNG" }).click(),
  ]);
  const path = await dl.path();
  const fs = await import("node:fs/promises");
  const downloaded = await fs.readFile(path!);
  expect(downloaded.equals(Buffer.from(preview.split(",")[1], "base64"))).toBe(
    true,
  );
  const size = await sharp(downloaded).metadata();
  expect([size.width, size.height]).toEqual([1080, 1350]);
  await nav(page, "My Collection");
  await expect(
    page.getByRole("heading", { name: "Peace for today", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Peace for today" }).click();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(page.getByLabel("Design name")).toHaveValue("Peace for today");
  await nav(page, "My Collection");
  await page
    .getByRole("button", { name: "Duplicate Peace for today", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Peace for today (copy)", exact: true }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Delete Peace for today (copy)", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Peace for today (copy)", exact: true }),
  ).toHaveCount(0);
  await nav(page, "Journal");
  await page.getByRole("button", { name: "New entry" }).click();
  await page.getByLabel("Entry title").fill("Grateful for today");
  await page.getByLabel("Entry type").selectOption("Gratitude");
  await page
    .getByLabel("Journal entry", { exact: true })
    .fill("A quiet morning and a kind friend.");
  await expect(page.locator(".journal-paper [role=status]")).toContainText(
    "Saved on this device",
  );
  await page.reload();
  await page
    .getByRole("button")
    .filter({ has: page.getByRole("heading", { name: "Grateful for today" }) })
    .click();
  await expect(page.getByLabel("Journal entry", { exact: true })).toHaveValue(
    "A quiet morning and a kind friend.",
  );
  await page
    .getByLabel("Journal entry", { exact: true })
    .fill("A quiet morning, a kind friend, and hope.");
  await expect(page.locator(".journal-paper [role=status]")).toContainText(
    "Saved on this device",
  );
  await page.getByLabel("Search journal").fill("kind friend");
  await expect(page.locator(".journal-item")).toHaveCount(1);
  await page.getByLabel("Search journal").fill("no match");
  await expect(page.locator(".journal-item")).toHaveCount(0);
  await page.getByLabel("Search journal").fill("");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect(page.locator(".journal-item")).toHaveCount(0);
  await nav(page, "Explore");
  await page.getByRole("button", { name: "Peace", exact: true }).click();
  await expect(page.locator(".verse-card")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Favorite Psalm 46:10", exact: true })
    .click();
  await nav(page, "My Collection");
  await page
    .getByRole("button", { name: "Favorite verses", exact: true })
    .click();
  await expect(page.locator(".verse-card")).toHaveCount(1);
  await nav(page, "Challenges");
  await page
    .getByRole("button", { name: "Complete today’s moment", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Today’s moment complete", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Today’s moment complete", exact: true }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
test("backups, uploaded backgrounds, templates, and aspect ratios", async ({
  page,
}) => {
  await page.goto("/#studio");
  await expect(page.locator(".canvas-wrap canvas")).toBeVisible();
  await page
    .getByRole("button", { name: "Save Still waters template" })
    .click();
  await page.getByRole("button", { name: "Background", exact: true }).click();
  await page
    .locator(".editor-tools input[type=file]")
    .setInputFiles("public/images/forest.jpg");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Design saved");
  for (const [ratio, w, h] of [
    ["1:1", 1080, 1080],
    ["9:16", 1080, 1920],
    ["16:9", 1920, 1080],
  ] as const) {
    await page.getByLabel("Aspect ratio").selectOption(ratio);
    await expect
      .poll(() =>
        page
          .locator(".canvas-wrap canvas")
          .evaluate((c) => [
            (c as HTMLCanvasElement).width,
            (c as HTMLCanvasElement).height,
          ]),
      )
      .toEqual([w, h]);
  }
  await nav(page, "Settings");
  await page.getByLabel("What should we call you?").fill("Grace");
  const [dl] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export backup", exact: true }).click(),
  ]);
  const fs = await import("node:fs/promises");
  const backup = JSON.parse(await fs.readFile((await dl.path())!, "utf8"));
  expect(backup.version).toBe(1);
  expect(backup.data.designs[0].background).toMatch(/^data:image\/jpeg/);
  expect(backup.data.templates).toEqual([0]);
  await page.getByLabel("What should we call you?").fill("Changed");
  page.once("dialog", (d) => d.accept());
  await page.locator(".settings-card input[type=file]").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByLabel("What should we call you?")).toHaveValue(
    "Grace",
  );
  await page.locator(".settings-card input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("status")).toContainText(
    "Invalid or unsupported",
  );
  await nav(page, "My Collection");
  await page
    .getByRole("button", { name: "Saved templates", exact: true })
    .click();
  await expect(page.locator(".collection-card")).toHaveCount(1);
});
test("offline reload and install readiness", async ({ page, context }) => {
  await page.goto("/#studio");
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByLabel("Design name").fill("Offline design");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Design saved");
  await nav(page, "Journal");
  await page.getByRole("button", { name: "New entry" }).click();
  await page.getByLabel("Entry title").fill("Offline prayer");
  await page
    .getByLabel("Journal entry", { exact: true })
    .fill("Keep my heart quiet.");
  await expect(page.locator(".journal-paper [role=status]")).toContainText(
    "Saved on this device",
  );
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(3);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".offline-notice")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Offline prayer" }),
  ).toBeVisible();
  await nav(page, "Today");
  await expect(page.locator(".daily-card h2")).toBeVisible();
  await nav(page, "Studio");
  await expect
    .poll(() =>
      page
        .locator(".canvas-wrap canvas")
        .evaluate((c) => (c as HTMLCanvasElement).width),
    )
    .toBe(1080);
  await nav(page, "My Collection");
  await page
    .getByRole("button", { name: "Edit Offline design", exact: true })
    .click();
  await expect
    .poll(() =>
      page
        .locator(".canvas-wrap canvas")
        .evaluate((c) => (c as HTMLCanvasElement).width),
    )
    .toBe(1080);
  const [offlineExport] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PNG", exact: true }).click(),
  ]);
  expect(offlineExport.suggestedFilename()).toBe("scripture-studio.png");
  await context.setOffline(false);
});
test("mobile layout and navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({
    path: "/tmp/scripture-mobile-landing.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Start creating", exact: true })
    .click();
  await expect(page.locator(".bottom-nav")).toBeVisible();
  await page.screenshot({
    path: "/tmp/scripture-mobile-today.png",
    fullPage: true,
  });
  await page
    .locator(".bottom-nav")
    .getByRole("button", { name: "Studio", exact: true })
    .click();
  await expect(page.locator(".canvas-wrap canvas")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/scripture-mobile-studio.png",
    fullPage: true,
  });
  await page
    .locator(".bottom-nav")
    .getByRole("button", { name: "Journal", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My faith journal." }),
  ).toBeVisible();
  await page
    .locator(".bottom-nav")
    .getByRole("button", { name: "Collection", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My collection." }),
  ).toBeVisible();
});

test("persistent data survives a browser process restart", async () => {
  const { chromium } = await import("@playwright/test");
  const fs = await import("node:fs/promises");
  const os = await import("node:os");
  const profile = await fs.mkdtemp(`${os.tmpdir()}/scripture-profile-`);
  const options = {
    headless: true,
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  };
  let context = await chromium.launchPersistentContext(profile, options);
  try {
    let page = await context.newPage();
    await page.goto(
      `${process.env.BASE_URL || "http://localhost:3000"}/#studio`,
    );
    await page.getByRole("button", { name: "Text", exact: true }).click();
    await page.getByLabel("Design name").fill("A lasting reminder");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Design saved");
    await nav(page, "Journal");
    await page.getByRole("button", { name: "New entry", exact: true }).click();
    await page.getByLabel("Entry title").fill("A lasting prayer");
    await page
      .getByLabel("Journal entry", { exact: true })
      .fill("Thank you for this day.");
    await expect(page.locator(".journal-paper [role=status]")).toContainText(
      "Saved on this device",
    );
    await context.close();
    context = await chromium.launchPersistentContext(profile, options);
    page = await context.newPage();
    await page.goto(
      `${process.env.BASE_URL || "http://localhost:3000"}/#collection`,
    );
    await expect(
      page.getByRole("heading", { name: "A lasting reminder", exact: true }),
    ).toBeVisible();
    await nav(page, "Journal");
    await expect(
      page.getByRole("heading", { name: "A lasting prayer", exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
    await fs.rm(profile, { recursive: true, force: true });
  }
});

test("tablet layout and storage failures are handled honestly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/#today");
  await expect(
    page.getByRole("heading", { name: "A moment with God." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/scripture-tablet.png", fullPage: true });
  await nav(page, "Studio");
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByLabel("Design name").fill("Draft that stays");
  await nav(page, "Today");
  await nav(page, "Studio");
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(page.getByLabel("Design name")).toHaveValue("Draft that stays");
  // IndexedDB can be blocked by a browser privacy policy. Show the failure, never a false save confirmation.
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      value: {
        open() {
          throw new Error("Storage blocked by test browser policy.");
        },
      },
    });
  });
  await page.reload();
  await expect(page.locator(".storage-error")).toContainText("Storage blocked");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Storage blocked");
  await expect(page.getByRole("status")).not.toContainText("Design saved");
});

test("native sharing failure falls back to a real PNG download", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      value: () => true,
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: () =>
        Promise.reject(
          new DOMException("Sharing unavailable", "NotAllowedError"),
        ),
      configurable: true,
    });
  });
  await page.goto("/#studio");
  await expect
    .poll(() =>
      page
        .locator(".canvas-wrap canvas")
        .evaluate((c) => (c as HTMLCanvasElement).width),
    )
    .toBe(1080);
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Share graphic", exact: true }).click(),
  ]);
  expect(file.suggestedFilename()).toBe("scripture-studio.png");
  await expect(page.getByRole("status")).toContainText(
    "Graphic shared or downloaded",
  );
});
