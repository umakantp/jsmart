import assert from 'assert';
import Jsmart from 'src/jsmart';

describe('tag if', function () {
  it('should support simple if', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {if $foo}world and{/if} people', { foo: false }), 'Hello  people');
  });
});
