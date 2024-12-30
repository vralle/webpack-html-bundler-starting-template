import validator from "@vralle/w3c-validator";
import { globSync } from "glob";
import projectPaths from "../configs/projectPaths.mjs";

const files = globSync(`${projectPaths.output}/**/*.html`, { ignore: ["**/google*.html", "**/yandex_*.html"], nodir: true });

validator(files);
