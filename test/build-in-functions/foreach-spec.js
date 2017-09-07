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

    it('test total in foreach', function () {
      tpl = '{foreach $people as $person}'
      tpl += '{$person} is {$person@total - $person@index} from last\\n'
      tpl += '{/foreach}'
      output = 'Uma is 3 from last\\n'
      output += 'Pallavi is 2 from last\\n'
      output += 'Lokesh is 1 from last\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test show in foreach', function () {
      tpl = '{foreach $people as $person}'
      tpl += '{$person}:'
      tpl += '{/foreach}'
      tpl += '{if $person@show}it had data{/if}'
      output = 'Uma:Pallavi:Lokesh:'
      output += 'it had data'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)

      tpl = '{foreach $people as $person}'
      tpl += '{$person}:'
      tpl += '{/foreach}'
      tpl += '{if !$person@show}it had no data{/if}'
      output = 'it had no data'
      t = new jSmart(tpl)
      expect(t.fetch({people: []})).toBe(output)
    })

    it('test nested foreach', function () {
      tpl = '{foreach $people as $person}'
      tpl += '----------------\\n'
      tpl += '{foreach $person as $prop => $val}'
      tpl += '{$prop}: {$val}\\n'
      tpl += '{/foreach}'
      tpl += '----------------\\n'
      tpl += '{/foreach}'

      output = '----------------\\n'
      output += 'name: Uma\\n'
      output += 'email: test@test.com\\n'
      output += '----------------\\n'
      output += '----------------\\n'
      output += 'name: Pallavi\\n'
      output += 'email: ptest@test.com\\n'
      output += '----------------\\n'
      output += '----------------\\n'
      output += 'name: Kasturi\\n'
      output += 'email: ktest@test.com\\n'
      output += '----------------\\n'

      t = new jSmart(tpl)
      expect(t.fetch({people: [
        {name: 'Uma', email: 'test@test.com'},
        {name: 'Pallavi', email: 'ptest@test.com'},
        {name: 'Kasturi', email: 'ktest@test.com'}
      ]})).toBe(output)
    })

    it('test break in foreach', function () {
      tpl = '{$data = [1,2,3,4,5]}'
      tpl += '{foreach $data as $value}'
      tpl += '{if $value == 3} {break} {/if}'
      tpl += '{$value}-'
      tpl += '{/foreach}'
      output = '1-2- '
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test continue in foreach', function () {
      tpl = '{$data = [1,2,3,4,5]}'
      tpl += '{foreach $data as $value}'
      tpl += '{if $value == 3} {continue} {/if}'
      tpl += '{$value}-'
      tpl += '{/foreach}'
      output = '1-2- 4-5-'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test foreachelse', function () {
      tpl = '{foreach $data as $value}'
      tpl += '{$value}-'
      tpl += '{foreachelse}'
      tpl += 'dont print'
      tpl += '{/foreach}'
      output = '1-2-3-4-5-'
      t = new jSmart(tpl)
      expect(t.fetch({data: [1, 2, 3, 4, 5]})).toBe(output)

      tpl = '{foreach $data as $value}'
      tpl += '{$value}-'
      tpl += '{foreachelse}'
      tpl += 'print this'
      tpl += '{/foreach}'
      output = 'print this'
      t = new jSmart(tpl)
      expect(t.fetch({data: []})).toBe(output)
    })

    it('test foreach smarty 2 syntax', function () {
      tpl = '{foreach from=$data key="mykey" item="value"}'
      tpl += '{$mykey}-{$value}:'
      tpl += '{/foreach}'
      output = '0-1:1-2:2-3:3-4:4-5:'
      t = new jSmart(tpl)
      expect(t.fetch({data: [1, 2, 3, 4, 5]})).toBe(output)
    })
  })
})
