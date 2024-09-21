import assert from 'assert';
import Jsmart from 'src/jsmart';


describe('Test Syntax', function () {
  it('should add numbers', function() {
    // add an assertion
    const smarty = new Jsmart();
    assert.strictEqual(smarty.render('Hello world'), 'Hello world');
  });
});
