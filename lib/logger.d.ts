export interface ILogLevelMap {
    DEBUG: number;
    INFO: number;
    LOG: number;
    WARN: number;
    ERROR: number;
    NONE: number;
}
export declare type ILogLevel = keyof ILogLevelMap;
export declare const setLogLevel: (level?: "DEBUG" | "INFO" | "LOG" | "WARN" | "ERROR" | "NONE") => void;
declare var _default: {
    debug(message: string): void;
    info(message: string): void;
    log(message: string): void;
    warn(message: string): void;
    error(message: string): void;
};
export default _default;
