import { CityField } from "./cityField";
import { ContainerWrapper } from "./container";
import { TemperatureField } from "./temperatureField";
import { WeatherRenderer } from "./weatherRenderer";
import { observer } from "mobx-react-lite";
import { appStore } from "../../../store/AppStore";

export const Container = observer(() => {
    return (
        <ContainerWrapper>
            <CityField />
            <WeatherRenderer store={appStore} />
            <TemperatureField />
        </ContainerWrapper>
    );
});
