import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { AppStore, appStore } from "../../../store/AppStore";
import { WindCardData } from "../../../store/WeatherStore";
import { WaterDrop } from "./components/WaterDrop";

export const WeatherRenderer = observer(({ store }: { store: AppStore }) => {
    const { weatherStore } = store;

    useEffect(() => {
        store.fetchWeatherData();
    }, []);

    const renderWindCard = () => {
        return weatherStore.cardData
            .slice(0, 5)
            .map((card: WindCardData, index: number) => {
                return (
                    <>
                        <article key={index}>
                            <p>{weatherStore.days[index]}</p>
                            <img src={weatherStore.weatherImage[index]}></img>
                            <p className="article__weather-wind-deg">
                                <span>풍향 </span>
                                {card.windDeg}
                                <i
                                    className="fas fa-arrow-up"
                                    style={{
                                        transform: `rotate(${card.windDegSymbol}deg)`,
                                    }}
                                ></i>
                                <WaterDrop
                                    fillRate={Number(
                                        card.humidity.replace("%", "").trim()
                                    )}
                                />
                            </p>
                            <p className="article__weather-wind-speed">
                                <span>풍속 </span>
                                {card.windSpeed}
                            </p>
                            <p className="article__weather-humidity">
                                <span>습도 </span>
                                {card.humidity}
                            </p>
                            <p className="article__weather-temp-min">
                                <span>최저 기온 </span>
                                {card.minTemp}
                            </p>
                            <p className="article__weather-temp-max">
                                <span>최고 기온 </span>
                                {card.maxTemp}
                            </p>
                            <p className="article__weather-sunrize">
                                <span>일출 시간 </span>
                                {card.sunrise}
                            </p>
                            <p className="temperature-text">
                                {card.currentTemp}
                            </p>
                        </article>
                    </>
                );
            });
    };

    return <section className="weather-renderer">{renderWindCard()}</section>;
});
