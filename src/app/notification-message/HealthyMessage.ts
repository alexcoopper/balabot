import { AiService } from '../services/AiService';
import { NotificationMessage } from './NotificationMessage';

export class HealthyMessage extends NotificationMessage {
    private aiService: AiService;

    constructor() {
        super();
        this.aiService = new AiService();
    }


    async build(): Promise<string> {
        return await this.aiService.generateHealtyMessage();
    }
}
