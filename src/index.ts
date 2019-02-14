import org from "org";
import fs from "fs";
import path from "path";
import * as _ from "lodash";
import mkdirp from "mkdirp";
import { OrgDoc, Doc, Html, LinkSection } from "./types";
import { createHtml } from "./html";
import { buildDir } from "./paths";

const parser = new org.Parser();

const interpreterFile = "/Users/jakerunzer/Dropbox/org/brain/haskell.org";

const resourceRegex = /:RESOURCES:(.*\s)*:END:/m;
const moveResourcesToBottom = (contents: string): string => {
  const match = resourceRegex.exec(contents);

  let resources = "";
  let newContents = contents;

  if (match && match.length > 0) {
    resources = match[0];

    newContents = newContents.replace(resources, "");
    resources = resources.replace(":RESOURCES:", "").replace(":END:", "");
    newContents = `
${newContents}

* Resources

${resources}
`.trim();
  }

  return newContents;
};

const addListSection = (title: string, list: string[]): any => {
  const toPageLink = (page: string): string =>
    `[[/${page}][${_.upperFirst(page)}]]`;

  const toListItem = (item: string): string => `- ${item}`;

  return `
* ${_.upperFirst(title)}

${list.map(s => toListItem(toPageLink(s))).join("\n")}
`.trimLeft();
};

const readOrgFile = (file: string): string => {
  const contents = fs.readFileSync(file, "utf8");
  const modifiedContents = moveResourcesToBottom(contents);
  return modifiedContents;
};

const getBrainProperty = (p: string) => (doc: Doc): string[] => {
  const prop = doc.directiveValues[`${p}:`] || [];
  return prop.split(" ");
};

const getParents = getBrainProperty("brain_parents");
const getFriends = getBrainProperty("brain_friends");
const getChildren = getBrainProperty("brain_children");
const getTitle = doc => doc.title;

const createOrgHtml = (doc: Doc): string => {
  doc.options.toc = false;

  const orgHtmlDocument = doc.convert(org.ConverterHTML, {
    headerOffset: 1,
    exportFromLineNumber: false,
    suppressSubScriptHandling: false,
    suppressAutoLink: false,
    toc: false,
  });

  return orgHtmlDocument.toString();
};

const createLinkSection = (title: string, links: string[]): LinkSection => ({
  title,
  links: links.map(l => ({
    text: _.upperFirst(l),
    linkTo: `/${l}`,
  })),
});

const parseOrgFile = (filename: string): OrgDoc => {
  const contents = readOrgFile(filename);
  const baseDoc = parser.parse(contents);
  const orgHtml = createOrgHtml(baseDoc);

  const parents = getParents(baseDoc);
  const friends = getFriends(baseDoc);
  const children = getChildren(baseDoc);

  const html: Html = {
    orgHtml,
    linkSections: [
      createLinkSection("Parents", parents),
      createLinkSection("Friends", friends),
      createLinkSection("Children", children),
    ],
  };

  const basename = path.basename(filename, path.extname(filename));
  const outDir = path.resolve(buildDir, basename);
  const outFile = path.resolve(outDir, "./index.html");
  const title = baseDoc.title || basename;

  return {
    title,
    filename,
    outDir,
    outFile,
    html,
    parents,
    children,
    friends,
  };
};

const saveOrgDoc = (orgDoc: OrgDoc) => {
  mkdirp.sync(orgDoc.outDir);

  const htmlString = createHtml(orgDoc.html);
  fs.writeFileSync(orgDoc.outFile, htmlString);
};

const orgDoc = parseOrgFile(interpreterFile);
saveOrgDoc(orgDoc);

// console.log(orgDoc);
