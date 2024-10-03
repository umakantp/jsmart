import { grammerMatcher } from 'src/lib/grammer';
import { Token } from 'src/lib/types';

class Tokenizer {
  tokens: Token[];
  wrap: boolean;

  constructor(tpl: string) {
    this.tokens = [];
    this.wrap = false;

    // loop until while we are processing
    let i = 0;
    let isArrayAssignment = false;
    let isAssignment = false;
    let openTag = false;
    while (tpl.length > 0) {
      const definition = grammerMatcher(tpl);
      const processed = definition.node.process(definition.match, tpl);

      if (definition.key === 'variable' && i === 0) {
        // It is a variable and first thing, may be we need to wrap it in variable
        // Cases where this is not applicate like assignment, set it back to false.
        this.wrap = true;
      }
      if (definition.key === 'ifOpen') {
        openTag = true;
      }
      if (definition.key === 'shortHandIsNotOddEvenBy') {
        // Short hand is not odd even by needs opening tag.
        this.tokens[this.tokens.length - 1]!.data = `(${this.tokens[this.tokens.length - 1]!.data}`;
      }
      if (definition.key === 'xorOperator') {
        // xor is not present in js, to put it work we do !foo ^ !bar
        this.tokens[this.tokens.length - 1]!.data = `!${this.tokens[this.tokens.length - 1]!.data}`;
      }

      if (definition.key === 'squareBracketClose' && this.tokens[this.tokens.length - 1]?.type === 'squareBracketOpen' && this.tokens[this.tokens.length - 2]?.type === 'variable') {
        // This is case of $xyz[]. User is assigning a variable
        this.wrap = false;
        const varData = this.tokens[this.tokens.length - 2];
        // Argh typesript
        if (varData) {
          varData.data += '.push(';
          varData.type = 'arrayAssignmentOperator';
          this.tokens[this.tokens.length - 2] = varData;
        }
        // Remove open square and do not add urent token close square.
        this.tokens = this.tokens.slice(0, -1);
      } else if (definition.key === 'assignmentOperator') {
        this.wrap = false;
        isAssignment = true;
        // lets go back trace. if we find variable, stop it means it is simple variable assignment
        // if it reaches `arrayAssignmentOperator` first it means it .push in array.
        const anArray = this.tokens.reverse().find(f => f.type === 'variable' || f.type === 'arrayAssignmentOperator')?.type === 'arrayAssignmentOperator';
        if (anArray) {
          // Mark it so we close our push( by ).
          isArrayAssignment = true;
        } else {
          this.tokens.push({ ...processed, type: definition.key });
        }
      } else {
        this.tokens.push({ ...processed, type: definition.key });
      }

      tpl = tpl.substring(processed.tpl.length);
      i += 1;
    }

    if (isArrayAssignment) {
      this.tokens.push({
        data: ')',
        tpl: '',
        type: 'arrayAssignmentOperatorParen',
      });
    }
    if (isAssignment) {
      this.tokens.push({
        data: '; ',
        tpl: '',
        type: 'assignmentOperatorColon',
      });
    }
    if (openTag) {
      this.tokens.push({
        data: ') {',
        tpl: '',
        type: 'openTagParen',
      });
    }
  }

  stringify() {
    let wrap = this.wrap;
    if (this.tokens.length > 1 && (this.tokens[0]?.type === 'incDecOperators' || this.tokens[this.tokens.length - 1]?.type === 'incDecOperators')) {
      // if it is simply {$i++} or ${--i}, assign the variable to output.
      wrap = true;
    }
    return {
      data: this.tokens.map(t => t.data).join(''),
      wrap,
    };
  }
}

export default Tokenizer;
