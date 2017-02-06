
/// <reference path= "../../_jsHelper/jsHelper/jsHelper.ts" />
/// <reference path= "../../XioPorted/PageParsers/7_PageParserFunctions.ts" />
/// <reference path= "../../XioPorted/PageParsers/1_Exceptions.ts" />
/// <reference path= "../../XioPorted/PageParsers/2_IDictionary.ts" />

$ = jQuery = jQuery.noConflict(true);
$xioDebug = true;
type TGeo = { name: string, geocombo: string };

// упрощаем себе жисть, подставляем имя скрипта всегда в сообщении
function log(msg: string, ...args: any[]) {

    msg = "unit report: " + msg;
    let arr: any[] = [];
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
    let appendErr = (msg: string) => {
        if ($errTd.find("span").length > 0)
            $errTd.append("</br>");

        $errTd.append(`<span>${msg}</span>`);
    };

    // вставим кнопку запроса уточнения по цифрам
    let $preciseBtn = $("<input type='button' value=' уточнить '></input>");
    $btnTd.append($preciseBtn);
    $preciseBtn.on("click", (event) => {
        $preciseBtn.prop("disabled", true);
        $errTd.children().remove();

        $.when(doUpdate())
            .then((quantities: IDictionary<number>) => { drawNumbers(quantities); })
            .fail((err: string) => { appendErr("не смогли обновить данные => " + err); })
            .always(() => $preciseBtn.prop("disabled", false));
    });

    // название города где маг стоит
    let cityName = $infoBlock.find("tr").eq(0).find("td").eq(1).text().split("(")[0].trim();
    if (cityName.length === 0) {
        appendErr("не нашел имя города в котором стоит данный магазин.");
        return;
    }


    // выводим общие цифры на основе чисто табличных данных. Ну и кнопку на обновление более точное
    let $rows = $tbl.find("tr").has("img");
    if ($rows.length === 0) {
        appendErr("не нашел ни одного товара.");
        return;
    }

    // урлы картинок нужны чтобы по ним найти рынки для данного товара в данном городе и взять объем рынка если чел нажмет а кнопку обновления
    let imgSrcs = $rows.find("img").map((i, e) => $(e).attr("src")) as any as string[];

    // грубые цифири чисто по таблице
    drawNumbers();

    // подаем строки с товарами и такой же длины словарь. в нем ключи это урлы на картинку товара, числа объем рынка
    // для товара в заданном городе
    function drawNumbers(quantities?: IDictionary<number>) {

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
            let price = numberfy($tds.eq(4).text());   // может быть не изв. как значение
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

    function doUpdate() {

        let doDefered = $.Deferred();
        //if (1) {
        //    doDefered.reject("тестовая ошибка");
        //    return doDefered.promise();
        //}

        let realm = getRealm();
        //debugger;
        $.when(getProducts(), getGeos())
            .then(function (args0: IProduct[], args1: IDictionary<TGeo>) {
                let products = args0;
                let geos = args1;
                let deffered = $.Deferred();

                try {
                    // теперь для каждого продукта на странице надо найти рынок и его объем
                    // сначала формируем ссылки на страницы откуда брать данне по объему
                    // "url картинки товара" = "линк на рынок в данном городе для данного товара".
                    let sources = makeImgDic(imgSrcs, products, cityName, geos);

                    log("", arguments);
                    log("", sources);

                    // сразу разрешаем промис дабы начала выполняться следующая часть задачи
                    deffered.resolve(sources);
                }
                catch (err) {
                    let e = (err as Error);
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }

                return deffered.promise()
            })
            .then((sources: IDictionary<string>) => {
                let deffered = $.Deferred();

                try {
                    // запросим объемы рынка для каждого линка в sources и отпарсим
                    let tasks: JQueryPromise<{}>[] = [];
                    for (let key in sources) {
                        let url = sources[key];
                        tasks.push(getQuantity(url));
                    }

                    $.when.apply($, tasks)
                        .then((...args: number[]) => {
                            //if (args.length != imgSrcs.length)
                            //    throw new Error("report: объемов рынков загрузилось не такое же колво что и товаров");

                            let quantities: IDictionary<number> = {};
                            Object.keys(sources).forEach((val, i, arr) => {
                                quantities[val] = args[i];
                            });

                            log("", quantities);
                            deffered.resolve(quantities);
                        })
                        .fail((err: string) => {
                            throw new Error(err);
                        });
                }
                catch (err) {
                    let e = (err as Error);
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }

                return deffered.promise();
            })
            .then((quants: IDictionary<number>) => doDefered.resolve(quants))
            .fail((err: string) => {
                doDefered.reject("не смогли уточнить данные по обороту => " + err);
                //throw new Error("Не смогли уточнить данные.")
            });

        return doDefered.promise();

        function makeImgDic(imgs: string[], products: IProduct[], city: string, geos: IDictionary<TGeo>) {
            let res: IDictionary<string> = {};
            let preparedProd = prepare(products);
            for (let i = 0; i < imgs.length; i++) {
                let imgSrc = imgs[i];

                // среди продуктов найдем по картинке нужный
                // НО есть разные брендовые товары которых нет в основном списке товаров. Их тупо пропустить
                if (!preparedProd[imgSrc])
                    continue;

                let prodId = preparedProd[imgSrc].id;
                let geo = geos[cityName].geocombo;
                // /lien/main/globalreport/marketing/by_trade_at_cities/370077/7060/7065/7087
                // <option class="geocombo f-mx" value="/422607/422609/422632">Акапулько</option>
                let url = `/${realm}/main/globalreport/marketing/by_trade_at_cities/${prodId}${geo}`;
                res[imgSrc] = url;

            }

            return res;

            // конвертает в словарь массив по урлу картинки
            function prepare(products: IProduct[]): IDictionary<IProduct> {
                let res: IDictionary<IProduct> = {};
                for (let i = 0; i < products.length; i++)
                    res[products[i].img] = products[i];

                return res;
            }
        }
    }

    // запрашивает полный список всех продуктов реалма
    function getProducts() {

        let deffered = $.Deferred();
        let realm = getRealm();
        if (realm == null) {
            deffered.reject("не нашли реалм");
            return deffered.promise();
        }

        // запросим список всех товаров что есть в игре
        // _ttps://virtonomica.ru/lien/main/common/main_page/game_info/products
        let urlProducts = `/${realm}/main/common/main_page/game_info/products`;
        let retries = 10;
        $.ajax({
            url: urlProducts,
            type: "GET",

            success: (data, status, jqXHR) => {
                try {
                    let products = parseProducts(data, urlProducts);
                    deffered.resolve(products);
                }
                catch (err) {
                    let e = (err as Error);
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }

            },

            error: function (this: JQueryAjaxSettings, jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                retries--;
                if (retries <= 0) {
                    deffered.reject("Не смог загрузить страницу " + this.url);
                    return;
                }

                appendErr(`ошибка запроса ${this.url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => $.ajax(_this), 1000);
            }
        });

        return deffered.promise();
    }

    // получает для каждого города вообще в мире, короткий аппендикс вида /34345/3453453/345345
    // страна/регион/город. нам это нужно чтобы запрашивать объемы рынка для товаров в маге
    function getGeos() {

        let deffered = $.Deferred();
        let realm = getRealm();
        if (realm == null) {
            deffered.reject("не нашли реалм");
            return deffered.promise();
        }

        // залезем в селекты на странице и найдем селект городов, в нем в нужном месте айдишники региона и страны
        // _ttps://virtonomica.ru/lien/main/globalreport/marketing/by_trade_at_cities
        let urlGeocombo = `/${realm}/main/globalreport/marketing/by_trade_at_cities`;
        let retries = 10;
        $.ajax({
            url: urlGeocombo,
            type: "GET",

            success: (data, status, jqXHR) => {

                try {
                    // для страницы розницы, нам надо тока выдрать из селекта все связки по городам и странам
                    // брать 3 селект
                    let geos = extractGeocombos($(data).find("select").eq(3));
                    if (Object.keys(geos).length === 0)
                        throw new Error("Не получилось вытащить геокомбо со страницы " + urlGeocombo);

                    deffered.resolve(geos);
                }
                catch (err) {
                    let e = (err as Error);
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }
            },

            error: function (this: JQueryAjaxSettings, jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                retries--;
                if (retries <= 0) {
                    deffered.reject("Не смог загрузить страницу " + this.url);
                    return;
                }

                log(`ошибка запроса ${this.url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => $.ajax(_this), 1000);
            }
        });

        return deffered.promise();

        // забирает из селекта все опции и формирует с них словарь. имя города - добавка к ссылке
        function extractGeocombos($select: JQuery): IDictionary<TGeo> {
            let res: IDictionary<TGeo> = {};

            // <option class="geocombo f-mx" value= "/422607/422609/422632" > Акапулько < /option>
            // забираем из опций value чтобы линк получить на объемы рынка.
            $select.find("option.geocombo").each((i, e) => {
                let cityName = getOnlyText($(e))[0];
                let geo = $(e).val() as string;
                res[cityName] = { name: cityName, geocombo: geo };
            });

            return res;
        }
    }

    // по заданной ссылке парсит страницу рынка по рознице и находит объем рынка
    function getQuantity(url: string) {

        let deffered = $.Deferred();

        let retries = 10;
        $.ajax({
            url: url,
            type: 'GET',

            success: (data, textStatus, jqXHR) => {
                try {
                    //if(1)
                    //    throw new Error("тестовая ошибка " + url);

                    let $td = $(data).find("td:contains('Объем рынка:')");
                    if ($td.length != 1)
                        throw new Error("Не нашел объем рынка для " + url);

                    let quant = numberfyOrError($td.next("td").text());
                    deffered.resolve(quant);
                }
                catch (err) {
                    let e = (err as Error);
                    deffered.reject(e.message);
                    log("ошибка: ", e);
                }
            },

            error: function (this: JQueryAjaxSettings, jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
                retries--;
                if (retries <= 0) {
                    deffered.reject("Не смог загрузить страницу " + url);
                    return;
                }

                log(`ошибка запроса ${url} осталось ${retries} попыток`);
                let _this = this;
                setTimeout(() => $.ajax(_this), 1000);
            }
        });

        return deffered.promise();
    }
}

$(document).ready(() => run());