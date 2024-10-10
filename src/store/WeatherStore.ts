import { makeAutoObservable } from "mobx";
import { ChartStore } from "./ChartStore";
import { WindCardData } from "./WindCardData";
import { OpenWeatherResponse } from "./WeatherResponse";

type WeatherWindDirection = {
    [key: number]: string;
};

export class WeatherStore {
    readonly chartStore: ChartStore;
    state = "pending";
    temperatures: number[] = [];
    timezone: string;
    days: string[] = [];
    cardData: WindCardData[] = [];
    weatherImage: string[] = [];
    config: OpenWeatherResponse;

    constructor(chartStore: ChartStore) {
        makeAutoObservable(this);
        this.chartStore = chartStore;
    }

    ready(config: OpenWeatherResponse) {
        this.config = config;

        this.initWithDate(config);
        this.initWithWeather(config);
    }

    /**
     * @param {Number} unixTime
     */
    getTimeString(unixTime: number) {
        const options: Pick<
            Intl.DateTimeFormatOptions,
            "weekday" | "month" | "day"
        > = { weekday: "long", month: "long", day: "numeric" };
        const date = new Date(unixTime * 1000);

        return new Intl.DateTimeFormat("ko-KR", options).format(date);
    }

    /**
     * 절대 온도(K)에서 섭씨로 변환합니다.
     */
    getDegreeCelsius(k: number) {
        const c = Math.round(k - 273.15);

        return c;
    }

    getFahrenheit(k: number) {
        const c = this.getDegreeCelsius(k);
        return (c - 32) * 0.5555555555555556;
    }

    /**
     * 풍향 값에 따른 16방위 변환식
     * @param {Number} deg
     */
    getWindDirection(deg: number) {
        const cardinalDir = Math.floor((deg + 22.5 * 0.5) / 22.5);

        const data: WeatherWindDirection = {
            0: "북",
            1: "북북동",
            2: "북동",
            3: "동북동",
            4: "동",
            5: "동남동",
            6: "남동",
            7: "남남동",
            8: "남",
            9: "남남서",
            10: "남서",
            11: "서남서",
            12: "서",
            13: "서북서",
            14: "북서",
            15: "북북서",
            16: "북",
        };

        const windDir = data[cardinalDir];

        return windDir;
    }

    /**
     * 향후 5일간의 날짜를 표기합니다.
     */
    initWithDate(config: OpenWeatherResponse) {
        const { list: daily } = config;

        const days: Array<number> = [];
        const maxDays = 5;
        for (let i = 0; i < maxDays; i++) {
            days.push(daily[i].dt);
        }

        this.timezone = "서울";
        this.days = days.map((day) => this.getTimeString(day));
    }

    initWithWindSpeed(config: OpenWeatherResponse, index: number) {
        const { list: daily } = config;
        const data = daily[index];

        this.cardData.push(
            WindCardData.of({
                windDeg: `${this.getWindDirection(data.wind.deg)}`,
                windDegSymbol: data.wind.deg,
                windSpeed: `${Math.round(data.wind.speed / 1.944)}m/s`,
                humidity: `${data.main.humidity}%`,
                minTemp: `${this.getDegreeCelsius(data.main.temp_min)}°C`,
                maxTemp: `${this.getDegreeCelsius(data.main.temp_max)}°C`,
                sunrise: `${new Intl.DateTimeFormat("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }).format(new Date(data.dt * 1000))}`,
                currentTemp: `${this.getDegreeCelsius(data.main.temp)}°C`,
            })
        );
    }

    initWithWeather(config: OpenWeatherResponse) {
        for (let i = 0; i < 5; i++) {
            const { list: daily } = config;
            const data = daily[i];
            const weather = data.weather;

            const windowWidth = window.innerWidth;
            let size = windowWidth > 768 ? "@4x" : "@2x";

            if (windowWidth < 480) {
                size = "";
            }

            const imgSrc = `https://openweathermap.org/img/wn/${weather[0].icon}${size}.png`;

            this.weatherImage.push(imgSrc);

            this.initWithWindSpeed(config, i);
        }
    }

    *fetch() {
        this.state = "pending";
        try {
            const location = {
                // 대한민국 서울
                seoul: {
                    lat: 37.5326,
                    lon: 126.024612,
                },
                // 남극 (영하 20도)
                zucchelli: {
                    lat: -74.69453035090875,
                    lon: 164.10430690326442,
                },
                ilulissat: {
                    lat: 69.22481727432647,
                    lon: -51.09234800679942,
                },
            };
            const target: keyof typeof location = "seoul";
            const lat = location[target].lat;
            const lon = location[target].lon;
            const API = window.atob(
                process.env.REACT_APP_OPEN_WEATHER_MAP_API_KEY
            );
            const lang = navigator.language.slice(3).toLowerCase();
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}&lang=${lang}`;

            const response: Response = yield fetch(url);
            const data: OpenWeatherResponse = yield response.json();

            const { list: daily } = data;

            for (let i = 0; i < 5; i++) {
                this.temperatures.push(
                    this.getDegreeCelsius(daily[i].main.temp)
                );
            }

            this.state = "success";

            yield this.ready(data);
        } catch {
            this.state = "error";
        }
    }
}
