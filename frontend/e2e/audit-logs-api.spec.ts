import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000";

test("book write operations are recorded in audit logs", async ({ request }) => {
  const bootstrapResponse = await request.post(`${apiBaseUrl}/api/admin/bootstrap`, {
    data: {
      email: "step28-admin@example.com",
      username: "step28-admin",
      password: "Step28Pass123",
    },
  });
  expect(bootstrapResponse.status()).toBe(201);

  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      login_id: "step28-admin@example.com",
      password: "Step28Pass123",
    },
  });
  expect(loginResponse.status()).toBe(200);

  const createResponse = await request.post(`${apiBaseUrl}/api/books`, {
    data: {
      title: "Step28 監査ログ作成本",
      author: "監査ログ著者",
      published_year: 2026,
      isbn: "step28-audit-001",
    },
  });
  expect(createResponse.status()).toBe(201);
  const createdBook = await createResponse.json();

  const updateResponse = await request.put(
    `${apiBaseUrl}/api/books/${createdBook.id}`,
    {
      data: {
        title: "Step28 監査ログ更新本",
        author: "監査ログ著者",
        published_year: 2027,
        isbn: "step28-audit-002",
      },
    },
  );
  expect(updateResponse.status()).toBe(200);

  const deleteResponse = await request.delete(
    `${apiBaseUrl}/api/books/${createdBook.id}`,
  );
  expect(deleteResponse.status()).toBe(204);

  const auditLogsResponse = await request.get(`${apiBaseUrl}/api/audit-logs`);
  expect(auditLogsResponse.status()).toBe(200);
  const auditLogsBody = await auditLogsResponse.json();

  expect(auditLogsBody).toHaveLength(3);
  expect(auditLogsBody.map((auditLog: { action: string }) => auditLog.action)).toEqual([
    "delete",
    "update",
    "create",
  ]);
  expect(auditLogsBody[0].target_title).toBe("Step28 監査ログ更新本");
  expect(auditLogsBody[0].actor_email).toBe("step28-admin@example.com");

  const evidenceDir = resolveEvidenceDir(
    path.join("..", "test", "evidence", "step28-playwright"),
  );
  await fs.mkdir(evidenceDir, { recursive: true });
  await fs.writeFile(
    path.join(evidenceDir, "01-audit-logs-api-flow.json"),
    JSON.stringify(
      {
        createResponse: {
          status: createResponse.status(),
          body: createdBook,
        },
        updateResponse: {
          status: updateResponse.status(),
        },
        deleteResponse: {
          status: deleteResponse.status(),
        },
        auditLogsResponse: {
          status: auditLogsResponse.status(),
          body: auditLogsBody,
        },
      },
      null,
      2,
    ),
    "utf-8",
  );
});
