import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidenceDir = path.resolve("../test/evidence/step15-playwright");

test("docker compose の環境変数設定で books 画面を表示できる", async ({
  page,
}) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/books");

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();

  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-compose-env-books.png"),
  });
});
