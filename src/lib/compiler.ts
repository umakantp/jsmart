import { AUTO_LITERAL, LEFT_DELIMITER, RIGHT_DELIMITER } from 'src/lib/defaults';
import syntaxChecker from 'src/lib/syntax';
import { Node, NodeType, SmartyConfig } from 'src/lib/types';
import { assignVarToJsmart, findCloseDelimiter, findOpenDelimiter } from 'src/lib/utils';

class Compiler {
  config: SmartyConfig = {
    leftDelimiter: LEFT_DELIMITER,
    rightDelimiter: RIGHT_DELIMITER,
    autoLiteral: AUTO_LITERAL,
  };

  constructor(config: Partial<SmartyConfig>) {
    this.config = { ...this.config, ...config };
  }

  compile(tplString: string) {
    // First we convert normal text to basic tokens
    const parsedTpl = this.parse(tplString);
    // Convert basic tokens to better named tokens having detailed parsing
    return this.parseTags(parsedTpl);
  }

  parse(tplString: string) {
    const ldelim = this.config.leftDelimiter;
    const rdelim = this.config.rightDelimiter;
    const parsedTpl: Node[] = [];
    while (tplString.length > 0) {
      // Find first opening tag in the string.
      const startIndex = findOpenDelimiter(ldelim, tplString, this.config.autoLiteral);
      // Anything before open delimiter is a string. If no open delimiter, then its all string.
      parsedTpl.push({
        type: NodeType.Text,
        content: startIndex === -1 ? tplString : tplString.substring(0, startIndex)
      });
      if (startIndex === -1) {
        // Nothing left to parse, so clear string and we will break from while
        tplString = '';
      } else {
        // Remove open delimiter
        tplString = tplString.substring(startIndex + ldelim.length);
        // lets find next closing
        const endIndex = findCloseDelimiter(rdelim, tplString, this.config.autoLiteral);
        if (endIndex === -1) {
          // did we just have a situation where open tag is present but not close?
          throw new Error(`Missing ${rdelim} after ${tplString.substring(10)}`);
        }
        // Anything before close delimiter is a tag..
        parsedTpl.push({
          type: NodeType.Smarty,
          content: tplString.substring(0, endIndex).trim()
        });
        // Remove close delimiter
        tplString = tplString.substring(endIndex + rdelim.length);
      }
    }
    return parsedTpl;
  }

  parseTags(parsedTpl: Node[]) {
    let parsedTagsTpl = '';
    for (const node of parsedTpl) {
      if (node.type === NodeType.Text) {
        parsedTagsTpl += assignVarToJsmart(`\`${node.content}\``, true);
      } else if (node.type === NodeType.Smarty) {
        const syntax = syntaxChecker(node.content);
        const processed = syntax.item.process(
          syntax.match,
          { content: node.content, shouldWrap: true }
        );
        parsedTagsTpl += processed.result;
      }
    }
    return parsedTagsTpl;
  }
}

export default Compiler;
