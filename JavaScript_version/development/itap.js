/**
 * Multi-tap and predictive text system emulator
 * 
 * @author Nick Pershin <nikolaiperschin doggi mail punkt ru>
 * @copyright Copyright (c) 2010 Nick Pershin
 */

// 'const' is a Mozilla-specific extension, it is not supported by IE, 
// but has been partially supported by Opera since version 9.0 and Safari
const LIMIT = 15;// how many predictions to show
const DELAY = 700;// cursor delay
const DELIM = " ";//delimiter for word breaks

var App = {
    
    View: {
	/*Object*/	btns: []
	},
	
	Logic: {
	/*Int*/		codes: [],		//T9 codes
    /*Char*/	phrase: [],	//array of chars
	/*Int*/		curPos: 0,		//pointer to the phrase's and codes's index
	/*String*/	wordsBuf: [],	//array to store words
	/*Int*/		wordNum: 0		//pointer to the wordsBuf's index
	},
	
	init: function() 
	{
		var view = this.View;
		// (TODO: it is possible to avoid 'new' if closures will be used instead of prototyping)
		view.btns[0] = new t9Button( $("zero"), [DELIM], 0 );
		view.btns[1] = new t9Button( $("one"), ["'"], 1 );
		view.btns[2] = new t9Button( $("ABC2"), ["a", "b", "c"], 2 );
		view.btns[3] = new t9Button( $("DEF3"), ["d", "e", "f"], 3 );
		view.btns[4] = new t9Button( $("GHI4"), ["g", "h", "i"], 4 );
		view.btns[5] = new t9Button( $("JKL5"), ["j", "k", "l"], 5 );
		view.btns[6] = new t9Button( $("MNO6"), ["m", "n", "o"], 6 );
		view.btns[7] = new t9Button( $("PQRS7"), ["p", "q", "r", "s"], 7 );
		view.btns[8] = new t9Button( $("TUV8"), ["t", "u", "v"], 8 );
		view.btns[9] = new t9Button( $("WXYZ9"), ["w", "x", "y", "z"], 9 );
			
		$("asterisk").addEventListener("click", this.Logic.doBackspace, false);
		$("num").addEventListener("click", view.clear, false);
			
		view.display();
	}
};


/*
 * View methods
 */
(function(the) 
{
	var logic = App.Logic;
	
	// TODO: REFACTORING! зачем каждый раз дергать циклом все батоны, если достаточно запоминать
	// батон, нажатый последним и для него вызывать его метод reset() при нажатии следующей кнопки, 
	// записывая в переменную ссылку на нажатую новую кнопку...
	the.resetBtns = function _resetBtns() {
		for (var i = the.btns.length; i --> 0;) //a little speed up at the expense of loop's presentation loss ;)
			the.btns[i].reset();
	};
	
	
	the.clear = function _clear() {
		the.resetBtns();
		the.setLCDValue("");
		the.clearPredictions();
		logic.clearData();
		the.display();
	};
	
	
	the.clearPredictions = function _clearPredictions() {
		$("predictions").innerHTML = "";
	};
	
	
	the.setLCDValue = function _setLCDValue(val) {
		$("txt").value = val;
	};

	
	//TODO: getter for $("txt").value

	
	the.populatePredictions = function _populatePredictions(arr) {
		var j = 0;
		var cnt = 0;
		while (arr[j] && j < LIMIT) 
		{
			for(var x=0, l=arr[j][1].length; x < l; x++) 
			{
				cnt++;
				if(cnt > LIMIT)
					break;

				//arr[j][0] - Т9 code for inserted word
				$("predictions").innerHTML += "<a href=\"javascript:void(0)\" onclick=\'App.Logic.insertPredicted("+
										arr[j][0]+", \""+arr[j][1][x]+"\");\'>"+arr[j][1][x]+"</a><br/>";
			}
			j++;
		}
	};
	
	
	the.display = function _display() {
		logic.wordsBuf = $("txt").value.split(DELIM);
		logic.wordNum = logic.wordsBuf.length;
		--logic.wordNum;
		
		the.setLCDValue(logic.phrase.join(""));
		$("txt").focus();
		$("txt").setSelectionRange(logic.curPos, logic.curPos);
	};
			
})(App.View);


