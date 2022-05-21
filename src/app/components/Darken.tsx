import { observer } from "mobx-react-lite";
import { appStore } from "../../store/AppStore";

const DarkenStyle = {
    show: {
        display: "block",
    },
    hide: {
        display: "none",
    },
};

export const Darken = observer(() => {
    return (
        <div
            className="darken"
            style={appStore.isLoadingBar ? DarkenStyle.show : DarkenStyle.hide}
        ></div>
    );
});
