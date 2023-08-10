import { observer } from "mobx-react-lite";
import React, { useLayoutEffect } from "react";
import { AppStore } from "../../../store/AppStore";
import { WindCardData } from "../../../store/WindCardData";
import { WaterDrop } from "./components/WaterDrop";

export function useCards(
  store: AppStore
): [WindCardData[], () => JSX.Element[]] {
  const { weatherStore } = store;

  const cardData = weatherStore.cardData;
  const getCards: () => JSX.Element[] = () => {
    return cardData.slice(0, 5).map((card: WindCardData, index: number) => {
      return (
        <article key={index}>
          <p>{weatherStore.days[index]}</p>
          <img src={weatherStore.weatherImage[index]} alt="weatherImage"></img>
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
              fillRate={Number(card.humidity.replace("%", "").trim())}
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
          <p className="temperature-text">{card.currentTemp}</p>
        </article>
      );
    });
  };

  return [cardData, getCards];
}

export const WeatherRenderer = observer(({ store }: { store: AppStore }) => {
  useLayoutEffect(() => {
    store.fetchWeatherData();
  }, [store]);

  const [, getCards] = useCards(store);

  return <section className="weather-renderer">{getCards()}</section>;
});
