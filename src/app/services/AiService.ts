import { User } from 'telegraf/typings/core/types/typegram';
import { AiServiceApi } from './AiServiceApi';
import { UserInfo } from './UserInfoService';

export class AiService {
    private aiServiceApi: AiServiceApi;

    constructor() {
        this.aiServiceApi = new AiServiceApi();
    }

    async generateDailyMessage(): Promise<string> {
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. Ти маєш прислати повідомлення на кожен день у груповий чат телеграм. 
        Щось типу "а я ще тут, не забувайте про мене.". У чаті є як хлопці, так і дівчата.
        Повідомлення має бути 18+, з пошлістю, нахабством і гумором. Має бути дуже жорсткий гумор!. Він має бути не девше ніж 1 речення! Без додаткових коментарів чи пояснень.`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    //async generateDailyJoke(): Promise<string> {
    //    const prompt = `Твоя роль - прислати анегдот. Він має бути 18+. Дуже смішний!
    //    Лише один! Він має бути не девше ніж 4 речення! Надсилай лише сам анегдот, без додаткових коментарів чи пояснень.`;
    //    return await this.aiServiceApi.generateResponse(prompt);
    //}

    async generateTrashMessage(): Promise<string> {
        const prompt = `Згенеруй повідомлення, яке нагадує викинути сміття та викотити баки. 
        Це відбувається кожен вечір вівторка. Повідомлення має бути 18+, з пошлістю, нахабством і гумором. 
        Не більше 4 речень! Звертайся до кількох людей, використовуючи множину: "Ви", "Ваш", "Вам".`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateRandomMessage(messageText: string, userInfo: UserInfo|undefined): Promise<string> {
        const userDetails = userInfo ? `Ім'я автора: ${userInfo.name}, Стать автора: ${userInfo}` : 'Не згадуй стать у відповіді.';
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. 
        Згенеруй повідомлення, яке якось пов'язано з попереднім повідомленням в груповому чаті.
        Попереднє повідомлення: ${messageText}.
        Повідомлення має бути 18+, з пошлістю, нахабством і гумором. Має бути дуже жорсткий гумор!. 
        Не більше 1 речення! Звертайся на ти, до того хто це написав. У чаті є як хлопці, так і дівчата.
        ${userDetails}`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateAnswerToDirectMessage(messageText: string, userInfo: UserInfo|undefined): Promise<string> {
        const userDetails = userInfo ? `Ім'я автора: ${userInfo.name}, Стать автора: ${userInfo}` : 'Не згадуй стать у відповіді.';
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. 
        Ти маєш відповісти на повідомлення, яке буле адресовано напряму тобі.
        Тобі написали: ${messageText}.
        Повідомлення має бути 18+, з пошлістю, нахабством і гумором. Має бути дуже жорсткий гумор!. 
        Не більше 1 речення! Звертайся на ти, до того хто це написав. 
        У чаті є як хлопці, так і дівчата. 
        ${userDetails}`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateAnswerToReplayMessage(messageText: string, replayToText: string, userInfo: UserInfo|undefined): Promise<string> {
        const userDetails = userInfo ? `Ім'я автора: ${userInfo.name}, Стать автора: ${userInfo}` : 'Не згадуй стать у відповіді.';
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. 
        Тобі відповіли на одне з твоїх попередніх повідомлень.
        Тобі написали: ${messageText}. Твоє попереднє повідомлення: ${replayToText}.
        Дай наступну відповідь беручи до уваги весь попередній контекст.
        Відопвідь має бути 18+, з пошлістю, нахабством і гумором. Має бути дуже жорсткий гумор!. 
        Не більше 1 речення! Звертайся на ти, до того хто це написав. 
        У чаті є як хлопці, так і дівчата. 
        ${userDetails}`;
        return await this.aiServiceApi.generateResponse(prompt);
    }
}
