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

  it('should support comparison operator', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('--{if $foo === 2}++{/if}{if $bar !== true}**{/if}{if $baz === \'3\'}##{/if}--', { foo: 2, bar: true, baz: 3 }),
      '--++--'
    );
    assert.strictEqual(
      smarty.render('--{if $foo == 2}++{/if}{if $bar != true}**{/if}{if $bar != 0}@@{/if}{if $baz == \'3\'}##{/if}--', { foo: 2, bar: true, baz: 3 }),
      '--++@@##--'
    );
    assert.strictEqual(
      smarty.render('--{if $foo eq 2}++{/if}{if $bar neq true}**{/if}{if $bar neq 0}@@{/if}{if $bar ne 0}xx{/if}{if $baz eq \'3\'}##{/if}--', { foo: 2, bar: true, baz: 3 }),
      '--++@@xx##--'
    );
  });

  it('should support math comparison operator', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('--{if $foo > 2}++{/if}{if $foo >= 2}**{/if}{if $foo < 2}%%{/if}{if $foo <= 2}@@{/if}--', { foo: 2 }),
      '--**@@--'
    );
    assert.strictEqual(
      smarty.render('--{if $foo gt 2}++{/if}{if $foo gte 2}**{/if}{if $foo lt 2}%%{/if}{if $foo lte 2}@@{/if}--', { foo: 2 }),
      '--**@@--'
    );
    assert.strictEqual(
      smarty.render('--{if $foo gt 2}++{/if}{if $foo ge 2}**{/if}{if $foo lt 2}%%{/if}{if $foo le 2}@@{/if}--', { foo: 2 }),
      '--**@@--'
    );
  });

  it('should support negation operator', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('--{if !$foo}**{/if}{if !$bar}***{/if}{if !($foo == 2)}$${/if}{if !($foo == 3)}$${/if}--', { foo: 2, bar: false }),
      '--***$$--'
    );
    assert.strictEqual(
      smarty.render('--{if not $foo}**{/if}{if not $bar}***{/if}{if not ($foo == 2)}$${/if}{if not ($foo == 3)}$${/if}--', { foo: 2, bar: false }),
      '--***$$--'
    );
  });

  it('should support mod operator', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('{$a=10} {$b=3} {$a mod $b}'),
      '  1'
    );

    assert.strictEqual(
      smarty.render('{if $a % $b == 0}test1{/if} {if $a % $b != 5}test2{/if}', { a: 15, b: 3 }),
      'test1 test2'
    );
  });

  it('should support \'is (not) div by\'', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('{if $a is not div by 4}test1{/if} {if $a is div by 5}test2{/if}', { a: 15, b: 10 }),
      'test1 test2'
    );
  });

  it('should support \`is [not] even [by]\`', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('{if $c is not even}test-1{/if} {if $b is even}test0{/if} {if $a is not even by $b}test1{/if} {if $a is even by $c}test2{/if} {if ($a/$b) % 2  != 0}test3{/if} {if ($a/$c)%2 == 0}test4{/if}', { a: 6, b: 2, c: 3 }),
      'test-1 test0 test1 test2 test3 test4'
    );
  });

  it('should support \`is [not] odd  [by]\`', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('{if $b is not odd}test-1{/if} {if $c is odd}test0{/if} {if $a is not odd by $c}test1{/if} {if $a is odd by $b}test2{/if} {if ($a/$b) % 2  != 0}test3{/if} {if ($a/$c)%2 == 0}test4{/if}', { a: 6, b: 2, c: 3 }),
      'test-1 test0 test1 test2 test3 test4'
    );
  });

  it('should support and/or/xor', function () {
    const smarty = new Jsmart();
    assert.strictEqual(
      smarty.render('{if true && true}test1{/if} {if true and false}test2{/if} {if 1 and true}test3{/if} {if \'test\' and true}test4{/if} {if \'test\' &&  \'test\'}test5{/if} {if $a and $b}test6{/if} {if $a && $c}test7{/if}', { a: true, b: false, c: 'yo' }),
      'test1  test3 test4 test5  test7'
    );

    assert.strictEqual(
      smarty.render('{if true || true}test1{/if} {if true or false}test2{/if} {if 1 or true}test3{/if} {if \'test\' or true}test4{/if} {if \'test\' ||  \'test\'}test5{/if} {if $a || $b}test6{/if} {if $a || $c}test7{/if}', { a: true, b: false, c: 'yo' }),
      'test1 test2 test3 test4 test5 test6 test7'
    );

    assert.strictEqual(
      smarty.render('{if false xor false}test1{/if} {if true xor false}test2{/if} {if 1 xor true}test3{/if} {if \'test\' xor true}test4{/if} {if $a xor $b}test5{/if} {if $a xor $c}test6{/if} {if $b xor $d}test7{/if}', { a: false, b: true, c: false, d: true }),
      ' test2   test5  '
    );

    assert.strictEqual(
      smarty.render('{if ($a || $b) && !($a && $b)}test1{/if} {if ($a || $c) && !($a && $c)}test2{/if}', { a: false, b: true, c: false, d: true }),
      'test1 '
    );
  });
});
