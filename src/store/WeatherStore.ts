import { makeAutoObservable, runInAction } from "mobx";
import { ChartStore } from "./ChartStore";

type WeatherWindDirection = {
    [key: number]: string;
};

type WeatherResponse = {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number;
    current: {
        dt: number;
        sunrise: number;
        sunset: number;
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
        dew_point: number;
        uvi: number;
        clouds: number;
        visibility: number;
        wind_speed: number;
        wind_deg: number;
        weather: {
            id: number;
            main: string;
            description: string;
            icon: string;
        };
        rain: {
            "1h": number;
        };
        snow: {
            "1h": number;
        };
    };
    daily: {
        dt: number;
        sunrise: number;
        sunset: number;
        temp: {
            day: number;
            min: number;
            max: number;
            night: number;
            eve: number;
            morn: number;
        };
        feels_like: {
            day: number;
            night: number;
            eve: number;
            morn: number;
        };
        pressure: number;
        humidity: number;
        dew_point: number;
        clouds: number;
        wind_speed: number;
        wind_deg: number;
        weather: {
            id: number;
            main: string;
            description: string;
            icon: string;
        };
        rain: {
            "3h": number;
        };
        snow: {
            "3h": number;
        };
    }[];
};

export class WindCardData {
    /**
     * 풍향
     */
    public windDeg: string;
    /**
     * 풍향 값
     */
    public windDegSymbol: number;
    /**
     * 풍속
     */
    public windSpeed: string;
    /**
     * 습도
     */
    public humidity: string;
    /**
     * 최저 기온
     */
    public minTemp: string;
    /**
     * 최고 기온
     */
    public maxTemp: string;
    /**
     * 일출 시간
     */
    public sunrise: string;
    /**
     * 현재 온도
     */
    public currentTemp: string;

    constructor() {
        makeAutoObservable(this);
    }

    static of<T = WindCardData>(data: {
        [Property in keyof T]: T[Property];
    }): WindCardData {
        const windCardData = new WindCardData();
        Object.assign(windCardData, data);
        return windCardData;
    }
}

export class WeatherStore {
    readonly chartStore: ChartStore;
    state = "pending";
    temperatures: number[] = [];
    timezone: string;
    days: string[] = [];
    cardData: WindCardData[] = [];
    weatherImage: string[] = [];
    config: WeatherResponse;

    constructor(chartStore: ChartStore) {
        makeAutoObservable(this);
        this.chartStore = chartStore;
    }

    ready(config: WeatherResponse) {
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
    initWithDate(config: WeatherResponse) {
        const { daily } = config;

        const days: Array<number> = [];
        const maxDays = 5;
        for (let i = 0; i < maxDays; i++) {
            days.push(daily[i].dt);
        }

        this.timezone = config.timezone;
        this.days = days.map((day) => this.getTimeString(day));
    }

    initWithWindSpeed(config: WeatherResponse, index: number) {
        const { daily } = config;
        const data = daily[index];

        this.cardData.push(
            WindCardData.of({
                windDeg: `${this.getWindDirection(data.wind_deg)}`,
                windDegSymbol: data.wind_deg,
                windSpeed: `${Math.round(data.wind_speed / 1.944)}m/s`,
                humidity: `${data.humidity}%`,
                minTemp: `${this.getDegreeCelsius(data.temp.min)}°C`,
                maxTemp: `${this.getDegreeCelsius(data.temp.max)}°C`,
                sunrise: `${new Date(
                    data.sunrise * 1000
                ).toLocaleTimeString()}`,
                currentTemp: `${this.getDegreeCelsius(data.temp.day)}°C`,
            })
        );
    }

    initWithWeather(config: WeatherResponse) {
        for (let i = 0; i < 5; i++) {
            const { daily } = config;
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
            const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API}&lang=${lang}`;

            const response: Response = yield fetch(url);
            const data: WeatherResponse = yield response.json();

            const { daily } = data;

            for (let i = 0; i < 5; i++) {
                this.temperatures.push(
                    this.getDegreeCelsius(daily[i].temp.day)
                );
            }

            this.state = "success";

            yield this.ready(data);
        } catch {
            this.state = "error";
        }
    }
}
