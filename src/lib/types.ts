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

export type Token = {
  // Type of token
  // TODO:: type is key of Grammer, fix the type.
  type: string,
  // Processed output
  data: string,
  // Processed template string,
  tpl: string,
}

export type BuiltInMatchResult = RegExpMatchArray;

export type Grammer = Record<string, { re: RegExp, process: (result: BuiltInMatchResult, tpl: string) => Omit<Token, 'type'> }>;
