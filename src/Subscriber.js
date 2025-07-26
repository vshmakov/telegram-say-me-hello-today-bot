class Subscriber {
    constructor(id, expectResponse) {
        this.id = id;
        this.expectResponse = expectResponse;
    }

    static fromRedis(id, value) {
        return new Subscriber(id, JSON.parse(value))
    }
}

module.exports = Subscriber;
