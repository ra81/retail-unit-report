// ==UserScript==
// @name           Virtonomica: Расчет цены за ед. кач. + сортировка
// @namespace      virtonomica
// @author         UnclWish
// @description    Цена за единицу качества + сортировка
// @include        http*://virtonomic*.*/*/window/unit/supply/create/*/step2
// @include        http*://virtonomic*.*/*/window/unit/equipment/*
// @version        1.4
// ==/UserScript==
var run = function () {
    function fillArray(id, cen) {
        this.id = id;
        this.cen = cen;
    }
    var win = (typeof (unsafeWindow) != 'undefined' ? unsafeWindow : top.window);
    var txt = [];
    $ = win.$;
    i = 0;
    $('#supply_content table tr').each(function () {
        var temp = $(this).attr('id');
        if (!isNaN(temp)) {
            return;
        }
        var cels1 = $('th', this);
        $(cels1[3]).after('<th><div class="field_title">ЦК<div class="asc" title="сортировка по возрастанию"><a id="qpasc" href="#"><img src="/img/up_gr_sort.png"></a></div><div class="desc" title="сортировка по убыванию"><a id="qpdesc" href="#"><img src="/img/down_gr_sort.png"></a></div></div></th>');
        var cels = $('td', this);
        var price = parseFloat($(cels[5]).text().replace('$', '').replace(/ /g, ''));
        var qual = parseFloat($(cels[6]).text().replace(/ /g, ''));
        if (isNaN(price) || isNaN(qual)) {
            return;
        }
        var qp = (price / qual).toFixed(2);
        i++;
        $(cels[5]).after('<td class="supply_data" id="td_s' + i + '" style="color: blue">' + qp + '</td>');
        txt[i] = new fillArray(i, parseFloat($('#td_s' + i).text()));
    });
    total = i;
    function sort_table(type) {
        for (i = 0; i <= total; i++) {
            for (j = 1; j < total - i; j++) {
                if (type == 'asc') {
                    if (txt[j]['cen'] > txt[j + 1]['cen']) {
                        var tmp = txt[j]['cen'];
                        txt[j]['cen'] = txt[j + 1]['cen'];
                        txt[j + 1]['cen'] = tmp;
                        tmp = txt[j]['id'];
                        txt[j]['id'] = txt[j + 1]['id'];
                        txt[j + 1]['id'] = tmp;
                    }
                }
                if (type == 'desc') {
                    if (txt[j]['cen'] < txt[j + 1]['cen']) {
                        var tmp = txt[j]['cen'];
                        txt[j]['cen'] = txt[j + 1]['cen'];
                        txt[j + 1]['cen'] = tmp;
                        tmp = txt[j]['id'];
                        txt[j]['id'] = txt[j + 1]['id'];
                        txt[j + 1]['id'] = tmp;
                    }
                }
            }
        }
        for (i = total; i > 1; i--) {
            id_rod = $('#td_s' + txt[i]['id']).closest('tr');
            id_rod1 = $('#td_s' + txt[i - 1]['id']).closest('tr');
            if (id_rod1.next().hasClass('ordered')) {
                var n = id_rod1.next();
                id_rod.before(id_rod1).before(n);
            }
            else
                id_rod.before(id_rod1);
        }
        return false;
    }
    $('#qpasc').click(function () {
        sort_table('asc');
        return false;
    });
    $('#qpdesc').click(function () {
        sort_table('desc');
        return false;
    });
};
// Хак, что бы получить полноценный доступ к DOM >:]
var script = document.createElement("script");
script.textContent = '(' + run.toString() + ')();';
document.documentElement.appendChild(script);
//# sourceMappingURL=pqr.js.map