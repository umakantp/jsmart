define(['./core', 'util/objectmerge'], function (jSmart, ObjectMerge) {

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
      var paramData = [],
          i,
          fname;

      for (i = 0; i < params.length; ++i) {
        paramData.push(params[i]);
      }

      if (('__owner' in data && params.name in data.__owner)) {
        fname = data['__owner'];
        if (params.length) {
          return fname[params.name].apply(fname, params);
        } else {
          // When function doesn't has arguments.
          return fname[params.name].apply(fname);
        }
        // something went wrong.
        return '';
      } else if (jSmart.prototype.modifiers.hasOwnProperty(params.name)) {
        fname = jSmart.prototype.modifiers[params.name]
        return fname.apply(fname, paramData);
      } else {
        fname = params.name;

        if (data[fname]) {
          return data[fname].apply(data[fname], paramData);
        } else if (window[fname]) {
          return window[fname].apply(window[fname], paramData);
        }
        // something went wrong.
        return '';
      }
    }
  );

  return jSmart;
});
