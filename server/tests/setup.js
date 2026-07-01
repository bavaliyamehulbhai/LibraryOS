jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      on: jest.fn(),
      close: jest.fn()
    })),
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn()
    })),
    QueueEvents: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      close: jest.fn()
    }))
  };
});

// Also mock node-cron if it starts jobs on load
jest.mock("node-cron", () => ({
  schedule: jest.fn()
}));
