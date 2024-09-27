export interface SmartyConfig {
  leftDelimiter: string,

  rightDelimiter: string,

  // Name is auto_literal in PHP Smarty.
  autoLiteral: boolean,
}

export type Variables = Record<string, any>

export enum NodeType {
  Text,
  Smarty,
}

export type Node = { type: NodeType, content: string, }

export type BuiltInMatchResult = RegExpMatchArray;

export type GrammerOptions = { content: string, shouldWrap?: boolean };

export type GrammerResponse = { content: string, result: string };

export type Grammer = Record<string, { re: RegExp, process: (result: BuiltInMatchResult, options: GrammerOptions) => GrammerResponse }>;
