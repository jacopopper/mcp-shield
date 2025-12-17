import { promptUser } from './prompt.js';
export class HITLQueue {
    queue = [];
    processing = false;
    async requestApproval(tool, args) {
        return new Promise((resolve) => {
            this.queue.push({ tool, args, resolve });
            this.processNext();
        });
    }
    async processNext() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        const request = this.queue.shift();
        try {
            const approved = await promptUser(request.tool, request.args);
            request.resolve(approved);
        }
        catch {
            // On error, deny by default
            request.resolve(false);
        }
        this.processing = false;
        this.processNext();
    }
}
//# sourceMappingURL=queue.js.map