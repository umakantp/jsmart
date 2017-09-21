define(['parser/parser', 'processor/processor', 'util/objectmerge'], function (jSmartParser, jSmartProcessor, objectMerge) {
  var version = '@VERSION'

  /*
   Define jsmart constructor. jSmart object just stores,
   tree, $smarty block and some intialization methods.
   We keep jSmart object light weight as one page or program
   might contain to many jSmart objects.
   Keep parser and processor outside of jSmart objects, help
   us not to store, same parser and processor methods in all
   jSmart object.
  */
  var jSmart = function (template, options) {
    // Smarty object which has version, delimiters, config, current directory
    // and all blocks like PHP Smarty.
    this.smarty = {

      // Blocks in the current smarty object.
      block: {},

      // Used to store state of break;
      'break': false,

      // All the capture blocks in the current smarty object.
      capture: {},

      // Used to store state of continue
      'continue': false,

      // Current counter information. Smarty like feature.
      counter: {},

      // Use by {cycle} custom function to store array and cycle info.
      cycle: {},

      // All the foreach blocks in the current smarty object.
      'foreach': {},

      // All the section blocks in the current smarty object.
      section: {},

      // Current timestamp, when the object is created.
      now: Math.floor(((new Date()).getTime() / 1000)),

      // All the constants defined the current smarty object.
      'const': {},

      // Current configuration.
      config: {},

      // Current directory, underscored name as PHP Smarty does it.
      current_dir: '/',

      // Currrent template.
      template: '',

      // Left delimiter.
      ldelim: '{',

      // Right delimiter.
      rdelim: '}',

      // Current version of jSmart.
      version: version
    }

    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    this.autoLiteral = true

    // Escape html??
    this.escapeHtml = false

    // Currently disabled, will decide in future, what TODO.
    this.debugging = false

    // Store outer blocks below extends.
    this.outerBlocks = {}

    // Stores inner blocks.
    this.blocks = {}

    this.parse(template, options)
  }

  // Add more properties to jSmart core.
  jSmart.prototype = {
    constructor: jSmart,

    // Current tree structure.
    tree: [],

    // Current javascript files loaded via include_javascript.
    scripts: {},

    // List of all modifiers present in the app.
    modifiers: {},

    // All the modifiers to apply by default to all variables.
    defaultModifiers: [],

    // Global modifiers which which can be used in all instances.
    defaultModifiersGlobal: [],

    // Cache for global and default modifiers merged version to apply.
    globalAndDefaultModifiers: [],

    // Filters which are applied to all variables are in 'variable'.
    // Filters which are applied after processing whole template are in 'post'.
    filters: {
      'variable': [],
      'post': []
    },

    // Global filters. pre, post and variable. All of them.
    filtersGlobal: {
      'pre': [],
      'variable': [],
      'post': []
    },

    // Cached value for all default and global variable filters.
    // Only for variable.
    globalAndDefaultFilters: [],

    // Build in functions of the smarty.
    buildInFunctions: {},

    // Plugins of the functions.
    plugins: {},

    // Store current runtime plugins. Generally used for
    // {function} tags.
    runTimePlugins: {},

    // Initialize, jSmart, set settings and parse the template.
    parse: function (template, options) {
      var parsedTemplate
      if (!options) {
        options = {}
      }
      if (options.rdelim) {
        // If delimiters are passed locally take them.
        this.smarty.rdelim = options.rdelim
      } else if (jSmart.prototype.right_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.smarty.rdelim = jSmart.prototype.right_delimiter
      } else {
        // Otherwise default delimiters
        this.smarty.rdelim = '}'
      }
      if (options.ldelim) {
        // If delimiters are passed locally take them.
        this.smarty.ldelim = options.ldelim
      } else if (jSmart.prototype.left_delimiter) {
        // Backward compatible. Old way to set via prototype.
        this.smarty.ldelim = jSmart.prototype.left_delimiter
      } else {
        // Otherwise default delimiters
        this.smarty.ldelim = '{'
      }
      if (options.autoLiteral !== undefined) {
        // If autoLiteral is passed locally, take it.
        this.autoLiteral = options.autoLiteral
      } else if (jSmart.prototype.auto_literal !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.autoLiteral = jSmart.prototype.auto_literal
      }

      if (options.debugging !== undefined) {
        // If debugging is passed locally, take it.
        this.debugging = options.debugging
      }

      if (options.escapeHtml !== undefined) {
        // If escapeHtml is passed locally, take it.
        this.escapeHtml = options.escapeHtml
      } else if (jSmart.prototype.escape_html !== undefined) {
        // Backward compatible. Old way to set via prototype.
        this.escapeHtml = jSmart.prototype.escape_html
      }

      // Is template string or at least defined?!
      template = String(template || '')

      // Generate the tree. We pass delimiters and many config values
      // which are needed by parser to parse like delimiters.
      jSmartParser.clear()
      jSmartParser.rdelim = this.smarty.rdelim
      jSmartParser.ldelim = this.smarty.ldelim
      jSmartParser.getTemplate = this.getTemplate
      jSmartParser.getConfig = this.getConfig
      jSmartParser.autoLiteral = this.autoLiteral
      jSmartParser.plugins = this.plugins
      jSmartParser.preFilters = this.filtersGlobal.pre
      // Above parser config are set, lets parse.
      parsedTemplate = jSmartParser.getParsed(template)
      this.tree = parsedTemplate.tree
      this.runTimePlugins = parsedTemplate.runTimePlugins
      this.blocks = parsedTemplate.blocks
      this.outerBlocks = parsedTemplate.outerBlocks
    },

    // Process the generated tree.
    fetch: function (data) {
      var outputData = ''
      if (!(typeof data === 'object')) {
        data = {}
      }

      // Define smarty inside data and copy smarty vars, so one can use $smarty
      // vars inside templates.
      data.smarty = {}
      objectMerge(data.smarty, this.smarty)

      // Take default global modifiers, add with local default modifiers.
      // Merge them and keep them cached.
      this.globalAndDefaultModifiers = jSmart.prototype.defaultModifiersGlobal.concat(this.defaultModifiers)

      // Take default global filters, add with local default filters.
      // Merge them and keep them cached.
      this.globalAndDefaultFilters = jSmart.prototype.filtersGlobal.variable.concat(this.filters.variable)

      jSmartProcessor.clear()
      jSmartProcessor.plugins = this.plugins
      jSmartProcessor.modifiers = this.modifiers
      jSmartProcessor.defaultModifiers = this.defaultModifiers
      jSmartProcessor.escapeHtml = this.escapeHtml
      jSmartProcessor.variableFilters = this.globalAndDefaultFilters
      jSmartProcessor.runTimePlugins = this.runTimePlugins
      jSmartProcessor.blocks = this.blocks
      jSmartProcessor.outerBlocks = this.outerBlocks

      // Capture the output by processing the template.
      outputData = jSmartProcessor.getProcessed(this.tree, data, this.smarty)

      // Merge back smarty data returned by process to original object.
      objectMerge(this.smarty, outputData.smarty)
      // Apply post filters to output and return the template data.
      return this.applyFilters(jSmart.prototype.filtersGlobal.post.concat(this.filters.post), outputData.output)
    },

    // Apply the filters to template.
    applyFilters: function (filters, tpl) {
      for (var i = 0; i < filters.length; ++i) {
        tpl = filters[i](tpl)
      }
      return tpl
    },

    // Register a plugin.
    registerPlugin: function (type, name, callback) {
      if (type === 'modifier') {
        this.modifiers[name] = callback
      } else {
        this.plugins[name] = {'type': type, 'process': callback}
      }
    },

    // Register a filter.
    registerFilter: function (type, callback) {
      (this.tree ? this.filters : jSmart.prototype.filtersGlobal)[((type === 'output') ? 'post' : type)].push(callback)
    },

    addDefaultModifier: function (modifiers) {
      if (!(modifiers instanceof Array)) {
        modifiers = [modifiers]
      }

      for (var i = 0; i < modifiers.length; ++i) {
        var data = jSmartParser.parseModifiers('|' + modifiers[i], [0])
        if (this.tree) {
          this.defaultModifiers.push(data.tree[0])
        } else {
          this.defaultModifiersGlobal.push(data.tree[0])
        }
      }
    },

    getTemplate: function (name) {
      throw new Error('No template for ' + name)
    },

    getFile: function (name) {
      throw new Error('No file for ' + name)
    },

    getJavascript: function (name) {
      throw new Error('No Javascript for ' + name)
    },

    getConfig: function (name) {
      throw new Error('No config for ' + name)
    }
  }

  return jSmart
})
