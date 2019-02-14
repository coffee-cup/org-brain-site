export interface Link {
  text: string;
  linkTo: string;
}

export interface LinkSection {
  title: string;
  links: Link[];
}

export interface Html {
  orgHtml: string;
  linkSections: LinkSection[];
}

export type Doc = any;

export interface OrgDoc {
  title: string;
  filename: string;
  outDir: string;
  outFile: string;
  html: Html;
  parents: string[];
  children: string[];
  friends: string[];
}
