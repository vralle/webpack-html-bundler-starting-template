#!/usr/bin/env node
/*!
 * Script to check HTML files with vnu-jar if Java is available.
 * Licensed under MIT
 */
interface VnuMessage {
    type: string;
    url: string;
    lastLine: number;
    lastColumn: number;
    firstColumn: number;
    message: string;
    extract: string;
    hiliteStart: number;
    hiliteLength: number;
}
interface VnuReport {
    messages: VnuMessage[];
}
type Logger = (vnuReport: VnuReport) => void;
interface Options {
    logger?: Logger;
    ignores?: string[];
}
declare function stdoutLogger(vnuReport: VnuReport): void;
declare function validator(files: string[], options?: Options): void;
export { stdoutLogger };
export type { Logger, Options, VnuMessage, VnuReport };
export default validator;
