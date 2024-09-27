import assert from 'assert';
import Jsmart from 'src/jsmart';

describe('tag if', function () {
  it('should support simple if, if/else, if/elseif', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {if $foo}world and{/if} people', { foo: false }), 'Hello  people');
    assert.strictEqual(smarty.render('Hello {if $foo}world {else} and{/if} people', { foo: false }), 'Hello  and people');
    assert.strictEqual(smarty.render('Hello {if $foo}world {elseif $bar} and{/if} people', { foo: false , bar: true }), 'Hello  and people');
  });

  it('should support nested if, if/else, if/elseif', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {if $foo}world{if $bar}and{else}or{/if}{/if} people', { foo: true, bar: false }), 'Hello worldor people');
    assert.strictEqual(smarty.render('Hello {if $foo}world{if $bar}and{elseif $baz}or{else} {if $quo}what{else}good{/if}{/if}{/if} people', { foo: true, bar: false, baz: false, quo: false }), 'Hello world good people');
  });
});
