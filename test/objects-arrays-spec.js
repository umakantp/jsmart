define(['jSmart'], function (jSmart) {
  describe('Test Objects and Arrays', function () {
    it('test array', function () {
      var tpl = "{$person = [name=>[first=>'Pallavi'],age=>36]}"
      tpl += "{$person.name.last = 'Patil'}"
      tpl += "{$person['favorite gadget'] = 'iPad'}"
      tpl += "I am {$person.name.first} {$person.name.last} and I like my {$person['favorite gadget']}"
      tpl += "{$days = ['Sun','Mon','Tue']}"
      tpl += "{$days[] = 'Wed'}"
      tpl += 'Today is {$days[3]}'

      var output = 'I am Pallavi Patil and I like my iPad'
      output += 'Today is Wed'

      var t = new jSmart(tpl)
      expect(t.fetch()).toBe(output)
    })

    it('test object', function () {
      var Person = function () {
        this.name = {
          first: 'Umakant',
          last: 'Patil'
        }
        this.age = 31
      }

      Person.prototype.getName = function (nameType) {
        return nameType === 'last' ? this.name.last : this.name.first
      }

      expect((new jSmart("{$human->getName('first')} {$human->getName('last')} of age {$human->age}")).fetch({
        human: new Person()
      })).toBe('Umakant Patil of age 31')
    })
  })
})
