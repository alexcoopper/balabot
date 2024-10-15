import { AiService } from '../services/AiService';
import { NotificationMessage } from './NotificationMessage';

export class CacheAddedNotificationMessage extends NotificationMessage {
    private aiService: AiService;

    constructor() {
        super();
        this.aiService = new AiService();
    }


    async build(parameters: any): Promise<string> {
        return `Щойно витратили трохи наліка!\nХто додав: ${parameters.author}\nСкільки: ${parameters.amount}(грн)\nНа що: ${parameters.description}`;
    }
}
