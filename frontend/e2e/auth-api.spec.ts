import fs from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { resolveEvidenceDir } from "./support/evidence";

const apiBaseUrl = "http://127.0.0.1:8000";

test("login, me, logout flow works with auth cookie", async ({ request }) => {
  const bootstrapResponse = await request.post(`${apiBaseUrl}/api/admin/bootstrap`, {
    data: {
      email: "step25-admin@example.com",
      username: "step25-admin",
      password: "Step25Pass123",
    },
  });

  expect(bootstrapResponse.status()).toBe(201);
  const bootstrapBody = await bootstrapResponse.json();

  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      login_id: "step25-admin@example.com",
      password: "Step25Pass123",
    },
  });

  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  expect(loginBody.user.email).toBe("step25-admin@example.com");

  const meResponse = await request.get(`${apiBaseUrl}/api/auth/me`);
  expect(meResponse.status()).toBe(200);
  const meBody = await meResponse.json();
  expect(meBody.user.username).toBe("step25-admin");

  const logoutResponse = await request.post(`${apiBaseUrl}/api/auth/logout`);
  expect(logoutResponse.status()).toBe(204);

  const unauthenticatedMeResponse = await request.get(`${apiBaseUrl}/api/auth/me`);
  expect(unauthenticatedMeResponse.status()).toBe(401);
  const unauthenticatedMeBody = await unauthenticatedMeResponse.json();

  const evidenceDir = resolveEvidenceDir(
    path.join("..", "test", "evidence", "step25-playwright"),
  );
  await fs.mkdir(evidenceDir, { recursive: true });
  await fs.writeFile(
    path.join(evidenceDir, "01-auth-api-flow.json"),
    JSON.stringify(
      {
        bootstrapResponse: {
          status: bootstrapResponse.status(),
          body: bootstrapBody,
        },
        loginResponse: {
          status: loginResponse.status(),
          body: loginBody,
        },
        meResponse: {
          status: meResponse.status(),
          body: meBody,
        },
        unauthenticatedMeResponse: {
          status: unauthenticatedMeResponse.status(),
          body: unauthenticatedMeBody,
        },
      },
      null,
      2,
    ),
    "utf-8",
  );
});
