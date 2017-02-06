var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// ==UserScript==
// @name          Retail Unit Turnover report
// @namespace     virtonomica
// @description   Выводит для чужого юнита выручку по каждому товару, возможную выручку. Так же общую текущую выручку для юнита и потенциал если занять весь рынок по текущим ценам.
// @version       1.5
// @include       https://virtonomic*.*/*/main/unit/view/*
// @include       https://virtonomic*.*/*/window/unit/view/*
// @require       https://code.jquery.com/jquery-1.11.1.min.js
// ==/UserScript==
// 
// Набор вспомогательных функций для использования в других проектах. Универсальные
//   /// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
/**
 * Проверяет наличие в словаре ключей. Шорт алиас для удобства.
 * Если словарь не задать, вывалит исключение
 * @param dict проверяемый словарь
 */
function isEmpty(dict) {
    return Object.keys(dict).length === 0; // исключение на null
}
/**
 * Конвертит словарь в простую текстовую строку вида "key:val, key1:val1"
 * значения в строку конвертятся штатным toString()
 * Создана чисто потому что в словарь нельзя засунуть методы.
 * @param dict
 */
function dict2String(dict) {
    if (isEmpty(dict))
        return "";
    var newItems = [];
    for (var key in dict)
        newItems.push(key + ":" + dict[key].toString());
    return newItems.join(", ");
}
/**
 * Проверяет что элемент есть в массиве.
 * @param item
 * @param arr массив НЕ null
 */
function isOneOf(item, arr) {
    return arr.indexOf(item) >= 0;
}
// PARSE -------------------------------------------
/**
 * удаляет из строки все денежные и специальные символы типо процента и пробелы между цифрами
 * @param str
 */
function cleanStr(str) {
    return str.replace(/[\s\$\%\©]/g, "");
}
/**
 * Выдергивает реалм из текущего href ссылки если это возможно.
 */
function getRealm() {
    // https://*virtonomic*.*/*/main/globalreport/marketing/by_trade_at_cities/*
    // https://*virtonomic*.*/*/window/globalreport/marketing/by_trade_at_cities/*
    var rx = new RegExp(/https:\/\/virtonomic[A-Za-z]+\.[a-zA-Z]+\/([a-zA-Z]+)\/.+/ig);
    var m = rx.exec(document.location.href);
    if (m == null)
        return null;
    return m[1];
}
function getRealmOrError() {
    var realm = getRealm();
    if (realm === null)
        throw new Error("Не смог определить реалм по ссылке " + document.location.href);
    return realm;
}
/**
 * Парсит id компании со страницы и выдает ошибку если не может спарсить
 */
function getCompanyId() {
    var str = matchedOrError($("a.dashboard").attr("href"), /\d+/);
    return numberfyOrError(str);
}
/**
 * Оцифровывает строку. Возвращает всегда либо число или Number.POSITIVE_INFINITY либо -1 если отпарсить не вышло.
 * @param variable любая строка.
 */
function numberfy(str) {
    // возвращает либо число полученно из строки, либо БЕСКОНЕЧНОСТЬ, либо -1 если не получилось преобразовать.
    if (String(str) === 'Не огр.' ||
        String(str) === 'Unlim.' ||
        String(str) === 'Не обм.' ||
        String(str) === 'N’est pas limité' ||
        String(str) === 'No limitado' ||
        String(str) === '无限' ||
        String(str) === 'Nicht beschr.') {
        return Number.POSITIVE_INFINITY;
    }
    else {
        // если str будет undef null или что то страшное, то String() превратит в строку после чего парсинг даст NaN
        // не будет эксепшнов
        var n = parseFloat(cleanStr(String(str)));
        return isNaN(n) ? -1 : n;
    }
}
/**
 * Пробуем оцифровать данные но если они выходят как Number.POSITIVE_INFINITY или <= minVal, валит ошибку.
   смысл в быстром вываливании ошибки если парсинг текста должен дать число
 * @param value строка являющая собой число больше minVal
 * @param minVal ограничение снизу. Число.
 * @param infinity разрешена ли бесконечность
 */
function numberfyOrError(str, minVal, infinity) {
    if (minVal === void 0) { minVal = 0; }
    if (infinity === void 0) { infinity = false; }
    var n = numberfy(str);
    if (!infinity && (n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY))
        throw new RangeError("Получили бесконечность, что запрещено.");
    if (n <= minVal)
        throw new RangeError("Число должно быть > " + minVal);
    return n;
}
/**
 * Ищет паттерн в строке. Предполагая что паттерн там обязательно есть 1 раз. Если
 * нет или случился больше раз, валим ошибку
 * @param str строка в которой ищем
 * @param rx паттерн который ищем
 */
function matchedOrError(str, rx, errMsg) {
    var m = str.match(rx);
    if (m == null)
        throw new Error(errMsg || "\u041F\u0430\u0442\u0442\u0435\u0440\u043D " + rx + " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 " + str);
    if (m.length > 1)
        throw new Error(errMsg || "\u041F\u0430\u0442\u0442\u0435\u0440\u043D " + rx + " \u043D\u0430\u0439\u0434\u0435\u043D \u0432 " + str + " " + m.length + " \u0440\u0430\u0437 \u0432\u043C\u0435\u0441\u0442\u043E \u043E\u0436\u0438\u0434\u0430\u0435\u043C\u043E\u0433\u043E 1");
    return m[0];
}
/**
 * Пробуем прогнать регулярное выражение на строку, если не прошло, то вывалит ошибку.
 * иначе вернет массив. 0 элемент это найденная подстрока, остальные это найденные группы ()
 * @param str
 * @param rx
 * @param errMsg
 */
function execOrError(str, rx, errMsg) {
    var m = rx.exec(str);
    if (m == null)
        throw new Error(errMsg || "\u041F\u0430\u0442\u0442\u0435\u0440\u043D " + rx + " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D \u0432 " + str);
    return m;
}
/**
 * из строки пробует извлечь все вещественные числа. Рекомендуется применять ТОЛЬКО для извлечения из текстовых строк.
 * для простого парсинга числа пойдет numberfy
 * Если их нет вернет null
 * @param str
 */
function extractFloatPositive(str) {
    var m = cleanStr(str).match(/\d+\.\d+/ig);
    if (m == null)
        return null;
    var n = m.map(function (i, e) { return numberfyOrError($(e).text(), -1); });
    return n;
}
/**
 * из указанной строки которая должна быть ссылкой, извлекает числа. обычно это id юнита товара и так далее
 * @param str
 */
function extractIntPositive(str) {
    var m = cleanStr(str).match(/\d+/ig);
    if (m == null)
        return null;
    var n = m.map(function (val, i, arr) { return numberfyOrError(val, -1); });
    return n;
}
/**
 * По текстовой строке возвращает номер месяца начиная с 0 для января. Либо null
 * @param str очищенная от пробелов и лишних символов строка
 */
function monthFromStr(str) {
    var mnth = ["янв", "февр", "мар", "апр", "май", "июн", "июл", "авг", "сент", "окт", "нояб", "дек"];
    for (var i = 0; i < mnth.length; i++) {
        if (str.indexOf(mnth[i]) === 0)
            return i;
    }
    return null;
}
/**
 * По типовой игровой строке даты вида 10 января 55 г., 3 февраля 2017 - 22.10.12
 * выдергивает именно дату и возвращает в виде объекта даты
 * @param str
 */
function extractDate(str) {
    var dateRx = /^(\d{1,2})\s+([а-я]+)\s+(\d{1,4})/i;
    var m = dateRx.exec(str);
    if (m == null)
        return null;
    var d = parseInt(m[1]);
    var mon = monthFromStr(m[2]);
    if (mon == null)
        return null;
    var y = parseInt(m[3]);
    return new Date(y, mon, d);
}
/**
 * из даты формирует короткую строку типа 01.12.2017
 * @param date
 */
function dateToShort(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var dStr = d < 10 ? "0" + d : d.toString();
    var mStr = m < 10 ? "0" + m : m.toString();
    return dStr + "." + mStr + "." + yyyy;
}
/**
 * из строки вида 01.12.2017 формирует дату
 * @param str
 */
function dateFromShort(str) {
    var items = str.split(".");
    var d = parseInt(items[0]);
    if (d <= 0)
        throw new Error("дата неправильная.");
    var m = parseInt(items[1]) - 1;
    if (m < 0)
        throw new Error("месяц неправильная.");
    var y = parseInt(items[2]);
    if (y < 0)
        throw new Error("год неправильная.");
    return new Date(y, m, d);
}
/**
 * По заданному числу возвращает число с разделителями пробелами для удобства чтения
 * @param num
 */
function sayNumber(num) {
    if (num < 0)
        return "-" + sayMoney(-num);
    if (Math.round(num * 100) / 100 - Math.round(num))
        num = Math.round(num * 100) / 100;
    else
        num = Math.round(num);
    var s = num.toString();
    var s1 = "";
    var l = s.length;
    var p = s.indexOf(".");
    if (p > -1) {
        s1 = s.substr(p);
        l = p;
    }
    else {
        p = s.indexOf(",");
        if (p > -1) {
            s1 = s.substr(p);
            l = p;
        }
    }
    p = l - 3;
    while (p >= 0) {
        s1 = ' ' + s.substr(p, 3) + s1;
        p -= 3;
    }
    if (p > -3) {
        s1 = s.substr(0, 3 + p) + s1;
    }
    if (s1.substr(0, 1) == " ") {
        s1 = s1.substr(1);
    }
    return s1;
}
/**
 * Для денег подставляет нужный символ при выводе на экран
 * @param num
 * @param symbol
 */
function sayMoney(num, symbol) {
    var result = sayNumber(num);
    if (symbol != null) {
        if (num < 0)
            result = '-' + symbol + sayNumber(Math.abs(num));
        else
            result = symbol + result;
    }
    return result;
}
// РЕГУЛЯРКИ ДЛЯ ССЫЛОК ------------------------------------
// для 1 юнита
// 
var url_unit_rx = /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+/i; // внутри юнита. любая страница
var url_unit_main_rx = /\/\w+\/(?:main|window)\/unit\/view\/\d+\/?$/i; // главная юнита
var url_unit_finance_report = /\/[a-z]+\/main\/unit\/view\/\d+\/finans_report(\/graphical)?$/i; // финанс отчет
var url_trade_hall_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/trading_hall\/?/i; // торговый зал
var url_supply_rx = /\/[a-z]+\/unit\/supply\/create\/\d+\/step2\/?$/i; // заказ товара в маг, или склад. в общем стандартный заказ товара
var url_equipment_rx = /\/[a-z]+\/window\/unit\/equipment\/\d+\/?$/i; // заказ оборудования на завод, лабу или куда то еще
// для компании
// 
var url_unit_list_rx = /\/[a-z]+\/(?:main|window)\/company\/view\/\d+(\/unit_list)?(\/xiooverview|\/overview)?$/i; // список юнитов. Работает и для списка юнитов чужой компании
var url_rep_finance_byunit = /\/[a-z]+\/main\/company\/view\/\d+\/finance_report\/by_units(?:\/.*)?$/i; // отчет по подразделениями из отчетов
var url_rep_ad = /\/[a-z]+\/main\/company\/view\/\d+\/marketing_report\/by_advertising_program$/i; // отчет по рекламным акциям
var url_manag_equip_rx = /\/[a-z]+\/window\/management_units\/equipment\/(?:buy|repair)$/i; // в окне управления юнитами групповой ремонт или закупка оборудования
var url_manag_empl_rx = /\/[a-z]+\/main\/company\/view\/\d+\/unit_list\/employee\/?$/i; // управление - персонал
// для для виртономики
// 
var url_global_products_rx = /[a-z]+\/main\/globalreport\/marketing\/by_products\/\d+\/?$/i; // глобальный отчет по продукции из аналитики
var url_products_rx = /\/[a-z]+\/main\/common\/main_page\/game_info\/products$/i; // страница со всеми товарами игры
/**
 * По заданной ссылке и хтмл определяет находимся ли мы внутри юнита или нет.
 * Если на задавать ссылку и хтмл то берет текущий документ.
 * Вызов без параметров приводит к определению находимся ли мы своем юните сейчас
 * @param urlPath
 * @param $html
 * @param my своя компания или нет?
 */
