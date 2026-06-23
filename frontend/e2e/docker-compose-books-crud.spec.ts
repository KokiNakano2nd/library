import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl =
  process.env.DOCKER_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const evidenceDir = resolveEvidenceDir("../test/evidence/step17-playwright");

type BookResponse = {
  id: number;
  title: string;
  author: string;
  published_year: number | null;
  isbn: string | null;
  created_at: string;
  updated_at: string;
};

test("docker compose 起動中に本の CRUD を最後まで確認できる", async ({
  page,
  request,
}) => {
  await mkdir(evidenceDir, { recursive: true });

  const suffix = Date.now().toString();
  const createdTitle = `Docker Step17 ${suffix}`;
  const updatedTitle = `Docker Step17 Updated ${suffix}`;
  const isbn = `step17-${suffix.slice(-12)}`;

  await deleteBooksByIsbn(request, isbn);

  await page.goto("/books");
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: "Book list" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await saveEvidence(page, "01-books-initial.png");

  await page.locator('a[href="/books/new"]').click();
  await expect(page).toHaveURL(/\/books\/new$/);
  await page.waitForLoadState("networkidle");

  await page.locator('input[name="title"]').fill(createdTitle);
  await page.locator('input[name="author"]').fill("Docker Playwright Tester");
  await page.locator('input[name="publishedYear"]').fill("2026");
  await page.locator('input[name="isbn"]').fill(isbn);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: createdTitle })).toBeVisible();
  await saveEvidence(page, "02-book-created.png");

  const createdBookItem = page.locator("article").filter({ hasText: createdTitle });
  await createdBookItem.locator('a[href$="/edit"]').click();
  await expect(page).toHaveURL(/\/books\/\d+\/edit$/);
  await page.waitForLoadState("networkidle");

  await page.locator('input[name="title"]').fill(updatedTitle);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: createdTitle })).toHaveCount(0);
  await saveEvidence(page, "03-book-updated.png");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(updatedTitle);
    await dialog.accept();
  });

  const updatedBookItem = page.locator("article").filter({ hasText: updatedTitle });
  await updatedBookItem.getByRole("button").click();

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
