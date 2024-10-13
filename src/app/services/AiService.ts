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
        const prompt = `Згенеруй повідомлення, яку нагадує викинути мусор та викотити баки. То має бути 18+.`;
        return await this.aiServiceApi.generateResponse(prompt);
    }
}
