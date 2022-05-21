import { observer } from "mobx-react-lite";
import { appStore } from "../../store/AppStore";

const loadingBar = {
    show: {
        display: "block",
    },
    hide: {
        display: "none",
    },
};

export const Loading = observer(() => {
    return (
        <div
            className="loading spinner"
            style={appStore.isLoadingBar ? loadingBar.show : loadingBar.hide}
        ></div>
    );
});
