// Router for /addon endpoint, called by Kitsas

import addon from './addon';
import { AddonCall } from 'kitsas-addon-library';
import { Request, Response } from "express";
const router = addon.createRouter('/addon');

router.get('/',  async (req : Request, res : Response) => {
    // call object contains all the information about the call
    // and methods to interact with Kitsas server 
    const call = new AddonCall(req);

    // This example show logs if addon is active,
    // and introduction page if it's not.

    const logs = await call.getLogs();

    if( call.isActive() ) {
        res.render('main', { logs: logs });
    } else {
        res.render('introduction');
    }
});

export default router;

