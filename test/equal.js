/*  VERSION -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- *
 *  hrs3143:test/simple.js  ^  david.turgeon @ wf  ^  2011-12-10 ..
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/*
Demo
    equal
    deepEqual
    strictEqual
 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
(function(){
    module('EQUIVs');

    function Obj(){
        this.String = 'Foo';
    }
    Obj.prototype.toString = function(){
        return this.String;
    };

    var numA = 1, numB = "1.0"
    ,   objA = new Obj,  objB = new Obj
    ;

    function load(nom){
        var fun = window[nom];
        test(nom, function(){
            expect( 3 );
            fun( numA, numB, 'Number as string.' );
            fun( objA, objB, 'Equivalent object.' );
            fun( objA, objB+'', 'Coerced to string method.' );
        });
    }

    load('equal');
    load('deepEqual');
    load('strictEqual');

})();
