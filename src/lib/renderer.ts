import { Variables } from 'src/lib/types';

class Renderer {
  compiledData: string = '';

  constructor(compiledData: string) {
    this.compiledData = compiledData;
  }
  process(data: Variables) {
    const fnKeys = Object.keys(data);
    const args = fnKeys.join(', ');
    const body =  `var $JSMART = \'\'; ${this.compiledData} return $JSMART; `;
    const template = new Function(args, body);
    return template(...(Object.values(data)));
  }
}

export default Renderer;
