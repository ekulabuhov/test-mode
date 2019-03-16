class TestModeApi {
  constructor(iframe) {
    this.iframe = iframe;
  }

  type(id, value) {
    const el = this.iframe.contentDocument.querySelector(id);
    el.value = value;
    // Angular updates it's model after this event
    el.dispatchEvent(new CustomEvent("input"));
  }

  click(selector) {
    this.iframe.contentDocument.querySelector(selector).click();
  }

  visit(url) {
    return new Promise(resolve => {
      this.iframe.addEventListener("load", resolve, { once: true });
      this.iframe.src = url;
    });
  }

  expect(id) {
    return {
      toBe: expectedValue => {
        const interval = setInterval(() => {
          const targetEl = this.iframe.contentDocument.querySelector(id);

          if (!targetEl) {
            return;
          }

          clearInterval(interval);
          const targetValue = targetEl.textContent;
          const areEqual = targetValue === expectedValue;
          console.log({ targetValue, expectedValue, areEqual });
        }, 100);
      }
    };
  }
}

if (window.self !== window.top) {
  // here you can put your code that will run only inside iframe
  console.log("im an iframe a", document);
} else {
  // removes <html>
  document.children[0].remove();
  document.append(document.createElement("html"));
  document.children[0].append(document.createElement("head"));
  document.body = document.createElement("body");

  document.body.innerHTML = `
  <div id="overlay"></div>
  <div class="dropdown-menu show">
    <a class="dropdown-item verify-text-btn" href="#">Verify text</a>
    <a class="dropdown-item record-click-btn" href="#">Record click</a>
    <a class="dropdown-item fill-field-btn" href="#">Fill field</a>
  </div>
  `;

  $(".dropdown-item").click(target => {
    $(".dropdown-menu").css({ top: -150 });
  });
  document.querySelector(".verify-text-btn").onclick = () => {
    appendLine(
      `tm.expect('${getDomPath(lastTarget)}').toBe('${lastTarget.textContent}')`
    );
  };

  document.querySelector(".record-click-btn").onclick = () => {
    appendLine(`tm.click('${getDomPath(lastTarget)}')\n`);
  };

  document.querySelector(".fill-field-btn").onclick = () => {
    appendLine(`tm.type('${getDomPath(lastTarget)}', '${lastTarget.value}')`);
  };

  a = document.createElement("iframe");
  document.body.append(a);
  a.style.width = "80%";
  a.style.height = "100vh";
  a.style.float = "right";
  a.frameBorder = 0;

  a.src = location.href;

  document.body.style.margin = 0;

  const run = document.createElement("button");
  run.onclick = function() {
    const codeMirrorValue = myCodeMirror.doc.getValue();
    const codeToRun = `(async () => {
      await tm.visit(
        "${location.origin + location.pathname}"
      );
      ${codeMirrorValue}
    })();`;
    eval(codeToRun);
  };
  run.innerText = "Run";
  document.body.append(run);

  const save = document.createElement("button");
  save.innerText = "Save";
  save.onclick = () => {
    const testName = prompt("Test name");
    if (testName) {
      const codeMirrorValue = myCodeMirror.doc.getValue();
      const suite = localStorage.getItem("suite")
        ? JSON.parse(localStorage.getItem("suite"))
        : {
            tests: [],
            location: `${location.origin + location.pathname}`
          };
      suite.tests.push({ name: testName, text: codeMirrorValue });
      localStorage.setItem("suite", JSON.stringify(suite));
    }
  };
  document.body.append(save);

  const testList = document.createElement("ul");
  const suite = JSON.parse(localStorage.getItem("suite"));
  const ulTests = suite.tests.map(test => `<ul>${test.name}</ul>`).join('\n');
  testList.innerHTML = ulTests;
  document.body.append(testList);


  const tm = new TestModeApi(a);

  a.addEventListener("load", () => {
    a.contentDocument.onclick = event => {
      if (event.isTrusted === false) {
        // automated clicks should not be handled
        return;
      }

      $(".dropdown-menu").css({
        top: event.pageY,
        left: event.pageX + 288 /** iframe offset */
      });
      lastTarget = event.target;
    };

    a.contentDocument.onkeydown = event => console.log("keydown", event);

    a.contentDocument.onmouseover = event => {
      event.target.style.backgroundColor = "rgba(0,0,255,0.1)";
    };

    a.contentDocument.onmouseout = event =>
      (event.target.style.backgroundColor = "");
  });

  var myCodeMirror = CodeMirror(document.body, {
    lineNumbers: true,
    theme: "material",
    autoCloseBrackets: true
  });

  function appendLine(text) {
    let cmText = myCodeMirror.doc.getValue();
    cmText += text + "\n";
    myCodeMirror.doc.setValue(cmText);
  }
}

function getDomPath(el) {
  if (el.id) {
    return "#" + el.id;
  }

  var rightArrowParents = [],
    elm,
    entry;

  for (elm = el; elm; elm = elm.parentNode) {
    entry = elm.tagName.toLowerCase();
    if (entry === "html") {
      break;
    }
    if (elm.className) {
      entry +=
        "." +
        elm.className
          .split(" ")
          .filter(Boolean)
          .filter(
            val =>
              ["ng-valid", "ng-invalid", "ng-dirty", "ng-touched"].indexOf(
                val
              ) === -1
          )
          .join(".");
    }
    if (elm.name) {
      entry += `[name="${elm.name}"]`;
    }
    rightArrowParents.push(entry);
  }
  rightArrowParents.reverse();
  return rightArrowParents.join(" ");
}
