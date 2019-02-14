import org from "org";
import fs from "fs";
import path from "path";
import * as _ from "lodash";
import mkdirp from "mkdirp";
import { OrgDoc, Doc, Html, LinkSection } from "./types";
import { createHtml } from "./html";
import { buildDir, getOrgFile, indexFile, blacklisted } from "./paths";

const parser = new org.Parser();
const visited: { [key: string]: OrgDoc } = {};

const resourceRegex = /:RESOURCES:(.*\s)*:END:/m;
const moveResourcesToBottom = (contents: string): string => {
  const match = resourceRegex.exec(contents);

  let resources = "";
  let newContents = contents;

  if (match && match.length > 0) {
    resources = match[0];

    newContents = newContents.replace(resources, "");
    resources = resources
      .replace(":RESOURCES:", "")
      .replace(":END:", "")
      .trim();

    if (resources === "") {
      return newContents;
    }

    newContents = `
${newContents}

* Resources

${resources}
`.trim();
  }

  return newContents;
};

const readOrgFile = (filename: string): string => {
  const contents = fs.readFileSync(filename, "utf8");
  const modifiedContents = moveResourcesToBottom(contents);
  return modifiedContents;
};

const getBrainProperty = (p: string) => (doc: Doc): string[] => {
  const prop = doc.directiveValues[`${p}:`] || "";
  return prop !== ""
    ? prop.split(" ").filter(s => s !== "index" && !blacklisted.includes(s))
    : [];
};

const getParents = getBrainProperty("brain_parents");
const getFriends = getBrainProperty("brain_friends");
const getChildren = getBrainProperty("brain_children");

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

  const linkSections = [];
  if (parents.length !== 0) {
    linkSections.push(createLinkSection("Parents", parents));
  }
  if (friends.length !== 0) {
    linkSections.push(createLinkSection("Friends", friends));
  }
  if (children.length !== 0) {
    linkSections.push(createLinkSection("Children", children));
  }

  const html: Html = {
    orgHtml,
    linkSections,
  };

  const basename = path.basename(filename, path.extname(filename));
  const outDir =
    basename === "index" ? buildDir : path.resolve(buildDir, basename);
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

const visit = (name: string) => {
  if (visited[name]) {
    return;
  }

  const filename = getOrgFile(name);
  const orgDoc = parseOrgFile(filename);

  visited[name] = orgDoc;

  orgDoc.parents.forEach(visit);
  orgDoc.friends.forEach(visit);
  orgDoc.children.forEach(visit);
};

const saveAllDocs = () => {
  Object.values(visited).forEach(orgDoc => {
    saveOrgDoc(orgDoc);
  });
};

visit(indexFile);
saveAllDocs();
