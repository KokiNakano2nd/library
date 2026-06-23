import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveEvidenceDir } from "./support/evidence";

const evidenceDir = resolveEvidenceDir("../test/evidence/step14-playwright");

test("docker compose で books 画面へ到達できる", async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/books");

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-docker-compose-books.png"),
  });
});
