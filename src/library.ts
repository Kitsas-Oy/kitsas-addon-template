import { NextFunction, Request, Response } from "express";
import { AddonCallInfo, AddonLogDto, KitsasConnectionInterface, LanguageString, LogStatus, NotificationType, Notification } from "kitsas-library";
import { SessionData } from "express-session";
import { KitsasBookInterface } from "kitsas-library/lib/main/interfaces/kitsasbook.interface";

export interface AddonSession extends SessionData {
    call?: AddonCallInfo;
    language?: string;
    data?: { [key: string]: any};
}
export async function addonMiddleware(req: Request, res: Response, next: NextFunction) : Promise<void>
{
    const session = req.session as AddonSession;
    const callId = req.query['callId'];
    if (!callId) {
        if( session.call) {
            next();
            return;
        }
        res.status(400).send('This is a Kitsas addon and should be called from Kitsas with valid Call ID.');
        return;
    }
    const connection = req.app.get('KitsasConnection') as KitsasConnectionInterface;
    try {
        const call = await connection.getAddonCallInfo(callId as string);  
        console.log(JSON.stringify(call, null, 2))      
        session.call = call;
        req.app.locals.info = call;
        session.language = req.query['language'] as string || 'fi';
        req.app.locals.language = session.language;
        session.data = {};
        next();
    } catch (error) {        
        res.status(400).send('Call ID not valid.');
        return;
    }

};

class Hook {
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
        return this.session.call?.rights && this.session.call?.rights?.length > 0 || false;
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

    /**
     * Get language of the call
     * @returns Language code
     */
    language(): string {
        return this.session.language || 'fi';
    }

    async log(status: LogStatus, message: string, data?: object) : Promise<void>{                                
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await this.connection().writeAddonLog(this.organizationId(), status, message, data);
    }

    async getLogs(): Promise<AddonLogDto[]> {        
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return await this.connection().getAddonLog(this.organizationId());
    }

    async saveData(key: string, data: object) : Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await this.connection().saveData(this.organizationId(), key, data);
    }

    async getData(key: string): Promise<object> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return await this.connection().getData(this.organizationId(), key);
    }

    async notify(type: NotificationType, title: LanguageString, text: LanguageString, category?: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await this.connection().addNotification(this.organizationId(), type, title, text, category);
    }

    async replaceNotification(type: NotificationType, title: LanguageString, text: LanguageString, category: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await this.connection().replaceNotification(this.organizationId(), type, title, text, category);
    }

    async notifications(): Promise<Notification[]> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return await this.connection().getNotifications(this.organizationId());
    }

    async getBook(): Promise<KitsasBookInterface> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return await this.connection().getBook(this.organizationId());
    }

}

export async function health(req: Request, res: Response): Promise<void> {
    const hook = new Hook(req);
    try {
        await hook.connection().getBooks();
        res.send({status: 'ok'});
    } catch (error) {
        res.send({status: 'error'});
    }    
}
