import { NextFunction, Request, Response } from "express";
import { AddonCallInfo, KitsasConnectionInterface } from "kitsas-library";
import { SessionData } from "express-session";

export interface AddonSession extends SessionData {
    call?: AddonCallInfo;
}
export async function addonMiddleware(req: Request, res: Response, next: NextFunction) : Promise<void>
{
    const session = req.session as AddonSession;
    if ('call' in session) {
        next();
    } else {
        const callId = req.query['callId'];
        if (!callId) {
            res.status(400).send('Missing callId');
            return;
        }
        const connection = req.app.get('KitsasConnection') as KitsasConnectionInterface;
        const call = await connection.getAddonCallInfo(callId as string);
        if (!call) {
            res.status(404).send('Call not found');
            return;
        }
        session.call = call;
        next();
    }
};

export class Hook {
    constructor(request: Request) {
        this.request = request;        
    }

    private request: Request;
        
    connection(): KitsasConnectionInterface {
        return this.request.app.get('KitsasConnection') as KitsasConnectionInterface;
    }

}

export class Call extends Hook{
    constructor(request: Request) {
        super(request);
        this.session = request.session as AddonSession;
    }
    
    private session: AddonSession;

    userName(): string  {
        return this.session.call?.user?.name || '';
    }

    userId(): string  {
        return this.session.call?.user?.id || '';
    }

    organizationName(): string {
        return this.session.call?.organization?.name || '';
    }

    organizationId(): string {
        return this.session.call?.organization?.id || '';
    }

}
