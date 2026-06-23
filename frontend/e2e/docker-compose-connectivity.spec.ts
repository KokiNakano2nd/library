import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveEvidenceDir } from "./support/evidence";

const evidenceDir = resolveEvidenceDir("../test/evidence/step16-playwright");
const apiBaseUrl =
  process.env.DOCKER_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

test("docker compose 起動中に画面表示と browser からの API 疎通が通る", async ({
  page,
}) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/books");

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Could not load books" }),
  ).toHaveCount(0);

  const healthResult = await page.evaluate(async (url) => {
    const response = await fetch(`${url}/health`);

    return {
      ok: response.ok,
      status: response.status,
      body: (await response.json()) as { status?: string },
    };
  }, apiBaseUrl);

  expect(healthResult.ok).toBe(true);
  expect(healthResult.status).toBe(200);
  expect(healthResult.body.status).toBe("ok");

  const booksResult = await page.evaluate(async (url) => {
    const response = await fetch(`${url}/api/books`);

    return {
      ok: response.ok,
      status: response.status,
      body: (await response.json()) as unknown,
    };
  }, apiBaseUrl);

  expect(booksResult.ok).toBe(true);
  expect(booksResult.status).toBe(200);
  expect(Array.isArray(booksResult.body)).toBe(true);

  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-docker-compose-connectivity-books.png"),
  });
});
