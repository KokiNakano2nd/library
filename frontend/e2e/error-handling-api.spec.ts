import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000";

test("error responses include request_id and standardized payload", async ({
  request,
}) => {
  const unauthenticatedRequestId = "step29-unauthenticated-request";
  const unauthenticatedResponse = await request.post(`${apiBaseUrl}/api/books`, {
    data: {
      title: "Step29 未認証本",
      author: "構造化ログ著者",
      published_year: 2026,
      isbn: "step29-error-001",
    },
    headers: {
      "X-Request-ID": unauthenticatedRequestId,
    },
  });
  expect(unauthenticatedResponse.status()).toBe(401);
  const unauthenticatedBody = await unauthenticatedResponse.json();
  expect(unauthenticatedBody.error_code).toBe("authentication_required");
  expect(unauthenticatedBody.request_id).toBe(unauthenticatedRequestId);
  expect(unauthenticatedResponse.headers()["x-request-id"]).toBe(
    unauthenticatedRequestId,
  );

  const bootstrapResponse = await request.post(`${apiBaseUrl}/api/admin/bootstrap`, {
    data: {
      email: "step29-admin@example.com",
      username: "step29-admin",
      password: "Step29Pass123",
    },
  });
  expect(bootstrapResponse.status()).toBe(201);

  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      login_id: "step29-admin@example.com",
      password: "Step29Pass123",
    },
  });
  expect(loginResponse.status()).toBe(200);

  const validationRequestId = "step29-validation-request";
  const validationResponse = await request.post(`${apiBaseUrl}/api/books`, {
    data: {
      title: "   ",
      author: "構造化ログ著者",
      published_year: 2026,
      isbn: "step29-error-002",
    },
    headers: {
      "X-Request-ID": validationRequestId,
    },
  });
  expect(validationResponse.status()).toBe(422);
  const validationBody = await validationResponse.json();
  expect(validationBody.error_code).toBe("validation_error");
  expect(validationBody.request_id).toBe(validationRequestId);
  expect(Array.isArray(validationBody.errors)).toBe(true);

  const createResponse = await request.post(`${apiBaseUrl}/api/books`, {
    data: {
      title: "Step29 重複確認本",
      author: "構造化ログ著者",
      published_year: 2026,
      isbn: "step29-error-003",
    },
  });
  expect(createResponse.status()).toBe(201);
  const createdBook = await createResponse.json();

  const conflictRequestId = "step29-conflict-request";
  const conflictResponse = await request.post(`${apiBaseUrl}/api/books`, {
    data: {
      title: "Step29 重複確認本 2冊目",
      author: "構造化ログ著者",
      published_year: 2026,
      isbn: "step29-error-003",
    },
    headers: {
      "X-Request-ID": conflictRequestId,
    },
  });
  expect(conflictResponse.status()).toBe(409);
  const conflictBody = await conflictResponse.json();
  expect(conflictBody.error_code).toBe("duplicate_isbn");
  expect(conflictBody.request_id).toBe(conflictRequestId);

  const healthResponse = await request.get(`${apiBaseUrl}/health`);
  expect(healthResponse.status()).toBe(200);
  expect(healthResponse.headers()["x-request-id"]).toBeTruthy();

  const evidenceDir = resolveEvidenceDir(
    path.join("..", "test", "evidence", "step29-playwright"),
  );
  await fs.mkdir(evidenceDir, { recursive: true });
  await fs.writeFile(
    path.join(evidenceDir, "01-error-handling-api-flow.json"),
    JSON.stringify(
      {
        unauthenticatedResponse: {
          status: unauthenticatedResponse.status(),
          body: unauthenticatedBody,
          requestIdHeader: unauthenticatedResponse.headers()["x-request-id"],
        },
        validationResponse: {
          status: validationResponse.status(),
          body: validationBody,
          requestIdHeader: validationResponse.headers()["x-request-id"],
        },
        createResponse: {
          status: createResponse.status(),
          body: createdBook,
        },
        conflictResponse: {
          status: conflictResponse.status(),
          body: conflictBody,
          requestIdHeader: conflictResponse.headers()["x-request-id"],
        },
        healthResponse: {
          status: healthResponse.status(),
          requestIdHeader: healthResponse.headers()["x-request-id"],
        },
      },
      null,
      2,
    ),
    "utf-8",
  );
});
