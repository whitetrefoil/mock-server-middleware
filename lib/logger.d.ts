export interface ILogLevelMap {
    DEBUG: number;
    INFO: number;
    LOG: number;
    WARN: number;
    ERROR: number;
    NONE: number;
}
export declare type ILogLevel = keyof ILogLevelMap;
declare class Logger {
    readonly logLevel: ILogLevel;
    constructor(level: ILogLevel);
    debug(message: string): void;
    info(message: string): void;
    log(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
export default Logger;
