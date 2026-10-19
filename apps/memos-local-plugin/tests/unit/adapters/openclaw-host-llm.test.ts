import { describe, expect, it, vi } from "vitest";

import { createOpenClawHostLlmBridge } from "../../../adapters/openclaw/host-llm.js";
import type { OpenClawRuntimeLlm } from "../../../adapters/openclaw/openclaw-api.js";

describe("OpenClaw HostLlmBridge", () => {
  it("maps text completions through the runtime without selecting a model", async () => {
    const complete = vi.fn<OpenClawRuntimeLlm["complete"]>().mockResolvedValue({
      text: '{"summary":"done"}',
      provider: "openai",
      model: "configured-model",
      responseModel: "provider-model",
      usage: {
        inputTokens: 13,
        outputTokens: 7,
        totalTokens: 20,
        costUsd: 0.002,
      },
    });
    const bridge = createOpenClawHostLlmBridge({ complete });
    const controller = new AbortController();

    const result = await bridge.complete({
      messages: [
        { role: "system", content: "Return JSON." },
        { role: "user", content: "Summarize this trace." },
      ],
      model: "must-not-be-forwarded",
      temperature: 0.1,
      maxTokens: 128,
      signal: controller.signal,
      timeoutMs: 5_000,
    });

    expect(complete).toHaveBeenCalledWith({
      messages: [
        { role: "system", content: "Return JSON." },
        { role: "user", content: "Summarize this trace." },
      ],
      maxTokens: 128,
      temperature: 0.1,
      signal: controller.signal,
      purpose: "memos-local-memory",
    });
    expect(complete.mock.calls[0]?.[0]).not.toHaveProperty("model");
    expect(complete.mock.calls[0]?.[0]).not.toHaveProperty("timeoutMs");
    expect(result).toMatchObject({
      text: '{"summary":"done"}',
      model: "provider-model",
      usage: {
        promptTokens: 13,
        completionTokens: 7,
        totalTokens: 20,
        costUsd: 0.002,
      },
    });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("preserves an absent usage report as undefined", async () => {
    const complete = vi.fn<OpenClawRuntimeLlm["complete"]>().mockResolvedValue({
      text: "ok",
      provider: "openai",
      model: "configured-model",
      usage: {},
    });

    const result = await createOpenClawHostLlmBridge({ complete }).complete({
      messages: [{ role: "user", content: "hello" }],
    });

    expect(complete).toHaveBeenCalledWith({
      messages: [{ role: "user", content: "hello" }],
      purpose: "memos-local-memory",
    });
    expect(result).toMatchObject({ text: "ok", model: "configured-model" });
    expect(result.usage).toBeUndefined();
  });
});
