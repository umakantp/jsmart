define(['jSmart'], function (jSmart) {
  describe('Test Operators', function () {
    it('test increment/decrement', function () {
      expect((new jSmart('{$a=2} {$a++} {++$a}')).fetch()).toBe(' 2 4')

      expect((new jSmart('{$a=4} {$a--} {--$a}')).fetch()).toBe(' 4 2')
    })

    it('test not', function () {
      var t = new jSmart('{$a=0} {$b=1} {if !$a}print this{/if} {if !$b}dont print this{/if}')
      expect(t.fetch()).toBe('  print this ')

      expect((new jSmart('{$a=0} {if not $a}print{/if}')).fetch()).toBe(' print')
    })

    it('test multiply/divide', function () {
      var t = new jSmart('{$a=1} {$b=2} {$a*$b} {$c=10} {$b-$c}')
      expect(t.fetch()).toBe('  2  -8')
    })

    it('test modulous', function () {
      var t = new jSmart('{$a=10} {$b=3} {$a mod $b}')
      expect(t.fetch()).toBe('  1')
    })

    it('test add/sub', function () {
      var t = new jSmart('{$a=10} {$b=5} {$c=2} {$a+$b} {$b-$c}')
      expect(t.fetch()).toBe('   15 3')
    })

    it('test greater than', function () {
      var t = new jSmart('{if 5 > 2}yes{/if} {if 600 gt 200}yo{/if} {if 3 > 5}no{/if}')
      expect(t.fetch()).toBe('yes yo ')
    })

    it('test greater than equal', function () {
      var t = new jSmart('{if 5 >= 2}yes{/if} {if 600 gte 200}yo{/if} {if 600 ge 200}yup{/if} {if 3 >= 5}no{/if}')
      expect(t.fetch()).toBe('yes yo yup ')
    })

    it('test less than', function () {
      var t = new jSmart('{if 2 < 5}yes{/if} {if 200 lt 600}yo{/if} {if 5 < 3}no{/if}')
      expect(t.fetch()).toBe('yes yo ')
    })

    it('test less than equal', function () {
      var t = new jSmart('{if 2 <= 5}yes{/if} {if 200 lte 600}yo{/if} {if 200 le 600}yup{/if} {if 5 <= 3}no{/if}')
      expect(t.fetch()).toBe('yes yo yup ')
    })

    it('test equal/not equal', function () {
      var t = new jSmart("{if 5==5}yes1{/if} {if 5=='5'}yes2{/if} {if true=='1'}yes3{/if} {if true=='true'}yo{/if} {if 'bleh'=='bleh'}yup{/if}  {if 0=='1'}no{/if} {if 'ble'=='bleh'}naah{/if}")
      expect(t.fetch()).toBe('yes1 yes2 yes3  yup   ')

      t = new jSmart("{if 5 eq 5}yes1{/if} {if 5 eq '5'}yes2{/if} {if true eq '1'}yes3{/if} {if true eq 'true'}yo{/if} {if 'bleh' eq 'bleh'}yup{/if}  {if 0 eq '1'}no{/if} {if 'ble' eq 'bleh'}naah{/if}")
      expect(t.fetch()).toBe('yes1 yes2 yes3  yup   ')

      t = new jSmart("{if 4 != 4}no{/if} {if 4 != '4'}no{/if} {if '4' != 4}no{/if} {if '4' != '4'}no{/if} {if '3' != '4'}yes1{/if} {if true != false}yes2{/if} {if 'umakant' != 'Umakant'}yes3{/if}")
      expect(t.fetch()).toBe('    yes1 yes2 yes3')

      t = new jSmart("{if 4 neq 4}no{/if} {if 4 neq '4'}no{/if} {if '4' neq 4}no{/if} {if '4' neq '4'}no{/if} {if '3' neq '4'}yes1{/if} {if true neq false}yes2{/if} {if 'umakant' neq 'Umakant'}yes3{/if}")
      expect(t.fetch()).toBe('    yes1 yes2 yes3')
    })

    it('test identity equal/not equal', function () {
      // TODO:: false !== '' should return true.
      var t = new jSmart("{if 2 !== '2'}yes1{/if} {if false !== ''}yes2{/if} {if false !== false}no1{/if} {if 'uma' !== 'uma'}no2{/if} {if 'uma' !== 'umakant'}yup3{/if}")
      expect(t.fetch()).toBe('yes1    yup3')

      // TODO:: false === '' should return false.
      t = new jSmart("{if 2 === '2'}yes1{/if} {if false === ''}yes2{/if} {if false === false}no1{/if} {if 'uma' === 'uma'}no2{/if} {if 'uma' === 'umakant'}yup3{/if}")
      expect(t.fetch()).toBe(' yes2 no1 no2 ')
    })

    it('test operators priority', function () {
      var t = new jSmart('{if $a % $b == 0}test1{/if} {if $a % $b != 5}test2{/if}')
      expect(t.fetch({a: 15, b: 3})).toBe('test1 test2')

      t = new jSmart('{if $a is not div by 4}test1{/if} {if $a is div by 5}test2{/if}')
      expect(t.fetch({a: 15, b: 10})).toBe('test1 test2')

      t = new jSmart('{if $c is not even}test-1{/if} {if $b is even}test0{/if} {if $a is not even by $b}test1{/if} {if $a is even by $c}test2{/if} {if ($a/$b) % 2  != 0}test3{/if} {if ($a/$c)%2 == 0}test4{/if}')
      expect(t.fetch({a: 6, b: 2, c: 3})).toBe('test-1 test0 test1 test2 test3 test4')

      t = new jSmart('{if $b is not odd}test-1{/if} {if $c is odd}test0{/if} {if $a is not odd by $c}test1{/if} {if $a is odd by $b}test2{/if} {if ($a/$b) % 2  != 0}test3{/if} {if ($a/$c)%2 == 0}test4{/if}')
      expect(t.fetch({a: 6, b: 2, c: 3})).toBe('test-1 test0 test1 test2 test3 test4')
    })

    it('test and/or/xor', function () {
      var t = new jSmart("{if true && true}test1{/if} {if true and false}test2{/if} {if 1 and true}test3{/if} {if 'test' and true}test4{/if} {if 'test' &&  'test'}test5{/if} {if $a and $b}test6{/if} {if $a && $c}test7{/if}")
      expect(t.fetch({a: true, b: false, c: 'yo'})).toBe('test1  test3 test4 test5  test7')

      t = new jSmart("{if true || true}test1{/if} {if true or false}test2{/if} {if 1 or true}test3{/if} {if 'test' or true}test4{/if} {if 'test' ||  'test'}test5{/if} {if $a || $b}test6{/if} {if $a || $c}test7{/if}")
      expect(t.fetch({a: false, b: false, c: 'yo'})).toBe('test1 test2 test3 test4 test5  test7')

      t = new jSmart("{if false xor false}test1{/if} {if true xor false}test2{/if} {if 1 xor true}test3{/if} {if 'test' xor true}test4{/if} {if $a xor $b}test5{/if} {if $a xor $c}test6{/if} {if $b xor $d}test7{/if}")
      expect(t.fetch({a: false, b: true, c: false, d: true})).toBe(' test2   test5  ')

      t = new jSmart('{if ($a || $b) && !($a && $b)}test1{/if} {if ($a || $c) && !($a && $c)}test2{/if}')
      expect(t.fetch({a: false, b: true, c: false, d: true})).toBe('test1 ')
    })
  })
})
