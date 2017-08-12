describe("Test Functions", function() {
  // TODO:: None of these are working. Currrently skipped.
  it("test inline functions", function() {
    var tpl = "{function 'sayHello' to=''}Hello {$to}!{/function}";
        tpl =+ "\n";
        tpl =+ '{sayHello to="whole World"}';

    var t = new jSmart(tpl);
    expect(t.fetch()).toBe('Hello whole World!');
  });

  it("test js functions", function() {
    function hello(to) {
      return 'Hello '+to;
    }
    var tpl = "{hello('World')}";
        tpl += ' and ';
        tpl =+ "{helloAgain('world')}";

    var t = new jSmart(tpl);
    expect(t.fetch({
      helloAgain: function (name) {
        return hello(to) + ' again';
      }
    })).toBe('Hello World and Hello world again');
  });

});
