import { v4 as uuidv4 } from 'uuid';

export class Step {
    constructor({ step_id, description, tool, params = {}, dependencies = [], status = "pending", result = null, uncertainty_level = "low" }) {
        this.step_id = step_id;
        this.description = description;
        this.tool = tool;
        this.params = params;
        this.dependencies = dependencies;
        this.status = status;
        this.result = result;
        this.uncertainty_level = uncertainty_level;
    }
}

export class Plan {
    constructor({ reasoning, steps = [] }) {
        this.reasoning = reasoning;
        this.steps = steps.map(s => new Step(s));
    }
}

export class LogEntry {
    constructor({ timestamp, message, level = "info" }) {
        this.timestamp = timestamp;
        this.message = message;
        this.level = level;
    }
}

export class JobState {
    constructor({ job_id, topic }) {
        this.job_id = job_id;
        this.topic = topic;
        this.status = "queued"; // queued, planning, executing, verifying, completed, failed
        this.plan = null;
        this.logs = [];
        this.final_report = null;
        this.created_at = new Date().toISOString();
    }
}
