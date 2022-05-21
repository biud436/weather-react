import { observer } from "mobx-react-lite";
import { appStore } from "../../../store/AppStore";
import GithubMark from "../../../images/GitHub-Mark-Light-32px.png";

export const CityField = observer(() => {
    return (
        <header className="city-field">
            <div>
                {appStore.isLoadingBar
                    ? "로딩중"
                    : appStore.weatherStore.timezone}
                <a href="https://github.com/biud436/">
                    <img src={GithubMark}></img>
                </a>
            </div>
        </header>
    );
});
