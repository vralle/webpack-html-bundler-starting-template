#!/usr/bin/env node
/*!
 * Script to check HTML files with vnu-jar if Java is available.
 * Licensed under MIT
 */
/** @see https://github.com/validator/validator/wiki/Output-%C2%BB-JSON */
interface VnuMessage {
    type: "error" | "info" | "non-document-error";
    subType?: string;
    message?: string;
    extract?: string;
    offset?: number;
    url?: string;
    firstLine?: number;
    firstColumn?: number;
    lastLine?: number;
    lastColumn?: number;
    hiliteStart?: number;
    hiliteLength?: number;
}
interface VnuReport {
    messages: VnuMessage[];
    url?: string;
    source?: {
        code: string;
        type?: string;
        encoding?: string;
    };
    language?: string;
}
type Logger = (vnuReport: VnuReport, files: string[]) => void;
interface Options {
    logger?: Logger;
    ignores?: string[];
}
declare function defaultLogger(vnuReport: VnuReport, files: string[]): void;
declare function validate(files: string[], options?: Options): void;
export { defaultLogger };
export type { Logger, Options, VnuMessage, VnuReport };
export default validate;
