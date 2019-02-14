import fs from "fs";
import * as path from "path";
import { Html } from "./types";
import Mustache from "mustache";
import { srcDir } from "./paths";

const templateFile = path.resolve(srcDir, "./index.html");
const templateString = fs.readFileSync(templateFile).toString();

export const createHtml = (html: Html): string => {
  const rendered = Mustache.render(templateString, html);
  return rendered;
};
