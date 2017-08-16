define([], function () {
  var
      version = '@VERSION',

      // Define jsmart constructor.
      jSmart = function (template, options) {
        this.init(template, options);
      };

  // Add more properties to jSmart core.
  jSmart.prototype = {

    constructor: jSmart,

    // Current tree structure.
    tree: [],

    // Current javascript files loaded via include_javascript.
    scripts: {},

    // All the modifiers to apply by default to all variables.
    defaultModifiers: [],

    // Filters which are applied to all variables are in 'variable'.
    // Filters which are applied after processing whole templeate are in 'post'.
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

    // Build in functions of the smarty.
    buildInFunctions: {},

    // Plugins of the functions.
    plugins: {},

    // Whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before.
    autoLiteral: true,

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
      foreach: {},

      // All the section block in the current smarty object.
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
    init: function (template, options) {
      if (!options) {
        options = {};
      }
      if (options.rdelim) {
        this.smarty.rdelim = options.rdelim;
      }
      if (options.ldelim) {
        this.smarty.ldelim = options.ldelim;
      }
      if (options.autoLiteral !== undefined) {
        this.autoLiteral = options.autoLiteral;
      }

      // Is template string or at least defined?!
      template = new String(template ? template : '');
      template = this.removeComments(template);
      template = template.replace(/\r\n/g,'\n');
      template = this.applyFilters(this.filtersGlobal.pre, template);

      // Generate the tree.
      this.tree = this.parse(template);
    },

    // Common error interface.
    error: function(msg) {
      throw new Error(msg);
	  },

    // Call the filter for the content.
    applyFilters: function(filters, s) {
      for (var i=0; i<filters.length; ++i) {
        s = filters[i](s);
      }
      return s;
    },

    add: function(thingsToAdd) {
      for (var i in thingsToAdd) {
        if (thingsToAdd.hasOwnProperty(i)) {
          jSmart.prototype[i] = thingsToAdd[i];
        }
      }
    },

    // Find a first {tag} in the string.
    findTag: function(expression, s) {
      var openCount = 0,
          offset = 0,
          i,
          ldelim = this.smarty.ldelim,
          rdelim = this.smarty.rdelim,
          skipInWhitespace = this.autoLiteral,
          expressionAny = /^\s*(.+)\s*$/i,
          expressionTag = expression ? new RegExp('^\\s*('+expression+')\\s*$','i') : expressionAny,
          sTag,
          found;

      for (i = 0; i < s.length; ++i) {
        if (s.substr(i, ldelim.length) == ldelim) {
          if (skipInWhitespace && (i + 1) < s.length && s.substr((i + 1), 1).match(/\s/)) {
            continue;
          }
          if (!openCount) {
            s = s.slice(i);
            offset += parseInt(i);
            i = 0;
          }
          ++openCount;
        } else if (s.substr(i, rdelim.length) == rdelim) {
          if (skipInWhitespace && (i - 1) >= 0 && s.substr((i - 1), 1).match(/\s/)) {
            continue;
          }
          if (!--openCount) {
            sTag = s.slice(ldelim.length, i).replace(/[\r\n]/g, ' '),
            found = sTag.match(expressionTag);
            if (found) {
              found.index = offset;
              found[0] = s.slice(0, (i + rdelim.length));
              return found;
            }
          }
          if (openCount < 0) {
            // Ignore any number of unmatched right delimiters.
            openCount = 0;
          }
        }
      }
      return null;
    },

    // Find closing tag which matches. expressionClose.
    findCloseTag: function(expressionClose, expressionOpen, s) {
      var sInner = ''
          closeTag = null,
          openTag = null,
          findIndex = 0;

      do {
        if (closeTag) {
          findIndex += closeTag[0].length;
        }
        closeTag = this.findTag(expressionClose, s);
        if (!closeTag) {
          this.errpr('Unclosed '+this.smarty.ldelim+expressionOpen+this.smarty.rdelim);
        }
        sInner += s.slice(0, closeTag.index);
        findIndex += closeTag.index;
        s = s.slice((closeTag.index + closeTag[0].length));
        openTag = this.findTag(expressionOpen, sInner);
        if (openTag) {
          sInner = sInner.slice((openTag.index + openTag[0].length));
        }
      } while(openTag);

      closeTag.index = findIndex;
      return closeTag;
    },

    // Parse expression.
    parseExpression: function () {
      var tree = [];
      /*
      while (jSmart.lookUp(s.slice(e.value.length))) {

      }
      if (!tree.length) {
        return false;
      }
      tree = jSmart.composeExpression(e.tree);*/
      return tree;
    },

    // Parse text.
    parseText: function (text) {
      // TODO ?? Add option to parse text inside double quotes.
      return {type: 'text', data: text};
    },

    // Parse the template and generate tree.
    parse: function (tpl) {
      var tree = [],
          openTag,
          tag;
      for (openTag = this.findTag('', tpl); openTag; openTag = this.findTag('', tpl))  {
        if (openTag.index) {
          tree.push(this.parseText(tpl.slice(0, openTag.index)));
        }
        tpl = tpl.slice((openTag.index + openTag[0].length));
        tag = openTag[1].match(/^\s*(\w+)(.*)$/);

        if (tag) {

        } else {
          // Variable.
          this.buildInFunctions.expression.parse.call(this, openTag[1]);
          if (node.type=='build-in' && node.name=='operator' && node.op == '=') {
              tpl = tpl.replace(/^\n/,'');
          }
        }
      }
      if (tpl) {
        tree.push(this.parseText(tpl));
      }
      console.log(tree)
      return tree;
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
          this.error('Unclosed '+this.smarty.ldelim+'*');
        }
        tpl = tpl.slice(closeTag.index+closeTag[0].length);
      }
      return newTpl + tpl;
    }

  };

  return jSmart;
});
