import { flowResult, makeAutoObservable } from "mobx";
import { ChartStore } from "./ChartStore";
import { WeatherStore } from "./WeatherStore";

export class AppStore {
    isLoadingBar: boolean = true;
    readonly chartStore: ChartStore = new ChartStore();
    readonly weatherStore: WeatherStore = new WeatherStore(this.chartStore);

    constructor() {
        makeAutoObservable(this);
    }

    showLoadingBar() {
        this.isLoadingBar = true;
    }

    hideLoadingBar() {
        this.isLoadingBar = false;
    }

    /**
     * 차트 데이터를 초기화합니다.
     *
     * @param temperatures
     */
    initWithChartData(temperatures: number[]) {
        this.chartStore.setOption({
            strokeStyle: "#489AED",
            lineWidth: 8,
            font: "0.8em Arial",
            padding: 10,
            textAlign: "center",
            lineCap: "round",
            temperatureSymbol: "\u00B0",
            smooth: true,
            fillChart: true,
            pattern: {
                valid: true,
                src: `${process.env.PUBLIC_URL}images/background2.webp`,
            },
            fillStyle: "rgb(255, 0, 0, 0.5)",
            textColor: "white",
            temperatures: temperatures.slice(0, 5),
            maxTemperature: 50,
        });
        this.chartStore.isReady = true;
    }

    getTemperatures(): number[] {
        return this.weatherStore.temperatures;
    }

    async fetchWeatherData() {
        // 날씨 데이터를 가져옵니다.
        await flowResult(this.weatherStore.fetch());
        this.initWithChartData(this.getTemperatures());
        this.hideLoadingBar();
    }
}

export const appStore = new AppStore();
