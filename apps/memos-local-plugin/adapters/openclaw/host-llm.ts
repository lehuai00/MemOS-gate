/** Bridge MemOS auxiliary LLM calls through OpenClaw's runtime-owned LLM. */

import type {
  HostLlmBridge,
  HostLlmCompleteInput,
  HostLlmCompletion,
} from "../../core/llm/host-bridge.js";
import type { LlmUsage } from "../../core/llm/types.js";
import type {
  OpenClawRuntimeLlm,
  OpenClawRuntimeLlmCompleteParams,
} from "./openclaw-api.js";

const HOST_LLM_BRIDGE_ID = "openclaw.host.v1";
const MEMOS_LLM_PURPOSE = "memos-local-memory";

/**
 * Adapt MemOS' text-only host bridge to OpenClaw's runtime LLM capability.
 *
 * The runtime owns model selection and credentials. In particular, do not
 * forward MemOS' optional `model` override: auxiliary memory work must use
 * the target agent's configured model and its already-authorized credential.
 */
export function createOpenClawHostLlmBridge(
  llm: OpenClawRuntimeLlm,
): HostLlmBridge {
  return {
    id: HOST_LLM_BRIDGE_ID,
    async complete(input: HostLlmCompleteInput): Promise<HostLlmCompletion> {
      const startedAt = Date.now();
      const params: OpenClawRuntimeLlmCompleteParams = {
        messages: input.messages.map(({ role, content }) => ({ role, content })),
        purpose: MEMOS_LLM_PURPOSE,
        ...(input.maxTokens === undefined ? {} : { maxTokens: input.maxTokens }),
        ...(input.temperature === undefined ? {} : { temperature: input.temperature }),
        ...(input.signal === undefined ? {} : { signal: input.signal }),
      };
      const result = await llm.complete(params);
      return {
        text: result.text,
        model: result.responseModel ?? result.model,
        usage: toMemosUsage(result.usage),
        durationMs: Date.now() - startedAt,
      };
    },
  };
}

function toMemosUsage(
  usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number; costUsd?: number },
): LlmUsage | undefined {
  if (
    usage.inputTokens === undefined &&
    usage.outputTokens === undefined &&
    usage.totalTokens === undefined &&
    usage.costUsd === undefined
  ) {
    return undefined;
  }
  return {
    ...(usage.inputTokens === undefined ? {} : { promptTokens: usage.inputTokens }),
    ...(usage.outputTokens === undefined ? {} : { completionTokens: usage.outputTokens }),
    ...(usage.totalTokens === undefined ? {} : { totalTokens: usage.totalTokens }),
    ...(usage.costUsd === undefined ? {} : { costUsd: usage.costUsd }),
  };
}
