import { Variables } from 'src/lib/types';

class Renderer {
  compiledData: string[] = [];

  constructor(compiledData: string[]) {
    this.compiledData = compiledData;
  }
  process(_data: Variables) {
    return this.compiledData.join('');
  }
}

export default Renderer;
