import { BuiltInMatchResult, Grammer } from 'src/lib/types';

export const grammer: Grammer = {
  ifOpen: {
    re: /^(if|elseif|else(\s*)if) \s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      const jsElseIf = result[0].replace('elseif', 'else if');
      return {
        data: result[1]?.match(/elseif|else(\s*)if/) ? `} ${jsElseIf} (` : `${jsElseIf} (`,
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },
  ifElse: {
    re: /^else$/,
    process: (_result: BuiltInMatchResult, tpl: string) => {
      return { data: '} else { ', tpl };
    }
  },
  ifClose: {
    re: /^\s*\/if\s*/,
    process: (_result: BuiltInMatchResult, tpl: string) => {
      return { data: '} ', tpl };
    }
  },

  variable: {
    re: /^\$([\w@]+)/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      // If is not needed but typescript, since we pass only values which are matched.
      if (result[1]) {
        return {
          data: result[1],
          tpl: tpl.substring(0, result[0].length)
        };
      }
      throw `Not able parse variable in '${tpl}'`;
    }
  },

  singleQuoteWord: {
    re: /^'([^'\\]*(?:\\.[^'\\]*)*)'/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  dotNotationAndArrowArray: {
    re: /^(?:\.|->\s*)/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0].replace('->', '.'),
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  // TODO:: Handle double quotes.

  // TODO:: will this not get confused functions() parens?
  parentStart: {
    re: /^\s*\(\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },
  parentEnd: {
    re: /^\s*\)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  nullCoalescingOperator: {
    re: /^\s*(\?)(\?)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: `${result[1]} __fill__ :`,
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  shortHandTernaryOperator: {
    re: /^\s*(\?)(\:)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: `${result[1]} __fill__ ${result[2]}`,
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  ternaryOperator: {
    re: /^\s*(\?|\:)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  incDecOperators: {
    re: /^\s*(\+\+|--)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  comparisonOperators: {
    re: /^\s*(===|!==|==|!=)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  textComparisionOperators: {
    re: /^\s+(eq|ne|neq)\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      const operator =  result[1] === 'eq' ? '==' : '!=';
      return { data: operator, tpl: tpl.substring(0, result[0].length) };
    }
  },

  negationOperators: {
    re: /^\s*!\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  textNegationOperators: {
    re: /^\s*not\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: '!', tpl: tpl.substring(0, result[0].length) };
    }
  },

  assignmentOperator: {
    re: /^(\s*=\s*)/,
    process:(result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  progrmammingOtherOperator: {
    re: /^\s*(\+=|-=|\*=|\/=|%=)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  basicMathOperators: {
    re: /^\s*(\+|-|\/|\*|%)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  modOperator: {
    re: /^\s+mod\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0].replace('mod', '%'), tpl: tpl.substring(0, result[0].length) };
    }
  },

  mathComparisonOperators: {
    re: /^\s*(<=|>=|<>|<|>)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  textMathComparisonOperators: {
    re: /^\s+(lt|lte|le|gt|gte|ge)\s+/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      const op = (result[1] ? result[1] : result[0]).replace(/l(t)?e/, '<=').replace(/lt/, '<').replace(/g(t)?e/, '>=').replace(/gt/, '>');
      return { data: op, tpl: tpl.substring(0, result[0].length) };
    }
  },

  shortHandIsNotDivBy: {
    re: /^\s+(is\s+(not\s+)?div\s+by)\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      let length = result[0].length;
      const resolved = grammerResolver(tpl.substring(result[0].length));
      let variable = ' % ' + resolved.variable;
      length += resolved.tpl.length;

      variable += result[2] ? ' != 0' : ' == 0';
      return {
        data: variable,
        tpl: tpl.substring(0, length)
      };
    }
  },

  shortHandIsNotOddEvenBy: {
    re: /^\s+is\s+(not\s+)?(even|odd)(\s+by\s+)?\s*/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      let variable = '';
      let length = result[0].length;

      if (result[3]) {
        const resolved = grammerResolver(tpl.substring(result[0].length));
        variable += ' / ' + resolved.variable + ') % 2 ';
        if (result[2] === 'odd') {
          if (result[1]?.includes('not')) {
            variable += '== 0';
          } else {
            variable += '!= 0';
          }
        } else {
          if (result[1]?.includes('not')) {
            variable += '!= 0';
          } else {
            variable += '== 0';
          }
        }
        length += resolved.tpl.length;
      } else {
        if (result[2] === 'even') {
          if (result[1]?.includes('not')) {
            variable += ' % 2) != 0';
          } else {
            variable += ' % 2) == 0';
          }
        } else {
          if (result[1]?.includes('not')) {
            variable += ' % 2) == 0';
          } else {
            variable += ' % 2) != 0';
          }
        }
      }
      return {
        data: variable,
        tpl: tpl.substring(0, length)
      };
    }
  },

  shortHandIsIn: {
    re: /^\s+is\s+in\s*/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      const resolved = grammerResolver(tpl.substring(result[0].length));
      const variable = resolved.variable;
      const length = result[0].length + resolved.tpl.length;
      return {
        data: variable,
        tpl: tpl.substring(0, length)
      };
    }
  },

  shortHandIsNotIn: {
    re: /^\s+is\s+not\s+in\s*/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      const resolved = grammerResolver(tpl.substring(result[0].length));
      const variable = resolved.variable;
      const length = result[0].length + resolved.tpl.length;
      return {
        data: variable,
        tpl: tpl.substring(0, length)
      };
    }
  },

  andOperator: {
    re: /^\s*(&&)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  textAndOperator: {
    re: /^\s+and\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0].replace('and', '&&'), tpl: tpl.substring(0, result[0].length) };
    }
  },

  orOperator: {
    re: /^\s*(\|\|)\s*/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0], tpl: tpl.substring(0, result[0].length) };
    }
  },

  xorOperator: {
    re: /^\s+xor\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: ' ^ !', tpl: tpl.substring(0, result[0].length) };
    }
  },

  textOrOperator: {
    re: /^\s+or\s+/i,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return { data: result[0].replace('or', '||'), tpl: tpl.substring(0, result[0].length) };
    }
  },

  // TODO: Handle #config#

  squareBracketOpen: {
    re: /^\[/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  squareBracketClose: {
    re: /^\]/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  staticNumber: {
    // TODO:: test negative and float numbers.
    re: /^[\d.]+/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },

  staticWord: {
    re: /^\w+/,
    process: (result: BuiltInMatchResult, tpl: string) => {
      return {
        data: result[0],
        tpl: tpl.substring(0, result[0].length)
      };
    }
  },
};

const grammerResolver = (tpl: string) => {
  let variable = '';
  let length = 0;
  let restTpl = tpl;
  // loop until while we are processing
  while (restTpl.length > 0) {
    const syntax = grammerMatcher(restTpl);
    const processed = syntax.node.process(syntax.match, restTpl);
    variable += processed.data;
    restTpl = restTpl.substring(processed.tpl.length);
    length += processed.tpl.length;
  }
  return { variable, tpl: tpl.substring(0, length)};
};

export const grammerMatcher = (tpl: string) => {
  const list = Object.keys(grammer);
  for (const item of list) {
    // If is not need here, but typescript :-(
    if (grammer[item]) {
      const pattern = new RegExp(grammer[item].re);
      const match = tpl.match(pattern);
      // If the pattern is matched then only process and break
      if (match) {
        return { node: grammer[item], match, key: item, };
      }
    }
  }
  throw `Not able to parse '${tpl}'`;
};
