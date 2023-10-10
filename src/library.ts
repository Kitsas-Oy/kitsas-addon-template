import { NextFunction, Request, Response } from "express";
import { AddonCallInfo, KitsasConnectionInterface } from "kitsas-library";
import { SessionData } from "express-session";

export interface AddonSession extends SessionData {
    call?: AddonCallInfo;
    data?: { [key: string]: any};
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
        session.data = {};
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

    rights(): string[] {
        return this.session.call?.rights || [];
    }

    active(): boolean {
        return this.rights.length > 0;
    }


    /**
     * Get session stored custom data
     * @param key Key of the data
     * @returns Data or undefined if not found
     */
    get(key: string): any {
        return this.session.data?.[key] || undefined;
    }

    /**
     * Store custom data to session
     * @param key Key of the data
     * @param value Data value
     */
    set(key: string, value: any) {        
        const oldObject: { [key: string]: any } = this.session.data || {};        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        oldObject[key] = value;
        this.session.data = oldObject;
    }


}
