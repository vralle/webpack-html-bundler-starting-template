import validate from "@vralle/nu-html-checker";
import { globSync } from "glob";
import projectPaths from "../configs/projectPaths.mjs";

const files = globSync(`${projectPaths.output}/**/*.html`, { ignore: ["**/google*.html", "**/yandex_*.html"], nodir: true });

validate(files);
