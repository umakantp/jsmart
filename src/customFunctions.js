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

  return jSmart
})
