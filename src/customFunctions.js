define(['./core'], function (jSmart) {
  // All built in but custom functions

  jSmart.prototype.registerPlugin(
    'function',
    'counter',
    function (params, data) {
      var name = params.__get('name', 'default')
      if (name in data.smarty.counter) {
        var counter = data.smarty.counter[name]
        if ('start' in params) {
          counter.value = parseInt(params['start'], 10)
        } else {
          counter.value = parseInt(counter.value, 10)
          counter.skip = parseInt(counter.skip, 10)
          if (counter.direction === 'down') {
            counter.value -= counter.skip
          } else {
            counter.value += counter.skip
          }
        }
        counter.skip = params.__get('skip', counter.skip)
        counter.direction = params.__get('direction', counter.direction)
        counter.assign = params.__get('assign', counter.assign)
        data.smarty.counter[name] = counter
      } else {
        data.smarty.counter[name] = {
          value: parseInt(params.__get('start', 1), 10),
          skip: parseInt(params.__get('skip', 1), 10),
          direction: params.__get('direction', 'up'),
          assign: params.__get('assign', false)
        }
      }
      if (data.smarty.counter[name].assign) {
        data[data.smarty.counter[name].assign] = data.smarty.counter[name].value
        return ''
      }
      if (params.__get('print', true)) {
        return data.smarty.counter[name].value
      }
      // User didn't assign and also said, print false.
      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'cycle',
    function (params, data) {
      var name = params.__get('name', 'default')
      var reset = params.__get('reset', false)
      if (!(name in data.smarty.cycle)) {
        data.smarty.cycle[name] = {arr: [''], delimiter: params.__get('delimiter', ','), index: 0}
        reset = true
      }

      if (params.__get('delimiter', false)) {
        data.smarty.cycle[name].delimiter = params.delimiter
      }
      var values = params.__get('values', false)
      if (values) {
        var arr = []
        if (values instanceof Object) {
          for (var nm in values) {
            arr.push(values[nm])
          }
        } else {
          arr = values.split(data.smarty.cycle[name].delimiter)
        }

        if (arr.length !== data.smarty.cycle[name].arr.length || arr[0] !== data.smarty.cycle[name].arr[0]) {
          data.smarty.cycle[name].arr = arr
          data.smarty.cycle[name].index = 0
          reset = true
        }
      }

      if (params.__get('advance', 'true')) {
        data.smarty.cycle[name].index += 1
      }
      if (data.smarty.cycle[name].index >= data.smarty.cycle[name].arr.length || reset) {
        data.smarty.cycle[name].index = 0
      }

      if (params.__get('assign', false)) {
        this.assignVar(params.assign, data.smarty.cycle[name].arr[data.smarty.cycle[name].index], data)
        return ''
      }

      if (params.__get('print', true)) {
        return data.smarty.cycle[name].arr[data.smarty.cycle[name].index]
      }

      return ''
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'eval',
    function (params, data) {
      var s = params.var
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  jSmart.prototype.registerPlugin(
    'function',
    'fetch',
    function (params, data) {
      var s = jSmart.prototype.getFile(params.__get('file', null, 0))
      if ('assign' in params) {
        this.assignVar(params.assign, s, data)
        return ''
      }
      return s
    }
  )

  return jSmart
})
