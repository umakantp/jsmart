/**
 * Node: Extended example, showing show files can be parsed and cached.
 *
 * Runnable in node js only, will fail in browser, look at import statement.
 */


const Jsmart = require('jsmart/node');

// Sync example of node
const syncSmartyRender = (tplName) => {
  const smarty = new Jsmart();

  smarty.setTemplateDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');
  smarty.setConfigDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');

  smarty.setEscapeHtml(true);
  const compiled = smarty.compileFileSync(tplName);
  return { compiled, smarty };
}

const { compiled, smarty } = syncSmartyRender('hello.tpl')
smarty.assign('version', 'v5')
smarty.display(compiled, { name: 'Umakant' })

// Async example of node
const asyncSmartyRender = async (tplName) => {
  const smarty = new Jsmart();

  smarty.setTemplateDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');
  smarty.setConfigDir('/Users/umakant/codex/jsmart/examples/extended-node/tpls');

  smarty.setEscapeHtml(true);
  const compiled = await smarty.compileFile(tplName);
  return { compiled, smarty };
}

asyncSmartyRender('hello.tpl')
  .then(({ compiled, smarty }) => {
    smarty.assign('version', 'v5')
    smarty.display(compiled, { name: 'Umakant' })
  })
