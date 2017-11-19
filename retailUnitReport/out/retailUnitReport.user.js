var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
// 
// Набор вспомогательных функций для использования в других проектах. Универсальные
//   /// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
// список типов юнитов. берется по картинке в юните, или с класса i-farm, i-office в списках юнитов
var UnitTypes;
(function (UnitTypes) {
    UnitTypes[UnitTypes["unknown"] = 0] = "unknown";
    UnitTypes[UnitTypes["animalfarm"] = 1] = "animalfarm";
    UnitTypes[UnitTypes["farm"] = 2] = "farm";
    UnitTypes[UnitTypes["lab"] = 3] = "lab";
    UnitTypes[UnitTypes["mill"] = 4] = "mill";
    UnitTypes[UnitTypes["mine"] = 5] = "mine";
    UnitTypes[UnitTypes["office"] = 6] = "office";
    UnitTypes[UnitTypes["oilpump"] = 7] = "oilpump";
    UnitTypes[UnitTypes["orchard"] = 8] = "orchard";
    UnitTypes[UnitTypes["sawmill"] = 9] = "sawmill";
    UnitTypes[UnitTypes["shop"] = 10] = "shop";
    UnitTypes[UnitTypes["seaport"] = 11] = "seaport";
    UnitTypes[UnitTypes["warehouse"] = 12] = "warehouse";
    UnitTypes[UnitTypes["workshop"] = 13] = "workshop";
    UnitTypes[UnitTypes["villa"] = 14] = "villa";
    UnitTypes[UnitTypes["fishingbase"] = 15] = "fishingbase";
    UnitTypes[UnitTypes["service_light"] = 16] = "service_light";
    UnitTypes[UnitTypes["fitness"] = 17] = "fitness";
    UnitTypes[UnitTypes["medicine"] = 18] = "medicine";
    UnitTypes[UnitTypes["restaurant"] = 19] = "restaurant";
    UnitTypes[UnitTypes["laundry"] = 20] = "laundry";
    UnitTypes[UnitTypes["hairdressing"] = 21] = "hairdressing";
    UnitTypes[UnitTypes["power"] = 22] = "power";
    UnitTypes[UnitTypes["coal_power"] = 23] = "coal_power";
    UnitTypes[UnitTypes["incinerator_power"] = 24] = "incinerator_power";
    UnitTypes[UnitTypes["oil_power"] = 25] = "oil_power";
    UnitTypes[UnitTypes["fuel"] = 26] = "fuel";
    UnitTypes[UnitTypes["repair"] = 27] = "repair";
    UnitTypes[UnitTypes["apiary"] = 28] = "apiary";
    UnitTypes[UnitTypes["educational"] = 29] = "educational";
    UnitTypes[UnitTypes["kindergarten"] = 30] = "kindergarten";
    UnitTypes[UnitTypes["sun_power"] = 31] = "sun_power";
    UnitTypes[UnitTypes["network"] = 32] = "network";
    UnitTypes[UnitTypes["it"] = 33] = "it";
    UnitTypes[UnitTypes["cellular"] = 34] = "cellular";
})(UnitTypes || (UnitTypes = {}));
// уровни сервиса
var ServiceLevels;
(function (ServiceLevels) {
    ServiceLevels[ServiceLevels["none"] = -1] = "none";
    ServiceLevels[ServiceLevels["lower"] = 0] = "lower";
    ServiceLevels[ServiceLevels["low"] = 1] = "low";
    ServiceLevels[ServiceLevels["normal"] = 2] = "normal";
    ServiceLevels[ServiceLevels["high"] = 3] = "high";
    ServiceLevels[ServiceLevels["higher"] = 4] = "higher";
    ServiceLevels[ServiceLevels["elite"] = 5] = "elite";
})(ServiceLevels || (ServiceLevels = {}));
function serviceFromStrOrError(str) {
    switch (str.toLowerCase()) {
        case "элитный":
            return ServiceLevels.elite;
        case "очень высокий":
            return ServiceLevels.higher;
        case "высокий":
            return ServiceLevels.high;
        case "нормальный":
            return ServiceLevels.normal;
        case "низкий":
            return ServiceLevels.low;
        case "очень низкий":
            return ServiceLevels.lower;
        case "не известен":
            return ServiceLevels.none;
        default:
            throw new Error("Не смог идентифицировать указанный уровень сервиса " + str);
    }
}
// индекс рынка
var MarketIndex;
(function (MarketIndex) {
    MarketIndex[MarketIndex["None"] = -1] = "None";
    MarketIndex[MarketIndex["E"] = 0] = "E";
    MarketIndex[MarketIndex["D"] = 1] = "D";
    MarketIndex[MarketIndex["C"] = 2] = "C";
    MarketIndex[MarketIndex["B"] = 3] = "B";
    MarketIndex[MarketIndex["A"] = 4] = "A";
    MarketIndex[MarketIndex["AA"] = 5] = "AA";
    MarketIndex[MarketIndex["AAA"] = 6] = "AAA";
})(MarketIndex || (MarketIndex = {}));
function mIndexFromString(str) {
    let index = MarketIndex.None;
    switch (str) {
        case "AAA":
            return MarketIndex.AAA;
        case "AA":
            return MarketIndex.AA;
        case "A":
            return MarketIndex.A;
        case "B":
            return MarketIndex.B;
        case "C":
            return MarketIndex.C;
        case "D":
            return MarketIndex.D;
        case "E":
            return MarketIndex.E;
        case "?":
        case "None":
            return MarketIndex.None;
        default:
            throw new Error(`Неизвестный индекс рынка: ${str}`);
    }
}
/**
 * Простенький конвертер, который из множества формирует массив значений множества. По факту массив чисел.
   используется внутреннее представление множеств и как бы может сломаться в будущем
 * @param enumType тип множества
 */
function enum2Arr(enumType) {
    let res = [];
    for (let key in enumType) {
        if (typeof enumType[key] === "number")
            res.push(enumType[key]);
    }
    return res;
}
/**
 * Простой счетчик. Увеличивается на 1 при каждом вызове метода Next. Нужен для подсчета числа запросов
 */
class Counter {
    constructor() {
        this.Next = () => {
            this._count++;
        };
        this._count = 0;
    }
    ;
    get Count() {
        return this._count;
    }
}
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
    let newItems = [];
    for (let key in dict)
        newItems.push(key + ":" + dict[key].toString());
    return newItems.join(", ");
}
/**
 * Фильтрует заданный словарь. Выбирает из него только те элементы которые проходят фильтр.
 * В любом раскладе возвращает пустой словарь
 * @param dict
 * @param selector
 */
function filterDictVal(dict, selector) {
    let res = {};
    for (let key in dict) {
        let item = dict[key];
        if (selector(item))
            res[key] = item;
    }
    return res;
}
/**
 * Склеивает два словаря вместе. Ключи не теряются, если есть одинаковые то вывалит ошибку
 * @param dict1
 * @param dict2
 */
function mergeDict(dict1, dict2) {
    if (dict1 == null || dict2 == null)
        throw new Error("аргументы не должны быть null");
    let res = {};
    for (let key in dict1)
        res[key] = dict1[key];
    for (let key in dict2) {
        if (res[key] != null)
            throw new Error(`dict1 уже имеет такой же ключ '${key}' как и dict2`);
        res[key] = dict2[key];
    }
    return res;
}
function mergeDictN(dict1, dict2) {
    if (dict1 == null || dict2 == null)
        throw new Error("аргументы не должны быть null");
    let res = {};
    for (let key in dict1)
        res[key] = dict1[key];
    for (let key in dict2) {
        if (res[key] != null)
            throw new Error(`dict1 уже имеет такой же ключ '${key}' как и dict2`);
        res[key] = dict2[key];
    }
    return res;
}
/**
 * Проверяет что элемент есть в массиве.
 * @param item
 * @param arr массив НЕ null
 */
function isOneOf(item, arr) {
    if (arr.length <= 0)
        return false;
    return arr.indexOf(item) >= 0;
}
/**
 * Преобразует массив в словарь используя заданные селектор ключа.
 * @param arr
 * @param keySelector
 */
function toDictionaryN(arr, keySelector) {
    let res = {};
    if (!arr)
        throw new Error("arr null");
    if (!keySelector)
        throw new Error("keySelector null");
    for (let el of arr) {
        let k = keySelector(el);
        if (!k)
            throw new Error("Ключ не может быть неопределен!");
        if (res[k])
            throw new Error("Обнаружено повторение ключа!");
        res[k] = el;
    }
    return res;
}
/**
 * Возвращает только уникальные значения массива. Для объектов идет сравнение ссылок, само содержимое не сравнивается
 * @param array
 */
