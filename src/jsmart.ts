import Compiler from 'src/lib/compiler';
import Renderer from 'src/lib/renderer';
import { Variables } from 'src/lib/types';

class Smarty {
  data: Variables = {};

  leftDelimiter: string = '{';

  rightDelimiter: string = '}';

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
    });
    return c.process(tplString);
  }

  // TODO:: For now value is any. Should we limit what can be value?
  assign(key: string, value: any) {
    this.data[key] = value;
  }

  display(compiledData: string[], moreData?: Variables) {
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
