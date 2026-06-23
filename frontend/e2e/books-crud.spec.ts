import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const apiBaseUrl = "http://127.0.0.1:8000";
const evidenceDir = path.resolve("../test/evidence/step9-playwright");

type BookResponse = {
  id: number;
  title: string;
  author: string;
  published_year: number | null;
  isbn: string | null;
  created_at: string;
  updated_at: string;
};

test("画面から本を登録、編集、削除できる", async ({ page, request }) => {
  await mkdir(evidenceDir, { recursive: true });

  const suffix = Date.now().toString();
  const createdTitle = `Playwright Step9 ${suffix}`;
  const updatedTitle = `Playwright Step9 Updated ${suffix}`;
  const isbn = `pw9-${suffix.slice(-12)}`;

  await deleteBooksByIsbn(request, isbn);

  await page.goto("/books");
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
  await expect(page.getByRole("heading", { name: createdTitle })).toBeVisible();
  await saveEvidence(page, "02-book-created.png");

  const createdBookItem = page.locator("article").filter({ hasText: createdTitle });
  await createdBookItem.getByRole("link", { name: "編集" }).click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);

  await page.getByLabel("タイトル").fill(updatedTitle);
  await page.getByRole("button", { name: "更新する" }).click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: createdTitle })).toHaveCount(0);
  await saveEvidence(page, "03-book-updated.png");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(updatedTitle);
    await dialog.accept();
  });

  const updatedBookItem = page.locator("article").filter({ hasText: updatedTitle });
  await updatedBookItem.getByRole("button", { name: "削除" }).click();

  await expect(page.getByRole("heading", { name: updatedTitle })).toHaveCount(0);
  await saveEvidence(page, "04-book-deleted.png");

  await deleteBooksByIsbn(request, isbn);
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
