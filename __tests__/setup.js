// Mock MongoDB connection
jest.mock('mongoose', () => {
  const mmongoose = {
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      on: jest.fn(),
      once: jest.fn()
    },
    Schema: jest.fn().mockReturnValue({
      pre: jest.fn().mockReturnThis(),
      methods: {},
      statics: {},
      virtual: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    }),
    model: jest.fn().mockReturnValue({
      findById: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({})
    }),
    Schema: {
      Types: {
        ObjectId: 'ObjectId'
      }
    }
  };
  return mmongoose;
});

// Close any open handles after tests
afterAll(done => {
  jest.clearAllMocks();
  done();
});