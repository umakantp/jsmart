define(['./core', 'util/objectmerge', 'util/executebyobject'], function (jSmart, ObjectMerge, ExecuteByFuncObject) {

  jSmart.prototype.registerPlugin(
    'function',
    '__quoted',
    function(params, data) {
      return params.join('');
    }
  );

  // Register __array which gets called for all arrays.
  jSmart.prototype.registerPlugin(
    'function',
    '__array',
    function(params, data) {
      var a = [];
      for (var name in params) {
        if (params.hasOwnProperty(name) && params[name] && typeof params[name] != 'function') {
          a[name] = params[name];
        }
      }
      return a;
    }
  );

  // Register __func which gets called for all modifiers and function calls.
  jSmart.prototype.registerPlugin(
    'function',
    '__func',
    function(params, data) {
      var paramNames = [],
          paramValues = {},
          paramData = [],
          i,
          fname,
          mergedData;

      for (i = 0; i < params.length; ++i) {
        paramNames.push((params.name + '__p'+i));
        paramData.push(params[i]);
        paramValues[(params.name + '__p' + i)] = params[i];
      }

      mergedData = ObjectMerge({}, data, paramValues);
      if (('__owner' in data && params.name in data.__owner)) {
        fname = '__owner.'+params.name;
        return execute(fname + '(' + paramNames.join(',') + ')', mergedData);
      } else if (jSmart.prototype.modifiers.hasOwnProperty(params.name)) {
        fname = jSmart.prototype.modifiers[params.name]
        return ExecuteByFuncObject(fname, paramData);
      } else {
        fname = params.name;
        if (paramNames.length) {
          var values = [];
          // When function has arguments.
          for(var i=0; i<paramNames.length; i++) {
            values.push(mergedData[paramNames[i]]);
          }
          return ExecuteByFuncObject(window[fname], values);
        } else {
          // When function doesn't has arguments.
          return ExecuteByFuncObject(window[fname]);
        }
      }
    }
  );

  return jSmart;
});
