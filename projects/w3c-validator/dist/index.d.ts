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
declare function stdoutLogger(vnuReport: VnuReport): void;
declare function validator(files: string[], logger?: undefined | Logger): void;
export { stdoutLogger };
export type { Logger, VnuMessage, VnuReport };
export default validator;
