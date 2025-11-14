import {
    getNotifications,
    markAsRead,
    deleteNotification,
} from '../../controllers/notification.controller';
import Notification from '../../models/notification.model.js';

// Mock dependencies
jest.mock('../../models/notification.model.js');

describe('Notification Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: {
                _id: 'userId',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getNotifications', () => {
        it('should return all notifications for the current user', async () => {
            const mockNotifications = [
                {
                    _id: 'notificationId1',
                    message: 'Test notification 1',
                    read: false,
                },
                {
                    _id: 'notificationId2',
                    message: 'Test notification 2',
                    read: true,
                },
            ];

            Notification.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockNotifications),
            });

            await getNotifications(req, res, next);

            expect(Notification.find).toHaveBeenCalledWith({
                destination: 'userId',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotifications);
        });

        it('should return 500 if there is an error fetching notifications', async () => {
            const error = new Error('Test error');
            Notification.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(error),
            });

            await getNotifications(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error fetching notifications',
                error,
            });
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            req.params.id = 'notificationId';

            const mockNotification = {
                _id: 'notificationId',
                destination: 'userId',
                read: false,
                save: jest.fn().mockResolvedValue(true),
            };

            Notification.findById.mockResolvedValue(mockNotification);

            await markAsRead(req, res, next);

            expect(Notification.findById).toHaveBeenCalledWith('notificationId');
            expect(mockNotification.read).toBe(true);
            expect(mockNotification.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockNotification);
        });

        it('should return 404 if notification is not found', async () => {
            req.params.id = 'notificationId';

            Notification.findById.mockResolvedValue(null);

            await markAsRead(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notification not found',
            });
        });

        it('should return 403 if user is not authorized', async () => {
            req.params.id = 'notificationId';

            const mockNotification = {
                _id: 'notificationId',
                destination: 'otherUserId',
            };

            Notification.findById.mockResolvedValue(mockNotification);

            await markAsRead(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'You are not authorized to perform this action',
            });
        });
    });

    describe('deleteNotification', () => {
        it('should delete a notification', async () => {
            req.params.id = 'notificationId';

            const mockNotification = {
                _id: 'notificationId',
                destination: 'userId',
                remove: jest.fn().mockResolvedValue(true),
            };

            Notification.findById.mockResolvedValue(mockNotification);

            await deleteNotification(req, res, next);

            expect(Notification.findById).toHaveBeenCalledWith('notificationId');
            expect(mockNotification.remove).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notification deleted successfully',
            });
        });

        it('should return 404 if notification is not found', async () => {
            req.params.id = 'notificationId';

            Notification.findById.mockResolvedValue(null);

            await deleteNotification(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notification not found',
            });
        });

        it('should return 403 if user is not authorized', async () => {
            req.params.id = 'notificationId';

            const mockNotification = {
                _id: 'notificationId',
                destination: 'otherUserId',
            };

            Notification.findById.mockResolvedValue(mockNotification);

            await deleteNotification(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'You are not authorized to perform this action',
            });
        });
    });
});
