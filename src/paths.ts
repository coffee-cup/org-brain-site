import * as path from "path";

export const srcDir = path.resolve("./src");
export const buildDir = path.resolve("./site");

export const getOrgFile = (name: string): string =>
  `/Users/jakerunzer/Dropbox/org/brain/${name}.org`;

export const indexFile = "index";

export const blacklisted = ["london", "interview"];
