/**
 * `HostLlmBridge` is the adapter-injected escape hatch for "use the host
 * agent's LLM." OpenClaw has one via its sharing API; Hermes typically does
 * not.
 *
 * The bridge is intentionally simple: one `complete(prompt, opts)` entry
 * point. Streaming is deliberately not supported — hosts usually don't
 * expose streaming over their sharing APIs, and our streaming call sites
 * only ever target the primary provider.
 */

import type { LlmMessage, LlmUsage } from "./types.js";

export interface HostLlmCompleteInput {
  messages: LlmMessage[];
  /** Optional override, in case the host supports multiple models. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface HostLlmCompletion {
  text: string;
  model: string;
  usage?: LlmUsage;
  durationMs: number;
}

export interface HostLlmBridge {
  /** Stable provider id the host reports (e.g. "openclaw.host.v1"). */
  readonly id: string;

  complete(input: HostLlmCompleteInput): Promise<HostLlmCompletion>;
}

// Module-scoped singleton: adapter registers once at startup, core reads it.
let currentBridge: HostLlmBridge | null = null;

export function registerHostLlmBridge(bridge: HostLlmBridge | null): void {
  currentBridge = bridge;
}

/**
 * Clear a bridge only when the caller still owns the current registration.
 *
 * Hosts may stop an older plugin runtime after a newer runtime has already
 * registered its bridge. Identity matching prevents that stale shutdown from
 * disconnecting the newer runtime's LLM capability.
 */
export function unregisterHostLlmBridge(bridge: HostLlmBridge): boolean {
  if (currentBridge !== bridge) return false;
  currentBridge = null;
  return true;
}

export function getHostLlmBridge(): HostLlmBridge | null {
  return currentBridge;
}

/** Clear on shutdown / test teardown. */
export function __resetHostLlmBridgeForTests(): void {
  currentBridge = null;
}
