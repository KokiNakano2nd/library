import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidenceDir = path.resolve("../test/evidence/step13-playwright");

test("frontend container で books 画面へ到達できる", async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/books");

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-frontend-container-books.png"),
  });
});
