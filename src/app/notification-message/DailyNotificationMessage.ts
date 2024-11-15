import { AiService } from '../services/AiService';
import { parseWeatherData, WeatherService } from '../services/WeatherService';
import { NotificationMessage } from './NotificationMessage';

export class DailyNotificationMessage extends NotificationMessage {
    private aiService: AiService;
    private weatherService: WeatherService;

    constructor() {
        super();
        this.aiService = new AiService();
        this.weatherService = new WeatherService();
    }

    async build(): Promise<string> {
        const weather = await this.weatherService.getWeather();
        const simpleWeather = parseWeatherData(weather);
        console.log('Simple weather:', simpleWeather);
        return await this.aiService.generateDailyWeatherMessage(simpleWeather);
        //return await this.aiService.generateDailyMessage();
    }
}
