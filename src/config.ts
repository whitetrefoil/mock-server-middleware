import * as _       from 'lodash';
import { LogLevel } from './logger';

export interface IMockServerConfig {
  /**
   * If a request path starts like one of this,
   * it will be handled by the mock server,
   * otherwise it will call `next()` to pass the request to the next middleware.
   */
  apiPrefixes?: string[];

  /** Where the API definition files locate.  Related to PWD. */
  apiDir?: string;

  /** Log level. 'INFO' & 'LOG' is the same. Default is 'NONE'. */
  logLevel?: LogLevel;

  /** Whether to unify all cases to lower case. */
  lowerCase?: boolean;

  /** Replace `/[^\w\d-]/g` to this when looking for API definition files. */
  nonChar?: string;

  /**
   * Whether to overwrite existing definition file.
   * Only take effect when using "recorder" middleware.
   */
  overwriteMode?: boolean;

  /**
   * Specific some headers to save in "recorder" mode.
   */
  saveHeaders?: string[];

  /** Delay before response, in ms. */
  ping?: number;
}

export type IParsedServerConfig = Required<IMockServerConfig>;

export function setOptions<APP extends IMockServerConfig>(
  _this: APP,
  options?: IMockServerConfig,
) {
  if (options != null) {
    if (options.apiPrefixes != null) {
      _this.apiPrefixes = options.apiPrefixes;
    }
    if (typeof options.apiDir === 'string') {
      _this.apiDir = options.apiDir;
    }
    if (typeof options.nonChar === 'string') {
      _this.nonChar = options.nonChar;
    }
    if (options.logLevel != null && options.logLevel in LogLevel) {
      _this.logLevel = options.logLevel;
    }
    if (options.lowerCase === true) {
      _this.lowerCase = options.lowerCase;
    }
    if (options.overwriteMode === true) {
      _this.overwriteMode = options.overwriteMode;
    }
    if (options.saveHeaders != null && options.saveHeaders.length != null) {
      _this.saveHeaders = options.saveHeaders;
    }
    if (_.isFinite(options.ping)) {
      _this.ping = options.ping as number;
    }
  }
}
