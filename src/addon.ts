import { Router, Request, Response } from "express";
import { addonMiddleware, Call } from "./library";

const router = Router();

router.use(addonMiddleware);

router.get('/',  (req : Request, res : Response) => {
    const call = new Call(req);
    
    res.send({
        userName: call.userName(),
        userId: call.userId(),
        organizationName: call.organizationName(),
        organizationId: call.organizationId(),
        addonName: call.connection().getName(),
    })
});

export default router;