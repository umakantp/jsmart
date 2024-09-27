import assert from 'assert';
import Jsmart from 'src/jsmart';

describe('basic smarty', function () {

  it('should render plain text', function() {
    // add an assertion
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello world'), 'Hello world');
  });

  it('should ignore comments', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Testing {*comments yo *}, does it work?'), 'Testing , does it work?');
  });

  const multipleTpl = `Testing {*comments
yo *},
does it work?`;
  const multipleTplOutput = `Testing ,
does it work?`;

  it('should ignore multi-line comments', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render(multipleTpl), multipleTplOutput);
  });

  it('should ignore multiple comments', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Writing {* first comment*} and {* 2nd comment *} testing'), 'Writing  and  testing');
  });

  it('should print simple variables', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {$name}!', { name: 'World' }), 'Hello World!');
  });
});
