const org = require("org");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const parser = new org.Parser();

const interpreterFile = "/Users/jakerunzer/Dropbox/org/brain/haskell.org";
const buildDir = path.resolve("./build");

const readOrgFile = file => {
  const contents = fs.readFileSync(file, "utf8");
  const orgDocument = parser.parse(contents);
  return orgDocument;
};

const getBrainProperty = p => doc => {
  const prop = doc.directiveValues[`${p}:`] || [];
  return prop.split(" ");
};

const getParents = getBrainProperty("brain_parents");
const getChildren = getBrainProperty("brain_friends");
const getFriends = getBrainProperty("brain_friends");
const getTitle = doc => doc.title;

const createHtml = doc => {
  const orgHtmlDocument = doc.convert(org.ConverterHTML, {
    headerOffset: 1,
    exportFromLineNumber: false,
    suppressSubScriptHandling: false,
    suppressAutoLink: false,
  });

  return orgHtmlDocument;
};

const saveOrgFile = filename => {
  const doc = readOrgFile(filename);

  const basename = path.basename(filename, path.extname(filename));
  const outDir = path.resolve(buildDir, basename);
  const outFile = path.resolve(outDir, "./index.html");

  mkdirp.sync(outDir);

  const html = createHtml(doc).toString();
  fs.writeFileSync(outFile, html);
};

saveOrgFile(interpreterFile);

// const parents = getParents(doc);
// const children = getChildren(doc);
// const friends = getFriends(doc);
// const title = getTitle(doc);

// console.log(`Title: ${title}`);
// console.log(`Parents: ${parents.join(" ")}`);
// console.log(`Children: ${children.join(" ")}`);
// console.log(`Friends: ${friends.join(" ")}`);

// console.log(createHtml(doc));
