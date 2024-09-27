import { BuiltInMatchResult, Grammer, GrammerOptions } from 'src/lib/types';
import { assignVarToJsmart } from 'src/lib/utils';

export const grammer: Grammer = {

  ifOpen: {
    /*
      if $foo === 2, if $foo === 'bar',
      if $foo
      if $foo = 10
    */
    re: /^(if|elseif) \s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      if (result[0]) {
        let processedLength = 0;
        let restTpl = options.content.substring(result[0].length);
        const jsElseIf = result[0].replace('elseif', 'else if');
        let fullVariable = result[1] === 'elseif' ? `} ${jsElseIf} (` : `${jsElseIf} (`;
        processedLength += result[0].length;
        // loop until while we are processing
        while (restTpl.length > 0) {
          const syntax = syntaxChecker(restTpl);
          const processed = syntax.item.process(syntax.match, { content: restTpl });
          fullVariable += processed.result;
          restTpl = restTpl.substring(processed.content.length);
          processedLength += processed.content.length;
        }
        return {
          result: `${fullVariable}) { `,
          content: options.content.substring(0, processedLength)
        };
      }
      return { result: '', content: options.content };
    }
  },
  ifElse: {
    re: /^else$/,
    process: (_result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: '} else { ', content: options.content };
    }
  },
  ifClose: {
    re: /^\s*\/if\s*/,
    process: (_result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: '} ', content: options.content };
    }
  },

  variable: {
    /*
      {$foo}, {$foo.bar}, {$foo.bar.baz}, {$foo.$bar}, {$foo.bar.$baz}, {$foo.bar[1].$baz}
      {$foo[4]}, ${foo['bar']}
      {$foo[foo]} (only in {section} loop, to access {section} loop, TODO::)
      {$foo->bar}, {$foo->bar()}, {$foo->bar($baz, 2, $qux)}
      Math: {$foo + $bar}, {$foo[$x+3]}
      {$foo=$bar+2}
      {$foo="bar {counter}"}
      {$foo.bar=1}, {$foo.bar.baz=1}, {$foo[]=1}
    */
    re: /^\$([\w@]+)/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      let { shouldWrap } = options;
      // If is not needed but typescript, since we pass only values which are matched.
      if (result[1]) {
        // replace any -> it with . since js is always uses that for object array
        let restTpl = options.content.substring(result[0].length).replace(/(\s*->\s*)/g, '.');
        if (restTpl.length > 0) {
          let fullVariable = result[1];
          let isAssigning: RegExpMatchArray | null = null;
          let isArrayAssigning: RegExpMatchArray | null = null;
          while (restTpl.length > 0) {
            // First possibility dot notation:- .
            if (restTpl[0] === '.') {
              restTpl = restTpl.substring(1);
              fullVariable += '.';
            }
            // Other possibility assignment:- =
            if (isAssigning = restTpl.match(/^(\s*=\s*)/)) {
              restTpl = restTpl.substring(isAssigning[0].length);
              fullVariable = `var ${fullVariable} = `;
              shouldWrap = false;
            }
            if (isArrayAssigning = restTpl.match(/^(\s*\[\]\s*=\s*)/)) {
              restTpl = restTpl.substring(isArrayAssigning[0].length);
              fullVariable = `${fullVariable}.push(`;
              shouldWrap = false;
            }
            // Rest of it if any.
            if (restTpl) {
              const syntax = syntaxChecker(restTpl);
              const processed = syntax.item.process(syntax.match, { content: restTpl });
              fullVariable += processed.result;
              restTpl = restTpl.substring(processed.content.length);
            }
          }
          if (isAssigning || isArrayAssigning) {
            if (isArrayAssigning) {
              fullVariable += ')';
            }
            fullVariable += '; ';
          }
          return {
            result: assignVarToJsmart(fullVariable, shouldWrap),
            content: options.content
          };
        }
        // It was plain simple $foo variable.
        return {
          result: assignVarToJsmart(result[1], shouldWrap),
          content: options.content
        };
      }
      return { result: '', content: options.content };
    },
  },

  singleQuoteWord: {
    re: /^'([^'\\]*(?:\\.[^'\\]*)*)'/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      if (result[0]) {
        return { result: assignVarToJsmart(result[0], options.shouldWrap), content: result[0] };
      }
      return { result: '', content: options.content };
    }
  },

  // TODO:: Handle double quotes.

  // TODO:: will this not get confused functions() parens?
  parentStartEnd: {
    re: /^\s*\(|\)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  incDecOperators: {
    re: /^\s*(\+\+|--)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      if (result[0]) {
        let processedLength = 0;
        let restTpl = options.content.substring(result[0].length);
        let fullVariable = result[0];
        processedLength += result[0].length;
        // loop until while we are processing
        while (restTpl.length > 0) {
          const syntax = syntaxChecker(restTpl);
          const processed = syntax.item.process(syntax.match, { content: restTpl });
          fullVariable += processed.result;
          restTpl = restTpl.substring(processed.content.length);
          processedLength += processed.content.length;
        }
        return {
          result: assignVarToJsmart(fullVariable, options.shouldWrap),
          content: options.content.substring(0, processedLength)
        };
      }
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  comparisionOperators: {
    re: /^\s*(===|!==|==|!=)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  textComparisionOperators: {
    re: /^\s+(eq|ne|neq)\s+/i,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      const operator =  result[1] === 'eq' ? '==' : '!=';
      return { result: operator, content: options.content.substring(0, result[0].length) };
    }
  },

  negationOperators: {
    re: /^\s*!\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  textNegationOperators: {
    re: /^\s+not\s+/i,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: '!', content: options.content.substring(0, result[0].length) };
    }
  },

  progrmammingOtherOperator: {
    re: /^\s*(\+=|-=|\*=|\/=|%=)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  basicMathOperators: {
    re: /^\s*(\+|-|\/|\*|%)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  // TODO:: Handle mod

  mathComparisionOperators: {
    re: /^\s*(<=|>=|<>|<|>)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  textMathComparisionOperators: {
    re: /^\s+(lt|lte|le|gt|gte|ge)\s+/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      const op = (result[1] ? result[1] : result[0]).replace(/l(t)?e/, '<').replace(/lt/, '<=').replace(/g(t)?e/, '>').replace(/gt/, '>=');
      return { result: op, content: options.content.substring(0, result[0].length) };
    }
  },

  andOperator: {
    re: /^\s*(&&)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  textAndOperator: {
    re: /^\s+and\s+/i,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0].replace('and', '&&'), content: options.content.substring(0, result[0].length) };
    }
  },

  orOperator: {
    re: /^\s*(\|\|)\s*/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0], content: options.content.substring(0, result[0].length) };
    }
  },

  // TODO:: Handle xor

  textOrOperator: {
    re: /^\s+or\s+/i,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      return { result: result[0].replace('or', '||'), content: options.content.substring(0, result[0].length) };
    }
  },

  // TODO: Handle #config#

  squareBracket: {
    /*
      [], [12], ['string']
      [foo] (only in {section} loop, to access {section} loop, TODO::)
      [$foo], [$foo()]
      [$x+2]
      ["string {$foo}"]
    */
    re: /^\[/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      if (result[0]) {
        const indexedArray = options.content.match(/^\[([\d]+)\]/);
        if (indexedArray) {
          return {
            result: assignVarToJsmart(indexedArray[0], options.shouldWrap),
            content: indexedArray[0]
          };
        }
        let processedLength = 0;
        let restTpl = options.content.substring(result[0].length);
        let fullVariable = result[0];
        processedLength += result[0].length;
        // loop until while we are processing
        while (restTpl.length > 0 && restTpl[0] !== ']') {
          const syntax = syntaxChecker(restTpl);
          const processed = syntax.item.process(syntax.match, { content: restTpl });
          fullVariable += processed.result;
          restTpl = restTpl.substring(processed.content.length);
          processedLength += processed.content.length;
        }
        fullVariable += ']';
        processedLength += 1;
        return {
          result: assignVarToJsmart(fullVariable, options.shouldWrap),
          content: options.content.substring(0, processedLength)
        };
      }
      return { result: '', content: options.content };
    }
  },

  number: {
    /*
      Just the numbers.
      10, 100, -56, 34.12
     */
    re: /^[\d.]+/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      if (result[0]) {
        return { result: assignVarToJsmart(result[0], options.shouldWrap), content: result[0] };
      }
      return { result: '', content: options.content };
    }
  },

  word: {
    /*
      These are just a word like foo or bar. Mostly used in array dot notation.
      return it as is. Here assumption is that, it is part of variable
      foo, bar
    */
    re: /^([\w@]+)(\.|$)/,
    process: (result: BuiltInMatchResult, options: GrammerOptions) => {
      if (result[1]) {
        return { result: assignVarToJsmart(result[1], options.shouldWrap), content: result[1] };
      }
      return { result: '', content: options.content };
    }
  },
};

const syntaxChecker = (content: string) => {
  const list = Object.keys(grammer);
  for (const item of list) {
    // If is not need here, but typescript :-(
    if (grammer[item]) {
      const pattern = new RegExp(grammer[item].re);
      const match = content.match(pattern);
      // If the pattern is matched then only process and break
      if (match) {
        return { item: grammer[item], match };
      }
    }
  }
  throw `Not able to parse ${content}`;
};

export default syntaxChecker;
