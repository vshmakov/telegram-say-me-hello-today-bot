class AsyncBatcher {
    constructor(batchSize = 10) {
        this.batchSize = batchSize;
        this.tasks = [];
    }

    push(taskFn) {
        // taskFn — функция, возвращающая Promise
        this.tasks.push(taskFn);
    }

    async flush() {
        for (let i = 0; i < this.tasks.length; i += this.batchSize) {
            const batch = this.tasks.slice(i, i + this.batchSize).map(fn => fn());
            await Promise.all(batch);
        }

        this.tasks = [];
    }
}

module.exports = AsyncBatcher;
