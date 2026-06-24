import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl = "http://127.0.0.1:8000";

test("books management is hidden for unauthenticated users and available to admin", async ({
  page,
  context,
}) => {
  const suffix = Date.now().toString();
  const isbn = `step26-${suffix.slice(-12)}`;
  const evidenceDir = resolveEvidenceDir(
    path.join("..", "test", "evidence", "step26-playwright"),
  );
  await fs.mkdir(evidenceDir, { recursive: true });

  const bootstrapResponse = await context.request.post(
    `${apiBaseUrl}/api/admin/bootstrap`,
    {
      data: {
        email: "step26-admin@example.com",
        username: "step26-admin",
        password: "Step26Pass123",
      },
    },
  );
  expect(bootstrapResponse.status()).toBe(201);

  const unauthenticatedCreateResponse = await context.request.post(
    `${apiBaseUrl}/api/books`,
    {
      data: {
        title: `Step26 Public ${suffix}`,
        author: "Playwright",
        published_year: 2026,
        isbn,
      },
    },
  );
  expect(unauthenticatedCreateResponse.status()).toBe(401);
  const unauthenticatedCreateBody = await unauthenticatedCreateResponse.json();

  await page.goto("/books");
  await expect(page.getByRole("link", { name: "本を登録" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "管理操作には管理者ログインが必要です" }),
  ).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-books-public-view.png"),
  });

  const loginResponse = await context.request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      login_id: "step26-admin@example.com",
      password: "Step26Pass123",
    },
  });
  expect(loginResponse.status()).toBe(200);

  const createBookResponse = await context.request.post(`${apiBaseUrl}/api/books`, {
    data: {
      title: `Step26 Admin ${suffix}`,
      author: "Playwright",
      published_year: 2026,
      isbn,
    },
  });
  expect(createBookResponse.status()).toBe(201);
  const createdBookBody = await createBookResponse.json();

  await page.goto("/books");
  await expect(page.getByRole("link", { name: "本を登録" })).toBeVisible();

  const createdBookItem = page
    .locator("article")
    .filter({ hasText: createdBookBody.title as string });
  await expect(createdBookItem.getByRole("link", { name: "編集" })).toBeVisible();
  await expect(createdBookItem.getByRole("button", { name: "削除" })).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "02-books-admin-view.png"),
  });

  await fs.writeFile(
    path.join(evidenceDir, "03-books-authorization.json"),
    JSON.stringify(
      {
        unauthenticatedCreateResponse: {
          status: unauthenticatedCreateResponse.status(),
          body: unauthenticatedCreateBody,
        },
        createBookResponse: {
          status: createBookResponse.status(),
          body: createdBookBody,
        },
      },
      null,
      2,
    ),
    "utf-8",
  );
});
