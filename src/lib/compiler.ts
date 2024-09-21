import { SmartyConfig } from 'src/lib/types';


class Compiler {
  constructor(_config: SmartyConfig) {
    // no op
  }
  process(tplString: string) {
    return tplString.split('');
  }
}

export default Compiler;
