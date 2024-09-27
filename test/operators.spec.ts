import assert from 'assert';
import Jsmart from 'src/jsmart';

describe('operators', function () {
  it('should support simple math operators', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$foo + 4}', { foo: 12 }), '16');
    assert.strictEqual(smarty.render('{$foo * 4}', { foo: 3 }), '12');
    assert.strictEqual(smarty.render('{$foo - 4 + 12}', { foo: 10 }), '18');
    assert.strictEqual(smarty.render('{$foo = $bar + $baz}{$foo}', { bar: 4, baz: 5 }), '9');
  });

  it('should increment/decrement numbers', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$a=2} {$a++} {++$a}'), ' 2 4');
    assert.strictEqual(smarty.render('{$a=4} {$a--} {--$a}'), ' 4 2');
  });
});
