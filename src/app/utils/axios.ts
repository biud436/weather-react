import axios, { AxiosInstance } from "axios";

type AxiosOptional<T> = T | null | undefined;
type PrivateMemberVariables = {
    instance: AxiosOptional<AxiosInstance>;
    baseURL: string | undefined;
};

export namespace AxiosManager {
    const _private: PrivateMemberVariables = {
        instance: null,
        baseURL: process.env.REACT_APP_SERVER_URL,
    };

    export function getInstance(): AxiosInstance {
        const { baseURL } = _private;

        if (!_private.instance) {
            _private.instance = axios.create({
                baseURL,
            });
        }
        return _private.instance;
    }
}
