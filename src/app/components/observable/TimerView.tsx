import { observer } from "mobx-react-lite";
import { timerStore } from "../../../store/__test__/Timer";

export const TimerView = observer(({ timer }: { timer: typeof timerStore }) => {
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
