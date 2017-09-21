define(['jSmart'], function (jSmart) {
  describe('Test build-in function:: section', function () {
    var tpl
    var output
    var t

    it('test simple section', function () {
      // Simple
      tpl = '{section name=person loop=$people}'
      tpl += '{$people[person]}\\n'
      tpl += '{/section}'
      output = 'Uma\\nPallavi\\nLokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test index in section', function () {
      // index
      tpl = '{section name=person loop=$people}'
      tpl += '{$smarty.section.person.index} => {$people[person]}\\n'
      tpl += '{/section}'
      output = '0 => Uma\\n1 => Pallavi\\n2 => Lokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test without array section', function () {
      tpl = '{section name=fooNew start=10 loop=20 step=2}'
      tpl += '{$smarty.section.fooNew.index}\\n'
      tpl += '{/section}'
      output = '10\\n12\\n14\\n16\\n18\\n'
      t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test associative in section', function () {
      tpl = '{section name=person loop=$people}'
      tpl += '{$people[person].name}\\n'
      tpl += '{/section}'
      output = 'Uma\\nPallavi\\nLokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: [{name: 'Uma'}, {name: 'Pallavi'}, {name: 'Lokesh'}]})).toBe(output)
    })

    it('test loop in section', function () {
      tpl = '{section name=customer loop=$custid}'
      tpl += '{$custid[customer]}-'
      tpl += '{$name[customer]}\\n'
      tpl += '{/section}'
      output = '1-Uma\\n2-Pallavi\\n3-Lokesh\\n'
      t = new jSmart(tpl)
      expect(t.fetch({
        custid: [1, 2, 3],
        name: ['Uma', 'Pallavi', 'Lokesh']
      })).toBe(output)
    })

    it('test simple sectionelse', function () {
      tpl = '{section name=person loop=$people}'
      tpl += '{$people[person].name}\\n'
      tpl += '{sectionelse}'
      tpl += 'no data'
      tpl += '{/section}'
      output = 'no data'
      t = new jSmart(tpl)
      expect(t.fetch({people: []})).toBe(output)
    })

    it('test index_* property in section', function () {
      tpl = '{section name=person loop=$people}'
      tpl += '{$smarty.section.person.index}=>{$people[person]}:'
      tpl += '{$smarty.section.person.index_prev}=>{$smarty.section.person.index_next}\\n'
      tpl += '{/section}'
      output = '0=>Uma:-1=>1\\n1=>Pallavi:0=>2\\n2=>Lokesh:1=>3\\n'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test simple iteration property in section', function () {
      tpl = '{section name=cu loop=$arr start=5 step=2}'
      tpl += 'iteration={$smarty.section.cu.iteration}:'
      tpl += 'index={$smarty.section.cu.index}:'
      tpl += 'id={$arr[cu]}/'
      tpl += '{/section}'
      output = 'iteration=1:index=5:id=205/'
      output += 'iteration=2:index=7:id=207/'
      output += 'iteration=3:index=9:id=209/'
      output += 'iteration=4:index=11:id=211/'
      t = new jSmart(tpl)
      expect(t.fetch({arr: [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212]})).toBe(output)
    })

    it('test first and last property in section', function () {
      tpl = '{section name=person loop=$people}'
      tpl += '{if $smarty.section.person.first}List of names =>{/if}'
      tpl += '{$people[person]}:'
      tpl += '{/section}'
      output = 'List of names =>Uma:Pallavi:Lokesh:'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)

      tpl = '{section name=person loop=$people}'
      tpl += '{$people[person]}'
      tpl += '{if !$smarty.section.person.last}:{/if}'
      tpl += '{/section}'
      output = 'Uma:Pallavi:Lokesh'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test loop property section', function () {
      tpl = '{section name=person loop=$people}'
      tpl += '{$people[person]}\\n'
      tpl += '{/section} Total: {$smarty.section.person.loop}.'
      output = 'Uma\\nPallavi\\nLokesh\\n Total: 3.'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test show property section', function () {
      tpl = '{section name=person loop=$people show=$toShow}'
      tpl += '{$people[person]}\\n'
      tpl += '{sectionelse}'
      tpl += 'yo\\n'
      tpl += '{/section} {if $smarty.section.person.show}true{/if}'
      output = 'Uma\\nPallavi\\nLokesh\\n true'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh'], toShow: true})).toBe(output)

      tpl = '{section name=person loop=$people show=$toShow}'
      tpl += '{$people[person]}\\n'
      tpl += '{sectionelse}'
      tpl += 'yo\\n'
      tpl += '{/section} {if !$smarty.section.person.show}true{/if}'
      output = 'yo\\n true'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh'], toShow: false})).toBe(output)
    })

    it('test total property section', function () {
      tpl = '{section name=person loop=$people}'
      tpl += '{$people[person]}\\n'
      tpl += '{/section} Total: {$smarty.section.person.total}.'
      output = 'Uma\\nPallavi\\nLokesh\\n Total: 3.'
      t = new jSmart(tpl)
      expect(t.fetch({people: ['Uma', 'Pallavi', 'Lokesh']})).toBe(output)
    })

    it('test nested section', function () {
      tpl = '{section name=person loop=$ids}'
      tpl += '----------------\\n'
      tpl += 'id: {$ids[person]}\\n'
      tpl += '{section name=name loop=$names[person]}'
      tpl += '{$names[person][name]}\\n'
      tpl += '{/section}'
      tpl += '----------------\\n'
      tpl += '{/section}'

      output = '----------------\\n'
      output += 'id: 1\\n'
      output += 'data1\\n'
      output += 'data2\\n'
      output += '----------------\\n'
      output += '----------------\\n'
      output += 'id: 2\\n'
      output += 'data3\\n'
      output += 'data4\\n'
      output += '----------------\\n'
      output += '----------------\\n'
      output += 'id: 3\\n'
      output += '----------------\\n'

      t = new jSmart(tpl)
      expect(t.fetch({ids: [1, 2, 3], names: [['data1', 'data2'], ['data3', 'data4']]})).toBe(output)
    })
  })
})
