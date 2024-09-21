/**
 * Simple example, showing show strings can be parsed and cached.
 *
 * Run it in the browser or node js, works in all the environments.
 */

const Jsmart = require('jsmart');

const tplString = `
  Hello People..

  This template is rendered from Node.js using Jsmart {$version}

  By {$name}
`;

const smarty = new Jsmart();
const compiled = smarty.compile(tplString);
smarty.assign('version', 'v5');
console.log(smarty.display(compiled, { name: 'Umakant' }));
