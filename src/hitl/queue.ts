import { promptUser } from './prompt.js';

interface QueuedRequest {
    tool: string;
    args: unknown;
    resolve: (approved: boolean) => void;
}

export class HITLQueue {
    private queue: QueuedRequest[] = [];
    private processing = false;

    async requestApproval(tool: string, args: unknown): Promise<boolean> {
        return new Promise((resolve) => {
            this.queue.push({ tool, args, resolve });
            this.processNext();
        });
    }

    private async processNext(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;
        const request = this.queue.shift()!;

        try {
            const approved = await promptUser(request.tool, request.args);
            request.resolve(approved);
        } catch {
            // On error, deny by default
            request.resolve(false);
        }

        this.processing = false;
        this.processNext();
    }
}
