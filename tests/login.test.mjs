import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../src/pages/BaseLogin.vue", import.meta.url),
  "utf8"
);
const script = source
  .match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*;\r?\n/gm, "")
  .replace(
    "export default defineComponent",
    "const component = defineComponent"
  );

const response = (status = 200, body = { success: true }) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => body,
});

// Exercise the actual component with fake requests, storage, navigation, and time.
// These tests never send credentials or call the production authentication API.
function fixture(fetchImpl = async () => response(), options = {}) {
  const requests = [];
  const saved = [];
  const navigated = [];
  const timers = new Map();
  let nextTimer = 0;
  const login = runInNewContext(
    script + "\ncomponent.setup()",
    {
      defineComponent: (definition) => definition,
      ref: (value) => ({ value }),
      useMapStore: () => ({
        AUTH_NAMESPACE: "test_namespace",
        saveLoginState: async (username) => {
          if (options.storageError) throw new Error("Storage unavailable");
          saved.push(username);
        },
      }),
      useRouter: () => ({
        push: async (path) => {
          if (options.navigationError) throw new Error("Navigation failed");
          navigated.push(path);
        },
      }),
      fetch: (url, init) => {
        requests.push({ url, init });
        return fetchImpl(url, init);
      },
      AbortController,
      setTimeout: (callback, delay) => {
        const id = ++nextTimer;
        timers.set(id, { callback, delay });
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
    },
    { filename: "BaseLogin.vue" }
  );
  login.username.value = "test-user";
  login.password.value = "test-password";
  return { login, requests, saved, navigated, timers };
}

function assertRetryable(state, message) {
  assert.equal(state.login.loginDisabled.value, false);
  assert.match(state.login.errors.value, message);
  assert.equal(state.saved.length, 0);
  assert.equal(state.navigated.length, 0);
  assert.equal(state.timers.size, 0);
}

test("successful login preserves the existing request and navigation contract", async () => {
  const state = fixture();
  await state.login.doLogin();
  assert.equal(state.requests.length, 1);
  assert.equal(
    state.requests[0].url,
    "https://culkcka9db.execute-api.us-east-2.amazonaws.com/Prod/auth?namespace=test_namespace"
  );
  assert.equal(state.requests[0].init.method, "POST");
  assert.deepEqual(JSON.parse(state.requests[0].init.body), {
    username: "test-user",
    password: "test-password",
  });
  assert.equal(
    state.requests[0].init.headers["Content-Type"],
    "application/json"
  );
  assert.ok(state.requests[0].init.signal);
  assert.deepEqual(state.saved, ["test-user"]);
  assert.deepEqual(state.navigated, ["/"]);
  assert.equal(state.login.errors.value, "");
  assert.equal(state.login.loginDisabled.value, false);
  assert.equal(state.timers.size, 0);
});

for (const status of [401, 403]) {
  test(
    "HTTP " + status + " displays a credential error and enables retry",
    async () => {
      const state = fixture(async () => ({
        ...response(status),
        json: async () => {
          throw new Error("Failed-response body must not be parsed");
        },
      }));
      await state.login.doLogin();
      assertRetryable(state, /username.*password.*do not match/i);
    }
  );
}

for (const status of [400, 404, 429, 500, 502, 503]) {
  test(
    "HTTP " + status + " displays a service error and enables retry",
    async () => {
      const state = fixture(async () => response(status, { success: true }));
      await state.login.doLogin();
      assertRetryable(state, /unable to sign in right now/i);
    }
  );
}

test("an explicit unsuccessful JSON response does not authenticate", async () => {
  const state = fixture(async () => response(200, { success: false }));
  await state.login.doLogin();
  assertRetryable(state, /username.*password.*do not match/i);
});

for (const [name, body] of [
  ["missing success", {}],
  ["null body", null],
  ["string body", "unexpected"],
  ["array body", []],
  ["string success", { success: "true" }],
  ["numeric success", { success: 1 }],
]) {
  test(
    "an unexpected response (" +
      name +
      ") enables retry without authenticating",
    async () => {
      const state = fixture(async () => response(200, body));
      await state.login.doLogin();
      assertRetryable(state, /unable to sign in right now/i);
    }
  );
}

test("invalid JSON enables retry without authenticating", async () => {
  const state = fixture(async () => ({
    ...response(),
    json: async () => {
      throw new SyntaxError("Invalid JSON");
    },
  }));
  await state.login.doLogin();
  assertRetryable(state, /unable to sign in right now/i);
});

test("a network failure provides a connection message and enables retry", async () => {
  const state = fixture(async () => {
    throw new TypeError("Failed to fetch");
  });
  await state.login.doLogin();
  assertRetryable(state, /check your connection/i);
});

test("a stalled request is aborted after 15 seconds and enables retry", async () => {
  const state = fixture(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      })
  );
  const pending = state.login.doLogin();
  assert.equal(state.login.loginDisabled.value, true);
  assert.equal(state.timers.size, 1);
  const timer = [...state.timers.values()][0];
  assert.equal(timer.delay, 15000);
  timer.callback();
  await pending;
  assert.equal(state.requests[0].init.signal.aborted, true);
  assertRetryable(state, /timed out.*try again/i);
});