function isUnit(urlPath, $html, my) {
    if (my === void 0) { my = true; }
    if (!urlPath || !$html) {
        urlPath = document.location.pathname;
        $html = $(document);
    }
    // для ситуации когда мы внутри юнита характерно что всегда ссылка вида 
    // https://virtonomica.ru/olga/main/unit/view/6452212/*
    var urlOk = url_unit_rx.test(urlPath);
    if (!urlOk)
        return false;
    // но у своего юнита ссыль на офис имеет тот же айди что и ссыль на дашборду. А для чужого нет
    var urlOffice = $html.find("div.officePlace a").attr("href");
    var urlDash = $html.find("a.dashboard").attr("href");
    if (urlOffice.length === 0 || urlDash.length === 0)
        throw new Error("Ссылка на офис или дашборду не может быть найдена");
    var isMy = (urlOffice + "/dashboard" === urlDash);
    return my ? isMy : !isMy;
}
/**
 * Проверяет что мы именно на своей странице со списком юнитов. По ссылке и id компании
 * Проверок по контенту не проводит.
 */
function isMyUnitList() {
    // для своих и чужих компани ссылка одна, поэтому проверяется и id
    if (url_unit_list_rx.test(document.location.pathname) === false)
        return false;
    // запрос id может вернуть ошибку если мы на window ссылке. значит точно у чужого васи
    try {
        var id = getCompanyId();
        var urlId = extractIntPositive(document.location.pathname); // полюбому число есть иначе регекс не пройдет
        if (urlId[0] != id)
            return false;
    }
    catch (err) {
        return false;
    }
    return true;
}
/**
 * Проверяет что мы именно на чужой!! странице со списком юнитов. По ссылке.
 * Проверок по контенту не проводит.
 */
function isOthersUnitList() {
    // для своих и чужих компани ссылка одна, поэтому проверяется и id
    if (url_unit_list_rx.test(document.location.pathname) === false)
        return false;
    try {
        // для чужого списка будет разный айди в дашборде и в ссылке
        var id = getCompanyId();
        var urlId = extractIntPositive(document.location.pathname); // полюбому число есть иначе регекс не пройдет
        if (urlId[0] === id)
            return false;
    }
    catch (err) {
        // походу мы на чужом window списке. значит ок
        return true;
    }
    return true;
}
function isUnitMain(urlPath, html, my) {
    if (my === void 0) { my = true; }
    var ok = url_unit_main_rx.test(urlPath);
    if (!ok)
        return false;
    var hasTabs = $(html).find("ul.tabu").length > 0;
    if (my)
        return hasTabs;
    else
        return !hasTabs;
}
//function isOthersUnitMain() {
//    // проверим линк и затем наличие табулятора. Если он есть то свой юнит, иначе чужой
//    let ok = url_unit_main_rx.test(document.location.pathname);
//    if (ok)
//        ok = $("ul.tabu").length === 0;
//    return ok;
//}
function isUnitFinanceReport() {
    return url_unit_finance_report.test(document.location.pathname);
}
function isCompanyRepByUnit() {
    return url_rep_finance_byunit.test(document.location.pathname);
}
/**
 * Возвращает Истину если данная страница есть страница в магазине своем или чужом. Иначе Ложь
 * @param html полностью страница
 * @param my свой юнит или чужой
 */
function isShop(html, my) {
    if (my === void 0) { my = true; }
    var $html = $(html);
    // нет разницы наш или чужой юнит везде картинка мага нужна. ее нет только если window
    var $img = $html.find("#unitImage img[src*='/shop_']");
    if ($img.length > 1)
        throw new Error("\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E (" + $img.length + ") \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u0430.");
    return $img.length > 0;
}
/**
 * Возвращает Истину если данная страница есть страница в заправке своей или чужой. Иначе Ложь
 * @param html полностью страница
 * @param my свой юнит или чужой
 */
function isFuel(html, my) {
    if (my === void 0) { my = true; }
    var $html = $(html);
    // нет разницы наш или чужой юнит везде картинка мага нужна
    var $img = $html.find("#unitImage img[src*='/fuel_']");
    if ($img.length > 1)
        throw new Error("\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E (" + $img.length + ") \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u0430.");
    return $img.length > 0;
}
function hasTradeHall(html, my) {
    if (my === void 0) { my = true; }
    var $html = $(html);
    if (my) {
        var $a = $html.find("ul.tabu a[href$=trading_hall]");
        if ($a.length > 1)
            throw new Error("Найдено больше одной ссылки на трейдхолл.");
        return $a.length === 1;
    }
    else
        return false;
}
// let url_visitors_history_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/visitors_history\/?/i;
//function isVisitorsHistory() {
//    return url_visitors_history_rx.test(document.location.pathname);
//}
// JQUERY ----------------------------------------
/**
 * Возвращает ближайшего родителя по имени Тэга
   работает как и closest. Если родитель не найден то не возвращает ничего для данного элемента
    то есть есть шанс что было 10 а родителей нашли 4 и их вернули.
 * @param items набор элементов JQuery
 * @param tagname имя тэга. tr, td, span и так далее
 */
function closestByTagName(items, tagname) {
    var tag = tagname.toUpperCase();
    var found = [];
    for (var i = 0; i < items.length; i++) {
        var node = items[i];
        while ((node = node.parentNode) && node.nodeName != tag) { }
        ;
        if (node)
            found.push(node);
    }
    return $(found);
}
/**
 * Для заданного элемента, находит все непосредственно расположенные в нем текстовые ноды и возвращает их текст.
   очень удобен для извлечения непосредственного текста из тэга БЕЗ текста дочерних нодов
 * @param item 1 объект типа JQuery
 */
function getOnlyText(item) {
    // просто children() не отдает текстовые ноды.
    var $childrenNodes = item.contents();
    var res = [];
    for (var i = 0; i < $childrenNodes.length; i++) {
        var el = $childrenNodes.get(i);
        if (el.nodeType === 3)
            res.push($(el).text()); // так как в разных браузерах текст запрашивается по разному, 
    }
    return res;
}
/**
 * Пробует найти ровно 1 элемент для заданного селектора. если не нашло или нашло больше валит ошибку
 * @param $item
 * @param selector
 */
function oneOrError($item, selector) {
    var $one = $item.find(selector);
    if ($one.length != 1)
        throw new Error("\u041D\u0430\u0439\u0434\u0435\u043D\u043E " + $one.length + " \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 \u0432\u043C\u0435\u0441\u0442\u043E 1 \u0434\u043B\u044F \u0441\u0435\u043B\u0435\u043A\u0442\u043E\u0440\u0430 " + selector);
    return $one;
}
// AJAX ----------------------------------------
/**
 * Отправляет запрос на установку нужной пагинации. Возвращает promice дальше делай с ним что надо.
 */
function doRepage(pages, $html) {
    // если не задать данные страницы, то считаем что надо использовать текущую
    if ($html == null)
        $html = $(document);
    // снизу всегда несколько кнопок для числа страниц, НО одна может быть уже нажата мы не знаем какая
    // берем просто любую ненажатую, извлекаем ее текст, на у далее в ссылке всегда
    // есть число такое же как текст в кнопке. Заменяем на свое и все ок.
    var $pager = $html.find('ul.pager_options li').has("a").last();
    var num = $pager.text().trim();
    var pagerUrl = $pager.find('a').attr('href').replace(num, pages.toString());
    // запросили обновление пагинации, дальше юзер решает что ему делать с этим
    var deffered = $.Deferred();
    $.get(pagerUrl)
        .done(function (data, status, jqXHR) { return deffered.resolve(data); })
        .fail(function (err) { return deffered.reject("Не удалось установить пагинацию => " + err); });
    return deffered.promise();
}
/**
 * Загружается указанную страницу используя заданное число повторов и таймаут. Так же можно задать
 * нужно ли убирать пагинацию или нет. Если нужно, то функция вернет страничку БЕЗ пагинации
 * @param url
 * @param retries число попыток
 * @param timeout
 * @param repage нужно ли убирать пагинацию
 */
function getPage(url, retries, timeout, repage) {
    if (retries === void 0) { retries = 10; }
    if (timeout === void 0) { timeout = 1000; }
    if (repage === void 0) { repage = true; }
    var deffered = $.Deferred();
    // сначала запросим саму страницу с перезапросом по ошибке
    tryGet(url, retries, timeout)
        .then(function (html) {
        var locdef = $.Deferred();
        if (html == null) {
            locdef.reject("неизвестная ошибка. страница пришла пустая " + url);
            return locdef.promise();
        }
        // если страниц нет, то как бы не надо ничо репейджить
        // если не надо репейджить то тоже не будем
        var $html = $(html);
        if (!repage || !hasPages($html)) {
            deffered.resolve(html);
        }
        else {
            // репейджим
            var purl = getRepageUrl($html, 10000);
            if (purl == null)
                locdef.reject("не смог вытащить урл репейджа хотя он там должен быть");
            else
                locdef.resolve(purl);
        }
        return locdef.promise();
    }) // если нет репейджа все закончится тут
        .then(function (purl) {
        var locdef = $.Deferred();
        tryGet(purl, retries, timeout)
            .done(function () { return locdef.resolve(); })
            .fail(function (err) { return locdef.reject("ошибка репейджа => " + err); });
        return locdef.promise();
    }) // запросим установку репейджа
        .then(function () { return tryGet(url, retries, timeout); }) // снова запросим страницу
        .then(function (html) { return deffered.resolve(html); })
        .fail(function (err) { return deffered.reject(err); });
    return deffered.promise();
}
/**
 * Запрашивает страницу. При ошибке поробует повторить запрос через заданное число секунд.
 * Пробует заданное число попыток, после чего возвращает reject
 * @param url
 * @param retries число попыток загрузки
 * @param timeout таймаут между попытками
 */
