import { makeAutoObservable } from "mobx";

export type ChartStoreConfig = {
    strokeStyle: string;
    lineWidth: number; // 차트 그래프의 선 굵기를 지정합니다.
    font: `${number}em ${string}`; // 폰트를 설정합니다.
    padding: 10; // 캔버스의 폭을 10등분한 값입니다.
    textAlign: "center" | "left" | "right";
    lineCap: string;
    temperatureSymbol: "\u00B0";
    smooth: boolean; // 차트의 계산 현상을 없애고 부드럽게 만듭니다.
    fillChart: boolean; // 차트를 채울 지 결정합니다.
    pattern: {
        valid: boolean; // 차트 배경에 이미지를 지정합니다.
        src: string;
    };
    fillStyle: string;
    textColor: string; // 차트의 텍스트 색상을 지정합니다.
    temperatures: number[];
    maxTemperature: number; // 차트의 최고 기온을 설정합니다 (이 값을 이용하여 비율을 만듭니다.)
};

export class ChartStore {
    option: ChartStoreConfig;
    isReady: boolean = false;
    isError: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    ready() {
        this.isReady = true;
    }

    error() {
        this.isReady = false;
        this.isError = true;
    }

    public setOption(option: ChartStoreConfig) {
        this.option = option;
    }

    public getOption(): ChartStoreConfig {
        return this.option;
    }
}
