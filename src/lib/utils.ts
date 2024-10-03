
export const findOpenDelimiter = (delimiter: string, tplString: string, autoLiteral: boolean) => {
  const re = new RegExp(autoLiteral ? `${delimiter}(?!\\s)` : delimiter);
  const firstMatch = tplString.match(re);
  if (firstMatch) {
    return firstMatch.index !== undefined ? firstMatch.index : -1;
  }
  return -1;
};

export const findCloseDelimiter = (delimiter: string, tplString: string, autoLiteral: boolean) => {
  const re = new RegExp(autoLiteral ? `(?!\\s)${delimiter}` : delimiter);
  const firstMatch = tplString.match(re);
  if (firstMatch) {
    return firstMatch.index !== undefined ? firstMatch.index : -1;
  }
  return -1;
};

export const removeComments = (ldelim: string, rdelim: string, tplString: string) => {
  const ldelimRe = new RegExp(ldelim + '\\*');
  const rdelimRe = new RegExp('\\*' + rdelim);
  let newTplString = '';

  let openTag: RegExpMatchArray | null;
  while (openTag = tplString.match(ldelimRe)) {
    newTplString += tplString.slice(0, openTag.index);
    tplString = tplString.slice((openTag.index || 0) + openTag[0].length);
    const closeTag = tplString.match(rdelimRe);
    if (!closeTag) {
      throw new Error('Missing *' + rdelim);
    }
    tplString = tplString.slice((closeTag.index || 0) + closeTag[0].length);
  }
  return newTplString + tplString;
};

