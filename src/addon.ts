import { Router, Request, Response } from "express";
import { addonMiddleware, Call } from "./library";

const router = Router();

router.use(addonMiddleware);

router.get('/',  async (req : Request, res : Response) => {
    const call = new Call(req);
    const logs = await call.getLogs();

    if( call.active() ) {
        res.render('main', { logs: logs });
    } else {
        res.render('introduction');
    }
});

export default router;