function unique(array) {
    let res = [];
    for (let i = 0; i < array.length; i++) {
        let item = array[i];
        if (array.indexOf(item) === i)
            res.push(item);
    }
    return res;
}
/**
 * Находит пересечение двух массивов. Объекты сравнивать будет по ссылкам. Дубли удаляются.
 * Возвращает массив уникальных значений имеющихся в обоих массивах
 * @param a
 * @param b
 */
function intersect(a, b) {
    // чтобы быстрее бегал indexOf в A кладем более длинный массив
    if (b.length > a.length) {
        let t = b;
        b = a;
        a = t;
    }
    // находим пересечение с дублями
    let intersect = [];
    for (let item of a) {
        if (b.indexOf(item) >= 0)
            intersect.push(item);
    }
    // если надо удалить дубли, удаляем
    return unique(intersect);
}
// NUMBER ------------------------------------------
/**
 * round до заданного числа знаков. Может дать погрешность на округлении но похрен
 * @param n
 * @param decimals
 */
function roundTo(n, decimals) {
    if (isNaN(n) || isNaN(decimals))
        throw new Error(`числа должны быть заданы. n:${n}, decimals:${decimals}`);
    if (decimals < 0)
        throw new Error(`decimals: ${decimals} не может быть меньше 0`);
    decimals = Math.round(decimals); // делаем ставку на косяки округления откуда может прилететь 1.00000001
    let f = Math.pow(10, decimals);
    return Math.round(n * f) / f;
}
/**
 * floor до заданного числа знаков. Может дать погрешность если будет число вида x.99999999999
   так как при расчетах прибавляет 1е-10. Но это очень редкий случай когда округлит вверх
 * @param n
 * @param decimals
 */
function floorTo(n, decimals) {
    if (isNaN(n) || isNaN(decimals))
        throw new Error(`числа должны быть заданы. n:${n}, decimals:${decimals}`);
    if (decimals < 0)
        throw new Error(`decimals: ${decimals} не может быть меньше 0`);
    decimals = Math.round(decimals); // делаем ставку на косяки округления откуда может прилететь 1.00000001
    let f = Math.pow(10, decimals);
    return Math.floor(n * f + 1e-10) / f;
}
/**
 * ceil до заданного числа знаков. Может дать погрешность если будет число вида x.00000000000001
   так как при расчетах вычитает 1е-10. Но это очень редкий случай когда округлит вверх
 * @param n
 * @param decimals
 */
function ceilTo(n, decimals) {
    if (isNaN(n) || isNaN(decimals))
        throw new Error(`числа должны быть заданы. n:${n}, decimals:${decimals}`);
    if (decimals < 0)
        throw new Error(`decimals: ${decimals} не может быть меньше 0`);
    decimals = Math.round(decimals); // делаем ставку на косяки округления откуда может прилететь 1.00000001
    let f = Math.pow(10, decimals);
    return Math.ceil(n * f - 1e-10) / f;
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
    let rx = new RegExp(/https:\/\/virtonomic[A-Za-z]+\.[a-zA-Z]+\/([a-zA-Z]+)\/.+/ig);
    let m = rx.exec(document.location.href);
    if (m == null)
        return null;
    return m[1];
}
function getRealmOrError() {
    let realm = getRealm();
    if (realm === null)
        throw new Error("Не смог определить реалм по ссылке " + document.location.href);
    return realm;
}
/**
 * Парсит id компании со страницы. Если не получилось то вернет null
 */
function parseCompanyId(html) {
    let $html = $(html);
    let href = $html.find("a.dashboard").attr("href");
    if (href == null || href.length <= 0)
        return null;
    let arr = href.match(/\d+/);
    if (arr == null || arr.length !== 1)
        return null;
    return numberfyOrError(arr[0]);
}
/**
 * Оцифровывает строку. Возвращает всегда либо число или Number.POSITIVE_INFINITY либо -1 если str не содержит числа.
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
        let n = parseFloat(cleanStr(String(str)));
        return isNaN(n) ? -1 : n;
    }
}
/**
 * Пробуем оцифровать данные но если они выходят как Number.POSITIVE_INFINITY или <= minVal, валит ошибку.
   смысл в быстром вываливании ошибки если парсинг текста должен дать число
   Нужно понимать что если оцифровка не удалась, то получится -1 и при minVal=0 выдаст ошибку конечно
 * @param value строка являющая собой число больше minVal
 * @param minVal ограничение снизу. Число.
 * @param infinity разрешена ли бесконечность
 */
function numberfyOrError(str, minVal = 0, infinity = false) {
    let n = numberfy(str);
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
    let m = str.match(rx);
    if (m == null)
        throw new Error(errMsg || `Паттерн ${rx} не найден в ${str}`);
    if (m.length > 1)
        throw new Error(errMsg || `Паттерн ${rx} найден в ${str} ${m.length} раз вместо ожидаемого 1`);
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
    let m = rx.exec(str);
    if (m == null)
        throw new Error(errMsg || `Паттерн ${rx} не найден в ${str}`);
    return m;
}
/**
 * из строки пробует извлечь все вещественные числа. Рекомендуется применять ТОЛЬКО для извлечения из текстовых строк.
 * для простого парсинга числа пойдет numberfy
 * Если их нет вернет null
 * @param str
 */
function extractFloatPositive(str) {
    let m = cleanStr(str).match(/\d+\.\d+/ig);
    if (m == null)
        return null;
    let n = m.map((val, i, arr) => numberfyOrError(val, -1));
    return n;
}
/**
 * из указанной строки, извлекает числа. обычно это id юнита товара и так далее
 * @param str
 */
function extractIntPositive(str) {
    let m = cleanStr(str).match(/\d+/ig);
    if (m == null)
        return null;
    let n = m.map((val, i, arr) => numberfyOrError(val, -1));
    return n;
}
/**
 * По текстовой строке возвращает номер месяца начиная с 0 для января. Либо null
 * @param str очищенная от пробелов и лишних символов строка
 */
