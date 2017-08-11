describe("Test Syntax", function() {

  it("test plain text", function() {
    var t = new jSmart('Hello world');
    expect(t.fetch()).toBe('Hello world');
  });

  it("test variable", function() {
    var t = new jSmart('Hello {$name}, how are you?');
    expect(t.fetch({name: 'world'})).toBe('Hello world, how are you?');
  });

  it("test comment", function() {
    var t = new jSmart('Testing {*comments yo *}, does it work?');
    expect(t.fetch()).toBe('Testing , does it work?');
  });

  it("test assigning variable", function() {
    var t = new jSmart("{$foo = 'bar'} print foo {$foo}");
    expect(t.fetch()).toBe(' print foo bar');
  });

  it("test double quotes strings", function() {
    var t = new jSmart('{$foo="bar"} {$bar = "value of foo is \'$foo\'"} {$bar}');
    expect(t.fetch()).toBe("  value of foo is 'bar'");

    // back tick test.
    var t = new jSmart('{$foo = "`$person.name.first` has `$person[\'favorite gadget\']`"} {$foo}');
    expect(t.fetch({person: {name: {first: 'Umakant'}, 'favorite gadget': 'ipad'}})).toBe(" Umakant has ipad");
  });
});
