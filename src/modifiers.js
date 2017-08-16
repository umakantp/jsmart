define(['./core', 'util/objectmerge', 'util/executebyobject'], function (jSmart, ObjectMerge, ExecuteByFuncObject) {

  jSmart.prototype.addDefaultModifier = function(modifiers) {
    if (!(modifiers instanceof Array)) {
      modifiers = [modifiers];
    }

    for (var i=0; i<modifiers.length; ++i) {
      var data = this.parseModifiers('|'+modifiers[i], [0]);
      (this.tree ? this.defaultModifiers : this.defaultModifiersGlobal).push(data.tree[0]);
    }
  };

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
          mergedParams;

      for (i = 0; i < params.length; ++i) {
        paramNames.push((params.name + '__p'+i));
        paramData.push(params[i]);
        paramValues[(params.name + '__p' + i)] = params[i];
      }

      mergedParams = ObjectMerge({}, data, paramValues);
      if (('__owner' in data && params.name in data.__owner)) {
        fname = '__owner.'+params.name;
        return execute(fname + '(' + paramNames.join(',') + ')', mergedParams);
      } else if (jSmart.prototype.modifiers.hasOwnProperty(params.name)) {
        fname = jSmart.prototype.modifiers[params.name]
        return ExecuteByFuncObject(fname, paramData, mergedParams);
      } else {
        fname = params.name;
        return execute(fname + '(' + paramNames.join(',') + ')', mergedParams);
      }
    }
  );

  return jSmart;
});