function tryGet(url, retries, timeout) {
    if (retries === void 0) { retries = 10; }
    if (timeout === void 0) { timeout = 1000; }
    var deffered = $.Deferred();
    $.ajax({
        url: url,
        type: "GET",
        success: function (data, status, jqXHR) { return deffered.resolve(data); },
        error: function (jqXHR, textStatus, errorThrown) {
            retries--;
            if (retries <= 0) {
                deffered.reject("Не смог загрузить страницу " + this.url);
                return;
            }
            logDebug("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 " + this.url + " \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C " + retries + " \u043F\u043E\u043F\u044B\u0442\u043E\u043A");
            var _this = this;
            setTimeout(function () { return $.ajax(_this); }, timeout);
        }
    });
    return deffered.promise();
}
// COMMON ----------------------------------------
var $xioDebug = false;
function logDebug(msg) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (!$xioDebug)
        return;
    if (args.length === 0)
        console.log(msg);
    else
        console.log(msg, args);
}
/**
 * определяет есть ли на странице несколько страниц которые нужно перелистывать или все влазит на одну
 * если не задать аргумента, будет брать текущую страницу
 * @param $html код страницы которую надо проверить
 */
function hasPages($html) {
    // если не задать данные страницы, то считаем что надо использовать текущую
    if ($html == null)
        $html = $(document);
    // там не только кнопки страниц но еще и текст Страницы в первом li поэтому > 2
    var $pageLinks = $html.find('ul.pager_list li');
    return $pageLinks.length > 2;
}
/**
 * Формирует ссылку на установку новой пагинации. Если страница не имеет пагинатора, вернет null
 * @param $html
 * @param pages число элементов на страницу которое установить
 */
function getRepageUrl($html, pages) {
    if (pages === void 0) { pages = 10000; }
    if (!hasPages($html))
        return null;
    // снизу всегда несколько кнопок для числа страниц, НО одна может быть уже нажата мы не знаем какая
    // берем просто любую ненажатую, извлекаем ее текст, на у далее в ссылке всегда
    // есть число такое же как текст в кнопке. Заменяем на свое и все ок.
    var $pager = $html.find('ul.pager_options li').has("a").last();
    var num = $pager.text().trim();
    return $pager.find('a').attr('href').replace(num, pages.toString());
}
// SAVE & LOAD ------------------------------------
/**
 * По заданным параметрам создает уникальный ключик использую уникальный одинаковый по всем скриптам префикс
 * @param realm реалм для которого сейвить. Если кросс реалмово, тогда указать null
 * @param code строка отличающая данные скрипта от данных другого скрипта
 * @param subid если для юнита, то указать. иначе пропустить
 */
function buildStoreKey(realm, code, subid) {
    if (code.length === 0)
        throw new RangeError("Параметр code не может быть равен '' ");
    if (realm != null && realm.length === 0)
        throw new RangeError("Параметр realm не может быть равен '' ");
    if (subid != null && realm == null)
        throw new RangeError("Как бы нет смысла указывать subid и не указывать realm");
    var res = "^*"; // уникальная ботва которую добавляем ко всем своим данным
    if (realm != null)
        res += "_" + realm;
    if (subid != null)
        res += "_" + subid;
    res += "_" + code;
    return res;
}
//
// Сюда все функции которые парсят данные со страниц
//
/**
 * Возвращает ТОЛЬКО текст элемента БЕЗ его наследников
 * @param el
 */
function getInnerText(el) {
    return $(el).clone().children().remove().end().text();
}
/**
 * Из набора HTML элементов представляющих собой tr парсит subid. Ряды должны быть стандартного формата.
 */
function parseSubid(trList) {
    if (trList == null)
        throw new ArgumentNullError("trList");
    var f = function (i, e) { return numberfyOrError($(e).text()); };
    return $(trList).find("td.unit_id").map(f).get();
}
/**
 * Берет локальное хранилище и тащит оттуда все записи по юнитам. возвращает subid
 */
function parseAllSavedSubid(realm) {
    if (!realm || realm.length === 0)
        throw new ArgumentNullError("realm");
    var subids = [];
    var rx = new RegExp("x" + realm + "\\d+");
    for (var key in localStorage) {
        if (!rx.test(key))
            continue;
        var m = key.match(/\d+/);
        if (m != null)
            subids.push(numberfy(m[0]));
    }
    return subids;
}
/**
 * Парсинг главной страницы с юнитами.
 * @param html
* @param url
 */
function parseUnitList(html, url) {
    var $html = $(html);
    try {
        var $table = $html.find("table.unit-list-2014");
        var _subids = $table.find("td.unit_id").map(function (i, e) { return numberfyOrError($(e).text()); }).get();
        var _type = $table.find("td.info").map(function (i, e) {
            var s = $(e).attr("class").split("-")[1];
            if (s == null)
                throw new RangeError("class attribute doesn't contains type part.");
            return s;
        }).get();
        if (_type.length !== _subids.length)
            throw new Error("\u0427\u0438\u0441\u043B\u043E subid:" + _subids.length + " \u043D\u0435 \u0441\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0441 \u0447\u0438\u0441\u043B\u043E\u043C \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0445 \u0442\u0438\u043F\u043E\u0432 \u044E\u043D\u0438\u0442\u043E\u0432 " + _type.length);
        return { subids: _subids, type: _type };
    }
    catch (err) {
        console.log(url);
        throw err;
    }
}
/**
 * Парсит "/main/unit/view/ + subid + /sale" урлы
 * Склады, заводы это их тема
 * @param html
 * @param url
 */
