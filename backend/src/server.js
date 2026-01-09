/**
 * @fileoverview Express server for the Auto-Research Agent backend.
 * Provides REST API endpoints and SSE streaming for research jobs.
 * @module server
 */

import express from 'express';
import cors from 'cors';
import { Controller } from './agent/controller.js';

/** @type {import('express').Express} */
const app = express();
const port = 8000;

app.use(cors({
    origin: 'https://new-gemini-nine.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const controller = new Controller();

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', backend: 'node' });
});

// Create Job
app.post('/api/v1/jobs', (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        const jobId = controller.createJob(topic);
        res.json({ job_id: jobId, status: 'queued' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Job Status
app.get('/api/v1/jobs/:jobId', (req, res) => {
    const job = controller.getJob(req.params.jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    res.json({
        job_id: job.job_id,
        status: job.status,
        plan: job.plan,
        logs: job.logs,
        final_report: job.final_report
    });
});

// SSE Stream
app.get('/api/v1/jobs/:jobId/events', (req, res) => {
    const jobId = req.params.jobId;
    const job = controller.getJob(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    // SSE Headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Send initial history
    job.logs.forEach(log => {
        res.write(`event: log\ndata: ${JSON.stringify(log)}\n\n`);
    });

    if (job.status === 'completed' && job.final_report) {
        res.write(`event: result\ndata: ${JSON.stringify({ report: job.final_report })}\n\n`);
    }

    // Subscribe for new events
    controller.subscribe(jobId, res);

    // Keep alive
    const keepAlive = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 15000);

    req.on('close', () => {
        clearInterval(keepAlive);
        // Remove subscriber logic could be added here for cleanup
    });
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
