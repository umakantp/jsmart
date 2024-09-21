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
