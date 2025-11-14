export const EmailService = jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));
