/**
 * Simple example, showing show strings can be parsed and cached.
 *
 * Run it in the browser or node js, works in all the environments.
 */

const jSmart = require('jsmart');

const tplString = `
  Hello People..

  This template is rendered from Node.js using jSmart {$version}

  By {$name}
`;

const smarty = new jSmart();
const compiled = smarty.compile(tplString);
compiled.assign('version', 'v5')
console.log(compiled.display({ name: 'Umakant' }));