/*
 * Logic methods
 */
(function(obj) 
{
	var view = App.View;
	
	obj.getCurCode = function _getCurCode() {
		var curCode = this.codes.join("").split(0);
		return curCode[curCode.length - 1];
	};
	
	
	obj.setCurCode = function(code) {
		var q = obj.getCurCode();
		for(var i= q.length; i --> 0;)//a little speed up at the expense of loop's presentation loss ;)
			obj.codes.pop();// pop the last predicted codes

		var c = code.toString();
		for(var j=0, l=c.length; j<l; j++)
			obj.codes.push(parseInt(c[j]));// push the code for inserted word
	};

	
	
	obj.clearData = function _clearData() {
		obj.phrase.length = 0;
		obj.curPos = 0;
		
		obj.wordsBuf.length = 0;
		obj.wordNum = 0;
		
		obj.codes.length = 0;
	};

	
	obj.doBackspace = function _doBackspace() {
		if(obj.phrase.length) {
			view.resetBtns();
			obj.phrase.length--;
			if(obj.curPos)
				obj.curPos--;
			obj.codes.pop();
			obj.makePrediction();
		}
		view.display();
	};

	
	obj.onBtnValueSelected = function _onBtnValueSelected(pointer, code) {
		obj.curPos++;
		pointer = 0;
		obj.codes.push(code);
		if(code)
			obj.makePrediction();
		else
			view.clearPredictions();

		view.display();
	};

	
	obj.makePrediction = function _makePrediction() {
		view.resetBtns();
		var q = obj.getCurCode();
		if(q && q != "") 
		{
			view.clearPredictions();
		
			var qLen = q.length;
			var curCode = q;
			
			var c = dict[q[0]].filter(function(x) {
				if(x[0].length >= qLen)
					return (x[0].substring(0, qLen) == curCode);
				else 
					return false;
			});
			
			view.populatePredictions(c);

		} else 
			view.clearPredictions();
	};
	
	
	obj.insertPredicted = function _insertPredicted(code, val) {
		obj.wordsBuf[obj.wordNum] = val;
		view.setLCDValue(obj.wordsBuf.join(DELIM));
		obj.phrase.length = 0;
		obj.phrase = $("txt").value.split("");
		obj.curPos = obj.phrase.length;
		
		obj.setCurCode(code);

		view.display();
	};

})(App.Logic);




function t9Button(elm, theValues, theCode) {
	if(!elm || !theValues)
		return;
	
	this.values = theValues.concat();// arrays cloning emulation, variant 1
	// this.values = theValues.slice(0);// arrays cloning emulation, variant 2
	
	this.valPos = 0; // pointer to the current symbol for this button
	
	this.timer = null;
	
	var self = this;
	function switchValue() {
		clearTimeout(self.timer);//self.timer = null;
		self.timer = App.Logic.onBtnValueSelected.defer(DELAY, self, [self.valPos, theCode]);
		
		var v = self.values;
		
		App.Logic.phrase[App.Logic.curPos] = v[self.valPos];

		self.valPos++;
		if(self.valPos == v.length)
			self.valPos = 0;
		
		App.View.display();
	}
	
	elm.addEventListener("click", switchValue, false);
	
}

t9Button.prototype.reset = function() {
	clearTimeout(this.timer);
	this.valPos = 0;
	App.View.display();
};



/**
 * UTILS
 */

/**
 * Calls the function after specified quantity of milliseconds within the 'ctx' scope with 'args' arguments.
 * @param {Number} millis
 * @param {Object} ctx
 * @param {Array} args
 * @return {Number} timeout's ID
 */
Function.prototype.defer = function(timeout, ctx, args) {
    var that = this;
    return setTimeout(function() {
        that.apply(ctx, args || []);
    }, timeout);
};


/**
 * get element by id or element
 */
function $(e) {return _$(window,e);}

function _$(wnd,e) {
	_e = (typeof e == "string" ? wnd.document.getElementById(e) : e);
	return (!_e && (wnd.parent != wnd)) ? _$(wnd.parent,e) : _e;
}
