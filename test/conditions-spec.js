define(['jSmart', 'text!./templates/if.tpl', 'text!./output/if.tpl'], function(jSmart, smartyTpl, outputTpl) {
  describe("Test Conditions", function() {
    jSmart.prototype.registerPlugin(
      'function',
      'isEmptyStr',
      function (params, data) {
        return (params.s.length == 0);
      }
    );

    jSmart.prototype.registerPlugin(
  	    'function',
  	    'sayHello',
  	    function (params, data) {
  	        var s = 'Hello ';
  	            s += params.to;
  	        return s;
  	    }
  	);

    it("test simple if else", function() {
      var tpl = "{if $x}";
      tpl += "it works";
      tpl += "{/if}";
  	  tpl += "|";
      tpl += "{if $y}";
      tpl += "nope";
      tpl += "{else if false}";
      tpl += "once again nope";
    	tpl += "{elseif $x}";
    	tpl += "yo works";
    	tpl += "{/if}";
    	tpl += "|";
    	tpl += "{if false}";
    	tpl += "wont go here";
    	tpl += "{elseif $y}";
    	tpl += "yo works again";
    	tpl += "{else}";
    	tpl += "and it works";
      tpl += "{/if}";

      var output = 'it works|yo works|and it works';

      var t = new jSmart(tpl);
      expect(t.fetch({x: true, y: 0})).toBe(output);
    });

    it("test nested if else", function() {
      var tpl = "{if $x}";
      tpl += "insideX-";
    	tpl += "{if $y}";
    	tpl += "insideY-";
    	tpl += "{else}";
    	tpl += "insideElseOfY-";
    	tpl += "{if false}";
    	tpl += "insideFalse-";
    	tpl += "{else if true}";
    	tpl += "insideTrue-";
    	tpl += "{/if}";
    	tpl += "{/if}";
      tpl += "{/if}";

      var output = 'insideX-insideElseOfY-insideTrue-';

      var t = new jSmart(tpl);
      expect(t.fetch({x: true, y: 0})).toBe(output);

  	//TODO:: Make {if (2*3) or (1*5)} work correctly.

  	var tpl = "{if 'what'}";
      tpl += "insideWhat-";
    	tpl += "{if $z.a.b}";
    	tpl += "insideY-";
    	tpl += "{if 'makeItLarge' and $z['a']['b']}";
    	tpl += "insideMakeit-";
    	tpl += "{if 5 || ''}";
    	tpl += "insideBlank-";
    	tpl += "{if '1' or (1*5)}";
    	tpl += "insideFinal-";
    	tpl += "{/if}";
    	tpl += "{else}";
    	tpl += "insideElseOfBlank-";
    	tpl += "{/if}";
    	tpl += "{elseif 0}";
    	tpl += "insideElseOfMakeit-";
    	tpl += "{/if}";
    	tpl += "{else}";
    	tpl += "insideElseOfY-";
    	tpl += "{if false}";
    	tpl += "insideFalse-";
    	tpl += "{else if true}";
    	tpl += "insideTrue-";
    	tpl += "{/if}";
    	tpl += "{/if}";
      tpl += "{/if}";

      var output = 'insideWhat-insideY-insideMakeit-insideBlank-insideFinal-';

      var t = new jSmart(tpl);
      expect(t.fetch({x: false, y: 'yo', z: {a: {b: true}}})).toBe(output);
    });

    
    it("test complex template", function() {
			// Insert complex statements in the template and test them.
			var t = new jSmart(smartyTpl);
	    expect(t.fetch(getData())).toBe(outputTpl);
	  });
  });
});
