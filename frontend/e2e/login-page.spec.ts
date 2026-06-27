import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000";

test("login page shows validation, authenticates admin, and redirects back to books", async ({
  page,
  context,
}) => {
  const suffix = Date.now().toString();
  const adminEmail = `step27-admin-${suffix}@example.com`;
  const adminUsername = `step27-admin-${suffix}`;
  const adminPassword = "Step27Pass123";
  const evidenceDir = resolveEvidenceDir(
    path.join("..", "test", "evidence", "step27-playwright"),
  );
  await fs.mkdir(evidenceDir, { recursive: true });

  const bootstrapResponse = await context.request.post(
    `${apiBaseUrl}/api/admin/bootstrap`,
    {
      data: {
        email: adminEmail,
        username: adminUsername,
        password: adminPassword,
      },
    },
  );
  expect(bootstrapResponse.status()).toBe(201);

  await page.goto("/books");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("ログインID").fill(adminEmail);
  await page.getByLabel("パスワード").fill("WrongPass123");
  await page.getByRole("button", { name: "ログインする" }).click();
  await expect(
    page.getByRole("alert").filter({
      hasText: "ログインIDまたはパスワードが正しくありません",
    }),
  ).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "01-login-error.png"),
  });

  await page.getByLabel("パスワード").fill(adminPassword);
  await page.getByRole("button", { name: "ログインする" }).click();
  await expect(page).toHaveURL(/\/books$/);
  await page.goto("/books");
  await expect(page.getByRole("link", { name: "本を登録" })).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, "02-books-after-login.png"),
  });

  await page.goto("/login");
  await expect(page).toHaveURL(/\/books$/);

  await fs.writeFile(
    path.join(evidenceDir, "03-login-page-flow.json"),
    JSON.stringify(
      {
        bootstrapStatus: bootstrapResponse.status(),
        adminEmail,
        finalUrl: page.url(),
      },
      null,
      2,
    ),
    "utf-8",
  );
});
