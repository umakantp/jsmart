import Compiler from 'src/lib/compiler';
import { AUTO_LITERAL, LEFT_DELIMITER, RIGHT_DELIMITER } from 'src/lib/defaults';
import Renderer from 'src/lib/renderer';
import { Variables } from 'src/lib/types';
import { removeComments } from 'src/lib/utils';

class Smarty {
  // Smarty version and also can be used as cache version, so if we change
  // anything in future version, should have new cache.
  version = '@version';

  data: Variables = {};

  autoLiteral: boolean = AUTO_LITERAL;

  leftDelimiter: string = LEFT_DELIMITER;

  rightDelimiter: string = RIGHT_DELIMITER;

  setLeftDelimiter(newDelimiter: string) {
    const leftDelimiter = newDelimiter.trim();
    this.leftDelimiter = leftDelimiter;
  }

  setRightDelimiter(newDelimiter: string) {
    const rightDelimiter = newDelimiter.trim();
    this.rightDelimiter = rightDelimiter;
  }

  compile(tplString: string) {
    const c = new Compiler({
      leftDelimiter: this.leftDelimiter,
      rightDelimiter: this.rightDelimiter,
      autoLiteral: this.autoLiteral,
    });

    tplString = removeComments(this.leftDelimiter, this.rightDelimiter, tplString);
    tplString = tplString.replace(/\r\n/g, '\n');

    return c.compile(tplString);
  }

  // TODO:: For now value is any. Should we limit what can be a value?
  assign(key: string, value: any) {
    this.data[key] = value;
  }

  display(compiledData: string, moreData?: Variables) {
    if (moreData) {
      Object.keys(moreData).forEach(moreDataKey => {
        this.data[moreDataKey] = moreData[moreDataKey];
      });
    }
    const r = new Renderer(compiledData);
    return r.process(this.data);
  }

  render(tplString: string, data?: Variables) {
    const cachableTpl = this.compile(tplString);
    return this.display(cachableTpl, data);
  }
}

export default Smarty;
