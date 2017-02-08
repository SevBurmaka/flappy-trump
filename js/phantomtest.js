// Use 'page.injectJs()' to load the script itself in the Page context

"use strict";
if ( typeof(phantom) !== "undefined" ) {
    var page = require('webpage').create();

    // Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    page.onAlert = function(msg) {
        console.log(msg);
    };

    console.log("* Script running in the Phantom context.");
    console.log("* Script will 'inject' itself in a page...");
    page.open("http://myfax.com/free/", function(status) {
        if ( status === "success" ) {
            page.resources.every(function (it) {
                console.log(it)
            })
        }
        phantom.exit();
    });
} else {
    alert("* Script running in the Page context.");
}
