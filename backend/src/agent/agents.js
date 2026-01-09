/**
 * @fileoverview Agent implementations for the research workflow.
 * Contains specialized agents: Planner, Executor, Verifier, and ReportGenerator.
 * @module agent/agents
 */

import { LLM } from '../llm.js';
import { Plan, Step } from '../memory.js';
import { SearchTools } from '../tools/search.js';

/**
 * Creates research plans by breaking down topics into actionable steps.
 * Uses Groq LLM for fast planning operations.
 */
export class PlannerAgent {
    constructor(llm) {
        this.llm = llm;
    }

    async createPlan(topic, feedback = null) {
        const prompt = `
        SYSTEM: You are an expert Research Planner.
        GOAL: ${topic}
        CONTEXT: Current time is ${new Date().toISOString()}
        
        INSTRUCTION: Break this goal into 3-5 focused steps.
        - Use 'web_search' for finding facts (KEYWORD-BASED queries)
        - Use 'scrape_url' only with specific URLs
        - Keep steps focused and actionable
        
        FEEDBACK FROM PREVIOUS ATTEMPT: ${feedback || "None"}
        
        OUTPUT FORMAT (JSON):
        {
            "reasoning": "string",
            "steps": [
                {
                    "step_id": "step_1",
                    "description": "string",
                    "tool": "web_search",
                    "params": { "query": "string" },
                    "dependencies": [],
                    "uncertainty_level": "low"
                }
            ]
        }
        `;

        // Use Groq for fast planning
        const data = await this.llm.plan(prompt);
        if (data.error) {
            throw new Error(data.error);
        }
        return new Plan(data);
    }
}

export class ExecutorAgent {
    constructor(llm) {
        this.llm = llm;
    }

    async executeStep(step, context) {
        if (step.tool === "web_search") {
            const query = step.params.query;
            return await SearchTools.webSearch(query);
        } else if (step.tool === "scrape_url") {
            const url = step.params.url;
            const rawContent = await SearchTools.scrapeUrl(url);

            const analysisPrompt = `
            SYSTEM: Extract specific information from this content.
            TASK: ${step.description}
            SOURCE: ${rawContent.substring(0, 12000)} 
            
            Extract key facts with sources. Output NOT_FOUND if unavailable.
            `;
            // Use Groq for fast extraction
            return await this.llm.execute(analysisPrompt);
        } else if (step.tool === "analyze_content" || step.tool === "deep_analyze") {
            return await this.performAnalysis(step, context);
        }
        return "Unknown tool";
    }

    async performAnalysis(step, context) {
        const analysisPrompt = `
        SYSTEM: Expert Research Analyst.
        TASK: ${step.description}
        
        CONTEXT: ${context}
        
        Provide evidence-backed analysis with specific data points.
        Be comprehensive but concise.
        `;

        // Use Groq for fast analysis
        return await this.llm.execute(analysisPrompt);
    }
}

export class VerifierAgent {
    constructor(llm) {
        this.llm = llm;
    }

    async verify(topic, plan, findings) {
        const findingsStr = JSON.stringify(findings, null, 2);

        const prompt = `
        SYSTEM: Quality Verifier for research outputs.
        
        ORIGINAL GOAL: ${topic}
        
        FINDINGS:
        ${findingsStr}
        
        VERIFICATION:
        1. Does the research answer the goal?
        2. Are there specific facts and data?
        3. Is there enough substance?
        
        PASS if the research provides useful, specific information.
        Only REJECT if truly empty or irrelevant.
        
        OUTPUT (JSON):
        {
            "status": "pass",
            "quality_score": 75,
            "feedback": "string if not pass",
            "final_report": "Comprehensive markdown report if pass"
        }
        `;

        // Use Gemini for thorough verification (falls back to Groq if unavailable)
        const result = await this.llm.verify(prompt);

        if (result.status !== "pass" && !result.feedback) {
            result.feedback = "Research needs more specific data.";
        }

        return result;
    }
}

export class ReportGenerator {
    constructor(llm) {
        this.llm = llm;
    }

    async generate(topic, findings) {
        const prompt = `
        SYSTEM: Expert report writer. Create a professional research report.
        
        TOPIC: ${topic}
        
        DATA:
        ${JSON.stringify(findings, null, 2)}
        
        Generate a comprehensive markdown report:
        - Executive Summary
        - Key Findings (with data)
        - Analysis
        - Recommendations
        - Conclusion
        
        Use the actual data. Be specific and professional.
        `;

        // Use Gemini for high-quality synthesis
        return await this.llm.synthesize(prompt);
    }
}
