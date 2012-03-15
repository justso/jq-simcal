(function ($) {
    var today = new Date(),
        months = 'Jan Feb March April May June July Aug Sept Oct Nov Dec'.split(' '),
        mlengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        dateRE = /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/,
        yearRE = /^\d{4,4}$/,
        $chosen, $today;
    $.fn.simcal = function (options) {
        var O = $.extend({}, $.fn.simcal.defaults, options);
        setupRange();

        function setupRange() {
            var begY, endY;
            if (O.begD.constructor === Date) {
                begY = O.begD.getFullYear();
            } else if (O.begD) {
                if (yearRE.test(O.begD)) {
                    begY = O.begD;
                } else if (dateRE.test(O.begD)) {
                    O.begD = new Date(O.begD);
                    begY = O.begD.getFullYear();
                } else {
                    begY = today.getFullYear();
                }
            } else {
                begY = today.getFullYear();
            }
            O.begY = begY;
            if (O.endD.constructor === Date) {
                endY = O.endD.getFullYear();
            } else if (O.endD) {
                if (yearRE.test(O.endD)) {
                    endY = O.endD;
                } else if (dateRE.test(O.endD)) {
                    O.endD = new Date(O.endD);
                    endY = O.endD.getFullYear();
                } else {
                    endY = today.getFullYear();
                }
            } else {
                endY = today.getFullYear();
            }
            O.endY = endY;
        }

        function makeHTML() {
            var years = [],
                $picker,
                Msel,
                Ysel,
                i;
            for (i = 0; i <= O.endY - O.begY; i++) years[i] = O.begY + i;
            $picker = $('<table class="simcal">');
            $picker.append('<thead>');
            $picker.append('<tfoot>');
            $picker.append('<tbody>');
            Msel = '<select name="month">';
            for (i in months) {
                Msel += '<option value="' + i + '">' + months[i] + '</option>';
            }
            Msel += '</select>';
            Ysel = '<select name="year">';
            for (i in years) {
                Ysel += '<option>' + years[i] + '</option>';
            }
            Ysel += '</select>';
            $('thead', $picker).append('<tr class="controls"><th colspan="7"><span class="prevMonth">&laquo;</span>&nbsp;' + Msel + Ysel + '&nbsp;<span class="nextMonth">&raquo;</span></th></tr>');
            $('thead', $picker).append('<tr class="days"><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>');
            $('tfoot', $picker).append('<tr><td colspan="2"><span class="today">today</span></td><td colspan="3">&nbsp;</td><td colspan="2"><span class="close">close</span></td></tr>');
            for (i = 0; i < 6; i++) {
                $('tbody', $picker).append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
            }
            return expPick($picker);
        }

        function expPick($p) {
            $p.sel = function (str) {
                str = (str === 'm' ? 'month' : str);
                str = (str === 'y' ? 'year' : str);
                return $(this).find('select[name=' + str + ']').get(0);
            };
            if ($.fn.nosel) $p.nosel();
            return $p;
        }

        function loadM(e, el, $picker, picD) {
            var mo = $picker.sel('m').selectedIndex,
                yr = $picker.sel('y').selectedIndex,
                yrs = $('select[name=year] option', $picker).get().length,
                beg = {},
                end = {},
                m, y, d, i,
                $cells,
                $cell,
                begAt,
                numdays;
            if (e && $(e.target).hasClass('prevMonth')) {
                if (0 === mo && yr) {
                    yr -= 1;
                    mo = 11;
                    $picker.sel('m').selectedIndex = 11;
                    $picker.sel('y').selectedIndex = yr;
                } else {
                    mo -= 1;
                    $picker.sel('m').selectedIndex = mo;
                }
            } else if (e && $(e.target).hasClass('nextMonth')) {
                if (11 === mo && yr + 1 < yrs) {
                    yr += 1;
                    mo = 0;
                    $picker.sel('m').selectedIndex = 0;
                    $picker.sel('y').selectedIndex = yr;
                } else {
                    mo += 1;
                    $picker.sel('m').selectedIndex = mo;
                }
            }
            if (0 === mo && !yr) $('span.prevMonth', $picker).css('visibility', 'hidden');
            else $('span.prevMonth', $picker).css('visibility', 'visible');
            if (yr + 1 === yrs && 11 === mo) $('span.nextMonth', $picker).css('visibility', 'hidden');
            else $('span.nextMonth', $picker).css('visibility', 'visible');

            $cells = $('tbody td', $picker).unbind('.simcal').empty().removeClass('date');
            m = parse( $('select[name=month]', $picker).val() );
            y = parse( $('select[name=year]', $picker).val() );
            d = new Date(y, m, 1);
            begAt = d.getDay();
            numdays = leaper(y, m);
            beggar(beg, O.begD);
            beggar(end, O.endD);
            if ($today) $today.removeClass('today');
            for (i = 0; i < numdays; i++) {
                $cell = $($cells.get(i + begAt)).removeClass('chosen');
                if ((yr || ((!beg.D && !beg.M) || ((i + 1 >= beg.D && mo === beg.M) || mo > beg.M))) && (yr + 1 < yrs || ((!end.D && !end.M) || ((i + 1 <= end.D && mo === end.M) || mo < end.M)))) {
                    $cell.text(i + 1).each(hovers).click(function () {
                        var me = $(this),
                            picDateObj = new Date($('select[name=year]', $picker).val(), $('select[name=month]', $picker).val(), me.text());
                        $chosen.removeClass('chosen');
                        me.addClass('chosen');
                        closeIt(el, $picker, picDateObj);
                    });
                    if (1 + i === picD.getDate() && m === picD.getMonth() && y === picD.getFullYear()) {
                        $chosen = $cell.addClass('chosen');
                    }
                    if (1 + i === today.getDate() && m === today.getMonth() && y === today.getFullYear()) {
                        $today = $cell.addClass('today');
                    }
                }
            }
        }

        function leaper (y, m) {
            var n = mlengths[m];
            if (m * 1 === 1 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0))
                n = 29;
            return n;
        }

        function beggar (c,o) {
            if (o.constructor === Date) {
                c.M = o.getMonth();
                c.D = o.getDate();
            }
        }

        function hovers() {
            var a = function () {
                $(this).addClass('over')
            },  b = function () {
                $(this).removeClass('over')
            };
            $(this).addClass('date').hover(a, b);
        }

        function closeIt($fld, $picker, dateObj) {
            if (dateObj && dateObj.constructor === Date)
                $fld.val($.fn.simcal.formatOutput(dateObj));
            $picker.fadeOut(333, function () {
                $(this).remove();
            });
            $picker = null;
            $fld.removeClass('picker');
            $fld.trigger('keyup').trigger('change').focus();
        }

        function parse(x) {
            return parseInt(x, 10);
        }

        function openIt() {
            var me = $(this),
                elPos = me.offset(),
                iniD, picD, $picker;
            if (!me.is('.picker')) {
                me.addClass('picker');
                iniD = me.val();

                if (iniD && dateRE.test(iniD)) picD = new Date(iniD);
                else if (O.picD.constructor === Date) picD = O.picD;
                else if (O.picD) picD = new Date(O.picD);
                else picD = today;

                $picker = makeHTML().prependTo($('body')).css({
                    position: 'absolute',
                    left: elPos.left,
                    top: elPos.top + O.icon
                });
                $('span', $picker).css('cursor', 'pointer');
                $('select', $picker).bind('change.simcal', function () {
                    loadM(null, me, $picker, picD);
                });
                $('span.prevMonth', $picker).click(function (e) {
                    loadM(e, me, $picker, picD);
                });
                $('span.nextMonth', $picker).click(function (e) {
                    loadM(e, me, $picker, picD);
                });
                $('span.today', $picker).click(function () {
                    closeIt(me, $picker, new Date());
                });
                $('span.close', $picker).click(function () {
                    closeIt(me, $picker);
                });
                $picker.sel('m').selectedIndex = picD.getMonth();
                $picker.sel('y').selectedIndex = Math.max(0, picD.getFullYear() - O.begY);
                loadM(null, me, $picker, picD);
            }
        }

        return this.each(function () {
            var me = $(this);
            if (!(me.is('input')) || ('text' !== me.prop('type'))) return;
            me.addClass('simcal').removeClass('picker');
            me.bind('keydown.simcal', function () {
                $('span.close').trigger('click');
            }).bind('mousedown.simcal', openIt);
        });
    };
    $.fn.simcal.formatOutput = function (dateObj) {
        return [dateObj.getMonth() + 1, dateObj.getDate(), dateObj.getFullYear()].join('/');
    };
    $.fn.simcal.defaults = {
        icon: 16,
        picD: today,
        begD: today.getFullYear() - 11,
        endD: today.getFullYear() + 11,
        x: - 1,
        y: 18
    };
    $(function () {
        $('.calpick').simcal();
    });
})(jQuery);
