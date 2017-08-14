class TestModeApi {
	constructor(iframe) {
		this.iframe = iframe;
	}

	type(id, value) {
		this.iframe.contentDocument.getElementById(id).value = value;
	}

	click(selector) {
		this.iframe.contentDocument.querySelector(selector).click();
	}

	visit(url) {
		this.iframe.src = url;
	}

	// type(id, value) {
	// 	let element = this.iframe.contentDocument.getElementById(id);

	// 	for (let i = 0; i < value.length; i++) {
	// 		let options = {
	// 			bubbles: true,
	// 			cancelable: true,
	// 			key: value[i],
	// 			char: value[i],
	// 			code: `Key${value[i].toUpperCase()}`,
	// 			which: value[i].charCodeAt(),
	// 			keyCode: value[i].charCodeAt()
	// 		},
	// 			keyDown = new KeyboardEvent("keydown", options),
	// 			keyUp = new KeyboardEvent("keyup", options),
	// 			keyPress = new KeyboardEvent("keypress", options);

	// 		event = new Event("keydown", {
	// 			bubbles: true,
	// 			cancelable: true
	// 		});

	// 		charCodeAt = key;
	// 		charCode = 0;
	// 		keyCode = charCodeAt;
	// 		which = charCodeAt;

	// 		event = Object.assign(event, {
	// 			charCode: charCode,
	// 			detail: 0,
	// 			keyCode: keyCode,
	// 			layerX: 0,
	// 			layerY: 0,
	// 			pageX: 0,
	// 			pageY: 0,
	// 			view: options.window,
	// 			which: which
	// 		});

	// 		element.dispatchEvent(keyDown);
	// 		element.dispatchEvent(keyUp);
	// 		element.dispatchEvent(keyPress);
	// 	}
	// }

	_generateEvent(eventName) {
		let event = new Event(eventName, { bubbles: true, cancelable: true });
		event.keyCode = 13;

		return event;
	}

	pressEnter(id) {
		// const element = this.iframe.contentDocument.getElementById(id);
		
		// element.dispatchEvent(this._generateEvent('keydown'));
		// element.dispatchEvent(this._generateEvent('keyup'));
		var actualCode = '// Some code example \n' + 
		                 'event = new Event("keydown", { bubbles: true, cancelable: true });' +
		                 'event.keyCode = 13;' +
		                 'document.getElementById("lst-ib").dispatchEvent(event);';

		this.iframe.contentDocument.documentElement.setAttribute('onreset', actualCode);
		this.iframe.contentDocument.documentElement.dispatchEvent(new CustomEvent('reset'));
		this.iframe.contentDocument.documentElement.removeAttribute('onreset');
	}
}

if (window.self !== window.top) {
	// here you can put your code that will run only inside iframe
	console.log("im an iframe", document);
} else {
	// removes <html>
	document.children[0].remove();
	document.append(document.createElement("html"));
	document.children[0].append(document.createElement("head"));
	document.body = document.createElement("body");

	a = document.createElement("iframe");
	document.body.append(a);
	a.style.width = "80%";
	a.style.height = "100vh";
	a.style.float = "right";
	a.frameBorder = 0;

	a.src = location.href;

	document.body.style.margin = 0;

	let run = document.createElement("button");
	run.onclick = function() {
		eval(myCodeMirror.doc.getValue());
	};
	run.innerText = "Run";
	document.body.append(run);

	const tm = new TestModeApi(a);

	// add monaco
	// s = document.createElement('script');
	// s.src = './node_modules/monaco-editor/dev/vs/loader.js';
	// require.config({ paths: { 'vs': chrome.runtime.getURL('node_modules/monaco-editor/min/vs') }});
	// 	require(['vs/editor/editor.main'], function() {
	// 		var editor = monaco.editor.create(document.getElementById('container'), {
	// 			value: [
	// 				'function x() {',
	// 				'\tconsole.log("Hello world!");',
	// 				'}'
	// 			].join('\n'),
	// 			language: 'javascript'
	// 		});
	// 	});
	var myCodeMirror = CodeMirror(document.body, {
		lineNumbers: true,
		theme: "material",
		autoCloseBrackets: true
	});
}
