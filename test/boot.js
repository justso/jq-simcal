/* -VERSION-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- *
 *  :test/boot.js  ^  dvdrtrgn  ^  2011-12
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
jQuery(function(){
    jQuery('body').append('<h1 id="qunit-header">'+document.title+'</h1>'   +
        '<h2 id="qunit-banner"></h2><div id="qunit-testrunner-toolbar">'    +
        '<a target="_blank" href="http://docs.jquery.com/QUnit">Docs</a>'   +
        ' </div><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol>'   +
        '<div id="qunit-fixture"></div>');
});
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
module("INIT");
test('empty',function(){
    equal(2+2, 4, 'duh 2+2');
});
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
