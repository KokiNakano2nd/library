import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000";
const evidenceDir = resolveEvidenceDir("../test/evidence/step30-playwright");

type BookResponse = {
  id: number;
  title: string;
  author: string;
  published_year: number | null;
  isbn: string | null;
  created_at: string;
  updated_at: string;
};

test("画面から本を登録、編集、削除できる", async ({
  page,
  context,
}) => {
  await mkdir(evidenceDir, { recursive: true });

  const suffix = Date.now().toString();
  const adminEmail = `step30-admin-${suffix}@example.com`;
  const adminUsername = `step30-admin-${suffix}`;
  const adminPassword = "Step30Pass123";
  const createdTitle = `Playwright Step30 ${suffix}`;
  const updatedTitle = `Playwright Step30 Updated ${suffix}`;
  const isbn = `pw30-${suffix.slice(-12)}`;

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

  const loginResponse = await context.request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      login_id: adminEmail,
      password: adminPassword,
    },
  });
  expect(loginResponse.status()).toBe(200);

  await deleteBooksByIsbn(context.request, isbn);

  await page.goto("/books");
  await expect(page).toHaveURL(/\/books$/);
  await saveEvidence(page, "01-books-initial.png");

  await page.getByRole("link", { name: "本を登録" }).click();
  await expect(page).toHaveURL(/\/books\/new$/);

  await page.getByLabel("タイトル").fill(createdTitle);
  await page.getByLabel("著者名").fill("Playwright Tester");
  await page.getByLabel("出版年").fill("2026");
  await page.getByLabel("ISBN").fill(isbn);
  await page.getByRole("button", { name: "登録する" }).click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(createdTitle) })).toBeVisible();
  await saveEvidence(page, "02-book-created.png");

  const createdBookItem = page
    .getByRole("row")
    .filter({ hasText: createdTitle });
  await createdBookItem.getByRole("link", { name: "編集" }).click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);

  await page.getByLabel("タイトル").fill(updatedTitle);
  await page.getByRole("button", { name: "更新する" }).click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("row", { name: new RegExp(updatedTitle) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(createdTitle) })).toHaveCount(0);
  await saveEvidence(page, "03-book-updated.png");

  const updatedBookItem = page
    .getByRole("row")
    .filter({ hasText: updatedTitle });
  await updatedBookItem.getByRole("button", { name: "削除" }).click();
  await expect(page.getByRole("dialog")).toContainText(updatedTitle);
  await saveEvidence(page, "04-delete-dialog.png");
  await page.getByRole("button", { name: "削除する" }).click();

  await expect(page.getByRole("row", { name: new RegExp(updatedTitle) })).toHaveCount(0);
  await expect(page.getByText(`「${updatedTitle}」を削除しました。`)).toBeVisible();
  await saveEvidence(page, "05-book-deleted.png");

  await deleteBooksByIsbn(context.request, isbn);
});

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
