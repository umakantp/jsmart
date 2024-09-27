import assert from 'assert';
import Jsmart from 'src/jsmart';

describe('variable', function () {
  it('should print simple variables', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {$name}!', { name: 'World' }), 'Hello World!');
  });

  it('should print array dot notation variables', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {$obj.name}!', { obj: { name : 'Dot Notation'} }), 'Hello Dot Notation!');
    assert.strictEqual(smarty.render('Hello {$obj.name.key}!', { obj: { name : { key: 'Double Dot Notation' } } }), 'Hello Double Dot Notation!');
  });

  it('should print array arrow notation variables', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {$obj->name}!', { obj: { name : 'Arrow Notation'} }), 'Hello Arrow Notation!');
    assert.strictEqual(smarty.render('Hello {$obj->name->key}!', { obj: { name : { key: 'Double Arrow Notation' } } }), 'Hello Double Arrow Notation!');
  });

  it('should print array bracket notation indexed variables', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {$arr[0]}!', { arr: ['Bracket Indexed Notation'] }), 'Hello Bracket Indexed Notation!');
    assert.strictEqual(smarty.render('Hello {$arr[0]}!', { arr: [['Double Bracket Indexed Notation']] }), 'Hello Double Bracket Indexed Notation!');
  });

  it('should print array bracket notation string variables', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello {$arr[\'name\']}!', { arr: { name: 'Bracket String Notation' } }), 'Hello Bracket String Notation!');
    assert.strictEqual(smarty.render('Hello {$arr[\'name\'][\'key\']}!', { arr: { name: { key: 'Double Bracket String Notation' } } }), 'Hello Double Bracket String Notation!');
  });

  it('should assign variables and print them', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$name=\'World\'} Hello {$name}!'), ' Hello World!');
  });

  it('should assign variables from variables and print them', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$name=$world} Hello {$name}!', { world: 'World' }), ' Hello World!');
    assert.strictEqual(smarty.render('{$name=$world.dot} Hello {$name}!', { world: { dot: 'Dot World' } }), ' Hello Dot World!');
    assert.strictEqual(smarty.render('{$name=$world->arrow} Hello {$name}!', { world: { arrow: 'Arrow World' } }), ' Hello Arrow World!');
    assert.strictEqual(smarty.render('{$name=$world[0]} Hello {$name}!', { world: ['Indexed World'] }), ' Hello Indexed World!');
    assert.strictEqual(smarty.render('{$name=$world[\'stringed\']} Hello {$name}!', { world: { stringed: 'Stringed World' } }), ' Hello Stringed World!');
  });

  it('should be possible to assign to array variable', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$names[]=\'Girls\'} Hello {$names[0]} and {$names[1]}!', { names: ['Boys'] }), ' Hello Boys and Girls!');
  });

  // TODO:: Test these and make them work
  /*
  it('should understand variables inside double quotes', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$foo="bar"} {$bar = "value of foo is \'$foo\'"} {$bar}'), '  value of foo is \'bar\'');
  });

  it('should understand variables inside double quotes and ticks', function () {
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('{$foo = "`$person.name.first` has `$person[\'favorite gadget\']`"} {$foo}', { person: { name: { first: 'Umakant' }, 'favorite gadget': 'ipad' } }), ' Umakant has ipad');
  });
  */
});
