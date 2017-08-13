var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  paths: {
    text: 'node_modules/requirejs-text/text'
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});

/* Stub data we need to run test cases. */

function TestClassObj() {
  this.prop = 'TestClassObj.prop';
  this.obData = {
      'ob1' : 'test1',
      'ob2' : { 'value' : 'test2' }
  };
  this.func = function() {
      return 'TestClassObj.func';
  };
}

function strayFunc(v1, v2) {
    return v1+','+v2;
};

function strayNoArgs() {
      return 'bar';
};

function getData(){
    return {
        'foo' : 'bar',
        'a' : ['0','1','2','3','4','5','6','7','8','9'],
        'a2' : ['0',{baz:'baz'}],
        'o' : { '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9' },
        'ob' : {
            'prop1': 'prop1',
            'prop2': { 'txt':'txt', 'num':777, 'bool_true': 1 }
        },
        'round': 2,
        'rounda': 2.1324,
        'code' : '[{$ob.prop2.txt}]',
        'num': 7,
        'books': [
            {
                    'title'  : 'JavaScript: The Definitive Guide',
            'author' : 'David Flanagan',
            'price'  : '31.18'
            },
            {
            'title'  : 'Murach JavaScript and DOM Scripting',
            'author' : 'Ray Harris',
            'price' : ''
            },
            {
            'title'  : 'Head First JavaScript',
            'author' : 'Michael Morrison',
            'price'  : '29.54'
            }
        ],
        'long_text': "\nfirst paragraph. Second sentence. \nNext paragraph. AAAAA.    Third sentence \n\n\n Third paragraph\n",
        'aEmpty' : [],
        'oEmpty': {},
        'sEmpty' : '',
        'nullVar': null,
        'textWithHTML': '<span style="color:red;"><i><b>foo</b></i></span>',
        'textWithHTMLEntities': 'Germans use &quot;mlauts&quot; and pay in euro',
        'testClassObj': new TestClassObj,
        'escapeHtml': '<span style="color:red;"><i><b>foo</b></i></span>',
        'setNull': null
    };
}
