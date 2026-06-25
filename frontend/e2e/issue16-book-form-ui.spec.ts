import { expect, test, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000";
const evidenceDir = resolveEvidenceDir("../test/evidence/issue16-playwright");
const adminEmail = "issue16-admin@example.com";
const adminUsername = "issue16-admin";
const adminPassword = "Issue16Pass123";

type BookResponse = {
  id: number;
  isbn: string | null;
};

test("図書登録画面の UX/UI と登録フローを確認できる", async ({
  context,
  page,
}) => {
  await mkdir(evidenceDir, { recursive: true });

  const suffix = Date.now().toString();
  const isbn = `issue16-${suffix.slice(-12)}`;
  const createdTitle = `Issue16 Book ${suffix}`;

  await ensureAdminExists(context);
  await deleteBooksByIsbn(context.request, isbn);

  await page.setViewportSize({ width: 1440, height: 1200 });
  await loginViaPage(page);
  await page.goto("/books");
  await page.getByRole("link", { name: "本を登録" }).click();
  await expect(page).toHaveURL(/\/books\/new$/);
  await expect(page.getByLabel("タイトル")).toBeVisible();
  await expect(page.getByText("入力の迷いを減らすための整理")).toBeVisible();
  await saveEvidence(page, "01-desktop-form.png");

  await page.getByLabel("タイトル").fill(createdTitle);
  await page.getByLabel("著者名").fill("   ");
  await page.getByRole("button", { name: "登録する" }).click();

  await expect(page.getByText("著者名を入力してください。")).toBeVisible();
  await saveEvidence(page, "02-validation-error.png");

  await page.getByLabel("著者名").fill("Issue16 Tester");
  await page.getByLabel("出版年").fill("2026");
  await page.getByLabel("ISBN").fill(isbn);
  await page.getByRole("button", { name: "登録する" }).click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("row", { name: new RegExp(createdTitle) })).toBeVisible();
  await saveEvidence(page, "03-book-created.png");

  await deleteBooksByIsbn(context.request, isbn);
});

test("図書登録画面が mobile 幅でも崩れずに表示される", async ({
  context,
  page,
}) => {
  await mkdir(evidenceDir, { recursive: true });

  await ensureAdminExists(context);

  await page.setViewportSize({ width: 390, height: 844 });
  await loginViaPage(page);
  await page.goto("/books");
  await page.getByRole("link", { name: "本を登録" }).click();
  await expect(page).toHaveURL(/\/books\/new$/);
  await expect(page.getByLabel("タイトル")).toBeVisible();
  await expect(page.getByRole("button", { name: "登録する" })).toBeVisible();
  await saveEvidence(page, "04-mobile-form.png");
});

async function ensureAdminExists(context: BrowserContext): Promise<void> {
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
  expect([201, 409]).toContain(bootstrapResponse.status());
}

async function loginViaPage(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("ログインID").fill(adminEmail);
  await page.getByLabel("パスワード").fill(adminPassword);
  await page.getByRole("button", { name: "ログインする" }).click();
  await expect(page).toHaveURL(/\/books$/);
}

async function saveEvidence(page: Page, fileName: string): Promise<void> {
  await page.screenshot({
    fullPage: true,
    path: path.join(evidenceDir, fileName),
  });
}

async function deleteBooksByIsbn(
  request: APIRequestContext,
  isbn: string,
): Promise<void> {
  const response = await request.get(`${apiBaseUrl}/api/books`);

  if (!response.ok()) {
    return;
  }

  const books = (await response.json()) as BookResponse[];
  const targetBooks = books.filter((book) => book.isbn === isbn);

  for (const book of targetBooks) {
    await request.delete(`${apiBaseUrl}/api/books/${book.id}`);
  }
}
