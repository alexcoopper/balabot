import { User } from 'telegraf/typings/core/types/typegram';
import { AiServiceApi } from './AiServiceApi';
import { UserInfo } from './UserInfoService';
import { SimpleWeather, WeatherData } from './WeatherService';

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

    async generateDailyWeatherMessage(weather: SimpleWeather): Promise<string> {
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. Ти маєш прислати повідомлення на кожен день у груповий чат телеграм. 
        Використовуй дані про погоду: ${JSON.stringify(weather)}.
        В повідомленні треба сказати яка на сьогодні буде погода, що варто мати на увазі, які речі взяти з собою, щоб не замерзнути або не згоріти на сонці.
        Обов'зяково вкажу яка очікується температура від і до.
        У чаті є як хлопці, так і дівчата.
        Повідомлення має бути 18+, з пошлістю, нахабством і гумором!. Він має бути не девше ніж 1 речення! Без додаткових коментарів чи пояснень. 
        Використовуй емоджі.`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    //async generateDailyJoke(): Promise<string> {
    //    const prompt = `Твоя роль - прислати анегдот. Він має бути 18+. Дуже смішний!
    //    Лише один! Він має бути не девше ніж 4 речення! Надсилай лише сам анегдот, без додаткових коментарів чи пояснень.`;
    //    return await this.aiServiceApi.generateResponse(prompt);
    //}

    

    async generateTrashMessage(): Promise<string> {
        const prompt = `Згенеруй повідомлення, яке нагадує викинути сміття та викотити баки. 
        Це відбувається кожен вечір вівторка.  
        Повідомлення має бути 18+, з пошлістю, нахабством і гумором.
        Не більше 4 речень! Звертайся до кількох людей, використовуючи множину: "Ви", "Ваш", "Вам".`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    getCommonPartForRandomMessage(userInfo: UserInfo|undefined): string {
        const userDetails = userInfo ? `Ім'я автора: ${userInfo.name}, Стать автора: ${userInfo.sex}` : 'Не згадуй стать у відповіді.';
        return `
            Повідомлення має бути 18+, з пошлістю, нахабством і гумором.
            ${this.getHumorStyle()}
            Не більше 1 речення! 
            Звертайся на ти, до того хто це написав. 
            У чаті є як хлопці, так і дівчата. 
            використовауй емоджі у відповіді.
            ${userDetails}`;
    } 

    async generateHealtyMessage(): Promise<string> {
        const prompt = `Твоя роль — помічник для здорового способу життя. Ти пишеш мотиваційні та корисні поради у дружньому і позитивному стилі. 
Порада буде відправлена у груповий чат в середині дня.
Згенеруй коротке повідомлення, яке мотивує людину виконати невелику фізичну вправу або зробити щось корисне для здоров'я. 

Приклади порад:
1. "Давай, не лінуйся! Постав таймер на 5 хвилин і зроби легку розминку: повороти голови, нахили, махи руками."
2. "Випий склянку води, твій організм скаже тобі спасибі! 💧"
3. "Пора підзарядити тіло: зроби 10 присідань прямо зараз! Ти зможеш!"

Стиль: дружній, мотиваційний, з гумором або емоджі. 
Довжина: 1-2 речення. 
Мета: спонукати людину діяти. 
Звертайся до кількох людей, використовуючи множину: "Ви", "Ваш", "Вам".

Випадкова порада:`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateRandomMessage(messageText: string, userInfo: UserInfo|undefined): Promise<string> {
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. 
        Згенеруй повідомлення, яке якось пов'язано з попереднім повідомленням в груповому чаті.
        Попереднє повідомлення: ${messageText}.
        ${this.getCommonPartForRandomMessage(userInfo)}`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateAnswerToDirectMessage(messageText: string, userInfo: UserInfo|undefined): Promise<string> {
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. 
        Ти маєш відповісти на повідомлення, яке буле адресовано напряму тобі.
        Тобі написали: ${messageText}.
        ${this.getCommonPartForRandomMessage(userInfo)}`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    async generateAnswerToReplayMessage(messageText: string, replayToText: string, userInfo: UserInfo|undefined): Promise<string> {
        const prompt = `Твоя роль - телеграм бот чат. Чоловіча стать. 
        Тобі відповіли на одне з твоїх попередніх повідомлень.
        Тобі написали: ${messageText}. Твоє попереднє повідомлення: ${replayToText}.
        Дай наступну відповідь беручи до уваги весь попередній контекст.
        ${this.getCommonPartForRandomMessage(userInfo)}`;
        return await this.aiServiceApi.generateResponse(prompt);
    }

    getHumorStyle(): string {
        const humorStyles = [
            'сарказм',
            'іронія',
            'грубий гумор',
            'гра слів',
            'абсурдний гумор'
        ];
        const selectedStyle = humorStyles[Math.floor(Math.random() * humorStyles.length)];
        return `Стиль гумору: ${selectedStyle}, цу дуже важливо.`;
    }
}
