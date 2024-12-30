#!/usr/bin/env node

/*!
 * Script to check HTML files with vnu-jar if Java is available.
 * Licensed under MIT
 */

import { Buffer } from "node:buffer";
import { execFile, spawn } from "node:child_process";
import { exit } from "node:process";
import { styleText } from "node:util";
import vnu from "vnu-jar";

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

/**
 * Increase child process buffer to accommodate large amounts of validation output.
 * The default is a paltry 200k:
 * https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
 */
const MAX_BUFFER = 20_000 * 1024;

// Note that the ignores are string regular expressions.
const IGNORES = [
  // "autocomplete" is included in <button> and checkboxes and radio <input>s due to
  // Firefox's non-standard autocomplete behavior - see https://bugzilla.mozilla.org/show_bug.cgi?id=654072
  "Attribute “autocomplete” is only allowed when the input type is.*",
  "Attribute “autocomplete” not allowed on element “button” at this point.",
  // Per https://www.w3.org/TR/html-aria/#docconformance having "aria-disabled" on a link is
  // NOT RECOMMENDED, but it's still valid - we explain in the docs that it's not ideal,
  // and offer more robust alternatives, but also need to show a less-than-ideal example
  "An “aria-disabled” attribute whose value is “true” should not be specified on an “a” element that has an “href” attribute.",
];

function stdoutLogger(vnuReport: VnuReport) {
  const messages = [];
  if (vnuReport.messages.length === 0) {
    console.log("\n", styleText("green", "The W3C validator found no errors. Good job!"), "\n");
    return;
  }

  const errorMessages = vnuReport.messages.filter((message) => message.type === "error");
  const warningMessages = vnuReport.messages.filter((message) => message.type === "warning");

  console.error(styleText("red", `\nW3C test found ${errorMessages.length} error(s) and ${warningMessages.length} warning(s).`));
  for (const error of vnuReport.messages) {
    const message = [];
    const type = String(error.type).charAt(0).toUpperCase() + String(error.type).slice(1);
    const typeColor = error.type === "error" ? "red" : "yellow";

    message.push(styleText(typeColor, `${type} in `) + `${error.url} at line ${error.lastLine}:${error.hiliteStart}-${error.lastLine}:${error.hiliteLength}`);
    message.push(error.message);
    message.push(error.extract);
    messages.push(message.join("\n"));
  }

  console.error("\n\n" + messages.join("\n\n") + "\n\n");
}

function validator(files: string[], options: Options = {}) {
  if (files.length === 0) {
    console.error(styleText("red", "No files to check. W3C test stop running."));
    exit(1);
  }

  const logger = options.logger ? options.logger : stdoutLogger;
  const ignores = options.ignores ? options.ignores : IGNORES;

  execFile("java", ["-version"], { maxBuffer: MAX_BUFFER, shell: true }, (error, _stdout, stderr) => {
    if (error) {
      console.error(styleText("red", "Java is missing. W3C test stop running."));
      console.error(error);
      return;
    }

    if (stderr === null) {
      console.error(styleText("red", "Something went wrong. Java output is null. W3C test stop running."));
      exit(1);
    }

    const versionMatched = stderr.match(/(?:java|openjdk) version "(.*)"/);
    if (versionMatched === null || !versionMatched[1]) {
      console.error(styleText("red", "Something went wrong. Java version not found. W3C test stop running."));
      exit(1);
    }

    const version = versionMatched[1];
    const [majorVersion, minorVersion] = version.split(".").map(Number);
    if (majorVersion === undefined || minorVersion === undefined) {
      console.error(styleText("red", "Something went wrong. Can't determine installed Java version. W3C test stop running."));
      exit(1);
    }

    if ((majorVersion !== 1 && majorVersion < 8) || (majorVersion === 1 && minorVersion < 8)) {
      console.error(styleText("red", `\nUnsupported Java version used: ${version}. Java 8 environment or up is required. W3C test stop running.`));
      exit(1);
    }

    if (!files.length) {
      console.info(styleText("red", "No files found to check. W3C test stop running."));
      exit(1);
    }

    console.info(styleText("green", "W3C test start running..."));
    console.info(styleText("green", "Files to check:\n"), files.join(", "));

    const is32bitJava = !/64-Bit/.test(stderr);

    const args = [
      "-jar",
      `"${vnu}"`,
      "--format",
      "json",
      "--asciiquotes",
      "--skip-non-html",
      "--Werror",
    ];

    // For the 32-bit Java we need to pass `-Xss512k`
    if (is32bitJava) {
      args.splice(0, 0, "-Xss512k");
    }

    if (ignores.length > 0) {
      const ignoresArgs = ignores.join("|");
      args.push(`--filterpattern "${ignoresArgs}"`);
    }

    const child = spawn(
      "java",
      [...args, ...files],
      {
        shell: true,
        stdio: "pipe",
      },
    );

    const vnuOutput: string[] = [];

    child.stderr?.on("data", (data) => {
      if (Buffer.isBuffer(data)) {
        vnuOutput.push(data.toString());
      }
    });

    child.on("exit", (code) => {
      logger(JSON.parse(vnuOutput.join("")));
      exit(code);
    });
  });
}

export { stdoutLogger };
export type { Logger, Options, VnuMessage, VnuReport };
export default validator;
