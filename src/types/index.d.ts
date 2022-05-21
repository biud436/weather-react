declare namespace NodeJS {
    interface ProcessEnv {
        readonly REACT_APP_SERVER_URL: string;
        readonly REACT_APP_OPEN_WEATHER_MAP_API_KEY: string;
    }
}