function parseSale(html, url) {
    var $html = $(html);
    try {
        var $rows = $html.find("table.grid").find("tr.even, tr.odd");
        // помним что на складах есть позиции без товаров и они как бы не видны по дефолту в продаже, но там цена 0 и есть политика сбыта.
        var _form = $html.find("[name=storageForm]");
        // может быть -1 если вдруг ничего не выбрано в селекте, что маовероятно
        var _policy = $rows.find("select:nth-child(3)").map(function (i, e) { return $(e).find("[selected]").index(); }).get();
        var _price = $rows.find("input.money:nth-child(1)").map(function (i, e) { return numberfy($(e).val()); }).get();
        var _incineratorMaxPrice = $html.find('span[style="COLOR: green;"]').map(function (i, e) { return numberfy($(e).text()); }).get();
        var stockIndex = $html.find("table.grid").find("th:contains('На складе')").index();
        var $stockTd = $rows.children("td:nth-child(" + (stockIndex + 1) + ")");
        var _stockamount = $stockTd.find("tr:nth-child(1)").find("td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _stockqual = $stockTd.find("tr:nth-child(2)").find("td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _stockprime = $stockTd.find("tr:nth-child(3)").find("td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        // относится к производству. для складов тупо редиректим на ячейку со складом. Будет одно и то же для склада и для выхода.
        var outIndex = $html.find("table.grid").find("th:contains('Выпуск')").index();
        var $outTd = outIndex >= 0 ? $rows.children("td:nth-child(" + (outIndex + 1) + ")") : $stockTd;
        var _outamount = $outTd.find("tr:nth-child(1)").find("td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _outqual = $outTd.find("tr:nth-child(2)").find("td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _outprime = $outTd.find("tr:nth-child(3)").find("td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        // название продукта Спортивное питание, Маточное молочко и так далее
        var _product = $rows.find("a:not([onclick])").map(function (i, e) {
            var t = $(e).text();
            if (t.trim() === "")
                throw new Error("product name is empty");
            return t;
        }).get();
        // номер продукта
        var _productId = $rows.find("a:not([onclick])").map(function (i, e) {
            var m = $(e).attr("href").match(/\d+/);
            if (m == null)
                throw new Error("product id not found.");
            return numberfyOrError(m[0]);
        }).get();
        // "Аттика, Македония, Эпир и Фессалия"
        var _region = $html.find(".officePlace a:eq(-2)").text();
        if (_region.trim() === "")
            throw new Error("region not found");
        // если покупцов много то появляется доп ссылка на страницу с контрактами. эта херь и говорит есть она или нет
        var _contractpage = !!$html.find(".tabsub").length;
        // TODO: сделать чтобы контракты были вида [товар, [линк на юнит, цена контракта]]. Тогда тупо словарь удобный для работы а не текущая хуйня
        // данное поле существует только если НЕТ ссылки на контракты то есть в простом случае и здесь может быть такой хуйня
        // ["Молоко", "$1.41", "$1.41", "$1.41", "Мясо", "$5.62"]
        // идет категория, потом цены покупателей, потом снова категория и цены. И как бы здесь нет порядка
        // Если покупателей нет, гарантируется пустой массив!
        var _contractprice = ($html.find("script:contains(mm_Msg)").text().match(/(\$(\d|\.| )+)|(\[\'name\'\]		= \"[a-zA-Zа-яА-ЯёЁ ]+\")/g) || []).map(function (e) {
            return e[0] === "[" ? e.slice(13, -1) : numberfy(e);
        });
        return {
            form: _form,
            policy: _policy,
            price: _price,
            incineratorMaxPrice: _incineratorMaxPrice,
            outamount: _outamount,
            outqual: _outqual,
            outprime: _outprime,
            stockamount: _stockamount,
            stockqual: _stockqual,
            stockprime: _stockprime,
            product: _product,
            productId: _productId,
            region: _region,
            contractpage: _contractpage,
            contractprice: _contractprice
        };
    }
    catch (err) {
        throw new ParseError("sale", url, err);
    }
}
function parseSaleNew(html, url) {
    var $html = $(html);
    // парсинг ячейки продукта на складе или на производстве
    // продукт идентифицируется уникально через картинку и имя. Урл на картинку нам пойдет
    // так же есть у продуктов уникальный id, но не всегда его можно выдрать
    var parseProduct = function ($td) {
        var img = $td.find("img").eq(0).attr("src");
        var $a = $td.find("a");
        // название продукта Спортивное питание, Маточное молочко и так далее
        var name = $a.text().trim();
        if (name.length === 0)
            throw new Error("Имя продукта пустое.");
        // номер продукта
        var m = $a.attr("href").match(/\d+/);
        if (m == null)
            throw new Error("id продукта не найден");
        var id = numberfyOrError(m[0], 0); // должно быть больше 0 полюбому
        return { name: name, img: img, id: id };
    };
    // парсинг ячеек на складе и выпуск 
    // если нет товара то прочерки стоят.вывалит - 1 для таких ячеек
    var parseStock = function ($td) {
        return {
            quantity: numberfy($td.find("tr").eq(0).find("td").eq(1).text()),
            quality: numberfy($td.find("tr").eq(1).find("td").eq(1).text()),
            price: numberfy($td.find("tr").eq(2).find("td").eq(1).text()),
            brand: -1
        };
    };
    // ищет имена в хедерах чтобы получить индексы колонок
    var parseHeaders = function ($ths) {
        // индексы колонок с данными
        var prodIndex = $ths.filter(":contains('Продукт')").index();
        var stockIndex = $ths.filter(":contains('На складе')").index();
        // для склада нет выпуска и ячейки может не быть. Просто дублируем складскую ячейку
        var outIndex = $ths.filter(":contains('Выпуск')").index();
        if (outIndex < 0)
            outIndex = stockIndex;
        var policyIndex = $ths.filter(":contains('Политика сбыта')").index();
        var priceIndex = $ths.filter(":contains('Цена')").index();
        var orderedIndex = $ths.filter(":contains('Объем заказов')").index();
        var freeIndex = $ths.filter(":contains('Свободно')").index();
        var obj = {
            prod: prodIndex,
            stock: stockIndex,
            out: outIndex,
            policy: policyIndex,
            price: priceIndex,
            ordered: orderedIndex,
            free: freeIndex
        };
        return obj;
    };
    var parseContractRow = function ($row) {
        // тип покупца вытащим из картинки. для завода workshop
        var items = $row.find("img[src*=unit_types]").attr("src").split("/");
        var unitType = items[items.length - 1].split(".")[0];
        var companyName = $row.find("b").text();
        var $a = $row.find("a").eq(1);
        var unitId = matchedOrError($a.attr("href"), new RegExp(/\d+/));
        var $td = $a.closest("td");
        var purshased = numberfyOrError($td.next("td").text(), -1);
        var ordered = numberfyOrError($td.next("td").next("td").text(), -1);
        var price = numberfyOrError($td.next("td").next("td").next("td").text(), -1);
        return {
            CompanyName: companyName,
            UnitType: unitType,
            UnitId: unitId,
            Ordered: ordered,
            Purchased: purshased,
            Price: price
        };
    };
    try {
        var $storageTable = $("table.grid");
        // помним что на складах есть позиции без товаров и они как бы не видны по дефолту в продаже, но там цена 0 и есть политика сбыта.
        var _storageForm = $html.find("[name=storageForm]");
        var _incineratorMaxPrice = $html.find('span[style="COLOR: green;"]').map(function (i, e) { return numberfy($(e).text()); }).get();
        // "Аттика, Македония, Эпир и Фессалия"
        var _region = $html.find(".officePlace a:eq(-2)").text().trim();
        if (_region === "")
            throw new Error("region not found");
        // если покупцов много то появляется доп ссылка на страницу с контрактами. эта херь и говорит есть она или нет
        var _contractpage = !!$html.find(".tabsub").length;
        // берем все стркои включая те где нет сбыта и они пусты. Может быть глюки если заказы есть товара нет. Хз в общем.
        // список ВСЕХ продуктов на складе юнита. Даже тех которых нет в наличии, что актуально для складов
        var products = {};
        var $rows = $storageTable.find("select[name*='storageData']").closest("tr");
        var th = parseHeaders($storageTable.find("th"));
        for (var i = 0; i < $rows.length; i++) {
            var $r = $rows.eq(i);
            var product = parseProduct($r.children("td").eq(th.prod));
            // для складов и производства разный набор ячеек и лучше привязаться к именам чем индексам
            var stock = parseStock($r.children("td").eq(th.stock));
            var out = parseStock($r.children("td").eq(th.out));
            var freeQuantity = numberfyOrError($r.children("td").eq(th.free).text(), -1);
            var orderedQuantity = numberfyOrError($r.children("td").eq(th.ordered).text(), -1);
            // может быть -1 если вдруг ничего не выбрано в селекте, что маовероятно
            var policy = $r.find("select:nth-child(3)").prop("selectedIndex");
            var price = numberfyOrError($r.find("input.money:nth-child(1)").eq(0).val(), -1);
            if (products[product.img] != null)
                throw new Error("Что то пошло не так. Два раза один товар");
            products[product.img] = {
                product: product,
                stock: stock,
                out: out,
                freeQuantity: freeQuantity,
                orderedQuantity: orderedQuantity,
                salePolicy: policy,
                salePrice: price
            };
        }
        // Парсим контракты склада
        var contracts = {};
        if (_contractpage) {
        }
        else {
            var $consumerForm = $html.find("[name=consumerListForm]");
            var $consumerTable = $consumerForm.find("table.salelist");
            // находим строки с заголовками товара. Далее между ними находятся покупатели. Собираем их
            var $prodImgs = $consumerTable.find("img").filter("[src*='products']");
            var $productRows = $prodImgs.closest("tr"); // ряды содержащие категории то есть имя товара
            // покупцы в рядах с id
            var $contractRows = $consumerTable.find("tr[id]");
            if ($contractRows.length < $prodImgs.length)
                throw new Error("Что то пошло не так. Число контрактов МЕНЬШЕ числа категорий");
            var prodInd = -1;
            var lastInd = -1;
            var key = "";
            for (var i = 0; i < $contractRows.length; i++) {
                var $r = $contractRows.eq(i);
                // если разница в индексах больше 1 значит была вставка ряда с именем товара и мы уже другой товар смотрим
                if ($r.index() > lastInd + 1) {
                    prodInd++;
                    key = $prodImgs.eq(prodInd).attr("src");
                    contracts[key] = [];
                }
                contracts[key].push(parseContractRow($r));
                lastInd = $r.index();
            }
        }
        return {
            region: _region,
            incineratorMaxPrice: _incineratorMaxPrice,
            form: _storageForm,
            contractpage: _contractpage,
            products: products,
            contracts: contracts
        };
    }
    catch (err) {
        //throw new ParseError("sale", url, err);
        throw err;
    }
}
///**
// * Парсит страницы вида "/main/unit/view/ + subid + /sale/product", а так же
// * "/main/unit/view/" + subid + "/sale/product/ + productId"
// * @param html
// * @param url
// */
//function parseSaleContracts(html: any, url: string): ISaleContract {
//    let $html = $(html);
//    // слегка дибильный подход. В объекте мы имеем цены покупцов для одной категории по url, но список категорий 
//    // каждый раз забираем весь.
//    // TODO: перепилить. Сделать контракт как {url:string, ИмяТовара:string, prices: number[]} 
//    // итоговая структура будет выглядеть так 
//    /* $mapped[subid/sale/product] = {
//            categories: string[];  - список урлов категорий
//        }
//        а далее
//        $mapped[subid/sale/product/prodId] = {
//            prodName: string; - строковое имя продукта    
//            buyerPrices: number[]; - массив цен покупцов данного товара
//        }
//        аналогично делать ISale. Вместо хуйни с string|number вставить туда сразу свойство
//        contracts: IDictionary<ISaleContract> содержащее инфу по всем товарам. ключом будет productId или его урл
//    */ 
//    try {
//        // каждая категория представляет товар который продается со склада или производства. По факту берем ссыль через которую
//        // попадаем на список покупателей товара.
//        // если покупцов товара НЕТ, тогда данной категории не будет. То есть не может быть пустая категория
//        let _categorys = $html.find("#productsHereDiv a").map(function (i, e) { return $(e).attr("href"); }).get() as any as string[];
//        // здесь уже есть четкая гарантия что резалт будет вида 
//        // ["Медицинский инструментарий", 534.46, 534.46, 534.46, 534.46]
//        // то есть первым идет название а потом цены покупателей
//        let _contractprices = ($html.find("script:contains(mm_Msg)").text().match(/(\$(\d|\.| )+)|(\[\'name\'\]		= \"[a-zA-Zа-яА-ЯёЁ ]+\")/g) || []).map(function (e) { return e[0] === "[" ? e.slice(13, -1) : numberfy(e) }) as any as string | number[]
//        return { category: _categorys, contractprice: _contractprices };
//    }
//    catch (err) {
//        throw new ParseError("sale contracts", url, err);
//    }
//}
/**
 * Парсинг данных по страницы /main/unit/view/8004742/virtasement
 * @param html
 * @param url
 */
function parseAds(html, url) {
    var $html = $(html);
    try {
        // известность
        var _celebrity = numberfyOrError($html.find(".infoblock tr:eq(0) td:eq(1)").text(), -1);
        // население города
        var _pop = (function () {
            // если регулярка сработала значит точно нашли данные
            var m = execOrError($html.find("script").text(), /params\['population'\] = (\d+);/i);
            return numberfyOrError(m[1], 0);
        })();
        // текущий бюджет, он может быть и 0
        var _budget = numberfyOrError($html.find("input:text:not([readonly])").val(), -1);
        // бюжет на поддержание известности
        // ["не менее ©110.25  в неделю для ТВ-рекламы"] здесь может быть и $110.25
        // данный бюжет тоже может быть 0 если известность 0
        var _requiredBudget = numberfyOrError($html.find(".infoblock tr:eq(1) td:eq(1)").text().split(/[$©]/g)[1], -1);
        //if (_celebrity > 0 && _requiredBudget === 0)  такое может быть при хреновой известности
        //    throw new Error("required budget can't be 0 for celebrity" + _celebrity);
        return {
            celebrity: _celebrity,
            pop: _pop,
            budget: _budget,
            requiredBudget: _requiredBudget
        };
    }
    catch (err) {
        throw new ParseError("ads", url, err);
    }
}
/**
 * Парсим данные  с формы зарплаты /window/unit/employees/engage/" + subid
 * @param html
 * @param url
 */
function parseSalary(html, url) {
    var $html = $(html);
    try {
        var _form = $html.filter("form");
        var _employees = numberfy($html.find("#quantity").val());
        var _maxEmployees = numberfy($html.find("tr.even:contains('Максимальное количество')").find("td.text_to_left").text());
        if (_maxEmployees <= 0)
            throw new RangeError("Макс число рабов не может быть 0.");
        var _salaryNow = numberfy($html.find("#salary").val());
        var _salaryCity = numberfyOrError($html.find("tr:nth-child(3) > td").text().split(/[$©]/g)[1]);
        var _skillNow = numberfy($html.find("#apprisedEmployeeLevel").text());
        var _skillCity = (function () {
            var m = $html.find("div span[id]:eq(1)").text().match(/[0-9]+(\.[0-9]+)?/);
            if (m == null)
                throw new Error("city skill not found.");
            return numberfyOrError(m[0]);
        })();
        var _skillReq = (function () {
            var m = $html.find("div span[id]:eq(1)").text().split(",")[1].match(/(\d|\.)+/);
            if (m == null)
                throw new Error("skill req not found.");
            return numberfy(m[0]);
        })();
        return {
            form: _form,
            employees: _employees,
            maxEmployees: _maxEmployees,
            salaryNow: _salaryNow,
            salaryCity: _salaryCity,
            skillNow: _skillNow,
            skillCity: _skillCity,
            skillReq: _skillReq
        };
    }
    catch (err) {
        throw new ParseError("unit list", url, err);
    }
}
/**
 * /main/user/privat/persondata/knowledge
 * @param html
 * @param url
 */
function parseManager(html, url) {
    var $html = $(html);
    try {
        // бонусной херни не всегда может быть поэтому надо заполнять руками
        var stats = (function () {
            var jq = $html.find("tr.qual_item").find("span.mainValue");
            if (jq.length === 0)
                throw new Error("top stats not found");
            // не может быть 0
            var main = jq.map(function (i, e) { return numberfyOrError($(e).text()); }).get();
            // может быть 0. иногда бонусного спана совсем нет
            var bonus = jq.map(function (i, e) {
                var bonusSpan = $(e).next("span.bonusValue");
                if (bonusSpan.length === 0)
                    return 0;
                return numberfy(bonusSpan.text());
            }).get();
            return [main, bonus];
        })();
        var _base = stats[0];
        var _bonus = stats[1];
        var _pic = $html.find(".qual_item img").map(function (i, e) { return $(e).attr("src"); }).get();
        if (_base.length !== _bonus.length || _base.length !== _pic.length)
            throw new Error("что то пошло не так. массивы разной длины");
        return {
            base: _base,
            bonus: _bonus,
            pic: _pic
        };
    }
    catch (err) {
        throw new ParseError("top manager", url, err);
    }
}
/**
 * /main/unit/view/ + subid
 * @param html
 * @param url
 */
function parseUnitMain(html, url) {
    var $html = $(html);
    try {
        var newInterf = $html.find(".unit_box").length > 0;
        if (newInterf) {
            var _employees = numberfy($html.find(".unit_box:has(.fa-users) tr:eq(0) td:eq(1)").text());
            var _salaryNow = numberfy($html.find(".unit_box:has(.fa-users) tr:eq(2) td:eq(1)").text());
            var _salaryCity = numberfy($html.find(".unit_box:has(.fa-users) tr:eq(3) td:eq(1)").text());
            var _skillNow = numberfy($html.find(".unit_box:has(.fa-users) tr:eq(4) td:eq(1)").text());
            var _skillReq = numberfy($html.find(".unit_box:has(.fa-users) tr:eq(5) td:eq(1)").text());
            // TODO: в новом интерфейсе не все гладко. проверить как оборудование ищет
            var _equipNum = numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(0) td:eq(1)").text());
            var _equipMax = numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(1) td:eq(1)").text());
            var _equipQual = numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(2) td:eq(1)").text());
            var _equipReq = numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(3) td:eq(1)").text());
            var _equipWearBlack = numberfy($html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1)").text().split("(")[1]);
            var _equipWearRed = $html.find(".unit_box:has(.fa-cogs) tr:eq(4) td:eq(1) span").length === 1;
            var _managerPic = $html.find(".unit_box:has(.fa-user) ul img").attr("src");
            var _qual = numberfy($html.find(".unit_box:has(.fa-user) tr:eq(1) td:eq(1)").text());
            var _techLevel = numberfy($html.find(".unit_box:has(.fa-industry) tr:eq(3) td:eq(1)").text());
            // общее число подчиненных по профилю
            var _totalEmployees = numberfy($html.find(".unit_box:has(.fa-user) tr:eq(2) td:eq(1)").text());
            var _img = $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0];
            var _size = numberfy($html.find("#unitImage img").attr("src").split("_")[1]);
            var _hasBooster = !$html.find("[src='/img/artefact/icons/color/production.gif']").length;
            var _hasAgitation = !$html.find("[src='/img/artefact/icons/color/politics.gif']").length;
            var _onHoliday = !!$html.find("[href$=unset]").length;
            var _isStore = !!$html.find("[href$=trading_hall]").length;
            var _departments = numberfy($html.find("tr:contains('Количество отделов') td:eq(1)").text());
            var _visitors = numberfy($html.find("tr:contains('Количество посетителей') td:eq(1)").text());
            return {
                employees: _employees,
                totalEmployees: _totalEmployees,
                employeesReq: -1,
                salaryNow: _salaryNow,
                salaryCity: _salaryCity,
                skillNow: _skillNow,
                skillCity: -1,
                skillReq: _skillReq,
                equipNum: _equipNum,
                equipMax: _equipMax,
                equipQual: _equipQual,
                equipReq: _equipReq,
                equipBroken: -1,
                equipWearBlack: _equipWearBlack,
                equipWearRed: _equipWearRed,
                managerPic: _managerPic,
                qual: _qual,
                techLevel: _techLevel,
                img: _img,
                size: _size,
                hasBooster: _hasBooster,
                hasAgitation: _hasAgitation,
                onHoliday: _onHoliday,
                isStore: _isStore,
                departments: _departments,
                visitors: _visitors
            };
        }
        else {
            var rxFloat_1 = new RegExp(/\d+\.\d+/g);
            var rxInt_1 = new RegExp(/\d+/g);
            var $block_1 = $html.find("table.infoblock");
            // Количество рабочих. может быть 0 для складов.
            var empl = (function () {
                // Возможные варианты для рабочих будут
                // 10(требуется ~ 1)
                // 10(максимум:1)
                // 10 ед. (максимум:1) это уже не включать
                // 1 000 (максимум:10 000) пробелы в числах!!
                var types = ["сотрудников", "работников", "учёных", "рабочих"];
                var res = [-1, -1];
                //let emplRx = new RegExp(/\d+\s*\(.+\d+.*\)/g);
                //let td = jq.next("td").filter((i, el) => emplRx.test($(el).text()));
                var jq = $block_1.find('td.title:contains("Количество")').filter(function (i, el) {
                    return types.some(function (t, i, arr) { return $(el).text().indexOf(t) >= 0; });
                });
                if (jq.length !== 1)
                    return res;
                // например в лаборатории будет находить вместо требований, так как их нет, макс число рабов в здании
                var m = jq.next("td").text().replace(/\s*/g, "").match(rxInt_1);
                if (!m || m.length !== 2)
                    return res;
                return [parseFloat(m[0]), parseFloat(m[1])];
            })();
            var _employees = empl[0];
            var _employeesReq = empl[1];
            // общее число подчиненных по профилю
            var _totalEmployees = numberfy($block_1.find('td:contains("Суммарное количество подчинённых")').next("td").text());
            var salary = (function () {
                //let rx = new RegExp(/\d+\.\d+.+в неделю\s*\(в среднем по городу.+?\d+\.\d+\)/ig);
                var jq = $block_1.find('td.title:contains("Зарплата")').next("td");
                if (jq.length !== 1)
                    return ["-1", "-1"];
                var m = jq.text().replace(/\s*/g, "").match(rxFloat_1);
                if (!m || m.length !== 2)
                    return ["-1", "-1"];
                return m;
            })();
            var _salaryNow = numberfy(salary[0]);
            var _salaryCity = numberfy(salary[1]);
            var skill = (function () {
                var jq = $block_1.find('td.title:contains("Уровень квалификации")').next("td");
                if (jq.length !== 1)
                    return ["-1", "-1", "-1"];
                // возможные варианты результата
                // 10.63 (в среднем по городу 9.39, требуется по технологии 6.74)
                // 9.30(в среднем по городу 16.62 )
                var m = jq.text().match(rxFloat_1);
                if (!m || m.length < 2)
                    return ["-1", "-1", "-1"];
                return [m[0], m[1], m[2] || "-1"];
            })();
            var _skillNow = numberfy(skill[0]);
            var _skillCity = numberfy(skill[1]);
            var _skillReq = numberfy(skill[2]); // для лаб требования может и не быть
            var equip = (function () {
                var res = [-1, -1, -1, -1, -1, -1, -1];
                // число оборудования тупо не ищем. гемор  не надо
                // качество оборудования и треб по технологии
                var jq = $block_1.find('td.title:contains("Качество")').next("td");
                if (jq.length === 1) {
                    // 8.40 (требуется по технологии 1.00)
                    // или просто 8.40 если нет требований
                    var m = jq.text().match(rxFloat_1);
                    if (m && m.length > 0) {
                        res[2] = parseFloat(m[0]) || -1;
                        res[3] = parseFloat(m[1]) || -1;
                    }
                }
                // красный и черный и % износа
                // 1.28 % (25+1 ед.)
                // 0.00 % (0 ед.)
                var types = ["Износ", "Здоровье"];
                jq = $block_1.find("td.title").filter(function (i, el) {
                    return types.some(function (t, i, arr) { return $(el).text().indexOf(t) >= 0; });
                });
                if (jq.length === 1) {
                    var rx = new RegExp(/(\d+\.\d+)\s*%\s*\((\d+)(?:\+(\d+))*.*\)/ig);
                    var m = rx.exec(jq.next("td").text());
                    if (m) {
                        // первым идет сама исходная строка
                        res[4] = parseFloat(m[1]); // 0  или float.
                        res[5] = parseInt(m[2]); // 0 или целое
                        res[6] = parseInt(m[3]) || -1; // красного может не быть будет undefined
                    }
                }
                return res;
            })();
            var _equipNum = equip[0];
            var _equipMax = equip[1];
            var _equipQual = equip[2];
            var _equipReq = equip[3];
            // % износа или здоровье животных для ферм.
            var _equipBroken = equip[4];
            // кол-во черного оборудования
            var _equipWearBlack = equip[5];
            // есть ли красное оборудование или нет
            var _equipWearRed = equip[6] > 0;
            var _managerPic = "";
            var _qual = (function () {
                var jq = $block_1.find("td.title:contains('Квалификация игрока')").next("td");
                if (jq.length !== 1)
                    return -1;
                return numberfy(jq.text());
            })();
            var _techLevel = (function () {
                var jq = $block_1.find("td.title:contains('Уровень технологии')").next("td");
                if (jq.length !== 1)
                    return -1;
                return numberfy(jq.text());
            })();
            var _img = $html.find("#unitImage img").attr("src").split("/")[4].split("_")[0];
            var _size = numberfy($html.find("#unitImage img").attr("src").split("_")[1]);
            //  есть ли возможность вкорячить бустер производства типо солнечных панелей или нет. если не занято то втыкает
            var _hasBooster = !$html.find("[src='/img/artefact/icons/color/production.gif']").length;
            // хз что это вообще
            var _hasAgitation = !$html.find("[src='/img/artefact/icons/color/politics.gif']").length;
            var _onHoliday = !!$html.find("[href$=unset]").length;
            var _isStore = !!$html.find("[href$=trading_hall]").length;
            var _departments = numberfy($html.find('tr:contains("Количество отделов") td:eq(1)').text()) || -1;
            var _visitors = numberfy($html.find('tr:contains("Количество посетителей") td:eq(1)').text()) || -1;
            return {
                employees: _employees,
                totalEmployees: _totalEmployees,
                employeesReq: _employeesReq,
                salaryNow: _salaryNow,
                salaryCity: _salaryCity,
                skillNow: _skillNow,
                skillCity: _skillCity,
                skillReq: _skillReq,
                equipNum: _equipNum,
                equipMax: _equipMax,
                equipQual: _equipQual,
                equipReq: _equipReq,
                equipBroken: _equipBroken,
                equipWearBlack: _equipWearBlack,
                equipWearRed: _equipWearRed,
                managerPic: _managerPic,
                qual: _qual,
                techLevel: _techLevel,
                img: _img,
                size: _size,
                hasBooster: _hasBooster,
                hasAgitation: _hasAgitation,
                onHoliday: _onHoliday,
                isStore: _isStore,
                departments: _departments,
                visitors: _visitors
            };
        }
    }
    catch (err) {
        throw err; // new ParseError("unit main page", url, err);
    }
}
/**
 * Чисто размер складов вида https://virtonomica.ru/fast/window/unit/upgrade/8006972
 * @param html
 * @param url
 */
function parseWareSize(html, url) {
    var $html = $(html);
    try {
        var _size = $html.find(".nowrap:nth-child(2)").map(function (i, e) {
            var txt = $(e).text();
            var sz = numberfyOrError(txt);
            if (txt.indexOf("тыс") >= 0)
                sz *= 1000;
            if (txt.indexOf("млн") >= 0)
                sz *= 1000000;
            return sz;
        }).get();
        var _rent = $html.find(".nowrap:nth-child(3)").map(function (i, e) { return numberfyOrError($(e).text()); }).get();
        var _id = $html.find(":radio").map(function (i, e) { return numberfyOrError($(e).val()); }).get();
        return {
            size: _size,
            rent: _rent,
            id: _id
        };
    }
    catch (err) {
        throw new ParseError("ware size", url, err);
    }
}
/**
 * Главная страница склада аналогично обычной главной юнита /main/unit/view/ + subid
 * @param html
 * @param url
 */
function parseWareMain(html, url) {
    var $html = $(html);
    try {
        if ($html.find("#unitImage img").attr("src").indexOf("warehouse") < 0)
            throw new Error("Это не склад!");
        var _size = $html.find(".infoblock td:eq(1)").map(function (i, e) {
            var txt = $(e).text();
            var sz = numberfyOrError(txt);
            if (txt.indexOf("тыс") >= 0)
                sz *= 1000;
            if (txt.indexOf("млн") >= 0)
                sz *= 1000000;
            return sz;
        }).get();
        var _full = (function () {
            var f = $html.find("[nowrap]:eq(0)").text().trim();
            if (f === "")
                throw new Error("ware full not found");
            return numberfy(f);
        })();
        var _product = $html.find(".grid td:nth-child(1)").map(function (i, e) { return $(e).text(); }).get();
        var _stock = $html.find(".grid td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _shipments = $html.find(".grid td:nth-child(6)").map(function (i, e) { return numberfy($(e).text()); }).get();
        return {
            size: _size,
            full: _full,
            product: _product,
            stock: _stock,
            shipments: _shipments
        };
    }
    catch (err) {
        throw new ParseError("ware main", url, err);
    }
}
/**
 * все продавцы данного продукта ВООБЩЕ /"+realm+"/main/globalreport/marketing/by_products/"+mapped[url].productId[i]
 * @param html
 * @param url
 */
function parseProductReport(html, url) {
    var $html = $(html);
    try {
        var $rows = $html.find(".grid").find("tr.odd, tr.even");
        // Макс ограничение на контракт. -1 если без.
        var _max = $rows.find("td.nowrap:nth-child(2)").map(function (i, e) {
            var $span = $(e).find("span");
            if ($span.length !== 1)
                return -1;
            return numberfy($span.text().split(":")[1]);
        }).get();
        // общее число на складе. может быть 0
        var _total = $rows.find("td.nowrap:nth-child(2)").map(function (i, e) {
            var txt = $(e).clone().children().remove().end().text().trim();
            if (txt.length === 0)
                throw new Error("total amount not found");
            return numberfy(txt);
        }).get();
        var _available = $rows.find("td.nowrap:nth-child(3)").map(function (i, e) { return numberfy($(e).text()); }).get();
        // не могут быть 0 по определению
        var _quality = $rows.find("td.nowrap:nth-child(4)").map(function (i, e) { return numberfyOrError($(e).text()); }).get();
        var _price = $rows.find("td.nowrap:nth-child(5)").map(function (i, e) { return numberfyOrError($(e).text()); }).get();
        // может быть независимый поставщик БЕЗ id. для таких будет -1 id
        var _subid = $rows.find("td:nth-child(1) td:nth-child(1)").map(function (i, e) {
            var jq = $(e).find("a");
            if (jq.length !== 1)
                return -1;
            var m = jq.attr("href").match(/\d+/);
            return numberfy(m ? m[0] : "-1");
        }).get();
        return {
            max: _max,
            total: _total,
            available: _available,
            quality: _quality,
            price: _price,
            subid: _subid
        };
    }
    catch (err) {
        throw new ParseError("product report", url, err);
    }
}
/**
 * "/"+realm+"/main/company/view/"+companyid+"/unit_list/employee/salary"
 * @param html
 * @param url
 */
function parseEmployees(html, url) {
    var $html = $(html);
    try {
        var $rows = $html.find("table.list").find(".u-c").map(function (i, e) { return $(e).closest("tr").get(); });
        var _id = $rows.find(":checkbox").map(function (i, e) { return numberfyOrError($(e).val()); }).get();
        // может быть 0 в принципе
        var _salary = $rows.find("td:nth-child(7)").map(function (i, e) {
            var txt = getInnerText(e).trim();
            if (txt.length === 0)
                throw new Error("salary not found");
            return numberfy(txt);
        }).get();
        // не может быть 0
        var _salaryCity = $rows.find("td:nth-child(8)").map(function (i, e) {
            var txt = getInnerText(e).trim(); // тут низя удалять ничо. внутри какой то инпут сраный и в нем текст
            if (txt.length === 0)
                throw new Error("salary city not found");
            return numberfyOrError(txt);
        }).get();
        // может быть 0
        var _skill = $rows.find("td:nth-child(9)").map(function (i, e) {
            var txt = $(e).text().trim(); // может быть a тег внутри. поэтому просто текст.
            if (txt.length === 0)
                throw new Error("skill not found");
            return numberfy(txt);
        }).get();
        var _skillRequired = $rows.find("td:nth-child(10)").map(function (i, e) {
            var txt = $(e).text().trim(); // может быть a тег внутри. поэтому просто текст.
            if (txt.length === 0)
                throw new Error("skill not found");
            return numberfy(txt);
        }).get();
        var _onHoliday = $rows.find("td:nth-child(11)").map(function (i, e) { return !!$(e).find(".in-holiday").length; }).get();
        // может отсутстовать если мы в отпуске -1 будет
        var _efficiency = $rows.find("td:nth-child(11)").map(function (i, e) {
            var txt = getInnerText(e).trim();
            return numberfy(txt || "-1");
        }).get();
        return {
            id: _id,
            salary: _salary,
            salaryCity: _salaryCity,
            skill: _skill,
            skillRequired: _skillRequired,
            onHoliday: _onHoliday,
            efficiency: _efficiency
        };
    }
    catch (err) {
        throw new ParseError("ware size", url, err);
    }
}
/**
 * \/.*\/main\/unit\/view\/[0-9]+\/trading_hall$
 * @param html
 * @param url
 */
function parseTradeHall(html, url) {
    var $html = $(html);
    try {
        var _history = $html.find("a.popup").map(function (i, e) { return $(e).attr("href"); }).get();
        var _report = $html.find(".grid a:has(img):not(:has(img[alt]))").map(function (i, e) { return $(e).attr("href"); }).get();
        var _img = $html.find(".grid a img:not([alt])").map(function (i, e) { return $(e).attr("src"); }).get();
        // "productData[price][{37181683}]" а не то что вы подумали
        var _name = $html.find(":text").map(function (i, e) {
            var nm = $(e).attr("name").trim();
            if (nm.length === 0)
                throw new Error("product name not found");
            return nm;
        }).get();
        var _stock = $html.find(".nowrap:nth-child(6)").map(function (i, e) {
            return numberfy($(e).text());
        }).get();
        var _deliver = $html.find(".nowrap:nth-child(5)").map(function (i, e) { return numberfy($(e).text().split("[")[1]); }).get();
        var _quality = $html.find("td:nth-child(7)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _purch = $html.find("td:nth-child(9)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _price = $html.find(":text").map(function (i, e) { return numberfy($(e).val()); }).get();
        var _share = $html.find(".nowrap:nth-child(11)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _cityprice = $html.find("td:nth-child(12)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _cityquality = $html.find("td:nth-child(13)").map(function (i, e) { return numberfy($(e).text()); }).get();
        if (_history.length !== _share.length)
            throw new Error("что то пошло не так. Количество данных различается");
        return {
            history: _history,
            report: _report,
            img: _img,
            name: _name,
            stock: _stock,
            deliver: _deliver,
            quality: _quality,
            purch: _purch,
            price: _price,
            share: _share,
            cityprice: _cityprice,
            cityquality: _cityquality
        };
    }
    catch (err) {
        throw new ParseError("trading hall", url, err);
    }
}
/**
 * Снабжение магазина
 * @param html
 * @param url
 */
function parseStoreSupply(html, url) {
    var $html = $(html);
    try {
        //  по идее на 1 товар может быть несколько поставщиков и следовательно парселов будет много а стока мало
        // парсить оно будет, но потом где при обработке данных будет жаловаться и не отработает
        // ячейка для ввода количества штук 
        var _parcel = $html.find("input:text[name^='supplyContractData[party_quantity]']").map(function (i, e) { return numberfy($(e).val()); }).get();
        // тип ограничения заказа абс или процент
        var _price_constraint_type = $html.find("select[name^='supplyContractData[constraintPriceType]']").map(function (i, e) { return $(e).val(); }).get();
        // если задан процент то будет номер опции селекта. иначе 0
        var _price_mark_up = $html.find("select[name^='supplyContractData[price_mark_up]']").map(function (i, e) { return numberfy($(e).val()); }).get();
        // макс ограничение по цене если задан абс вариант ограничения. будет 0 если в процентах
        var _price_constraint_max = $html.find("input[name^='supplyContractData[price_constraint_max]']").map(function (i, e) { return numberfy($(e).val()); }).get();
        var _quality_constraint_min = $html.find("input[name^='supplyContractData[quality_constraint_min]']").map(function (i, e) { return numberfy($(e).val()); }).get();
        var _deliver = $html.find("td.nowrap:nth-child(4)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _stock = $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _sold = $html.find("td:nth-child(2) table:nth-child(1) tr:nth-child(5) td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        // чекбокс данного поставщика
        var _offer = $html.find(".destroy").map(function (i, e) { return numberfy($(e).val()); }).get();
        var _price = $html.find("td:nth-child(9) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        // есть ли изменение цены
        var _reprice = $html.find("td:nth-child(9) table:nth-child(1) tr:nth-child(1) td:nth-child(2)").map(function (i, e) {
            return !!$(e).find("div").length;
        }).get();
        var _quality = $html.find("td:nth-child(9) table:nth-child(1) tr:nth-child(2) td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _available = $html.find("td:nth-child(10) table:nth-child(1) tr:nth-child(3) td:nth-child(2)").map(function (i, e) { return numberfy($(e).text()); }).get();
        var _img = $html.find(".noborder td > img").map(function (i, e) { return $(e).attr("src"); }).get();
        return {
            parcel: _parcel,
            price_constraint_type: _price_constraint_type,
            price_mark_up: _price_mark_up,
            price_constraint_max: _price_constraint_max,
            quality_constraint_min: _quality_constraint_min,
            deliver: _deliver,
            stock: _stock,
            sold: _sold,
            offer: _offer,
            price: _price,
            reprice: _reprice,
            quality: _quality,
            available: _available,
            img: _img
        };
    }
    catch (err) {
        throw new ParseError("store supply", url, err);
    }
}
/**
 * Со страницы с тарифами на энергию парсит все тарифы на энергию по всем отраслям для данного региона
 * @param html
 * @param url
 */
function parseEnergyPrices(html, url) {
    var $html = $(html);
    var res = {};
    try {
        var $rows = $html.find("tr").has("img");
        for (var i = 0; i < $rows.length; i++) {
            var $r = $rows.eq(i);
            var $tds = $r.children("td");
            var sector = $tds.eq(0).text().trim();
            var energyPrice = numberfyOrError($tds.eq(2).text().split("/")[0], -1);
            var products = parseProducts($tds.eq(1));
            if (res[sector] != null)
                throw new Error("Повторилась отрасль " + sector);
            res[sector] = { sector: sector, price: energyPrice, products: products };
        }
        return res;
    }
    catch (err) {
        throw err;
    }
    // собирает все продукты из ячейки
    function parseProducts($td) {
        var $imgs = $td.eq(0).find("img");
        var res = [];
        for (var i = 0; i < $imgs.length; i++) {
            var $pic = $imgs.eq(i);
            // название продукта Спортивное питание, Маточное молочко и так далее
            var name_1 = $pic.attr("title").trim();
            if (name_1.length === 0)
                throw new Error("Имя продукта пустое.");
            // номер продукта
            var m = $pic.parent("a").attr("href").match(/\d+/);
            if (m == null)
                throw new Error("id продукта не найден");
            var id = numberfyOrError(m[0], 0); // должно быть больше 0 полюбому
            var img = $pic.attr("src");
            res.push({
                name: name_1,
                img: img,
                id: id
            });
        }
        return res;
    }
    ;
}
function parseCountries(html, url) {
    var $html = $(html);
    try {
        var $tds = $html.find("td.geo");
        var countries = $tds.map(function (i, e) {
            var $a = oneOrError($(e), "a[href*=regionlist]");
            var m = matchedOrError($a.attr("href"), /\d+/i);
            return {
                id: numberfyOrError(m, 0),
                name: $a.text().trim(),
                regions: {}
            };
        });
        return countries;
    }
    catch (err) {
        throw err;
    }
}
function parseRegions(html, url) {
    var $html = $(html);
    try {
        var $tds = $html.find("td.geo");
        var regs = $tds.map(function (i, e) {
            var $a = oneOrError($(e), "a[href*=citylist]");
            var m = matchedOrError($a.attr("href"), /\d+/i);
            return {
                id: numberfyOrError(m, 0),
                name: $a.text().trim(),
                energy: {},
                salary: -1,
                tax: -1
            };
        });
        return regs;
    }
    catch (err) {
        throw err;
    }
}
function parseCities(html, url) {
    var $html = $(html);
    try {
        var $tds = $html.find("td.geo");
        var regs = $tds.map(function (i, e) {
            var $a = oneOrError($(e), "a[href*=city]");
            var m = matchedOrError($a.attr("href"), /\d+/i);
            return {
                id: numberfyOrError(m, 0),
                name: $a.text().trim(),
            };
        });
        return regs;
    }
    catch (err) {
        throw err;
    }
}
/**
 * Со странички пробуем спарсить игровую дату. А так как дата есть почти везде, то можно почти везде ее спарсить
 * @param html
 * @param url
 */
function parseGameDate(html, url) {
    var $html = $(html);
    try {
        // вытащим текущую дату, потому как сохранять данные будем используя ее
        var $date = $html.find("div.date_time");
        if ($date.length !== 1)
            throw new Error("Не получилось получить текущую игровую дату");
        var currentGameDate = extractDate(getOnlyText($date)[0].trim());
        if (currentGameDate == null)
            throw new Error("Не получилось получить текущую игровую дату");
        return currentGameDate;
    }
    catch (err) {
        throw err;
    }
}
/**
 * Парсит данные по числу рабов со страницы управления персоналам в Управлении
 * @param html
 * @param url
 */
function parseManageEmployees(html, url) {
    if (html == null)
        throw new Error("страница пуста. парсить нечего");
    var $html = $(html);
    function getOrError(n) {
        if (n == null)
            throw new Error("Argument is null");
        return n;
    }
    try {
        var $rows = $html.find("tr").has("td.u-c");
        var units_1 = {};
        $rows.each(function (i, e) {
            var $r = $(e);
            var $tds = $r.children("td");
            var n = extractIntPositive($tds.eq(2).find("a").eq(0).attr("href"));
            if (n == null || n.length === 0)
                throw new Error("не смог извлечь subid");
            var _subid = n[0];
            var _empl = numberfyOrError($tds.eq(4).text(), -1);
            var _emplMax = numberfyOrError($tds.eq(5).text(), -1);
            var _salary = numberfyOrError(getOnlyText($tds.eq(6))[0], -1);
            var _salaryCity = numberfyOrError($tds.eq(7).text(), -1);
            var $a = $tds.eq(8).find("a").eq(0);
            var _qual = numberfyOrError($a.text(), -1);
            var _qualRequired = numberfyOrError($tds.eq(9).text(), -1);
            var $tdEff = $tds.eq(10);
            var _holiday = $tdEff.find("div.in-holiday").length > 0;
            var _eff = -1;
            if (!_holiday)
                _eff = numberfyOrError($tdEff.text(), -1);
            units_1[_subid] = {
                subid: _subid,
                empl: _empl,
                emplMax: _emplMax,
                salary: _salary,
                salaryCity: _salaryCity,
                qual: _qual,
                qualRequired: _qualRequired,
                eff: _eff,
                holiday: _holiday
            };
        });
        return units_1;
    }
    catch (err) {
        throw err;
    }
}
/**
 * Парсит страницу отчета по рекламе, собирает всю инфу по всем юнитам где реклама есть. Где рекламы нет
 * те не выводятся в этой таблице их надо ручками парсить
 * @param html
 * @param url
 */
function parseReportAdvertising(html, url) {
    var $html = $(html);
    try {
        // заберем таблицы по сервисам и по торговле, а рекламу офисов не будем брать. числануть тока по шапкам
        var $tbls = $html.find("table.grid").has("th:contains('Город')");
        var $rows = $tbls.find("tr").has("a[href*='unit']"); // отсекаем шапку оставляем тока чистые
        var units_2 = {};
        $rows.each(function (i, e) {
            var $r = $(e);
            var $tds = $r.children("td");
            var n = extractIntPositive($tds.eq(1).find("a").eq(0).attr("href"));
            if (n == null || n.length === 0)
                throw new Error("не смог извлечь subid");
            var _subid = n[0];
            var _budget = numberfyOrError($tds.eq(2).text(), 0);
            var init = $tds.length > 8 ? 4 : 3;
            var _effAd = numberfyOrError($tds.eq(init).text(), -1);
            var _effUnit = numberfyOrError($tds.eq(init + 1).text(), -1);
            var _celebrity = numberfyOrError($tds.eq(init + 2).text().split("(")[0], -1);
            var _visitors = numberfyOrError($tds.eq(init + 3).text().split("(")[0], -1);
            var _profit = numberfy($tds.eq(init + 4).text());
            units_2[_subid] = {
                subid: _subid,
                budget: _budget,
                celebrity: _celebrity,
                visitors: _visitors,
                effAd: _effAd,
                effUnit: _effUnit,
                profit: _profit
            };
        });
        return units_2;
    }
    catch (err) {
        throw err;
    }
}
/**
 * Со страницы со всеми продуктами игры парсит их список
 * https://virtonomica.ru/lien/main/common/main_page/game_info/products
 * Брендовые товары здесь НЕ отображены и парсены НЕ БУДУТ
 * @param html
 * @param url
 */
function parseProducts(html, url) {
    var $html = $(html);
    try {
        var $items = $html.find("table.list").find("a").has("img");
        if ($items.length === 0)
            throw new Error("не смогли найти ни одного продукта на " + url);
        var products = $items.map(function (i, e) {
            var $a = $(e);
            var _img = $a.find("img").eq(0).attr("src");
            // название продукта Спортивное питание, Маточное молочко и так далее
            var _name = $a.attr("title").trim();
            if (_name.length === 0)
                throw new Error("Имя продукта пустое.");
            // номер продукта
            var m = matchedOrError($a.attr("href"), /\d+/);
            var _id = numberfyOrError(m, 0); // должно быть больше 0 полюбому
            return {
                id: _id,
                name: _name,
                img: _img
            };
        });
        return products;
    }
    catch (err) {
        throw err;
    }
}
function parseX(html, url) {
    //let $html = $(html);
    //try {
    //    let _size = $html.find(".nowrap:nth-child(2)").map((i, e) => {
    //        let txt = $(e).text();
    //        let sz = numberfyOrError(txt);
    //        if (txt.indexOf("тыс") >= 0)
    //            sz *= 1000;
    //        if (txt.indexOf("млн") >= 0)
    //            sz *= 1000000;
    //        return sz;
    //    }).get() as any as number[];
    //    let _rent = $html.find(".nowrap:nth-child(3)").map((i, e) => numberfyOrError($(e).text())).get() as any as number[];
    //    let _id = $html.find(":radio").map((i, e) => numberfyOrError($(e).val())).get() as any as number[];
    //    return {
    //        size: _size,
    //        rent: _rent,
    //        id: _id
    //    };
    //}
    //catch (err) {
    //    throw new ParseError("ware size", url, err);
    //}
}
//
// Свои исключения
// 
var ArgumentError = (function (_super) {
    __extends(ArgumentError, _super);
    function ArgumentError(argument, message) {
        var msg = argument + ". " + message;
        _super.call(this, msg);
    }
    return ArgumentError;
}(Error));
var ArgumentNullError = (function (_super) {
    __extends(ArgumentNullError, _super);
    function ArgumentNullError(argument) {
        var msg = argument + " is null";
        _super.call(this, msg);
    }
    return ArgumentNullError;
}(Error));
var ParseError = (function (_super) {
    __extends(ParseError, _super);
    function ParseError(dataName, url, innerError) {
        var msg = "Error parsing " + dataName;
        if (url)
            msg += "from " + url;
        // TODO: как то плохо работает. не выводит нихрена сообщений.
        msg += ".";
        if (innerError)
            msg += "\n" + innerError.message + ".";
        _super.call(this, msg);
    }
    return ParseError;
}(Error));
;
/// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
/// <reference path= "../../XioPorted/PageParsers/7_PageParserFunctions.ts" />
/// <reference path= "../../XioPorted/PageParsers/1_Exceptions.ts" />
/// <reference path= "../../XioPorted/PageParsers/2_IDictionary.ts" />
$ = jQuery = jQuery.noConflict(true);
$xioDebug = true;
// упрощаем себе жисть, подставляем имя скрипта всегда в сообщении
function log(msg) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    msg = "unit report: " + msg;
    var arr = [];
    arr.push(msg);
    arr.push.apply(arr, args);
    logDebug.apply(null, arr);
}
function run() {
    if (!isUnitMain(document.location.pathname, document, false)) {
        log("мы не в юните");
        return;
    }
    if (!isShop(document, false) && !isFuel(document, false)) {
        log("мы не в магазине и не в заправке");
        return;
    }
    // таблица с данными по товарам
    var $tbl = oneOrError($(document), "table.grid");
    var $infoBlock = oneOrError($(document), "table.infoblock tbody");
    $infoBlock.append("<tr style='color:red;'><td class='title'>Выручка: </td><td id='_turnover'>0</td></tr>");
    $infoBlock.append("<tr style='color:red;'><td class='title'>Потенциал: </td><td id='_turnoverMax'>0</td></tr>");
    var $turn = $infoBlock.find("#_turnover");
    var $turnMax = $infoBlock.find("#_turnoverMax");
    // кнопка и контейнер для вывода ошибок
    var $container = $("\n            <div>\n                <table><tbody>\n                    <tr><td id='_btnUpdate'></td></tr>\n                    <tr><td id=\"_errors\" style=\"color:red;\"></td></tr>\n                </tbody></table>\n            </div>");
    $tbl.before($container);
    var $btnTd = $container.find("#_btnUpdate");
    var $errTd = $container.find("#_errors");
    var appendErr = function (msg) {
        if ($errTd.find("span").length > 0)
            $errTd.append("</br>");
        $errTd.append("<span>" + msg + "</span>");
    };
    // вставим кнопку запроса уточнения по цифрам
    var $preciseBtn = $("<input type='button' value=' уточнить '></input>");
    $btnTd.append($preciseBtn);
    $preciseBtn.on("click", function (event) {
        $preciseBtn.prop("disabled", true);
        $errTd.children().remove();
        $.when(doUpdate())
            .then(function (quantities) { drawNumbers(quantities); })
            .fail(function (err) { appendErr("не смогли обновить данные => " + err); })
            .always(function () { return $preciseBtn.prop("disabled", false); });
    });
    // название города где маг стоит
    var cityName = $infoBlock.find("tr").eq(0).find("td").eq(1).text().split("(")[0].trim();
    if (cityName.length === 0) {
        appendErr("не нашел имя города в котором стоит данный магазин.");
        return;
    }
    // выводим общие цифры на основе чисто табличных данных. Ну и кнопку на обновление более точное
    var $rows = $tbl.find("tr").has("img");
    if ($rows.length === 0) {
        appendErr("не нашел ни одного товара.");
        return;
    }
    // урлы картинок нужны чтобы по ним найти рынки для данного товара в данном городе и взять объем рынка если чел нажмет а кнопку обновления
    var imgSrcs = $rows.find("img").map(function (i, e) { return $(e).attr("src"); });
    // грубые цифири чисто по таблице
    drawNumbers();
    // подаем строки с товарами и такой же длины словарь. в нем ключи это урлы на картинку товара, числа объем рынка
    // для товара в заданном городе
    function drawNumbers(quantities) {
        var total = 0;
        var totalMax = 0;
        $rows.each(function (i, e) {
            var $tds = $(e).find("td");
            // если нажали уточнить, у нас будет массив с реальными объемами рынка
            // поэтому мы можем посчитать более точно!
            // так как всталяем спаны, то при обновлении нужно их учитывать
            $tds.eq(1).find("span, br").remove();
            var m = matchedOrError($tds.eq(1).text().replace(/\s+/g, ""), /\d+/g);
            var quantity = numberfyOrError(m, -1);
            var price = numberfy($tds.eq(4).text()); // может быть не изв. как значение
            var share = numberfyOrError($tds.eq(5).text(), -1);
            var src = $(e).find("img").attr("src");
            if (quantities && quantities[src]) {
                quantity = quantities[src] * share / 100.0;
                $tds.eq(1).text("~ " + Math.round(quantity));
            }
            var turnover = price > 0 ? quantity * price : 0;
            var maxTurnover = share > 0 ? turnover * 100 / share : 0;
            total += turnover;
            totalMax += maxTurnover;
            turnover = Math.round(turnover);
            maxTurnover = Math.round(maxTurnover);
            $tds.eq(1).append("<br/><span style=\"color:orange;\">" + sayMoney(turnover, "$") + "</span>");
            $tds.eq(1).append("<br/><span style=\"color:gray;\">" + sayMoney(maxTurnover, "$") + "</span>");
        });
        total = Math.round(total);
        totalMax = Math.round(totalMax);
        $turn.text(sayMoney(total, "$"));
        $turnMax.text(sayMoney(totalMax, "$"));
    }
    function doUpdate() {
        var doDefered = $.Deferred();
        //if (1) {
        //    doDefered.reject("тестовая ошибка");
        //    return doDefered.promise();
        //}
        var realm = getRealm();
        //debugger;
        $.when(getProducts(), getGeos())
            .then(function (args0, args1) {
            var products = args0;
            var geos = args1;
            var deffered = $.Deferred();
            try {
                // теперь для каждого продукта на странице надо найти рынок и его объем
                // сначала формируем ссылки на страницы откуда брать данне по объему
                // "url картинки товара" = "линк на рынок в данном городе для данного товара".
                var sources = makeImgDic(imgSrcs, products, cityName, geos);
                log("", arguments);
                log("", sources);
                // сразу разрешаем промис дабы начала выполняться следующая часть задачи
                deffered.resolve(sources);
            }
            catch (err) {
                var e = err;
                deffered.reject(e.message);
                log("ошибка: ", e);
            }
            return deffered.promise();
        })
            .then(function (sources) {
            var deffered = $.Deferred();
            try {
                // запросим объемы рынка для каждого линка в sources и отпарсим
                var tasks = [];
                for (var key in sources) {
                    var url = sources[key];
                    tasks.push(getQuantity(url));
                }
                $.when.apply($, tasks)
                    .then(function () {
                    //if (args.length != imgSrcs.length)
                    //    throw new Error("report: объемов рынков загрузилось не такое же колво что и товаров");
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    var quantities = {};
                    Object.keys(sources).forEach(function (val, i, arr) {
                        quantities[val] = args[i];
                    });
                    log("", quantities);
                    deffered.resolve(quantities);
                })
                    .fail(function (err) {
                    throw new Error(err);
                });
            }
            catch (err) {
                var e = err;
                deffered.reject(e.message);
                log("ошибка: ", e);
            }
            return deffered.promise();
        })
            .then(function (quants) { return doDefered.resolve(quants); })
            .fail(function (err) {
            doDefered.reject("не смогли уточнить данные по обороту => " + err);
            //throw new Error("Не смогли уточнить данные.")
        });
        return doDefered.promise();
        function makeImgDic(imgs, products, city, geos) {
            var res = {};
            var preparedProd = prepare(products);
            for (var i = 0; i < imgs.length; i++) {
                var imgSrc = imgs[i];
                // среди продуктов найдем по картинке нужный
                // НО есть разные брендовые товары которых нет в основном списке товаров. Их тупо пропустить
                if (!preparedProd[imgSrc])
                    continue;
                var prodId = preparedProd[imgSrc].id;
                var geo = geos[cityName].geocombo;
                // /lien/main/globalreport/marketing/by_trade_at_cities/370077/7060/7065/7087
                // <option class="geocombo f-mx" value="/422607/422609/422632">Акапулько</option>
                var url = "/" + realm + "/main/globalreport/marketing/by_trade_at_cities/" + prodId + geo;
                res[imgSrc] = url;
            }
            return res;
            // конвертает в словарь массив по урлу картинки
            function prepare(products) {
                var res = {};
                for (var i = 0; i < products.length; i++)
                    res[products[i].img] = products[i];
                return res;
            }
        }
    }
    // запрашивает полный список всех продуктов реалма
    function getProducts() {
        var deffered = $.Deferred();
        var realm = getRealm();
        if (realm == null) {
            deffered.reject("не нашли реалм");
            return deffered.promise();
        }
        // запросим список всех товаров что есть в игре
        // _ttps://virtonomica.ru/lien/main/common/main_page/game_info/products
        var urlProducts = "/" + realm + "/main/common/main_page/game_info/products";
        var retries = 10;
        $.ajax({
            url: urlProducts,
            type: "GET",
            success: function (data, status, jqXHR) {
                try {
                    var products = parseProducts(data, urlProducts);
                    deffered.resolve(products);
                }
                catch (err) {
                    var e = err;
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                retries--;
                if (retries <= 0) {
                    deffered.reject("Не смог загрузить страницу " + this.url);
                    return;
                }
                appendErr("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 " + this.url + " \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C " + retries + " \u043F\u043E\u043F\u044B\u0442\u043E\u043A");
                var _this = this;
                setTimeout(function () { return $.ajax(_this); }, 1000);
            }
        });
        return deffered.promise();
    }
    // получает для каждого города вообще в мире, короткий аппендикс вида /34345/3453453/345345
    // страна/регион/город. нам это нужно чтобы запрашивать объемы рынка для товаров в маге
    function getGeos() {
        var deffered = $.Deferred();
        var realm = getRealm();
        if (realm == null) {
            deffered.reject("не нашли реалм");
            return deffered.promise();
        }
        // залезем в селекты на странице и найдем селект городов, в нем в нужном месте айдишники региона и страны
        // _ttps://virtonomica.ru/lien/main/globalreport/marketing/by_trade_at_cities
        var urlGeocombo = "/" + realm + "/main/globalreport/marketing/by_trade_at_cities";
        var retries = 10;
        $.ajax({
            url: urlGeocombo,
            type: "GET",
            success: function (data, status, jqXHR) {
                try {
                    // для страницы розницы, нам надо тока выдрать из селекта все связки по городам и странам
                    // брать 3 селект
                    var geos = extractGeocombos($(data).find("select").eq(3));
                    if (Object.keys(geos).length === 0)
                        throw new Error("Не получилось вытащить геокомбо со страницы " + urlGeocombo);
                    deffered.resolve(geos);
                }
                catch (err) {
                    var e = err;
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                retries--;
                if (retries <= 0) {
                    deffered.reject("Не смог загрузить страницу " + this.url);
                    return;
                }
                log("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 " + this.url + " \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C " + retries + " \u043F\u043E\u043F\u044B\u0442\u043E\u043A");
                var _this = this;
                setTimeout(function () { return $.ajax(_this); }, 1000);
            }
        });
        return deffered.promise();
        // забирает из селекта все опции и формирует с них словарь. имя города - добавка к ссылке
        function extractGeocombos($select) {
            var res = {};
            // <option class="geocombo f-mx" value= "/422607/422609/422632" > Акапулько < /option>
            // забираем из опций value чтобы линк получить на объемы рынка.
            $select.find("option.geocombo").each(function (i, e) {
                var cityName = getOnlyText($(e))[0];
                var geo = $(e).val();
                res[cityName] = { name: cityName, geocombo: geo };
            });
            return res;
        }
    }
    // по заданной ссылке парсит страницу рынка по рознице и находит объем рынка
    function getQuantity(url) {
        var deffered = $.Deferred();
        var retries = 10;
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data, textStatus, jqXHR) {
                try {
                    //if(1)
                    //    throw new Error("тестовая ошибка " + url);
                    var $td = $(data).find("td:contains('Объем рынка:')");
                    if ($td.length != 1)
                        throw new Error("Не нашел объем рынка для " + url);
                    var quant = numberfyOrError($td.next("td").text());
                    deffered.resolve(quant);
                }
                catch (err) {
                    var e = err;
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                retries--;
                if (retries <= 0) {
                    deffered.reject("Не смог загрузить страницу " + url);
                    return;
                }
                log("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 " + url + " \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C " + retries + " \u043F\u043E\u043F\u044B\u0442\u043E\u043A");
                var _this = this;
                setTimeout(function () { return $.ajax(_this); }, 1000);
            }
        });
        return deffered.promise();
    }
}
$(document).ready(function () { return run(); });
//# sourceMappingURL=retailUnitReport.user.js.map