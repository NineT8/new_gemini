import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Hybrid LLM System with Rate Limit Handling
 */

export class GroqLLM {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.warn("WARNING: GROQ_API_KEY not found");
        }
        this.groq = new Groq({ apiKey });
        this.modelName = "llama-3.3-70b-versatile";
        this.lastRequestTime = 0;
        this.minDelay = 1500;
        console.log(`✓ Groq initialized: ${this.modelName}`);
    }

    async throttle() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
            await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }

    async generateJson(prompt, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                await this.throttle();
                const completion = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: this.modelName,
                    response_format: { type: "json_object" }
                });
                return JSON.parse(completion.choices[0]?.message?.content || "{}");
            } catch (error) {
                if (error.status === 429 && i < retries - 1) {
                    const wait = Math.pow(2, i + 1) * 2000;
                    console.log(`Groq rate limit, waiting ${wait / 1000}s...`);
                    await new Promise(r => setTimeout(r, wait));
                    continue;
                }
                console.error("Groq Error:", error.message);
                return { error: error.message };
            }
        }
        return { error: "Max retries exceeded" };
    }

    async generateText(prompt, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                await this.throttle();
                const completion = await this.groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: this.modelName
                });
                return completion.choices[0]?.message?.content || "No response";
            } catch (error) {
                if (error.status === 429 && i < retries - 1) {
                    const wait = Math.pow(2, i + 1) * 2000;
                    console.log(`Groq rate limit, waiting ${wait / 1000}s...`);
                    await new Promise(r => setTimeout(r, wait));
                    continue;
                }
                return `Error: ${error.message}`;
            }
        }
        return "Error: Max retries exceeded";
    }
}

export class GeminiLLM {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("WARNING: GEMINI_API_KEY not found");
            this.available = false;
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash - better rate limits on free tier
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.available = true;
        this.lastRequestTime = 0;
        this.minDelay = 2000; // 2 second minimum between requests
        console.log(`✓ Gemini initialized: gemini-1.5-flash`);
    }

    async throttle() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
            await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }

    async generateJson(prompt, retries = 3) {
        if (!this.available) return { error: "Gemini not configured" };

        for (let i = 0; i < retries; i++) {
            try {
                await this.throttle();
                const result = await this.model.generateContent(prompt + "\n\nRespond ONLY with valid JSON.");
                const text = result.response.text();
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return JSON.parse(cleaned);
            } catch (error) {
                if (error.message?.includes('429') && i < retries - 1) {
                    const wait = Math.pow(2, i + 1) * 3000;
                    console.log(`Gemini rate limit, waiting ${wait / 1000}s...`);
                    await new Promise(r => setTimeout(r, wait));
                    continue;
                }
                console.error("Gemini Error:", error.message);
                return { error: error.message };
            }
        }
        return { error: "Max retries exceeded" };
    }

    async generateText(prompt, retries = 3) {
        if (!this.available) return "Error: Gemini not configured";

        for (let i = 0; i < retries; i++) {
            try {
                await this.throttle();
                const result = await this.model.generateContent(prompt);
                return result.response.text();
            } catch (error) {
                if (error.message?.includes('429') && i < retries - 1) {
                    const wait = Math.pow(2, i + 1) * 3000;
                    console.log(`Gemini rate limit, waiting ${wait / 1000}s...`);
                    await new Promise(r => setTimeout(r, wait));
                    continue;
                }
                return `Error: ${error.message}`;
            }
        }
        return "Error: Max retries exceeded";
    }
}

/**
 * HybridLLM - Routes to best available model with fallback
 */
export class LLM {
    constructor() {
        this.groq = new GroqLLM();
        this.gemini = new GeminiLLM();

        console.log(`\n🔀 Hybrid LLM System Active`);
        console.log(`   Groq: Planning + Execution`);
        console.log(`   Gemini: Verification + Reports\n`);
    }

    // For planning - use Groq
    async plan(prompt) {
        console.log("📋 [GROQ] Planning...");
        return await this.groq.generateJson(prompt);
    }

    // For step execution - use Groq
    async execute(prompt) {
        console.log("⚡ [GROQ] Executing...");
        return await this.groq.generateText(prompt);
    }

    // For verification - try Gemini, fallback to Groq
    async verify(prompt) {
        if (this.gemini.available) {
            console.log("🔍 [GEMINI] Verifying...");
            const result = await this.gemini.generateJson(prompt);
            if (!result.error) return result;
            console.log("🔍 [GROQ] Fallback...");
        }
        return await this.groq.generateJson(prompt);
    }

    // For final reports - try Gemini, fallback to Groq
    async synthesize(prompt) {
        if (this.gemini.available) {
            console.log("📝 [GEMINI] Synthesizing...");
            const result = await this.gemini.generateText(prompt);
            if (!result.startsWith("Error:")) return result;
            console.log("📝 [GROQ] Fallback...");
        }
        return await this.groq.generateText(prompt);
    }

    // Legacy
    async generateJson(prompt) {
        return await this.groq.generateJson(prompt);
    }

    async generateText(prompt) {
        return await this.groq.generateText(prompt);
    }
}
