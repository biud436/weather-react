import { CityField } from "./cityField";
import { ContainerWrapper } from "./container";
import { TemperatureField } from "./temperatureField";
import { WeatherRenderer } from "./weatherRenderer";

export function Container() {
    return (
        <ContainerWrapper>
            <CityField />
            <WeatherRenderer />
            <TemperatureField />
        </ContainerWrapper>
    );
}
