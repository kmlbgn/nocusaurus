import * as fs from "fs-extra";
import sanitize from "sanitize-filename";
import { LayoutStrategy } from "./LayoutStrategy";
import { NotionPage } from "./NotionPage";

// This strategy gives us a file tree that mirrors that of notion.
// Each level in the outline becomes a directory, and each file bears the name of the Notion page.
// As long as you use slugs, the urls is still just something like https://site/slug
export class HierarchicalNamedLayoutStrategy extends LayoutStrategy {
  public newLevel(
    dirRoot: string,
    order: number,
    context: string,
    levelLabel: string
  ): string {
    const path = context + "/" + sanitize(levelLabel).replaceAll(" ", "-");

    const newPath = dirRoot + "/" + path;
    fs.mkdirSync(newPath.toLowerCase(), { recursive: true });
    this.addCategoryMetadata(newPath, order, levelLabel);
    return path;
  }

  public getPathForPage(page: NotionPage, extensionWithDot: string): string {
    const sanitizedName = sanitize(page.nameForFile())
      .replaceAll("//", "/")
      .replaceAll("%20", "-")
      .replaceAll(" ", "-")
      // crowdin complains about some characters in file names. I haven't found
      // the actual list, so these are from memory.
      .replaceAll('"', "")
      .replaceAll("“", "")
      .replaceAll("”", "")
      .replaceAll("'", "")
      .replaceAll("?", "-");

    let path;
    // For all other pages, use the existing structure for Docusaurus to parse
    const context = ("/" + page.layoutContext + "/").replaceAll("//", "/");
    path = this.rootDirectory + context + sanitizedName + extensionWithDot;
    return path;
  }

  //{
  //   "position": 2.5,
  //   "label": "Tutorial",
  //   "collapsible": true,
  //   "collapsed": false,
  //   "className": "red",
  //   "link": {
  //     "type": "generated-index",
  //     "title": "Tutorial overview"
  //   },
  //   "customProps": {
  //     "description": "This description can be used in the swizzled DocCard"
  //   }
  // }
  private addCategoryMetadata(dir: string, order: number, label: string) {
    const data = `{"position":${order}, "label":"${label}"}`;
    fs.writeFileSync(dir + "/_category_.json", data);
  }
}
