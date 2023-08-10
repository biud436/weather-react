import { makeAutoObservable } from "mobx";

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
