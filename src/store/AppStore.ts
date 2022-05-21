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

    async fetchWeatherData() {
        await flowResult(this.weatherStore.fetch());
        this.hideLoadingBar();
    }
}

export const appStore = new AppStore();
