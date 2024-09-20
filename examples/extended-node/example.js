/**
 * Node: Extended example, showing show files can be parsed and cached.
 *
 * Runnable in node js only, will fail in browser, look at import statement.
 */


const jSmart = require('jsmart/node');

// Sync example of node
const syncSmartyRender = (tplName) => {
  const smarty = new jSmart();

  smarty.setTemplateDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');
  smarty.setConfigDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');

  smarty.setEscapeHtml(true);
  const compiled = smarty.compileFileSync(tplName);
  return compiled;
}

syncSmartyRender('hello.tpl').assign('version', 'v5').display({ name: 'Umakant' })

// Async example of node
const asyncSmartyRender = async (tplName) => {
  const smarty = new jSmart();

  smarty.setTemplateDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');
  smarty.setConfigDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');

  smarty.setEscapeHtml(true);
  const compiled = await smarty.compileFile(tplName);
  return compiled;
}

asyncSmartyRender('hello.tpl')
  .then((smartyCompiled) => {
    smartyCompiled.assign('version', 'v5')
    smartyCompiled.display({ name: 'Umakant' })
  })
