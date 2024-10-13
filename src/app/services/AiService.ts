import { AiServiceApi } from './AiServiceApi';

export class AiService {
    private aiServiceApi: AiServiceApi;

    constructor() {
        this.aiServiceApi = new AiServiceApi();
    }

    async generateDailyJoke(): Promise<string> {
        const prompt = `Твоя роль - прислати анегдот. Він має бути 18+. Дуже смішний!
        Лише один! Він має бути не девше ніж 4 речення! Надсилай лише сам анегдот, без додаткових коментарів чи пояснень.`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateTrashMessage(): Promise<string> {
        const prompt = `Згенеруй повідомлення, яке нагадує викинути сміття та викотити баки. 
        Це відбувається кожен вечір вівторка. Повідомлення має бути 18+, з пошлістю, нахабством і гумором. 
        Не більше 4 речень! Звертайся до кількох людей, використовуючи множину: "Ви", "Ваш", "Вам".`;
        return await this.aiServiceApi.generateResponse(prompt);
    }
}
