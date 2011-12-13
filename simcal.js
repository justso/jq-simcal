/*
 *  The script only works on "input [type=text]"
 *  global namespace -- declare nothing out here
 *
 *  dependancies:
 *      jqext.js
 *      noSel.js
 */

(function ($) { // private scope (inside you can use $ instead of jQuery)

    // declarations here are like singletons
    // good for immutable items or stateless functions

    var today = new Date(); // used in defaults
    var months = 'Jan Feb March April May June July Aug Sept Oct Nov Dec'.split(' ')
    ,   mlengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var dateRE = /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/
    ,   yearRE = /^\d{4,4}$/;
    var $chosen, $today;  // keep tabs on these elements
    var root = $.jsPath ? $.jsPath('simcal') : ''; // fail gracefully w/o ext

    // next, declare the plugin function (with legacy name)
    $.fn.simcal = $.fn.simcalPicker = function (options) {

        // declarations here created each time plugin is invoked
        // You could probably refactor your 'build', 'load_month', etc,
        // functions to be passed the DOM element from below.

        var opts = $.extend({}, $.fn.simcal.defaults, options);

        // replaces a date string with a date object
        // in opts.startdate and opts.enddate,
        // if one exists populates two new properties
        // with a ready-to-use year: opts.startyear and opts.endyear

        setupRange();
        /** extracts and setup a valid year range from the opts object **/
        function setupRange() {
            var startyear
            ,   endyear
            ;
            if (opts.startdate.constructor == Date) {
                startyear = opts.startdate.getFullYear();
            } else if (opts.startdate) {
                if (yearRE.test(opts.startdate)) {
                    startyear = opts.startdate;
                } else if (dateRE.test(opts.startdate)) {
                    opts.startdate = new Date(opts.startdate);
                    startyear = opts.startdate.getFullYear();
                } else {
                    startyear = today.getFullYear();
                }
            } else {
                startyear = today.getFullYear();
            }
            opts.startyear = startyear;

            if (opts.enddate.constructor == Date) {
                endyear = opts.enddate.getFullYear();
            } else if (opts.enddate) {
                if (yearRE.test(opts.enddate)) {
                    endyear = opts.enddate;
                } else if (dateRE.test(opts.enddate)) {
                    opts.enddate = new Date(opts.enddate);
                    endyear = opts.enddate.getFullYear();
                } else {
                    endyear = today.getFullYear();
                }
            } else {
                endyear = today.getFullYear();
            }
            opts.endyear = endyear;
        }

        /** HTML factory for the actual date-picker table element **/
        // Read the year range to setup the correct years in our HTML <select>
        /**
         * @return {jQuery} instance with table html
         */
        function makeHTML() {
            var years = []
            ,   $picker
            ,   monthselect
            ,   yearselect
            ,   i
            ;
            // process year range into an array
            for (i = 0; i <= opts.endyear - opts.startyear; i++){
                years[i] = opts.startyear + i;
            }

            // build the table structure
            $picker = $('<table class="simcal">');
            $picker.append('<thead>');
            $picker.append('<tfoot>');
            $picker.append('<tbody>');

            // month select field
            monthselect = '<select name="month">';
            for (i in months){
                monthselect += '<option value="' + i + '">'
                + months[i] + '</option>';
            }
            monthselect += '</select>';

            // year select field
            yearselect = '<select name="year">';
            for (i in years){
                yearselect += '<option>' + years[i] + '</option>';
            }
            yearselect += '</select>';

            $('thead', $picker).append(
                '<tr class="controls"><th colspan="7">'
                + '<span class="prevMonth">&laquo;</span>&nbsp;'
                + monthselect + yearselect
                + '&nbsp;<span class="nextMonth">&raquo;</span></th></tr>');
            $('thead', $picker).append(
                '<tr class="days"><th>S</th><th>M</th><th>T</th>'
                + '<th>W</th><th>T</th><th>F</th><th>S</th></tr>');
            $('tfoot', $picker).append(
                '<tr><td colspan="2"><span class="today">today</span></td>'
                + '<td colspan="3">&nbsp;</td><td colspan="2">'
                + '<span class="close">close</span></td></tr>');
            for (i = 0; i < 6; i++){
                $('tbody', $picker).append(
                    '<tr><td></td><td></td><td></td><td></td>'
                    + '<td></td><td></td><td></td></tr>');
            }

            if ($.fn.unselectable){
                $picker.unselectable();
            }
            return $picker;

        }

        function findPosition(obj) {
            /** get the real position of the input (well, anything really) **/
            // http://www.quirksmode.org/js/findpos.html
            var curleft, curtop
            ;
            curleft = curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop  += obj.offsetTop;
                } while ((obj = obj.offsetParent)); // not a syntax error
                return [curleft, curtop];
            } else {
                return false;
            }
        }

        function loadMonth(e, el, $picker, chosendate) {
            /** load the initial date and handle all date-navigation **/
            // initial calendar load (e is null)
            // prevMonth & nextMonth buttons
            // onchange for the select fields

            // reference our years for the nextMonth and prevMonth buttons
            var mo  = $('select[name=month]', $picker).get(0).selectedIndex
            ,   yr  = $('select[name=year]', $picker).get(0).selectedIndex
            ,   yrs = $('select[name=year] option', $picker).get().length
            ;

            // first try to process buttons that may change the month we're on
            if (e && $(e.target).hasClass('prevMonth')) {
                if (0 == mo && yr) {
                    yr -= 1;
                    mo = 11;
                    $('select[name=month]', $picker).get(0).selectedIndex = 11;
                    $('select[name=year]', $picker).get(0).selectedIndex = yr;
                } else {
                    mo -= 1;
                    $('select[name=month]', $picker).get(0).selectedIndex = mo;
                }
            } else if (e && $(e.target).hasClass('nextMonth')) {
                if (11 == mo && yr + 1 < yrs) {
                    yr += 1;
                    mo  = 0;
                    $('select[name=month]', $picker).get(0).selectedIndex = 0;
                    $('select[name=year]', $picker).get(0).selectedIndex = yr;
                } else {
                    mo += 1;
                    $('select[name=month]', $picker).get(0).selectedIndex = mo;
                }
            }

            // hide buttons, but keep placeholder metrics
            // 2do: get rid of this, and allow 'unlimited' back and forth
            if (0 == mo && !yr)
                $('span.prevMonth', $picker).css('visibility','hidden');
            else
                $('span.prevMonth', $picker).css('visibility','visible');

            if (yr + 1 == yrs && 11 == mo)
                $('span.nextMonth', $picker).css('visibility','hidden');
            else
                $('span.nextMonth', $picker).css('visibility','visible');

            var $cells
            ,   m, y, d
            ,   startindex, numdays
            ,   startMonth, endMonth
            ,   startDate, endDate
            ;
            // clear the old cells
            $cells = $('tbody td', $picker).unbind().empty().removeClass('date');

            // figure out what month and year to load
            m = $('select[name=month]', $picker).val();
            y = $('select[name=year]', $picker).val();
            d = new Date(y, m, 1);
            startindex = d.getDay();
            numdays = mlengths[m];

            // http://en.wikipedia.org/wiki/Leap_year
            if (1 == m && ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0))
                numdays = 29;

            // test for end dates (instead of just a year range)
            if (opts.startdate.constructor == Date) {
                startMonth = opts.startdate.getMonth();
                startDate = opts.startdate.getDate();
            }
            if (opts.enddate.constructor == Date) {
                endMonth = opts.enddate.getMonth();
                endDate = opts.enddate.getDate();
            }

            // walk through the index and populate each cell, binding events too
            var $cell, i;
            if ($today)
                $today.removeClass('today');    // for other months

            for (i = 0; i < numdays; i++) {
                $cell = $($cells.get(i + startindex)).removeClass('chosen');

                // test that the date falls within a range, if we have a range
                if (( yr || (
                    ( !startDate && !startMonth ) || (
                        ( i + 1 >= startDate
                            && mo == startMonth ) || mo > startMonth
                        ))
                ) && ( yr + 1 < yrs || (
                    ( !endDate && !endMonth )   || (
                        ( i + 1 <= endDate
                            && mo == endMonth ) || mo < endMonth
                        ))
                )){
                    $cell.text(i + 1).addClass('date').hover(
                        function () {
                            $(this).addClass('over');
                        },
                        function () {
                            $(this).removeClass('over');
                        })
                    .click(function () {
                        var chosenDateObj = new Date(
                            $('select[name=year]', $picker).val(),
                            $('select[name=month]', $picker).val(),
                            $(this).text());
                        $chosen.removeClass('chosen');  // move from
                        $(this).addClass('chosen');     // to here
                        closeIt(el, $picker, chosenDateObj);
                    });

                    // highlight the previous chosen date
                    if (i + 1 == chosendate.getDate()
                        && m == chosendate.getMonth()
                        && y == chosendate.getFullYear()){
                        $chosen = $cell.addClass('chosen');
                    }
                    // highlight today as expected
                    if (i + 1 == today.getDate()
                        && m == today.getMonth()
                        && y == today.getFullYear()){
                        $today = $cell.addClass('today');
                    }
                }
            }
        }

        function closeIt($fld, $picker, dateObj) {
            // set input element to the date,
            // if one is available remove the table element
            // indicate that there is no date-picker for this element

            if (dateObj && dateObj.constructor == Date)
                $fld.val($.fn.simcal.formatOutput(dateObj));

            $picker.fadeOut(333,function (){ // glimpse the chosen day
                $(this).remove();
            });
            $picker = null;
            $fld.removeClass('picker');
        }

        function openIt(evt) {
            var $fld = $(evt.target)
            ,   initialdate, chosendate
            ,   $picker
            ;

            if (!$fld.is('.picker')){

                // store data telling us there is already a date-picker
                $(this).addClass('picker');

                // validate the form's initial content for a date
                initialdate = $fld.val();

                if (initialdate && dateRE.test(initialdate)) {
                    chosendate = new Date(initialdate);
                } else if (opts.chosendate.constructor == Date) {
                    chosendate = opts.chosendate;
                } else if (opts.chosendate) {
                    chosendate = new Date(opts.chosendate);
                } else {
                    chosendate = today;
                }

                // insert the date-picker in the DOM
                $picker = makeHTML();
                $('body').prepend($picker);

                // position the date-picker
                var parse = function (){
                    window.parseInt(arguments[0],10);
                }
                ,   elPos = findPosition($fld.get(0))
                ,   x = (parse(opts.x) ? parse(opts.x) : 0) + elPos[0]
                ,   y = (parse(opts.y) ? parse(opts.y) : 0) + elPos[1]
                ;
                $picker.css({
                    position: 'absolute',
                    left: x,
                    top: y
                });

                // bind events to the table controls
                $('span', $picker).css('cursor', 'pointer');
                $('select', $picker).bind('change', function () {
                    loadMonth(null, $fld, $picker, chosendate);
                });
                $('span.prevMonth', $picker).click(function (e) {
                    loadMonth(e, $fld, $picker, chosendate);
                });
                $('span.nextMonth', $picker).click(function (e) {
                    loadMonth(e, $fld, $picker, chosendate);
                });
                $('span.today', $picker).click(function () {
                    closeIt($fld, $picker, new Date());
                });
                $('span.close', $picker).click(function () {
                    closeIt($fld, $picker);
                });

                // set the initial values for the month and year select fields
                // and load the first month
                $('select[name=month]', $picker).get(0)
                .selectedIndex = chosendate.getMonth();
                $('select[name=year]', $picker).get(0)
                .selectedIndex = Math.max(0, chosendate.getFullYear() - opts.startyear);

                loadMonth(null, $fld, $picker, chosendate);
            }
        }

        return this.each(function () {

            // iterate through the matched nodeset
            // declarations here are for each instance
            // this is in the context of DOM element

            var $fld = $(this)
            ;
            if (!($fld.is('input')) ||
                ('text' !== $fld.prop('type'))
                    ) return;
            $fld.addClass('simcal').removeClass('picker'); // remove in case already bound
            $fld.css({
                backgroundImage:'url('+opts.root+'/lib/cal-'+opts.icon+'.png)'
            });

            // toggle a date-picker on these events
            $fld.bind('keydown', function(){
                $('span.close').trigger('click');
            }).bind('mousedown focus', openIt);
        });
    };

    // Finally, I like to expose default plugin options as public
    // so they can be manipulated. One way to do this is to add a property
    // to the already-public plugin fn

    $.fn.simcal.formatOutput = function (dateObj) {
        return [
        dateObj.getMonth() + 1,
        dateObj.getDate(),
        dateObj.getFullYear()
        ].join('/');
    };

    $.fn.simcal.defaults = {
        icon: 14,
        root: root,

        chosendate: today,
        startdate: today.getFullYear() - 11,
        enddate: today.getFullYear() + 11,

        // offset from the top left of input element in px
        x : -1,
        y : 18
    };

    // inits
    $(function(){
        if (root){ // my ext
            $.loadJs(root+'/lib/noSel.js');
            $.loadCssFor('simcal');
            $('.calpick').simcal();
        }
    });

})(jQuery);
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
