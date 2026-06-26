import { supabase } from "../supabase";

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface AIResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  provider: string;
}

export abstract class AIProvider {
  protected apiKey: string;
  protected model: string;
  protected timeoutMs: number;
  protected maxRetries: number;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey || "";
    this.model = config.model || this.getDefaultModel();
    this.timeoutMs = config.timeoutMs || 10000; // default 10 seconds timeout
    this.maxRetries = config.maxRetries !== undefined ? config.maxRetries : 3;
  }

  abstract getProviderName(): string;
  protected abstract getDefaultModel(): string;
  protected abstract calculateCost(inputTokens: number, outputTokens: number): number;
  protected abstract generateImpl(prompt: string, signal?: AbortSignal): Promise<{ text: string; inputTokens: number; outputTokens: number }>;

  /**
   * Generates content with timeout, retries, cost tracking, and logging.
   */
  async generate(prompt: string): Promise<AIResponse> {
    let attempts = 0;
    let delay = 1000; // starting exponential backoff delay (1s)

    while (attempts <= this.maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const result = await this.generateImpl(prompt, controller.signal);
        clearTimeout(timeoutId);

        const cost = this.calculateCost(result.inputTokens, result.outputTokens);
        
        // Log generation stats to audit_log
        await this.logToAudit(prompt, result.text, result.inputTokens, result.outputTokens, cost);

        return {
          text: result.text,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          costUSD: cost,
          provider: this.getProviderName()
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`[AI Provider: ${this.getProviderName()}] Attempt ${attempts} failed: ${err.message || err}`);

        if (attempts > this.maxRetries || err.name === "AbortError") {
          throw err;
        }

        // Exponential backoff wait
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error(`AI generation failed after ${attempts} attempts`);
  }

  private async logToAudit(prompt: string, output: string, inputTokens: number, outputTokens: number, cost: number) {
    try {
      await supabase.from("audit_log").insert({
        actor_type: "system",
        action: "ai_generation",
        entity_affected: "ai_provider",
        details: {
          provider: this.getProviderName(),
          model: this.model,
          prompt: prompt.substring(0, 500) + (prompt.length > 500 ? "..." : ""),
          output_length: output.length,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: cost
        }
      });
    } catch (err) {
      console.error("Failed to write to audit log:", err);
    }
  }
}

/**
 * Google Gemini Provider
 */
export class GeminiProvider extends AIProvider {
  getProviderName(): string { return "gemini"; }
  protected getDefaultModel(): string { return "gemini-1.5-flash"; }

  // Approx rates: $0.075 / 1M input, $0.30 / 1M output
  protected calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * 0.000000075) + (outputTokens * 0.0000003);
  }

  protected async generateImpl(prompt: string, signal?: AbortSignal): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const key = this.apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not configured.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${key}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Approximate token counts if API doesn't return them directly
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(text.length / 4);

    return { text, inputTokens, outputTokens };
  }
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider extends AIProvider {
  getProviderName(): string { return "openai"; }
  protected getDefaultModel(): string { return "gpt-4o-mini"; }

  // Approx rates (gpt-4o-mini): $0.15 / 1M input, $0.60 / 1M output
  protected calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * 0.00000015) + (outputTokens * 0.0000006);
  }

  protected async generateImpl(prompt: string, signal?: AbortSignal): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const key = this.apiKey || process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY not configured.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }]
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = data.usage?.completion_tokens || Math.ceil(text.length / 4);

    return { text, inputTokens, outputTokens };
  }
}

/**
 * Anthropic Claude Provider
 */
export class ClaudeProvider extends AIProvider {
  getProviderName(): string { return "claude"; }
  protected getDefaultModel(): string { return "claude-3-5-haiku-20241022"; }

  // Approx rates (3.5 haiku): $0.80 / 1M input, $4.00 / 1M output
  protected calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * 0.0000008) + (outputTokens * 0.000004);
  }

  protected async generateImpl(prompt: string, signal?: AbortSignal): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const key = this.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY not configured.");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }]
      }),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const inputTokens = data.usage?.input_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = data.usage?.output_tokens || Math.ceil(text.length / 4);

    return { text, inputTokens, outputTokens };
  }
}

/**
 * Mock Provider for testing/local fallbacks
 */
export class MockProvider extends AIProvider {
  getProviderName(): string { return "mock"; }
  protected getDefaultModel(): string { return "mock-engine"; }
  protected calculateCost(): number { return 0; }

  protected async generateImpl(prompt: string): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    // Generate deterministic structured trip mock
    const text = JSON.stringify({
      itineraryName: "Bespoke Personalized Trip",
      destination: "Singapore",
      estimatedCost: 120000,
      confidenceScore: 98,
      days: [
        {
          day: 1,
          experienceIds: ["e0000000-0000-0000-0000-000000000004"],
          highlights: "Lush botanical gardens, spectacular supertrees, climate domes."
        }
      ]
    });

    return {
      text,
      inputTokens: Math.ceil(prompt.length / 4),
      outputTokens: Math.ceil(text.length / 4)
    };
  }
}

/**
 * Master coordinator manager supporting fallbacks and provider switching.
 */
export class AIChainService {
  private providers: AIProvider[];

  constructor() {
    this.providers = [];
    
    // Register active providers depending on env keys
    if (process.env.GEMINI_API_KEY) {
      this.providers.push(new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY }));
    }
    if (process.env.OPENAI_API_KEY) {
      this.providers.push(new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY }));
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.push(new ClaudeProvider({ apiKey: process.env.ANTHROPIC_API_KEY }));
    }
    
    // Fallback Mock provider always available
    this.providers.push(new MockProvider({}));
  }

  /**
   * Generates text trying each provider sequentially in case of failures.
   */
  async generateWithFallback(prompt: string): Promise<AIResponse> {
    let lastError: any = null;

    for (const provider of this.providers) {
      try {
        console.log(`[AI Chain] Attempting generation with provider: ${provider.getProviderName()}`);
        return await provider.generate(prompt);
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Chain] Provider ${provider.getProviderName()} failed: ${err.message || err}. Falling back...`);
      }
    }

    throw new Error(`AI Chain failed. All providers exhausted. Last error: ${lastError?.message || lastError}`);
  }
}

export const aiChain = new AIChainService();

export async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.data?.[0]?.embedding) {
          return result.data[0].embedding;
        }
      }
      console.warn("OpenAI Embedding endpoint failed. Falling back to deterministic mock.");
    } catch (err) {
      console.warn("OpenAI Embedding API error, falling back to deterministic mock:", err);
    }
  }

  // Deterministic 1536-dimensional float vector generator
  const embedding = new Array(1536).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (let i = 0; i < 1536; i++) {
    const val = Math.sin(hash + i) * 10000;
    embedding[i] = val - Math.floor(val);
  }
  // Normalize vector to unit length
  let sumSq = 0;
  for (let i = 0; i < 1536; i++) sumSq += embedding[i] * embedding[i];
  const norm = Math.sqrt(sumSq);
  for (let i = 0; i < 1536; i++) embedding[i] = embedding[i] / (norm || 1);
  return embedding;
}
