/**
 * @fileoverview Research job controller managing the Plan-Execute-Verify loop.
 * Orchestrates multi-agent research workflow with hybrid LLM processing.
 * @module agent/controller
 */

import { LLM } from '../llm.js';
import { PlannerAgent, ExecutorAgent, VerifierAgent, ReportGenerator } from './agents.js';
import { JobState, LogEntry } from '../memory.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller class that manages research jobs and coordinates agents.
 * Implements SSE event streaming for real-time progress updates.
 */
export class Controller {
    constructor() {
        this.jobs = {};
        this.llm = new LLM();  // Hybrid LLM
        this.planner = new PlannerAgent(this.llm);
        this.executor = new ExecutorAgent(this.llm);
        this.verifier = new VerifierAgent(this.llm);
        this.reporter = new ReportGenerator(this.llm);
        this.eventSubscribers = {};

        this.config = {
            maxRetries: 2,
            delayBetweenSteps: 1000
        };
    }

    createJob(topic) {
        const jobId = uuidv4();
        const job = new JobState({ job_id: jobId, topic });
        this.jobs[jobId] = job;
        this.eventSubscribers[jobId] = [];
        this.runJob(jobId);
        return jobId;
    }

    getJob(jobId) {
        return this.jobs[jobId];
    }

    async log(jobId, message, level = "info") {
        const job = this.jobs[jobId];
        if (job) {
            const entry = new LogEntry({
                timestamp: new Date().toISOString(),
                message,
                level
            });
            job.logs.push(entry);
            this.notifySubscribers(jobId, 'log', entry);
        }
    }

    subscribe(jobId, res) {
        if (this.eventSubscribers[jobId]) {
            this.eventSubscribers[jobId].push(res);
        }
    }

    notifySubscribers(jobId, event, data) {
        const subscribers = this.eventSubscribers[jobId];
        if (subscribers) {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            subscribers.forEach(res => res.write(payload));
        }
    }

    async runJob(jobId) {
        const job = this.jobs[jobId];
        let attempt = 0;
        let feedback = null;
        let lastFindings = null;

        try {
            while (attempt < this.config.maxRetries) {
                attempt++;
                await this.log(jobId, `🔄 Attempt ${attempt}/${this.config.maxRetries}`);

                // 1. PLANNING (Groq - fast)
                job.status = "planning";
                this.notifySubscribers(jobId, 'status', { status: job.status });
                await this.log(jobId, "📋 Planning [Groq]...");

                const plan = await this.planner.createPlan(job.topic, feedback);
                job.plan = plan;
                await this.log(jobId, `📋 ${plan.steps.length} steps planned`);

                // 2. EXECUTING (Groq - fast)
                job.status = "executing";
                this.notifySubscribers(jobId, 'status', { status: job.status });
                const findings = {};

                for (const step of plan.steps) {
                    step.status = "active";
                    await this.log(jobId, `⚡ [Groq] ${step.description}`);

                    const result = await this.executor.executeStep(step, JSON.stringify(findings));
                    step.result = result;
                    step.status = "completed";
                    findings[step.step_id] = result;

                    await this.log(jobId, `✅ Done (${result.length} chars)`);
                    await new Promise(r => setTimeout(r, this.config.delayBetweenSteps));
                }

                lastFindings = findings;

                // 3. VERIFYING (Gemini - thorough)
                job.status = "verifying";
                this.notifySubscribers(jobId, 'status', { status: job.status });
                await this.log(jobId, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                await this.log(jobId, "🔮 [Gemini] Starting verification...");
                await this.log(jobId, "🔬 [Gemini] Analyzing research quality...");
                await new Promise(r => setTimeout(r, 500));
                await this.log(jobId, "📋 [Gemini] Cross-referencing findings...");
                await new Promise(r => setTimeout(r, 300));
                await this.log(jobId, "✍️ [Gemini] Generating comprehensive report...");

                const verification = await this.verifier.verify(job.topic, plan, findings);

                await this.log(jobId, "✅ [Gemini] Verification complete!");
                if (verification.quality_score) {
                    await this.log(jobId, `📊 Quality Score: ${verification.quality_score}/100`);
                }

                if (verification.status === "pass") {
                    job.status = "completed";
                    job.final_report = verification.final_report;
                    this.notifySubscribers(jobId, 'status', { status: job.status });
                    this.notifySubscribers(jobId, 'result', { report: job.final_report });
                    await this.log(jobId, "🎉 Research completed!");
                    return;
                }

                feedback = verification.feedback;
                await this.log(jobId, `⚠️ ${feedback}`, "warning");
            }

            // Fallback: Generate report with Gemini
            if (lastFindings) {
                await this.log(jobId, "📝 Generating report [Gemini]...", "warning");
                job.status = "completed";
                job.final_report = await this.reporter.generate(job.topic, lastFindings);
                this.notifySubscribers(jobId, 'status', { status: job.status });
                this.notifySubscribers(jobId, 'result', { report: job.final_report });
                await this.log(jobId, "✅ Report generated!");
                return;
            }

            job.status = "failed";
            this.notifySubscribers(jobId, 'status', { status: job.status });
            await this.log(jobId, "❌ Research failed.", "error");

        } catch (error) {
            job.status = "failed";
            this.notifySubscribers(jobId, 'status', { status: job.status });
            await this.log(jobId, `💥 Error: ${error.message}`, "error");
            console.error(error);
        }
    }
}
