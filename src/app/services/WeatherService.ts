import axios from 'axios';


export interface CurrentWeather {
    temperature: number;
    summary: string;
    icon: string;
    wind: {
        speed: number;
        angle: number;
        dir: string;
    };
    cloudCover: number;
    precipitation: {
        total: number;
        type: string;
    };
}

export interface HourlyWeather {
    date: string;
    weather: string;
    summary: string;
    temperature: number;
    wind: {
        speed: number;
        angle: number;
        dir: string;
    };
    precipitation: {
        total: number;
        type: string;
    };
    cloud_cover: {
        total: number;
    };
}

export interface WeatherData {
    current: CurrentWeather;
    hourly: HourlyWeather[];
}


export class WeatherService {
    private readonly apiUrl: string = 'https://www.meteosource.com/api/v1/free/point';
    private readonly apiKey: string = process.env.METEOSOURCE_API_KEY || '';

    async getWeather(lat: string = '48.44248', lon: string = '22.71800', sections: string = 'current,hourly', units: string = 'metric'): Promise<WeatherData> {
        try {
            const response = await axios.get(this.apiUrl, {
                params: {
                    'place_id': 'mukachevo',
                    sections,
                    units,
                    key: this.apiKey,
                },
            });

            const data = response.data;

            // Map current weather
            const current: CurrentWeather = {
                temperature: data.current.temperature,
                summary: data.current.summary,
                icon: data.current.icon,
                wind: {
                    speed: data.current.wind.speed,
                    angle: data.current.wind.angle,
                    dir: data.current.wind.dir,
                },
                cloudCover: data.current.cloud_cover,
                precipitation: {
                    total: data.current.precipitation.total,
                    type: data.current.precipitation.type,
                },
            };

            const hourly: HourlyWeather[] = data.hourly.data.map((day: any) => ({
                date: day.date,
                weather: day.weather,
                summary: day.summary,
                temperature: day.temperature,
                wind: {
                    speed: day.wind.speed,
                    angle: day.wind.angle,
                    dir: day.wind.dir,
                },
                precipitation: {
                    total: day.precipitation.total,
                    type: day.precipitation.type,
                },
                cloud_cover: {
                    total: day.cloud_cover.total,
                },
            }));
            const weather = { current, hourly };
            return weather;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Failed to fetch weather data');
        }
    }
}

export interface SimpleWeather {
    temperatureFrom: number;
    temperatureTo: number;
    precipitation: string;
    cloudCover: number;
    averageWind: string;
}

export function parseWeatherData(weather: WeatherData): SimpleWeather {
    const temperatures = weather.hourly.map((hour) => hour.temperature);
    const totalWindSpeed = weather.hourly.reduce((sum, hour) => sum + hour.wind.speed, 0);
    const averageWindSpeed = (totalWindSpeed / weather.hourly.length).toFixed(1);

    // Count occurrences of each precipitation type
    const precipitationCount: Record<string, number> = {};
    weather.hourly.forEach((hour) => {
        const type = hour.precipitation.type || "none";
        precipitationCount[type] = (precipitationCount[type] || 0) + 1;
    });

    // Build a detailed precipitation string
    const totalHours = weather.hourly.length;
    const precipitationDetails = Object.entries(precipitationCount)
        .map(([type, count]) => {
            if (type === "none") {
                return `${count}/${totalHours} hours with no precipitation`;
            }
            return `${type}: ${count}/${totalHours} hours (${((count / totalHours) * 100).toFixed(1)}%)`;
        })
        .join(", ");

    return {
        temperatureFrom: Math.min(...temperatures),
        temperatureTo: Math.max(...temperatures),
        precipitation: `In the next ${totalHours} hours, ${precipitationDetails}.`,
        cloudCover: Math.round(
            weather.hourly.reduce((sum, hour) => sum + hour.cloud_cover.total, 0) / weather.hourly.length
        ),
        averageWind: `${averageWindSpeed} m/s ${weather.current.wind.dir}`,
    };
}
