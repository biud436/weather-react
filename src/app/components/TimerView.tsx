import { observer } from "mobx-react-lite";
import { Timer } from "../../store";

export const TimerView = observer(({ timer }: { timer: Timer }) => {
    return (
        <>
            <div>{timer.secondsPassed}</div>
            <div>
                <button onClick={() => timer.increaseTimer()}>증가</button>
            </div>
            <div>{process.env.REACT_APP_SERVER_URL}</div>
        </>
    );
});