test("timeout also covers a stalled response body", async () => {
  let readingBody;
  const bodyStarted = new Promise((resolve) => {
    readingBody = resolve;
  });
  const state = fixture(async (_url, { signal }) => ({
    ...response(),
    json: () => {
      readingBody();
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    },
  }));
  const pending = state.login.doLogin();
  await bodyStarted;
  [...state.timers.values()][0].callback();
  await pending;
  assertRetryable(state, /timed out.*try again/i);
});

for (const [name, username, password] of [
  ["missing username", undefined, "test-password"],
  ["empty username", "", "test-password"],
  ["blank username", "   ", "test-password"],
  ["missing password", "test-user", undefined],
  ["empty password", "test-user", ""],
]) {
  test(name + " is rejected locally without making a request", async () => {
    const state = fixture();
    state.login.username.value = username;
    state.login.password.value = password;
    await state.login.doLogin();
    assertRetryable(state, /enter.*username.*password/i);
    assert.equal(state.requests.length, 0);
  });
}

test("duplicate submits are ignored and the submitted username is retained", async () => {
  let resolveRequest;
  const state = fixture(
    () =>
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
  );
  const pending = state.login.doLogin();
  state.login.username.value = "changed-during-request";
  state.login.password.value = "changed-during-request";
  await state.login.doLogin();
  assert.equal(state.requests.length, 1);
  assert.equal(state.login.loginDisabled.value, true);
  resolveRequest(response());
  await pending;
  assert.deepEqual(state.saved, ["test-user"]);
  assert.deepEqual(JSON.parse(state.requests[0].init.body), {
    username: "test-user",
    password: "test-password",
  });
  assert.equal(state.timers.size, 0);
});

test("a failed login can be retried successfully without refreshing", async () => {
  let attempts = 0;
  const state = fixture(async () => response(++attempts === 1 ? 401 : 200));
  await state.login.doLogin();
  assertRetryable(state, /username.*password.*do not match/i);
  await state.login.doLogin();
  assert.equal(attempts, 2);
  assert.equal(state.login.errors.value, "");
  assert.equal(state.login.loginDisabled.value, false);
  assert.deepEqual(state.saved, ["test-user"]);
  assert.deepEqual(state.navigated, ["/"]);
  assert.equal(state.timers.size, 0);
});

test("local session-storage failures also restore the form", async () => {
  const state = fixture(undefined, { storageError: true });
  await state.login.doLogin();
  assertRetryable(state, /unable to sign in right now/i);
});

test("navigation failures do not leave the form disabled", async () => {
  const state = fixture(undefined, { navigationError: true });
  await state.login.doLogin();
  assert.equal(state.login.loginDisabled.value, false);
  assert.match(state.login.errors.value, /unable to sign in right now/i);
  assert.equal(state.navigated.length, 0);
  assert.equal(state.timers.size, 0);
});
