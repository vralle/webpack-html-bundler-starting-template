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

function defaultLogger(vnuReport: VnuReport, files: string[]) {
  const messages = [];
  const errors = vnuReport.messages.filter((message) => message.type === "error");
  const warnings = vnuReport.messages.filter((message) => message.type === "info" && message.subType === "warning");
  const infos = vnuReport.messages.filter((message) => message.type === "info" && message.subType !== "warning");
  for (const message of vnuReport.messages) {
    const type = message.type === "info" && message.subType === "warning" ? message.subType : message.type;
    const output = [];
    const label = type.toUpperCase();
    const typeColor = message.type === "error" ? "red" : "yellow";
    const url = message.url?.replace("file:", "");
    output.push(`${url}:${message.lastLine}:${message.firstColumn}`);
    output.push(styleText(typeColor, `[${label}] ${message.message}`));
    output.push(message.extract);
    messages.push(output.join("\n"));
  }

  if (messages.length > 0) {
    console.error("\n" + messages.join("\n\n") + "\n");
  }

  console.info(styleText("blue", `Checked ${files.length} file(s)`));
  if (errors.length) {
    console.info(styleText("red", `Found ${errors.length} error(s).`));
  }

  if (warnings.length) {
    console.info(styleText("yellow", `Found ${warnings.length} warning(s).`));
  }

  if (infos.length) {
    console.info(styleText("yellow", `Found ${warnings.length} tip(s).`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("\n", styleText("green", "Nu checker found no errors or warnings."), "\n");
  }
}

function validate(files: string[], options: Options = {}) {
  if (files.length === 0) {
    console.error(styleText("red", "No files to check. Nu validation stopped."));
    exit(1);
  }

  const logger = options.logger ? options.logger : defaultLogger;
  const ignores = options.ignores ? options.ignores : IGNORES;

  execFile("java", ["-version"], { maxBuffer: MAX_BUFFER, shell: true }, (error, _stdout, stderr) => {
    if (error) {
      console.error(styleText("red", "Java is missing. Nu validation stopped."));
      console.error(error);
      return;
    }

    if (stderr === null) {
      console.error(styleText("red", "Something went wrong. Java output is null. Nu validation stopped."));
      exit(1);
    }

    const versionMatched = stderr.match(/(?:java|openjdk) version "(.*)"/);
    if (versionMatched === null || !versionMatched[1]) {
      console.error(styleText("red", "Something went wrong. Java version not found. Nu validation stopped."));
      exit(1);
    }

    const version = versionMatched[1];
    const [majorVersion, minorVersion] = version.split(".").map(Number);
    if (majorVersion === undefined || minorVersion === undefined) {
      console.error(styleText("red", "Something went wrong. Can't determine installed Java version. Nu validation stopped."));
      exit(1);
    }

    if ((majorVersion !== 1 && majorVersion < 8) || (majorVersion === 1 && minorVersion < 8)) {
      console.error(styleText("red", `\nUnsupported Java version used: ${version}. Java 8 environment or up is required. Nu validation stopped.`));
      exit(1);
    }

    if (!files.length) {
      console.info(styleText("red", "No files found to check. Nu validation stopped."));
      exit(1);
    }

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

    console.info(styleText("blue", "Nu validation start running..."));
    console.info(styleText("blue", "Files to check:\n"), files.join(", "));

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
      logger(JSON.parse(vnuOutput.join("")), files);
      exit(code);
    });
  });
}

export { defaultLogger };
export type { Logger, Options, VnuMessage, VnuReport };
export default validate;
