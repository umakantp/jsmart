define(['parser/parser', 'processor/processor'], function (jSmartParser, jSmartProcessor) {
  var
      version = '@VERSION',

      /*
       Define jsmart constructor. jSmart object just stores,
       tree, $smarty block and some intialization methods.
       We keep jSmart object light weight as one page or program
       might contain to many jSmart objects.
       Keep parser and processor outside of jSmart objects, help
       us not to store, same parser and processor methods in all
       jSmart object.
      */
      jSmart = function (template, options) {
        this.parse(template, options);
      };

  // Add more properties to jSmart core.
  jSmart.prototype = {

    constructor: jSmart,

    // Current tree structure.
    tree: [],

    // Current javascript files loaded via include_javascript.
    scripts: {},

    // List of all modifiers present in the app.
    modifiers: [],

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

    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    autoLiteral: true,

    // Escape html??
    escapeHtml: false,

    // Currently disabled, will decide in future, what TODO.
    debugging: false,

    // Smarty object which has version, delimiters, config, current directory
    // and all blocks like PHP Smarty.
    smarty: {

      // Blocks in the current smarty object.
      block: {},

      // TODO:: Yet to figure out, what it is.
      'break': false,

      // All the capture blocks in the current smarty object.
      capture: {},

      // TODO:: Yet to figure out, what it is.
      'continue': false,

      // Current counter information. Smarty like feature.
      counter: {},

      // TODO:: Yet to figure out, what it is.
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
    },

    // Initialize, jSmart, set settings and parse the template.
    parse: function (template, options) {
      var parsedTemplate;

      if (!options) {
        options = {};
      }
      if (options.rdelim) {
        // If delimiters are passed locally take them.
        this.smarty.rdelim = options.rdelim;
      } else if (jSmart.prototype.right_delimiter) {
        // If no delimiters are passed locally, take global if present.
        this.smarty.rdelim = jSmart.prototype.right_delimiter;
      }
      if (options.ldelim) {
        // If delimiters are passed locally take them.
        this.smarty.ldelim = options.ldelim;
      } else if (jSmart.prototype.left_delimiter) {
        // If no delimiters are passed locally, take global if present.
        this.smarty.ldelim = jSmart.prototype.left_delimiter;
      }
      if (options.autoLiteral !== undefined) {
        // If autoLiteral is passed locally, take it.
        this.autoLiteral = options.autoLiteral;
      } else if (jSmart.prototype.auto_literal !== undefined) {
        // If no autoLiteral is passed locally, take global if present.
        this.autoLiteral = jSmart.prototype.auto_literal;
      }

      if (options.debugging !== undefined) {
        // If debugging is passed locally, take it.
        this.debugging = options.debugging;
      } else if (jSmart.prototype.debugging !== undefined) {
        // If no debugging is passed locally, take global if present.
        this.debugging = jSmart.prototype.debugging;
      }

      // Is template string or at least defined?!
      template = new String(template ? template : '');
      // Remove comments, we never want them.
      template = this.removeComments(template);
      // Make use of linux new comments. It will be consistent across all templates.
      template = template.replace(/\r\n/g,'\n');
      // Apply global pre filters to the template. These are global filters,
      // so we take it from global object, rather than taking it as args to
      // "new jSmart()" object.
      template = this.applyFilters(jSmart.prototype.filtersGlobal.pre, template);

      // Generate the tree. We pass "this", so Parser can read jSmart.*
      // config values. Please note that, jSmart.* are not supposed to be
      // modified in parsers. We get them here and then update jSmart object.

      this.tree = jSmartParser.getParsed(template, this);
    },

    // Process the generated tree.
    fetch: function (data) {
      var outputData = '';
      if (!(typeof data == 'object')) {
        data = {};
      }
      // Define smarty inside data and copy smarty vars, so one can use $smarty
      // vars inside templates.
      data.smarty = {};
      ObjectMerge(data.smarty, this.smarty);

      // Take default global modifiers, add with local default modifiers.
      // Merge them and keep them cached.
      this.globalAndDefaultModifiers = jSmart.prototype.defaultModifiersGlobal.concat(this.defaultModifiers);


      // Take default global filters, add with local default filters.
      // Merge them and keep them cached.
      this.globalAndDefaultFilters = jSmart.prototype.filtersGlobal.variable.concat(this.filters.variable);

      // Capture the output by processing the template.
      outputData = jSmartProcessor.getProcessed(this.tree, data, this);

      // Merge back smarty data returned by process to original object.
      ObjectMerge(this.smarty, outputData.smarty);
      // Apply post filters to output and return the template data.
      return this.applyFilters(jSmart.prototype.filtersGlobal.post.concat(this.filters.post), outputData.output);
    },

    // Apply the filters to template.
    applyFilters: function(filters, tpl) {
      for (var i=0; i<filters.length; ++i) {
        tpl = filters[i](tpl);
      }
      return tpl;
    },

    // Remove comments. We do not want to parse them anyway.
    removeComments: function (tpl) {
      var ldelim = new RegExp(this.smarty.ldelim+'\\*'),
          rdelim = new RegExp('\\*'+this.smarty.rdelim),
          newTpl = '';

      for (var openTag=tpl.match(ldelim); openTag; openTag=tpl.match(rdelim)) {
        newTpl += tpl.slice(0,openTag.index);
        s = tpl.slice(openTag.index+openTag[0].length);
        var closeTag = tpl.match(rDelim);
        if (!closeTag)
        {
          throw new Error('Unclosed '+this.smarty.ldelim+'*');
        }
        tpl = tpl.slice(closeTag.index+closeTag[0].length);
      }
      return newTpl + tpl;
    },

    // Register a plugin.
    registerPlugin: function (type, name, callback) {
      if (type == 'modifier') {
        this.modifiers[name] = callback;
      } else {
        this.plugins[name] = {'type': type, 'process': callback};
      }
    },

    // Register a filter.
    registerFilter: function(type, callback) {
        (this.tree ? this.filters : jSmart.prototype.filtersGlobal)[((type == 'output') ? 'post' : type)].push(callback);
    },

    add: function(thingsToAdd) {
      for (var i in thingsToAdd) {
        if (thingsToAdd.hasOwnProperty(i)) {
          jSmart.prototype[i] = thingsToAdd[i];
        }
      }
    },

    addDefaultModifier: function(modifiers) {
      if (!(modifiers instanceof Array)) {
        modifiers = [modifiers];
      }

      for (var i=0; i<modifiers.length; ++i) {
        var data = jSmartParser.parseModifiers('|'+modifiers[i], [0]);
        (this.tree ? this.defaultModifiers : this.defaultModifiersGlobal).push(data.tree[0]);
      }
    }
  };

  return jSmart;
});
