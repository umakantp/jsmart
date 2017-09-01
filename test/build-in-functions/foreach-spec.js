define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: foreach', function () {
    var tpl
    var output
    var t

    it('test simple foreach', function () {
      // Simple
      tpl = '{foreach $people as $person}'
      tpl += '{$person}\\n'
      tpl += '{/foreach}'
      output = 'Uma\\nPallavi\\nLokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test index in foreach', function () {
      // index
      tpl = '{foreach $people as $person}'
      tpl += '{$person@index} => {$person}\\n'
      tpl += '{/foreach}'
      output = '0 => Uma\\n1 => Pallavi\\n2 => Lokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test key in foreach', function () {
      // key like PHP
      tpl = '{foreach $people as $key => $person}'
      tpl += '{$key} => {$person}\\n'
      tpl += '{/foreach}'
      output = '0 => Uma\\n1 => Pallavi\\n2 => Lokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)

      tpl = '{foreach $people as $person}'
      tpl += '{$person@key} => {$person}\\n'
      tpl += '{/foreach}'
      output = '0 => Uma\\n1 => Pallavi\\n2 => Lokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test iteration in foreach', function () {
      tpl = '{foreach $people as $person}'
      tpl += '{$person@iteration} => {$person}\\n'
      tpl += '{/foreach}'
      output = '1 => Uma\\n2 => Pallavi\\n3 => Lokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test first and last in foreach', function () {
      tpl = '{foreach $people as $person}'
      tpl += '{if $person@first}List of names =>{/if}'
      tpl += '{$person}:'
      tpl += '{/foreach}'
      output = 'List of names =>Uma:Pallavi:Lokesh:'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)

      tpl = '{foreach $people as $person}'
      tpl += '{$person}'
      tpl += '{if !$person@last}:{/if}'
      tpl += '{/foreach}'
      output = 'Uma:Pallavi:Lokesh'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })
  })
})
