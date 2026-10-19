import { afterEach, describe, expect, it } from "vitest";

import {
  __resetHostLlmBridgeForTests,
  getHostLlmBridge,
  registerHostLlmBridge,
  unregisterHostLlmBridge,
  type HostLlmBridge,
} from "../../../core/llm/index.js";

function bridge(id: string): HostLlmBridge {
  return {
    id,
    async complete() {
      return { text: "ok", model: id, durationMs: 0 };
    },
  };
}

afterEach(() => __resetHostLlmBridgeForTests());

describe("HostLlmBridge registration lifecycle", () => {
  it("only unregisters the bridge that still owns the registration", () => {
    const first = bridge("first");
    const second = bridge("second");
    registerHostLlmBridge(first);
    registerHostLlmBridge(second);

    expect(unregisterHostLlmBridge(first)).toBe(false);
    expect(getHostLlmBridge()).toBe(second);
    expect(unregisterHostLlmBridge(second)).toBe(true);
    expect(getHostLlmBridge()).toBeNull();
  });
});
