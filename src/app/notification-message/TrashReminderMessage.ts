import { AiService } from '../services/AiService';
import { NotificationMessage } from './NotificationMessage';

export class TrashReminderMessage extends NotificationMessage {
    private aiService: AiService;

    constructor() {
        super();
        this.aiService = new AiService();
    }


    async build(): Promise<string> {
        return await this.aiService.generateTrashMessage();
    }
}
