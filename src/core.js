define(['template', 'parser/parser', 'processor/processor', 'util/objectmerge'], function (Template, jSmartParser, jSmartProcessor, objectMerge) {
  'use strict'

  var version = '@VERSION'

  /*
   Define jsmart constructor. jSmart object just stores the config value.
   Parsing of template has to be done by Template class.
  */
  var jSmart = function (template, options) {
    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    this.autoLiteral = true

    // Escape html while printing.
    this.escapeHtml = false

    // If user wants debug to be enabled.
    this.debugging = false

    // Default left delimiter.
    this.leftDelimiter = '{'

    // Default right delimiter.
    this.rightDelimiter = '}'

    if (typeof options !== 'object') {
      options = {}
    }
    this.setConfig(options)

    if (typeof template === 'string') {
      this.fetch(template, true)
    }
  }

  // Add more properties to jSmart core.
  jSmart.prototype = {
    constructor: jSmart,

    // Current version of jSmart.
    version: version,

    // Store previous parsed object.
    // For backward compatibility.
    t: null,

    // Current tree structure.
    // For backward compatibility.
    tree: [],

    // Current data for the template.
    data: {},

    // List of all modifiers present in the app.
    registeredModifiers: {},

    // Plugins registered
    registeredPlugins: {},

    // Pre, post, output and variable. All of them.
    registeredFilters: {
      pre: [],
      variable: [],
      post: [],
      output: []
    },

    // Modifiers to be use on all tags.
    // var j = jSmart();
    // j.addDefaultModifier(...);
    // j.display('index.tpl');
    defaultModifiers: [],

    // Assign the data.
    assign: function (variable, value) {
      this.data[variable] = value
    },

    // New api, loads the template and parses
    // Old api, process the data and processes template.
    fetch: function (pathOrData, isTemplate) {
      if (pathOrData === 'string') {
        // This is path or template.
        if (isTemplate) {
          // This is template string
          this.t = new Template(pathOrData, this)
        } else {
          // This is file path. Lets load the files and get the data.
          var data = this.getTemplate(pathOrData)
          this.t = new Template(data, this)
        }
        this.process(this.t, this)
      } else {
        // They are assigning the data. Lets assign data and processor.
        // For backward compatibility
        if (pathOrData === 'object') {
          for (var i in pathOrData) {
            if (pathOrData.hasOwnProperty(i)) {
              this.assign(i, pathOrData[i])
            }
          }
        }
        this.process(this.t, this)
      }
    },

    display: function (path) {
      this.fetch(path)
    },

    // Set config for this instance
    setConfig: function (configObj) {
      if (configObj.rdelim) {
        this.rightDelimiter = configObj.rdelim
      } else if (jSmart.prototype.right_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.rightDelimiter = jSmart.prototype.right_delimiter
      }

      if (configObj.ldelim) {
        // If delimiters are passed locally take them.
        this.leftDelimiter = configObj.ldelim
      } else if (jSmart.prototype.left_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.leftDelimiter = jSmart.prototype.left_delimiter
      }

      if (configObj.autoLiteral !== undefined) {
        // If autoLiteral is passed locally, take it.
        this.autoLiteral = configObj.autoLiteral
      } else if (jSmart.prototype.auto_literal !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.autoLiteral = jSmart.prototype.auto_literal
      }

      if (configObj.debugging !== undefined) {
        // If debugging is passed locally, take it.
        this.debugging = configObj.debugging
      }

      if (configObj.escapeHtml !== undefined) {
        // If escapeHtml is passed locally, take it.
        this.escapeHtml = configObj.escapeHtml
      } else if (jSmart.prototype.escape_html !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.escapeHtml = jSmart.prototype.escape_html
      }
    },

    // Register a plugin.
    registerPlugin: function (type, name, callback) {
      if (type === 'modifier') {
        this.registeredModifiers[name] = callback
      } else {
        this.registeredPlugins[name] = {'type': type, 'process': callback}
      }
    },

    // Register a filter.
    registerFilter: function (type, callback) {
      this.registeredFilters[type].push(callback)
    },

    addDefaultModifier: function (modifiers) {
      if (!(modifiers instanceof Array)) {
        modifiers = [modifiers]
      }

      for (var i = 0; i < modifiers.length; ++i) {
        // TODO, remove parser from here.
        var data = jSmartParser.parseModifiers('|' + modifiers[i], [0])
        this.defaultModifiers.push(data.tree[0])
      }
    },

    // @override
    // Reads & returns the template data in sync
    getTemplate: function (name) {
      throw new Error('No template for ' + name)
    },

    // @override
    // Reads & returns data for {fetch} tag file.
    getFile: function (name) {
      throw new Error('No file for ' + name)
    },

    // @override
    // Reads & returns config file for {config_load} tag.
    // Mostly same as getTemplate.
    getConfig: function (name) {
      throw new Error('No config for ' + name)
    }
  }

  return jSmart
})
