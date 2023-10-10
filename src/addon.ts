import { Router, Request, Response } from "express";
import { addonMiddleware, Call } from "./library";

const router = Router();

router.use(addonMiddleware);

router.get('/',  (req : Request, res : Response) => {
    const call = new Call(req);
    
    const counter = call.get('counter') as number || 0;
    call.set('counter', counter + 1);

    res.send({
        userName: call.userName(),
        userId: call.userId(),
        organizationName: call.organizationName(),
        organizationId: call.organizationId(),
        addonName: call.connection().getName(),
        rights: call.rights(),
        active: call.active(),
        counter: counter,
    })
});

export default router;