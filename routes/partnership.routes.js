import express from "express";
import { requestPartnership, getAllPartnershipRequests, getPartnershipRequestById } from "../controllers/partnership-request.controller.js";
import { authorize } from "../middleware/auth.middleware.js";

const partnershipRouter = express.Router();

partnershipRouter.post('/', requestPartnership);
partnershipRouter.get('/', authorize('admin'), getAllPartnershipRequests);
partnershipRouter.get('/:id', authorize('admin'), getPartnershipRequestById);

export default partnershipRouter;


