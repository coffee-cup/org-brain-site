import org from "org";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";

type Doc = any;

interface OrgDoc {
  doc: Doc;
  title: string;
  filename: string;
  outDir: string;
  outFile: string;
  html: string;
  parents: string[];
  children: string[];
  friends: string[];
}

const parser = new org.Parser();

const interpreterFile = "/Users/jakerunzer/Dropbox/org/brain/haskell.org";
const buildDir = path.resolve("./build");

const readOrgFile = (file: string) => {
  const contents = fs.readFileSync(file, "utf8");
  const orgDocument = parser.parse(contents);
  return orgDocument;
};

const getBrainProperty = (p: string) => (doc: Doc): string[] => {
  const prop = doc.directiveValues[`${p}:`] || [];
  return prop.split(" ");
};

const getParents = getBrainProperty("brain_parents");
const getChildren = getBrainProperty("brain_friends");
const getFriends = getBrainProperty("brain_friends");
const getTitle = doc => doc.title;

const createHtml = (doc: Doc): string => {
  const orgHtmlDocument = doc.convert(org.ConverterHTML, {
    headerOffset: 1,
    exportFromLineNumber: false,
    suppressSubScriptHandling: false,
    suppressAutoLink: false,
  });

  return orgHtmlDocument.toString();
};

const parseOrgFile = (filename: string): OrgDoc => {
  const doc = readOrgFile(filename);

  const basename = path.basename(filename, path.extname(filename));
  const outDir = path.resolve(buildDir, basename);
  const outFile = path.resolve(outDir, "./index.html");
  const title = doc.title || basename;
  const html = createHtml(doc);

  const parents = getParents(doc);
  const children = getChildren(doc);
  const friends = getFriends(doc);

  return {
    doc,
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

const saveOrgFile = (orgFile: OrgDoc) => {
  mkdirp.sync(orgFile.outDir);
  fs.writeFileSync(orgFile.outFile, orgFile.html);
};

const orgDoc = parseOrgFile(interpreterFile);
console.log(orgDoc);

// const parents = getParents(doc);
// const children = getChildren(doc);
// const friends = getFriends(doc);
// const title = getTitle(doc);

// console.log(`Title: ${title}`);
// console.log(`Parents: ${parents.join(" ")}`);
// console.log(`Children: ${children.join(" ")}`);
// console.log(`Friends: ${friends.join(" ")}`);

// console.log(createHtml(doc));
