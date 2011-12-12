/*
 *  The script only works on "input [type=text]"
 *  Don't declare anything out here in the global namespace
 *
 */

(function ($) { // private scope (inside you can use $ instead of jQuery)

    // Functions and vars declared here are effectively 'singletons'.
    // there will be only a single instance of them.
    // So this is a good place to declare any immutable items
    // or stateless functions. For example:

    var today = new Date(); // used in defaults
    var months = 'Jan Feb March April May June July Aug Sept Oct Nov Dec'.split(' ')
    ,   mlengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var dateRegEx = /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/
    ,   yearRegEx = /^\d{4,4}$/;
    var $chosen, $today;  // keep tabs on these

    // next, declare the plugin function
    $.fn.simcalPicker = function (options) {
        // Functions and vars declared here are created each time your
        // plugin function is invoked.
        // You could probably refactor your 'build', 'load_month', etc,
        // functions to be passed the DOM element from below.

        var opts = $.extend({}, $.fn.simcalPicker.defaults, options);

        // replaces a date string with a date object in opts.startdate
        // and opts.enddate, if one exists populates two new properties
        // with a ready-to-use year: opts.startyear and opts.endyear

        setupYearRange();
        /** extracts and setup a valid year range from the opts object **/
        function setupYearRange() {
            var startyear
            ,   endyear
            ;
            if (opts.startdate.constructor == Date) {
                startyear = opts.startdate.getFullYear();
            } else if (opts.startdate) {
                if (yearRegEx.test(opts.startdate)) {
                    startyear = opts.startdate;
                } else if (dateRegEx.test(opts.startdate)) {
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
                if (yearRegEx.test(opts.enddate)) {
                    endyear = opts.enddate;
                } else if (dateRegEx.test(opts.enddate)) {
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

        /** HTML factory for the actual datepicker table element **/
        // Read the year range to setup the correct years in our HTML <select>
        /**
         * @return {jQuery} instance with table html
         */
        function newPickerHTML() {
            var years = []
            ,   $picker
            ,   monthselect
            ,   yearselect
            ,   i
            ;
            // process year range into an array
            for (i = 0; i <= opts.endyear - opts.startyear; i++)
                years[i] = opts.startyear + i;

            // build the table structure
            $picker = $('<table class="simcal"></table>');
            $picker.append('<thead></thead>');
            $picker.append('<tfoot></tfoot>');
            $picker.append('<tbody></tbody>');

            // month select field
            monthselect = '<select name="month">';
            for (i in months)
                monthselect += '<option value="' + i + '">'
                + months[i] + '</option>';
            monthselect += '</select>';

            // year select field
            yearselect = '<select name="year">';
            for (i in years)
                yearselect += '<option>' + years[i] + '</option>';
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
            for (i = 0; i < 6; i++)
                $('tbody', $picker).append(
                    '<tr><td></td><td></td><td></td><td></td>'
                    + '<td></td><td></td><td></td></tr>');

            if ($.fn.unselectable)
                $picker.unselectable();
            return $picker;

        }

        /** get the real position of the input (well, anything really) **/
        //http://www.quirksmode.org/js/findpos.html
        function findPosition(obj) {
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

        /** load the initial date and handle all date-navigation **/
        // initial calendar load (e is null)
        // prevMonth & nextMonth buttons
        // onchange for the select fields
        function loadMonth(e, el, $picker, chosendate) {

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
                        && y == chosendate.getFullYear())
                        $chosen = $cell.addClass('chosen');
                    // highlight today as expected
                    if (i + 1 == today.getDate()
                        && m == today.getMonth()
                        && y == today.getFullYear())
                        $today = $cell.addClass('today');
                }
            }
        }

        /** closes the datepicker **/
        // sets the currently matched input element's value to the date,
        // if one is available remove the table element from the DOM
        // indicate that there is no datepicker for the currently
        // matched input element

        function closeIt(el, $picker, dateObj) {
            if (dateObj && dateObj.constructor == Date)
                el.val($.fn.simcalPicker.formatOutput(dateObj));

            $picker.fadeOut(333,function (){ // glimpse the chosen day
                $(this).remove();
            });
            $picker = null;
            $.data(el.get(0), 'simcalPicker', {
                hasPicker: false
            });
        }

        function openPicker(evt) {
            var $this = $(evt.target)
            ,   initialdate, chosendate
            ,   $picker
            ;

            if (false == $.data($this.get(0), 'simcalPicker').hasPicker) {

                // store data telling us there is already a datepicker
                $.data($this.get(0), 'simcalPicker', {
                    hasPicker: true
                });

                // validate the form's initial content for a date
                initialdate = $this.val();

                if (initialdate && dateRegEx.test(initialdate))
                    chosendate = new Date(initialdate);
                else if (opts.chosendate.constructor == Date)
                    chosendate = opts.chosendate;
                else if (opts.chosendate)
                    chosendate = new Date(opts.chosendate);
                else
                    chosendate = today;

                // insert the datepicker in the DOM
                $picker = newPickerHTML();
                $('body').prepend($picker);

                // position the datepicker
                var parse = function (){
                    window.parseInt(arguments[0],10);
                }
                ,   elPos = findPosition($this.get(0))
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
                    loadMonth(null, $this, $picker, chosendate);
                });
                $('span.prevMonth', $picker).click(function (e) {
                    loadMonth(e, $this, $picker, chosendate);
                });
                $('span.nextMonth', $picker).click(function (e) {
                    loadMonth(e, $this, $picker, chosendate);
                });
                $('span.today', $picker).click(function () {
                    closeIt($this, $picker, new Date());
                });
                $('span.close', $picker).click(function () {
                    closeIt($this, $picker);
                });

                // set the initial values for the month and year select fields
                // and load the first month
                $('select[name=month]', $picker).get(0)
                .selectedIndex = chosendate.getMonth();
                $('select[name=year]', $picker).get(0)
                .selectedIndex = Math.max(0, chosendate.getFullYear() - opts.startyear);

                loadMonth(null, $this, $picker, chosendate);
            }
        }

        // iterate the matched nodeset
        return this.each(function () {
            // functions and vars declared here are created for each
            // matched element. so if your functions need to manage
            // or access per-node state you can defined them
            // here and use $this to get at the DOM element

            if (!($(this).is('input')) ||
                ('text' !== $(this).attr('type'))
                    ) return;

            $.data($(this).get(0), 'simcalPicker', {
                hasPicker: false
            });

            // toggle a datepicker on these events
            $(this).bind('keydown', function(){
                $('span.close').trigger('click');
            }).bind('mousedown focus', openPicker);
        });
    };

    // Finally, I like to expose default plugin options as public
    // so they can be manipulated. One way to do this is to add a property
    // to the already-public plugin fn

    $.fn.simcalPicker.formatOutput = function (dateObj) {
        return [
        dateObj.getMonth() + 1,
        dateObj.getDate(),
        dateObj.getFullYear()
        ].join('/');
    };

    $.fn.simcalPicker.defaults = {
        // date string matching /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/
        chosendate: today,

        // date string matching /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/
        // or four digit year
        startdate: today.getFullYear() - 11,
        enddate: today.getFullYear() + 11,

        // offset from the top left corner of the input element
        x : -1, // must be in px
        y : 18  // must be in px
    };

    // inits
    $(function(){
        if ($.jsPath){ // my ext
            $.loadCssFor('simcal');
            $.loadJs($.jsPath('simcal')+'/lib/noSel.js');
        }
    });

})(jQuery);
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
