import { NotionToMarkdown } from "notion-to-md";
import { MdBlock } from "notion-to-md/build/types";
import * as md from "notion-to-md/build/utils/md";

// inherit a class
//
// A change implemented in version v2.5.1 of the library adds multiple line breaks to paragraphs.
// Since this change would greatly destroy the past text, we are taking workaround.
// It's just a cosmetic change and doesn't affect the underlying logic of Markdown.
//
// Comparing v2.5.0...v2.5.1 · souvikinator/notion-to-md
// https://github.com/souvikinator/notion-to-md/compare/v2.5.0...v2.5.1#diff-d99820b45e7d0bbc18b9ff1022d72f2af5698d32253f99e00db65b2bc0fad2beR48-R49
//
// Latest original source: https://github.com/souvikinator/notion-to-md/blob/master/src/notion-to-md.ts

export class NotionToMarkdownCustom extends NotionToMarkdown {
  /**
   * Converts Markdown Blocks to string
   * @param {MdBlock[]} mdBlocks - Array of markdown blocks
   * @param {number} nestingLevel - Defines max depth of nesting
   * @returns {string} - Returns markdown string
   */
  toMarkdownString(mdBlocks: MdBlock[] = [], nestingLevel: number = 0): string {
    let mdString = "";

    // Insert a blank line when List starts
    let listStyleContinuationStatus = false;
    mdBlocks.forEach((mdBlocks) => {
      // process parent blocks
      if (mdBlocks.parent) {
        if (
          mdBlocks.type !== "to_do" &&
          mdBlocks.type !== "bulleted_list_item" &&
          mdBlocks.type !== "numbered_list_item"
        ) {
          listStyleContinuationStatus = false;
          // add extra line breaks non list blocks
          mdString += `\n${md.addTabSpace(mdBlocks.parent, nestingLevel)}\n`;
        } else {
          const preLineBreak =
            listStyleContinuationStatus === false && nestingLevel === 0
              ? "\n"
              : "";
          mdString += `${preLineBreak}${md.addTabSpace(
            mdBlocks.parent,
            nestingLevel
          )}\n`;
          listStyleContinuationStatus = true;
        }
      }

      // process child blocks
      if (mdBlocks.children && mdBlocks.children.length > 0) {
        mdString += this.toMarkdownString(mdBlocks.children, nestingLevel + 1);
      }
    });
    return mdString;
  }
}
