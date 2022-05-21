import { observer } from "mobx-react-lite";

export const TemperatureField = observer(() => {
    return (
        <footer className="temperature-field">
            <canvas id="main-canvas">
                HTML5 캔버스를 지원하지 않는 브라우저입니다.
            </canvas>
        </footer>
    );
});