function monthFromStr(str) {
    let mnth = ["январ", "феврал", "март", "апрел", "ма", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"];
    for (let i = 0; i < mnth.length; i++) {
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
    let dateRx = /^(\d{1,2})\s+([а-я]+)\s+(\d{1,4})/i;
    let m = dateRx.exec(str);
    if (m == null)
        return null;
    let d = parseInt(m[1]);
    let mon = monthFromStr(m[2]);
    if (mon == null)
        return null;
    let y = parseInt(m[3]);
    return new Date(y, mon, d);
}
function extractDateOrError(str) {
    let dt = extractDate(str);
    if (dt == null)
        throw new Error(`Не получилось извлечь дату из "${str}"`);
    return dt;
}
/**
 * из даты формирует короткую строку типа 01.12.2017
 * @param date
 */
function dateToShort(date) {
    let d = date.getDate();
    let m = date.getMonth() + 1;
    let yyyy = date.getFullYear();
    let dStr = d < 10 ? "0" + d : d.toString();
    let mStr = m < 10 ? "0" + m : m.toString();
    return `${dStr}.${mStr}.${yyyy}`;
}
/**
 * из строки вида 01.12.2017 формирует дату
 * @param str
 */
function dateFromShort(str) {
    let items = str.split(".");
    let d = parseInt(items[0]);
    if (d <= 0)
        throw new Error("дата неправильная.");
    let m = parseInt(items[1]) - 1;
    if (m < 0)
        throw new Error("месяц неправильная.");
    let y = parseInt(items[2]);
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
        return "-" + sayNumber(-num);
    if (Math.round(num * 100) / 100 - Math.round(num))
        num = Math.round(num * 100) / 100;
    else
        num = Math.round(num);
    let s = num.toString();
    let s1 = "";
    let l = s.length;
    let p = s.indexOf(".");
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
 * Для денег подставляет нужный символ при выводе на экран. Округляет до 2 знаков,
   так же вставляет пробелы как разделитель для тысяч
 * @param num
 * @param symbol
 */
function sayMoney(num, symbol = "$") {
    let result = sayNumber(num);
    if (symbol != null) {
        if (num < 0)
            result = '-' + symbol + sayNumber(Math.abs(num));
        else
            result = symbol + result;
    }
    return result;
}
/**
 * Пробует взять со страницы картинку юнита и спарсить тип юнита
 * Пример сорса /img/v2/units/shop_1.gif  будет тип shop.
 * Он кореллирует четко с i-shop в списке юнитов
 * Если картинки на странице нет, то вернет null. Сам разбирайся почему ее там нет
 * @param $html
 */
function getUnitTypeOld($html) {
    let $div = $html.find("#unitImage");
    if ($div.length === 0)
        return null;
    let src = $div.find("img").attr("src");
    let items = src.split("/");
    if (items.length < 2)
        throw new Error("Что то не так с урлом картинки " + src);
    let typeStr = items[items.length - 1].split("_")[0];
    let type = UnitTypes[typeStr] ? UnitTypes[typeStr] : UnitTypes.unknown;
    if (type == UnitTypes.unknown)
        throw new Error("Не описан тип юнита " + typeStr);
    return type;
}
/**
 * Форматирует строки в соответствии с форматом в C#. Плейсхолдеры {0}, {1} заменяет на аргументы.
   если аргумента НЕТ а плейсхолдер есть, вывалит исключение, как и в сишарпе.
 * @param str шаблон строки
 * @param args аргументы которые подставить
 */
function formatStr(str, ...args) {
    let res = str.replace(/{(\d+)}/g, (match, number) => {
        if (args[number] == null)
            throw new Error(`плейсхолдер ${number} не имеет значения`);
        return args[number];
    });
    return res;
}
/**
 * если значение null то вывалит ошибку, иначе вернет само значение. Короткий метод для проверок на нулл
 * @param val
 */
function nullCheck(val) {
    if (val == null)
        throw new Error(`nullCheck Error`);
    return val;
}
/**
 * Спать потоку заданное число миллисекунд. Асинхронная!!
 * @param ms
 */
function sleep_async(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// РЕГУЛЯРКИ ДЛЯ ССЫЛОК ------------------------------------
// для 1 юнита
// 
//let url_unit_rx = /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+/i;           // внутри юнита. любая страница
//let url_unit_main_rx = /\/\w+\/(?:main|window)\/unit\/view\/\d+\/?$/i;     // главная юнита
//let url_unit_finrep_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/finans_report(\/graphical)?$/i; // финанс отчет
//let url_unit_finrep_by_prod_rx = /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/finans_report\/by_production\/?$/i; // финанс отчет по товарам
//let url_trade_hall_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/trading_hall\/?/i;    // торговый зал
//let url_price_history_rx = /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/product_history\/\d+\/?/i; // история продаж в магазине по товару
//let url_supply_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/supply\/?/i;    // снабжение
//let url_sale_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/sale\/?/i;        // продажа склад/завод
//let url_ads_rx = /\/[a-z]+\/main\/unit\/view\/\d+\/virtasement$/i;  // реклама
//let url_education_rx = /\/[a-z]+\/window\/unit\/employees\/education\/\d+\/?/i; // обучение
//let url_supply_create_rx = /\/[a-z]+\/unit\/supply\/create\/\d+\/step2\/?$/i;  // заказ товара в маг, или склад. в общем стандартный заказ товара
//let url_equipment_rx = /\/[a-z]+\/window\/unit\/equipment\/\d+\/?$/i;   // заказ оборудования на завод, лабу или куда то еще
// для компании
// 
//let url_unit_list_rx = /\/[a-z]+\/(?:main|window)\/company\/view\/\d+(\/unit_list)?(\/xiooverview|\/overview)?$/i;     // список юнитов. Работает и для списка юнитов чужой компании
//let url_rep_finance_byunit = /\/[a-z]+\/main\/company\/view\/\d+\/finance_report\/by_units(?:\/.*)?$/i;  // отчет по подразделениями из отчетов
//let url_rep_ad = /\/[a-z]+\/main\/company\/view\/\d+\/marketing_report\/by_advertising_program$/i;  // отчет по рекламным акциям
//let url_manag_equip_rx = /\/[a-z]+\/window\/management_units\/equipment\/(?:buy|repair)$/i;     // в окне управления юнитами групповой ремонт или закупка оборудования
//let url_manag_empl_rx = /\/[a-z]+\/main\/company\/view\/\d+\/unit_list\/employee\/?$/i;     // управление - персонал
// для для виртономики
// 
//let url_global_products_rx = /[a-z]+\/main\/globalreport\/marketing\/by_products\/\d+\/?$/i; // глобальный отчет по продукции из аналитики
//let url_products_rx = /\/[a-z]+\/main\/common\/main_page\/game_info\/products$/i;   // страница со всеми товарами игры
//let url_trade_products_rx = /\/[a-z]+\/main\/common\/main_page\/game_info\/trading$/i;   // страница с торгуемыми товарами
//let url_city_retail_report_rx = /\/[a-z]+\/(?:main|window)\/globalreport\/marketing\/by_trade_at_cities\/\d+/i; // розничный отчет по конкретному товару
//let url_products_size_rx = /\/[a-z]+\/main\/industry\/unit_type\/info\/2011\/volume\/?/i;  // размеры продуктов на склада
//let url_country_duties_rx = /\/[a-z]+\/main\/geo\/countrydutylist\/\d+\/?/i;    // таможенные пошлины и ИЦ
// let url_tm_info_rx = /\/[a-z]+\/main\/globalreport\/tm\/info/i;    // брендовые товары список
let Url_rx = {
    // для виртономики
    v_city_retail_report: /\/[a-z]+\/(?:main|window)\/globalreport\/marketing\/by_trade_at_cities\/\d+/i,
    v_tm_info: /\/[a-z]+\/(?:main|window)\/globalreport\/tm\/info\/?$/i,
    v_country_duties: /\/[a-z]+\/(?:main|window)\/geo\/countrydutylist\/\d+\/?/i,
    v_regions: /\/[a-z]+\/(?:main|window)\/common\/main_page\/game_info\/bonuses\/region\/?$/i,
    v_countries: /\/[a-z]+\/(?:main|window)\/common\/main_page\/game_info\/bonuses\/country\/?$/i,
    v_cities: /\/[a-z]+\/(?:main|window)\/common\/main_page\/game_info\/bonuses\/city\/?$/i,
    v_products_size: /\/[a-z]+\/(?:main|window)\/industry\/unit_type\/info\/2011\/volume\/?/i,
    v_media_rep_spec: /\/[a-z]+\/(?:main|window)\/mediareport\/\d+/i,
    v_global_products: /[a-z]+\/main\/globalreport\/marketing\/by_products\/\d+\/?$/i,
    v_products: /\/[a-z]+\/(?:main|window)\/common\/main_page\/game_info\/products$/i,
    v_trade_products: /\/[a-z]+\/(?:main|window)\/common\/main_page\/game_info\/trading$/i,
    v_energy_price: /\/[a-z]+\/(?:main|window)\/geo\/tariff\/\d+/i,
    v_product_suppliers: /\/[a-z]+\/(?:main|window)\/globalreport\/marketing\/by_products\/\d+\/?$/i,
    // для компании в целом
    top_manager: /\/[a-z]+\/(?:main|window)\/user\/privat\/persondata\/knowledge\/?$/ig,
    comp_ads_rep: /\/[a-z]+\/(?:main|window)\/company\/view\/\d+\/marketing_report\/by_advertising_program\/?$/i,
    comp_fin_rep_byunit: /\/[a-z]+\/(?:main|window)\/company\/view\/\d+\/finance_report\/by_units(?:\/.*)?$/i,
    comp_unit_list: /\/[a-z]+\/(?:main|window)\/company\/view\/\d+(\/unit_list)?(\/xiooverview|\/overview)?$/i,
    comp_manage_salary: /\/[a-z]+\/(?:main|window)\/company\/view\/\d+\/unit_list\/employee\/salary\/?$/i,
    // для юнита
    unit_any: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+/i,
    unit_main: /\/[a-z]+\/main\/unit\/view\/\d+\/?$/i,
    unit_ads: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/virtasement\/?$/i,
    unit_salary: /\/[a-z]+\/window\/unit\/employees\/engage\/\d+\/?$/ig,
    unit_sale: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/sale\/?/i,
    unit_supply: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/supply\/?/i,
    unit_supply_create: /\/[a-z]+\/unit\/supply\/create\/\d+\/step2\/?$/i,
    unit_trade_hall: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/trading_hall\/?/i,
    unit_retail_price_history: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/product_history\/\d+\/?/i,
    unit_education: /\/[a-z]+\/window\/unit\/employees\/education\/\d+\/?/i,
    unit_ware_resize: /\/[a-z]+\/window\/unit\/upgrade\/\d+\/?$/i,
    unit_ware_change_spec: /\/[a-z]+\/window\/unit\/speciality_change\/\d+\/?$/i,
    unit_finrep: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/finans_report(\/graphical)?$/i,
    unit_finrep_by_prod: /\/[a-z]+\/(?:main|window)\/unit\/view\/\d+\/finans_report\/by_production\/?$/i,
    // API
    api_unit_sale_contracts: /api\/[a-z]+\/main\/unit\/sale\/contracts$/i,
    api_unit_supply_contracts: /api\/[a-z]+\/main\/unit\/supply\/contracts$/i,
    api_trade_products: /api\/[a-z]+\/main\/product\/goods$/i,
    api_cities: /api\/[a-z]+\/main\/geo\/city\/browse$/i,
    api_regions: /api\/[a-z]+\/main\/geo\/region\/browse$/i,
};
let Url_tpl = {
    // АПИ
    api_unit_saleContracts: `/api/{0}/main/unit/sale/contracts?id={1}`,
    api_unit_supply_contracts: `/api/{0}/main/unit/supply/contracts?id={1}`,
    api_tradeGoods: `/api/{0}/main/product/goods`,
    api_cities: `/api/{0}/main/geo/city/browse`,
    api_regions: `/api/{0}/main/geo/region/browse`,
    // юнит
    ajax_deleteContract: `/{0}/ajax/unit/supply/delete`,
    ajax_createContract: `/{0}/ajax/unit/supply/create`,
    // глобальные виртовские
    v_glob_suppliers: `/{0}/main/globalreport/marketing/by_products/{1}/`,
    // пагинаторы
    setPaging_marketingProd: `/{0}/main/common/util/setpaging/reportcompany/marketingProduct/20000`,
};
/**
 * По заданной ссылке и хтмл определяет находимся ли мы внутри юнита или нет.
 * Если на задавать ссылку и хтмл то берет текущий документ.
 * Вызов без параметров приводит к определению находимся ли мы своем юните сейчас
 * @param urlPath
 * @param $html
 * @param my своя компания или нет?
 */
function isUnit(urlPath, $html, my = true) {
    if (!urlPath || !$html) {
        urlPath = document.location.pathname;
        $html = $(document);
    }
    // для ситуации когда мы внутри юнита характерно что всегда ссылка вида 
    // https://virtonomica.ru/olga/main/unit/view/6452212/*
    let urlOk = Url_rx.unit_any.test(urlPath);
    if (!urlOk)
        return false;
    // но у своего юнита есть слева в табах стрелочка со ссылью на компанию с тем же айди что и ссыль на дашборду. А для чужого нет ее и табов
    let urlCompany = nullCheck($html.find("a[data-name='itour-tab-company-view'").attr("href"));
    //let urlOffice = $html.find("div.officePlace a").attr("href");
    let urlDash = nullCheck($html.find("a.dashboard").attr("href"));
    if (urlCompany.length === 0 || urlDash.length === 0)
        throw new Error("Ссылка на юзерлист или дашборду не может быть найдена");
    let isMy = (`${urlCompany}/dashboard` === urlDash);
    return my ? isMy : !isMy;
}
function isUnitOld(urlPath, $html, my = true) {
    if (!urlPath || !$html) {
        urlPath = document.location.pathname;
        $html = $(document);
    }
    // для ситуации когда мы внутри юнита характерно что всегда ссылка вида 
    // https://virtonomica.ru/olga/main/unit/view/6452212/*
    let urlOk = Url_rx.unit_any.test(urlPath);
    if (!urlOk)
        return false;
    // но у своего юнита ссыль на офис имеет тот же айди что и ссыль на дашборду. А для чужого нет
    let urlOffice = $html.find("div.officePlace a").attr("href");
    let urlDash = $html.find("a.dashboard").attr("href");
    if (urlOffice.length === 0 || urlDash.length === 0)
        throw new Error("Ссылка на офис или дашборду не может быть найдена");
    let isMy = (`${urlOffice}/dashboard` === urlDash);
    return my ? isMy : !isMy;
}
/**
 * Проверяет что мы именно на своей странице со списком юнитов. По ссылке и id компании
 * Проверок по контенту не проводит.
 */
function isMyUnitList() {
    // для своих и чужих компани ссылка одна, поэтому проверяется и id
    if (Url_rx.comp_unit_list.test(document.location.pathname) === false)
        return false;
    // запрос id может вернуть ошибку если мы на window ссылке. значит точно у чужого васи
    try {
        let id = nullCheck(parseCompanyId(document));
        let urlId = extractIntPositive(document.location.pathname); // полюбому число есть иначе регекс не пройдет
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
    if (Url_rx.comp_unit_list.test(document.location.pathname) === false)
        return false;
    try {
        // для чужого списка будет разный айди в дашборде и в ссылке
        let id = nullCheck(parseCompanyId(document));
        let urlId = extractIntPositive(document.location.pathname); // полюбому число есть иначе регекс не пройдет
        if (urlId[0] === id)
            return false;
    }
    catch (err) {
        // походу мы на чужом window списке. значит ок
        return true;
    }
    return true;
}
function isUnitMain(urlPath, html, my = true) {
    let ok = Url_rx.unit_main.test(urlPath);
    if (!ok)
        return false;
    let hasTabs = $(html).find("ul.tabu").length > 0;
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
    return Url_rx.unit_finrep.test(document.location.pathname);
}
function isCompanyRepByUnit() {
    return Url_rx.comp_fin_rep_byunit.test(document.location.pathname);
}
/**
 * Возвращает Истину если данная страница есть страница в магазине своем или чужом. Иначе Ложь
 * @param html полностью страница
 * @param my свой юнит или чужой
 */
function isShop(html, my = true) {
    let $html = $(html);
    // нет разницы наш или чужой юнит везде картинка мага нужна. ее нет только если window
    let $img = $html.find("#unitImage img[src*='/shop_']");
    if ($img.length > 1)
        throw new Error(`Найдено несколько (${$img.length}) картинок Магазина.`);
    return $img.length > 0;
}
function isWarehouse($html) {
    // нет разницы наш или чужой юнит везде картинка мага нужна. ее нет только если window
    let $img = $html.find("#unitImage img[src*='/warehouse_']");
    if ($img.length > 1)
        throw new Error(`Найдено несколько (${$img.length}) картинок Склада.`);
    return $img.length > 0;
}
/**
 * Возвращает Истину если данная страница есть страница в заправке своей или чужой. Иначе Ложь
 * @param html полностью страница
 * @param my свой юнит или чужой
 */
function isFuel(html, my = true) {
    let $html = $(html);
    // нет разницы наш или чужой юнит везде картинка мага нужна
    let $img = $html.find("#unitImage img[src*='/fuel_']");
    if ($img.length > 1)
        throw new Error(`Найдено несколько (${$img.length}) картинок Магазина.`);
    return $img.length > 0;
}
function hasTradeHall(html, my = true) {
    let $html = $(html);
    if (my) {
        let $a = $html.find("ul.tabu a[href$=trading_hall]");
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
    let tag = tagname.toUpperCase();
    let found = [];
    for (let i = 0; i < items.length; i++) {
        let node = items[i];
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
    let $childrenNodes = item.contents();
    let res = [];
    for (let i = 0; i < $childrenNodes.length; i++) {
        let el = $childrenNodes.get(i);
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
    let $one = $item.find(selector);
    if ($one.length != 1)
        throw new Error(`Найдено ${$one.length} элементов вместо 1 для селектора ${selector}`);
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
    let $pager = $html.find('ul.pager_options li').has("a").last();
    let num = $pager.text().trim();
    let pagerUrl = $pager.find('a').attr('href').replace(num, pages.toString());
    // запросили обновление пагинации, дальше юзер решает что ему делать с этим
    let deffered = $.Deferred();
    $.get(pagerUrl)
        .done((data, status, jqXHR) => deffered.resolve(data))
        .fail((err) => deffered.reject("Не удалось установить пагинацию => " + err));
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
function getPage(url, retries = 10, timeout = 1000, repage = true) {
    let deffered = $.Deferred();
    // сначала запросим саму страницу с перезапросом по ошибке
    tryGet(url, retries, timeout)
        .then((html) => {
        let locdef = $.Deferred();
        if (html == null) {
            locdef.reject("неизвестная ошибка. страница пришла пустая " + url);
            return locdef.promise();
        }
        // если страниц нет, то как бы не надо ничо репейджить
        // если не надо репейджить то тоже не будем
        let $html = $(html);
        if (!repage || !hasPages($html)) {
            deffered.resolve(html);
        }
        else {
            // репейджим
            let purl = getRepageUrl($html, 10000);
            if (purl == null)
                locdef.reject("не смог вытащить урл репейджа хотя он там должен быть");
            else
                locdef.resolve(purl);
        }
        return locdef.promise();
    }) // если нет репейджа все закончится тут
        .then((purl) => {
        let locdef = $.Deferred();
        tryGet(purl, retries, timeout)
            .done(() => locdef.resolve())
            .fail((err) => locdef.reject("ошибка репейджа => " + err));
        return locdef.promise();
    }) // запросим установку репейджа
        .then(() => tryGet(url, retries, timeout)) // снова запросим страницу
        .then((html) => deffered.resolve(html))
        .fail((err) => deffered.reject(err));
    return deffered.promise();
}
/**
 * Запрашивает страницу. При ошибке поробует повторить запрос через заданное число секунд.
 * Пробует заданное число попыток, после чего возвращает reject
 * @param url
 * @param retries число попыток загрузки
 * @param timeout таймаут между попытками
 */
function tryGet(url, retries = 10, timeout = 1000) {
    let $deffered = $.Deferred();
    $deffered.notify("0: " + url); // сразу даем уведомление, это работает. НО только 1 сработает если вызвать ДО установки прогресс хендлера на промис
    $.ajax({
        url: url,
        type: "GET",
        success: (data, status, jqXHR) => $deffered.resolve(data),
        error: function (jqXHR, textStatus, errorThrown) {
            retries--;
            if (retries <= 0) {
                $deffered.reject("Не смог загрузить страницу " + this.url);
                return;
            }
            logDebug(`ошибка запроса ${this.url} осталось ${retries} попыток`);
            let _this = this;
            setTimeout(() => {
                $deffered.notify("0: " + url); // уведомляем об очередном запросе
                $.ajax(_this);
            }, timeout);
        }
    });
    return $deffered.promise();
}
/**
 * Запрашивает страницу. При ошибке поробует повторить запрос через заданное число секунд.
 * Пробует заданное число попыток, после чего возвращает reject.
 * При ресолве вернет текст страницы, а при реджекте вернет Error объект
 * @param url
 * @param retries число попыток загрузки
 * @param timeout таймаут между попытками
 * @param beforeGet вызывается перед каждым новым запросом. То есть число вызовов равно числу запросов. Каждый раз вызывается с урлом которые запрашивается.
 */
function tryGet_async(url, retries = 10, timeout = 1000, beforeGet, onError) {
    return __awaiter(this, void 0, void 0, function* () {
        //logDebug(`tryGet_async: ${url}`);
        // сам метод пришлось делать Promise<any> потому что string | Error не работало какого то хуя не знаю. Из за стрик нулл чек
        let $deffered = $.Deferred();
        if (beforeGet) {
            try {
                beforeGet(url);
            }
            catch (err) {
                logDebug("beforeGet вызвал исключение", err);
            }
        }
        $.ajax({
            url: url,
            type: "GET",
            success: (data, status, jqXHR) => $deffered.resolve(data),
            error: function (jqXHR, textStatus, errorThrown) {
                if (onError) {
                    try {
                        onError(url);
                    }
                    catch (err) {
                        logDebug("onError вызвал исключение", err);
                    }
                }
                retries--;
                if (retries <= 0) {
                    let err = new Error(`can't get ${this.url}\nstatus: ${jqXHR.status}\ntextStatus: ${jqXHR.statusText}\nerror: ${errorThrown}`);
                    $deffered.reject(err);
                    return;
                }
                //logDebug(`ошибка запроса ${this.url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => {
                    if (beforeGet) {
                        try {
                            beforeGet(url);
                        }
                        catch (err) {
                            logDebug("beforeGet вызвал исключение", err);
                        }
                    }
                    $.ajax(_this);
                }, timeout);
            }
        });
        return $deffered.promise();
    });
}
/**
 * Аналогично обычному методу tryGet_async правда ожидает только json и конвертает по ходу дела числа в числа если они идут строкой
 */
function tryGetJSON_async(url, retries = 10, timeout = 1000, beforeGet, onError) {
    return __awaiter(this, void 0, void 0, function* () {
        // сам метод пришлось делать Promise<any> потому что string | Error не работало какого то хуя не знаю. Из за стрик нулл чек
        let $deffered = $.Deferred();
        if (beforeGet) {
            try {
                beforeGet(url);
            }
            catch (err) {
                logDebug("beforeGet вызвал исключение", err);
            }
        }
        $.ajax({
            url: url,
            type: "GET",
            cache: false,
            dataType: "text",
            success: (jsonStr, status, jqXHR) => {
                let obj = JSON.parse(jsonStr, (k, v) => {
                    return (typeof v === "object" || isNaN(v)) ? v : parseFloat(v);
                });
                $deffered.resolve(obj);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (onError) {
                    try {
                        onError(url);
                    }
                    catch (err) {
                        logDebug("onError вызвал исключение", err);
                    }
                }
                retries--;
                if (retries <= 0) {
                    let err = new Error(`can't get ${this.url}\nstatus: ${jqXHR.status}\ntextStatus: ${jqXHR.statusText}\nerror: ${errorThrown}`);
                    $deffered.reject(err);
                    return;
                }
                //logDebug(`ошибка запроса ${this.url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => {
                    if (beforeGet) {
                        try {
                            beforeGet(url);
                        }
                        catch (err) {
                            logDebug("beforeGet вызвал исключение", err);
                        }
                    }
                    $.ajax(_this);
                }, timeout);
            }
        });
        return $deffered.promise();
    });
}
/**
 * Отправляет данные на сервер запросом POST. В остальном работает как и гет. Так же вернет промис который ресолвит с возвращенными данными
 * @param url
 * @param form данные для отправки на сервер
 * @param retries
 * @param timeout
 * @param beforePost
 */
function tryPost_async(url, form, retries = 10, timeout = 1000, beforePost, onError) {
    return __awaiter(this, void 0, void 0, function* () {
        // сам метод пришлось делать Promise<any> потому что string | Error не работало какого то хуя не знаю. Из за стрик нулл чек
        let $deferred = $.Deferred();
        if (beforePost) {
            try {
                beforePost(url);
            }
            catch (err) {
                logDebug("beforePost вызвал исключение", err);
            }
        }
        $.ajax({
            url: url,
            data: form,
            type: "POST",
            success: (data, status, jqXHR) => $deferred.resolve(data),
            error: function (jqXHR, textStatus, errorThrown) {
                if (onError) {
                    try {
                        onError(url);
                    }
                    catch (err) {
                        logDebug("onError вызвал исключение", err);
                    }
                }
                retries--;
                if (retries <= 0) {
                    let err = new Error(`can't post ${this.url}\nstatus: ${jqXHR.status}\ntextStatus: ${jqXHR.statusText}\nerror: ${errorThrown}`);
                    $deferred.reject(err);
                    return;
                }
                //logDebug(`ошибка запроса ${this.url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => {
                    if (beforePost) {
                        try {
                            beforePost(url);
                        }
                        catch (err) {
                            logDebug("beforePost вызвал исключение", err);
                        }
                    }
                    $.ajax(_this);
                }, timeout);
            }
        });
        return $deferred.promise();
    });
}
/**
 * Отправляет данные на сервер запросом POST. В остальном работает как и гет. Так же вернет промис который ресолвит с возвращенными данными
 * @param url
 * @param data данные для отправки на сервер
 * @param retries
 * @param timeout
 * @param beforePost
 */
function tryPostJSON_async(url, data, retries = 10, timeout = 1000, beforePost, onError) {
    return __awaiter(this, void 0, void 0, function* () {
        // сам метод пришлось делать Promise<any> потому что string | Error не работало какого то хуя не знаю. Из за стрик нулл чек
        let $deferred = $.Deferred();
        if (beforePost) {
            try {
                beforePost(url);
            }
            catch (err) {
                logDebug("beforePost вызвал исключение", err);
            }
        }
        $.ajax({
            url: url,
            data: data,
            type: "POST",
            dataType: 'JSON',
            success: (data, status, jqXHR) => $deferred.resolve(data),
            error: function (jqXHR, textStatus, errorThrown) {
                if (onError) {
                    try {
                        onError(url);
                    }
                    catch (err) {
                        logDebug("onError вызвал исключение", err);
                    }
                }
                retries--;
                if (retries <= 0) {
                    let err = new Error(`can't post ${this.url}\nstatus: ${jqXHR.status}\ntextStatus: ${jqXHR.statusText}\nerror: ${errorThrown}`);
                    $deferred.reject(err);
                    return;
                }
                //logDebug(`ошибка запроса ${this.url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => {
                    if (beforePost) {
                        try {
                            beforePost(url);
                        }
                        catch (err) {
                            logDebug("beforePost вызвал исключение", err);
                        }
                    }
                    $.ajax(_this);
                }, timeout);
            }
        });
        return $deferred.promise();
    });
}
// COMMON ----------------------------------------
let $xioDebug = false;
function logDebug(msg, ...args) {
    if (!$xioDebug)
        return;
    console.log(msg, ...args);
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
    let $pageLinks = $html.find('ul.pager_list li');
    return $pageLinks.length > 2;
}
/**
 * Формирует ссылку на установку новой пагинации. Если страница не имеет пагинатора, вернет null
 * @param $html
 * @param pages число элементов на страницу которое установить
 */
function getRepageUrl($html, pages = 10000) {
    if (!hasPages($html))
        return null;
    // снизу всегда несколько кнопок для числа страниц, НО одна может быть уже нажата мы не знаем какая
    // берем просто любую ненажатую, извлекаем ее текст, на у далее в ссылке всегда
    // есть число такое же как текст в кнопке. Заменяем на свое и все ок.
    let $pager = $html.find('ul.pager_options li').has("a").last();
    let num = $pager.text().trim();
    return $pager.find('a').attr('href').replace(num, pages.toString());
}
/**
 * Производит обрезку словаря (где ключи это строковые даты) до нужного числа ключей. Если ключи НЕ даты то даст ошибку.
   Если обрезать нечего то ничего не делает.
 * @param dict словарь который БУДЕТ изменен и удалены лишние самые старые элементы. shortDate: T
 * @param maxItems максимальное число самых последних дат которые оставить
 */
function trimDateDict(dict, maxItems) {
    // удалим лишние оставив maxItems дней истории
    if (Object.keys(dict).length <= maxItems)
        return;
    let delDates = Object.keys(dict)
        .map(v => dateFromShort(v))
        .sort((a, b) => b.getDate() - a.getTime())
        .map(v => dateToShort(v))
        .slice(maxItems);
    for (let d of delDates)
        delete dict[d];
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
    let res = "^*"; // уникальная ботва которую добавляем ко всем своим данным
    if (realm != null)
        res += "_" + realm;
    if (subid != null)
        res += "_" + subid;
    res += "_" + code;
    return res;
}
/**
 * Заданный стандартный ключик хранилища разбивает на компоненты. Конечно учитывает что некоторые элементы
   могут отсутствовать. например нет subid или даже реалма. В общем разбивка согласуется с билдером ключей
 * @param key
 */
function splitStoreKey(key) {
    if (key.length <= 0)
        throw new Error("Длина ключа должны быть больше 0");
    // допустимые варианты ключей исходя из билдера ключей
    // ^*_rm
    // ^*_olga_rm
    // ^*_olga_1234_rm
    let rx = /^\^\*_(?:([a-z]+)_){0,1}(?:(\d+)_){0,1}([a-z]+){1}$/i;
    let res = rx.exec(key);
    if (res == null)
        throw new Error(`Строка ${key} не является допустимым ключем хранилища.`);
    // так как часть групп может отсутствовать то в выходном массиве в этих местах будет undefined
    let realm = res[1] == null ? null : res[1].trim();
    let subid = res[2] == null ? null : parseInt(res[2]);
    let code = res[3].trim();
    return [realm, subid, code];
}
/**
 * Возвращает все ключи ЮНИТОВ для заданного реалма и КОДА.
 * @param realm
 * @param storeKey код ключа sh, udd, vh итд
 */
function getStoredUnitsKeys(realm, storeKey) {
    let res = [];
    for (let key in localStorage) {
        // если в ключе нет числа, не брать его
        let m = extractIntPositive(key);
        if (m == null)
            continue;
        // если ключик не совпадает со старым ключем для посетителей
        let subid = m[0];
        if (key !== buildStoreKey(realm, storeKey, subid))
            continue;
        res.push(key);
    }
    return res;
}
/**
 * Возвращает все ключи ЮНИТОВ для заданного реалма и КОДА. А так же subid юнита отдельно
 * @param realm
 * @param storeKey код ключа sh, udd, vh итд
 */
function getStoredUnitsKeysA(realm, storeKey) {
    let res = [];
    for (let key in localStorage) {
        // если в ключе нет числа, не брать его
        let m = extractIntPositive(key);
        if (m == null)
            continue;
        // если ключик не совпадает со старым ключем для посетителей
        let subid = m[0];
        if (key !== buildStoreKey(realm, storeKey, subid))
            continue;
        res.push([key, subid]);
    }
    return res;
}
/**
 * Выводит текстовое поле, куда выводит все ключи с содержимым в формате ключ=значение|ключи=значение...
 * @param test функция возвращающая ИСТИНУ если данный ключик надо экспортить, иначе ЛОЖЬ
 * @param $place элемент страницы в который будет добавлено текстовое поле для вывода
 */
function Export($place, test) {
    if ($place.length <= 0)
        return false;
    if ($place.find("#txtExport").length > 0) {
        $place.find("#txtExport").remove();
        return false;
    }
    let $txt = $('<textarea id="txtExport" style="display:block;width: 800px; height: 200px"></textarea>');
    let string = "";
    for (let key in localStorage) {
        if (!test(key))
            continue;
        if (string.length > 0)
            string += "|";
        string += `${key}=${localStorage[key]}`;
    }
    $txt.text(string);
    $place.append($txt);
    return true;
}
function ExportA($place, keys, converter, delim = "\n") {
    if ($place.length <= 0)
        return false;
    if ($place.find("#txtExport").length > 0) {
        $place.find("#txtExport").remove();
        return false;
    }
    let $txt = $('<textarea id="txtExport" style="display:block;width: 800px; height: 200px"></textarea>');
    let exportStr = "";
    for (let key of keys) {
        if (exportStr.length > 0)
            exportStr += delim;
        let item = converter == null ? localStorage[key] : converter(localStorage[key]);
        exportStr += `${key}=${item}`;
    }
    $txt.text(exportStr);
    $place.append($txt);
    return true;
}
/**
 * Импортирует в кэш данные введенные к текстовое окно. Формат данных такой же как в экспорте
 * Ключ=Значение|Ключ=Значение итд.
 * Если что то не заладится, будет выпадать с ошибкой. Существующие ключи перезаписывает, с уведомление в консоли
 * @param $place элемент страницы в который будет добавлено текстовое поле для ввода
 */
function Import($place) {
    if ($place.length <= 0)
        return false;
    if ($place.find("#txtImport").length > 0) {
        $place.find("#txtImport").remove();
        $place.find("#saveImport").remove();
        return false;
    }
    let $txt = $('<textarea id="txtImport" style="display:block;width: 800px; height: 200px"></textarea>');
    let $saveBtn = $(`<input id="saveImport" type=button disabled="true" value="Save!">`);
    $txt.on("input propertychange", (event) => $saveBtn.prop("disabled", false));
    $saveBtn.on("click", (event) => {
        let items = $txt.val().split("|"); // элементы вида Ключ=значение
        logDebug(`загружено ${items.length} элементов`);
        try {
            items.forEach((val, i, arr) => {
                let item = val.trim();
                if (item.length <= 0)
                    throw new Error(`получили пустую строку для элемента ${i}, невозможно импортировать.`);
                let kvp = item.split("="); // пара ключ значение
                if (kvp.length !== 2)
                    throw new Error("Должен быть только ключ и значение а по факту не так. " + item);
                let storeKey = kvp[0].trim();
                let storeVal = kvp[1].trim();
                if (storeKey.length <= 0 || storeVal.length <= 0)
                    throw new Error("Длина ключа или данных равна 0 " + item);
                if (localStorage[storeKey] != null)
                    logDebug(`Ключ ${storeKey} существует. Перезаписываем.`);
                localStorage[storeKey] = storeVal;
            });
            alert("импорт завершен");
        }
        catch (err) {
            let msg = err.message;
            alert(msg);
        }
    });
    $place.append($txt).append($saveBtn);
    return true;
}
function ImportA($place, converter, delim = "\n") {
    if ($place.length <= 0)
        return false;
    if ($place.find("#txtImport").length > 0) {
        $place.find("#txtImport").remove();
        $place.find("#saveImport").remove();
        return false;
    }
    let $txt = $('<textarea id="txtImport" style="display:block;width: 800px; height: 200px"></textarea>');
    let $saveBtn = $(`<input id="saveImport" type=button disabled="true" value="Save!">`);
    $txt.on("input propertychange", (event) => $saveBtn.prop("disabled", false));
    $saveBtn.on("click", (event) => {
        let items = $txt.val().split(delim); // элементы вида Ключ=значение
        logDebug(`загружено ${items.length} элементов`);
        try {
            items.forEach((val, i, arr) => {
                let item = val.trim();
                if (item.length <= 0)
                    throw new Error(`получили пустую строку для элемента ${i}, невозможно импортировать.`);
                let kvp = item.split("="); // пара ключ значение
                if (kvp.length !== 2)
                    throw new Error("Должен быть только ключ и значение а по факту не так. " + item);
                let storeKey = kvp[0].trim();
                let storeVal = kvp[1].trim();
                if (storeKey.length <= 0 || storeVal.length <= 0)
                    throw new Error("Длина ключа или данных равна 0 " + item);
                if (localStorage[storeKey] != null)
                    logDebug(`Ключ ${storeKey} существует. Перезаписываем.`);
                localStorage[storeKey] = converter == null ? storeVal : converter(storeVal);
            });
            alert("импорт завершен");
        }
        catch (err) {
            let msg = err.message;
            alert(msg);
        }
    });
    $place.append($txt).append($saveBtn);
    return true;
}
// ==UserScript==
// @name          Retail Unit Turnover report
// @namespace     virtonomica
// @description   Выводит для чужого юнита выручку по каждому товару, возможную выручку. Так же общую текущую выручку для юнита и потенциал если занять весь рынок по текущим ценам.
// @version       1.6
// @include       https://virtonomic*.*/*/main/unit/view/*
// @include       https://virtonomic*.*/*/window/unit/view/*
// @require       https://code.jquery.com/jquery-1.11.1.min.js
// ==/UserScript==
/// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
$ = jQuery = jQuery.noConflict(true);
let Realm = getRealmOrError();
// упрощаем себе жисть, подставляем имя скрипта всегда в сообщении
function log(msg, ...args) {
    msg = "unitReport: " + msg;
    logDebug(msg, ...args);
}
function run() {
    if (!isUnitMain(document.location.pathname, document, false)) {
        log("мы не в юните");
        return;
    }
    let ut = parseUnitType($(document));
    if (ut != UnitTypes.shop && ut != UnitTypes.fuel) {
        log("мы не в магазине и не в заправке");
        return;
    }
    // таблица с данными по товарам
    let $tbl = oneOrError($(document), "table.grid");
    let $infoBlock = oneOrError($(document), "table.infoblock tbody");
    $infoBlock.append("<tr style='color:red;'><td class='title'>Выручка: </td><td id='_turnover'>0</td></tr>");
    $infoBlock.append("<tr style='color:red;'><td class='title'>Потенциал: </td><td id='_turnoverMax'>0</td></tr>");
    let $turn = $infoBlock.find("#_turnover");
    let $turnMax = $infoBlock.find("#_turnoverMax");
    // кнопка и контейнер для вывода ошибок
    let $container = $(`
            <div>
                <table><tbody>
                    <tr><td id='_btnUpdate'></td></tr>
                    <tr><td id="_errors" style="color:red;"></td></tr>
                </tbody></table>
            </div>`);
    $tbl.before($container);
    let $btnTd = $container.find("#_btnUpdate");
    let $errTd = $container.find("#_errors");
    let appendErr = (msg) => {
        if ($errTd.find("span").length > 0)
            $errTd.append("</br>");
        $errTd.append(`<span>${msg}</span>`);
    };
    // вставим кнопку запроса уточнения по цифрам
    let $preciseBtn = $("<input type='button' value=' уточнить '></input>");
    $btnTd.append($preciseBtn);
    $preciseBtn.on("click", (event) => __awaiter(this, void 0, void 0, function* () {
        $preciseBtn.prop("disabled", true);
        $errTd.children().remove();
        try {
            // урлы картинок нужны чтобы по ним найти рынки для данного товара в данном городе и взять объем рынка если чел нажмет а кнопку обновления
            let imgSrcs = $rows.find("img").map((i, e) => $(e).attr("src")).get();
            // название города где маг стоит
            let cityName = $infoBlock.find("tr").eq(0).find("td").eq(1).text().split("(")[0].trim();
            if (cityName.length === 0)
                throw new Error("не нашел имя города в котором стоит данный магазин.");
            let qdict = yield getMarketSizes_async(imgSrcs, cityName);
            drawNumbers(qdict);
        }
        catch (err) {
            appendErr("не смогли обновить данные => " + err);
            throw err;
        }
        finally {
            $preciseBtn.prop("disabled", false);
        }
    }));
    // выводим общие цифры на основе чисто табличных данных. Ну и кнопку на обновление более точное
    let $rows = $tbl.find("tr").has("img");
    if ($rows.length === 0) {
        appendErr("не нашел ни одного товара.");
        return;
    }
    // грубые цифири чисто по таблице
    drawNumbers();
    // подаем строки с товарами и такой же длины словарь. в нем ключи это урлы на картинку товара, числа объем рынка
    // для товара в заданном городе
    function drawNumbers(quantities) {
        let total = 0;
        let totalMax = 0;
        $rows.each((i, e) => {
            let $tds = $(e).find("td");
            // если нажали уточнить, у нас будет массив с реальными объемами рынка
            // поэтому мы можем посчитать более точно!
            // так как всталяем спаны, то при обновлении нужно их учитывать
            $tds.eq(1).find("span, br").remove();
            let m = matchedOrError($tds.eq(1).text().replace(/\s+/g, ""), /\d+/g);
            let quantity = numberfyOrError(m, -1);
            let price = numberfy($tds.eq(4).text()); // может быть не изв. как значение
            let share = numberfyOrError($tds.eq(5).text(), -1);
            let src = $(e).find("img").attr("src");
            if (quantities && quantities[src]) {
                quantity = quantities[src] * share / 100.0;
                $tds.eq(1).text(`~ ${Math.round(quantity)}`);
            }
            let turnover = price > 0 ? quantity * price : 0;
            let maxTurnover = share > 0 ? turnover * 100 / share : 0;
            total += turnover;
            totalMax += maxTurnover;
            turnover = Math.round(turnover);
            maxTurnover = Math.round(maxTurnover);
            $tds.eq(1).append(`<br/><span style="color:orange;">${sayMoney(turnover, "$")}</span>`);
            $tds.eq(1).append(`<br/><span style="color:gray;">${sayMoney(maxTurnover, "$")}</span>`);
        });
        total = Math.round(total);
        totalMax = Math.round(totalMax);
        $turn.text(sayMoney(total, "$"));
        $turnMax.text(sayMoney(totalMax, "$"));
    }
}
function getMarketSizes_async(imgList, cityName) {
    return __awaiter(this, void 0, void 0, function* () {
        // собрали все продукты
        let urlProducts = `/${Realm}/window/common/main_page/game_info/products`;
        let html = yield tryGet_async(urlProducts);
        let products = parseProducts(html, urlProducts);
        // собираем геокомбы /422607/422609/422632
        let geos = yield getGeos_async();
        // формируем урлы на маркетинговые отчеты 
        let tm2prod = null;
        let img2url = {};
        for (let img of imgList) {
            let prod = products[img];
            // видимо ТМ надо искать в ТМ
            if (prod == null) {
                if (tm2prod == null)
                    tm2prod = yield tm2product_async(products);
                prod = tm2prod[img];
                if (prod == null)
                    throw new Error(`Не нашел ${img} ни среди товаров ни среди ТМ`);
            }
            // /lien/main/globalreport/marketing/by_trade_at_cities/370077/7060/7065/7087
            // <option class="geocombo f-mx" value="/422607/422609/422632">Акапулько</option>
            let url = `/${Realm}/window/globalreport/marketing/by_trade_at_cities/${prod.id}${geos[cityName].geocombo}`;
            img2url[img] = url; // TODO: тут ТМ картинки будут а потом косяки с ними
        }
        // по урлам запросим объемы рынков для всех товаров
        let img2quant = {};
        let waitList = [];
        for (let img in img2url)
            waitList.push(getRep_async(img2url[img]));
        let reports = yield Promise.all(waitList);
        let repMap = {}; // замаппим Картинка = отчет. Но тут нет ТМ учета и при ТМ товаре картинка от товара простого
        for (let rep of reports)
            repMap[rep.product.img] = rep.size;
        // теперь нужно объем рынка сопоставить с картинкой товара и вернуть
        let res = {};
        for (let img of imgList) {
            // если товар простой то берем сразу, иначе берем товар из ТМ таблицы и берем сайз
            let prod = products[img];
            if (prod == null)
                prod = nullCheck(tm2prod)[img];
            res[img] = repMap[prod.img];
        }
        return res;
        function getRep_async(url) {
            return __awaiter(this, void 0, void 0, function* () {
                let html = yield tryGet_async(url);
                return parseCityRetailReport(html, url);
            });
        }
    });
}
/**
 * получает для каждого города вообще в мире, короткий аппендикс вида /34345/3453453/345345
   страна/регион/город. нам это нужно чтобы запрашивать объемы рынка для товаров в маге
 */
function getGeos_async() {
    return __awaiter(this, void 0, void 0, function* () {
        // залезем в селекты на странице и найдем селект городов, в нем в нужном месте айдишники региона и страны
        let urlGeocombo = `/${Realm}/window/globalreport/marketing/by_trade_at_cities`;
        let html = yield tryGet_async(urlGeocombo);
        // для страницы розницы, нам надо тока выдрать из селекта все связки по городам и странам
        // брать 3 селект
        let geos = extractGeocombos($(html).find("select").eq(3));
        if (Object.keys(geos).length === 0)
            throw new Error("Не получилось вытащить геокомбо со страницы " + urlGeocombo);
        return geos;
        // забирает из селекта все опции и формирует с них словарь. имя города - добавка к ссылке
        function extractGeocombos($select) {
            let res = {};
            // <option class="geocombo f-mx" value= "/422607/422609/422632" > Акапулько < /option>
            // забираем из опций value чтобы линк получить на объемы рынка.
            $select.find("option.geocombo").each((i, e) => {
                let cityName = getOnlyText($(e))[0];
                let geo = $(e).val();
                res[cityName] = { name: cityName, geocombo: geo };
            });
            return res;
        }
    });
}
// формирует таблицу для конвертации ТМ товара в обычный
function tm2product_async(products) {
    return __awaiter(this, void 0, void 0, function* () {
        // забираем и парсим таблицу ТМ
        let tm_info_tpl = `/${Realm}/window/globalreport/tm/info`; // список всех брендовых товаров
        let html = yield tryGet_async(tm_info_tpl);
        let tmDict = parseTM(html, tm_info_tpl);
        // рисуем словарь ТМ картинка = стандартный продукт
        let resDict = {};
        for (let tmImg in tmDict) {
            let tmProdName = tmDict[tmImg];
            for (let img in products)
                if (products[img].name === tmProdName) {
                    resDict[tmImg] = products[img];
                    break;
                }
            if (resDict[tmImg] == null)
                throw new Error(`не смогли найти соответствие для ТМ товара ${tmImg}`);
        }
        return resDict;
    });
}
function parseUnitType($html) {
    // классы откуда можно дернуть тип юнита грузятся скриптом уже после загрузки страницц
    // и добавляются в дивы. Поэтому берем скрипт который это делает и тащим из него информацию
    let lines = $html.find("div.title script").text().split(/\n/);
    let rx = /\bbody\b.*?\bbg-page-unit-(.*)\b/i;
    let typeStr = "";
    for (let line of lines) {
        let arr = rx.exec(line);
        if (arr != null && arr[1] != null) {
            typeStr = arr[1];
            break;
        }
    }
    if (typeStr.length <= 0)
        throw new Error("Невозможно спарсить тип юнита");
    // некоторый онанизм с конверсией но никак иначе
    let type = UnitTypes[typeStr] ? UnitTypes[typeStr] : UnitTypes.unknown;
    if (type == UnitTypes.unknown)
        throw new Error("Не описан тип юнита " + typeStr);
    return type;
}
function isWindow($html, url) {
    return url.indexOf("/window/") > 0;
}
function parseProducts(html, url) {
    let $html = $(html);
    try {
        let $tbl = isWindow($html, url)
            ? $html.filter("table.list")
            : $html.find("table.list");
        let $items = $tbl.find("a").has("img");
        if ($items.length === 0)
            throw new Error("не смогли найти ни одного продукта на " + url);
        let dict = {};
        $items.each((i, el) => {
            let $a = $(el);
            let _img = $a.find("img").eq(0).attr("src");
            // название продукта Спортивное питание, Маточное молочко и так далее
            let _name = $a.attr("title").trim();
            if (_name.length === 0)
                throw new Error("Имя продукта пустое.");
            // номер продукта
            let m = matchedOrError($a.attr("href"), /\d+/);
            let _id = numberfyOrError(m, 0); // должно быть больше 0 полюбому
            dict[_img] = { id: _id, name: _name, img: _img };
        });
        return dict;
    }
    catch (err) {
        throw err;
    }
}
function parseTM(html, url) {
    let $html = $(html);
    try {
        let $imgs = isWindow($html, url)
            ? $html.filter("table.grid").find("img")
            : $html.find("table.grid").find("img");
        if ($imgs.length <= 0)
            throw new Error("Не найдено ни одного ТМ товара.");
        let dict = {};
        $imgs.each((i, el) => {
            let $img = $(el);
            let img = $img.attr("src");
            let lines = getOnlyText($img.closest("td").next("td"));
            if (lines.length !== 4)
                throw new Error("ошибка извлечения имени товара франшизы для " + img);
            dict[img] = lines[1].trim();
        });
        return dict;
    }
    catch (err) {
        throw err;
    }
}
function parseCityRetailReport(html, url) {
    // удалим динамические графики ибо жрут ресурсы в момент $(html) они всегда загружаются без кэша
    let $html = $(html.replace(/<img.*\/graph\/.*>/i, "<img>"));
    try {
        // какой то косяк верстки страниц и страница приходит кривая без второй таблицы, поэтому 
        // строку с индексом находим по слову Индекс
        let $r = oneOrError($html, "tr:contains('Индекс')");
        let $tds = $r.children("td");
        // продукт, индекс, объем рынка, число продавцов и компаний
        let $img = oneOrError($tds.eq(0), "img");
        let img = $img.attr("src");
        let name = $img.attr("alt");
        let nums = extractIntPositive(url);
        if (nums == null)
            throw new Error("Не получилось извлечь id товара из " + url);
        let id = nums[0];
        let indexStr = $tds.eq(2).text().trim();
        let index = mIndexFromString(indexStr);
        let quant = numberfyOrError($tds.eq(4).text(), -1);
        let sellersCnt = numberfyOrError($tds.eq(6).text(), -1);
        let companiesCnt = numberfyOrError($tds.eq(8).text(), -1);
        let $priceTbl = oneOrError($html, "table.grid");
        // местные
        let localPrice = numberfyOrError($priceTbl.find("tr").eq(1).children("td").eq(0).text());
        let localQual = numberfyOrError($priceTbl.find("tr").eq(2).children("td").eq(0).text());
        let localBrand = numberfy($priceTbl.find("tr").eq(3).children("td").eq(0).text()); // может быть равен -
        // магазины
        let shopPrice = numberfyOrError($priceTbl.find("tr").eq(1).children("td").eq(1).text());
        let shopQual = numberfyOrError($priceTbl.find("tr").eq(2).children("td").eq(1).text());
        let shopBrand = numberfy($priceTbl.find("tr").eq(3).children("td").eq(1).text()); // может быть равен -
        return {
            product: { id: id, img: img, name: name },
            index: index,
            size: quant,
            sellerCount: sellersCnt,
            companyCount: companiesCnt,
            locals: { price: localPrice, quality: localQual, brand: Math.max(localBrand, 0) },
            shops: { price: shopPrice, quality: shopQual, brand: Math.max(shopBrand, 0) },
        };
    }
    catch (err) {
        throw err;
    }
}
$(document).ready(() => run());
