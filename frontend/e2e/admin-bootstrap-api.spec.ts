import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { resolveEvidenceDir } from "./support/evidence";

test("bootstrap admin user hashes password and blocks second execution", async ({
  request,
}) => {
  const firstResponse = await request.post("/api/admin/bootstrap", {
    data: {
      email: "playwright-admin@example.com",
      username: "playwright-admin",
      password: "PlaywrightPass123",
    },
  });

  expect(firstResponse.status()).toBe(201);
  const firstBody = await firstResponse.json();
  expect(firstBody.email).toBe("playwright-admin@example.com");
  expect(firstBody.username).toBe("playwright-admin");
  expect(firstBody.role).toBe("admin");
  expect(firstBody.is_active).toBe(true);
  expect(firstBody.password_hash).toBeUndefined();

  const secondResponse = await request.post("/api/admin/bootstrap", {
    data: {
      email: "playwright-admin-2@example.com",
      username: "playwright-admin-2",
      password: "PlaywrightPass456",
    },
  });

  expect(secondResponse.status()).toBe(409);
  const secondBody = await secondResponse.json();

  const evidenceDir = resolveEvidenceDir(
    path.join("..", "test", "evidence", "step24-playwright"),
  );
  await fs.mkdir(evidenceDir, { recursive: true });
  await fs.writeFile(
    path.join(evidenceDir, "01-admin-bootstrap-response.json"),
    JSON.stringify(
      {
        firstResponse: {
          status: firstResponse.status(),
          body: firstBody,
        },
        secondResponse: {
          status: secondResponse.status(),
          body: secondBody,
        },
      },
      null,
      2,
    ),
    "utf-8",
  );
});
