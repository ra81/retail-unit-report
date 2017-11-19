

$ = jQuery = jQuery.noConflict(true);
let Realm = getRealmOrError();

type TGeo = { name: string, geocombo: string };



// упрощаем себе жисть, подставляем имя скрипта всегда в сообщении
function log(msg: string, ...args: any[]) {
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
    let appendErr = (msg: string) => {
        if ($errTd.find("span").length > 0)
            $errTd.append("</br>");

        $errTd.append(`<span>${msg}</span>`);
    };

    // вставим кнопку запроса уточнения по цифрам
    let $preciseBtn = $("<input type='button' value=' уточнить '></input>");
    $btnTd.append($preciseBtn);
    $preciseBtn.on("click", async (event) => {
        $preciseBtn.prop("disabled", true);
        $errTd.children().remove();

        try {

            // урлы картинок нужны чтобы по ним найти рынки для данного товара в данном городе и взять объем рынка если чел нажмет а кнопку обновления
            let imgSrcs: string[] = $rows.find("img").map((i, e) => $(e).attr("src")).get() as any;

            // название города где маг стоит
            let cityName = $infoBlock.find("tr").eq(0).find("td").eq(1).text().split("(")[0].trim();
            if (cityName.length === 0)
                throw new Error("не нашел имя города в котором стоит данный магазин.");

            let qdict = await getMarketSizes_async(imgSrcs, cityName);
            drawNumbers(qdict);
        }
        catch (err) {
            appendErr("не смогли обновить данные => " + err);
            throw err;
        }
        finally {
            $preciseBtn.prop("disabled", false);
        }
    });


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
}

async function getMarketSizes_async(imgList: string[], cityName: string): Promise<IDictionary<number>> {

    // собрали все продукты
    let urlProducts = `/${Realm}/window/common/main_page/game_info/products`;
    let html = await tryGet_async(urlProducts);
    let products = parseProducts(html, urlProducts);

    // собираем геокомбы /422607/422609/422632
    let geos = await getGeos_async();

    // формируем урлы на маркетинговые отчеты 
    let tm2prod: IDictionary<IProduct> | null = null;
    let img2url: IDictionary<string> = {};
    for (let img of imgList) {
        let prod = products[img];

        // видимо ТМ надо искать в ТМ
        if (prod == null) {
            if (tm2prod == null)
                tm2prod = await tm2product_async(products);

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
    let img2quant: IDictionary<number> = {};
    let waitList: Promise<ICityRetailReport>[] = [];
    for (let img in img2url)
        waitList.push(getRep_async(img2url[img]));

    let reports = await Promise.all(waitList);
    let repMap: IDictionary<number> = {};   // замаппим Картинка = отчет. Но тут нет ТМ учета и при ТМ товаре картинка от товара простого
    for (let rep of reports)
        repMap[rep.product.img] = rep.size;


    // теперь нужно объем рынка сопоставить с картинкой товара и вернуть
    let res: IDictionary<number> = {};
    for (let img of imgList) {
        // если товар простой то берем сразу, иначе берем товар из ТМ таблицы и берем сайз
        let prod = products[img];
        if (prod == null)
            prod = nullCheck(tm2prod)[img];

        res[img] = repMap[prod.img];
    }

    return res;


    async function getRep_async(url: string) {
        let html = await tryGet_async(url);
        return parseCityRetailReport(html, url);
    }
}

/**
 * получает для каждого города вообще в мире, короткий аппендикс вида /34345/3453453/345345
   страна/регион/город. нам это нужно чтобы запрашивать объемы рынка для товаров в маге
 */
async function getGeos_async() {

    // залезем в селекты на странице и найдем селект городов, в нем в нужном месте айдишники региона и страны
    let urlGeocombo = `/${Realm}/window/globalreport/marketing/by_trade_at_cities`;
    let html = await tryGet_async(urlGeocombo);

    // для страницы розницы, нам надо тока выдрать из селекта все связки по городам и странам
    // брать 3 селект
    let geos = extractGeocombos($(html).find("select").eq(3));
    if (Object.keys(geos).length === 0)
        throw new Error("Не получилось вытащить геокомбо со страницы " + urlGeocombo);

    return geos;


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

// формирует таблицу для конвертации ТМ товара в обычный
async function tm2product_async(products: IDictionary<IProduct>): Promise<IDictionary<IProduct>> {

    // забираем и парсим таблицу ТМ
    let tm_info_tpl = `/${Realm}/window/globalreport/tm/info`;    // список всех брендовых товаров
    let html = await tryGet_async(tm_info_tpl);
    let tmDict = parseTM(html, tm_info_tpl);

    // рисуем словарь ТМ картинка = стандартный продукт
    let resDict: IDictionary<IProduct> = {};
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
}

function parseUnitType($html: JQuery): UnitTypes {

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
    let type: UnitTypes = (UnitTypes as any)[typeStr] ? (UnitTypes as any)[typeStr] : UnitTypes.unknown;
    if (type == UnitTypes.unknown)
        throw new Error("Не описан тип юнита " + typeStr);

    return type;
}

function isWindow($html: JQuery, url: string) {
    return url.indexOf("/window/") > 0;
}

interface IProduct {
    name: string;
    img: string;    // полный путь картинки /img/products/clay.gif или /img/products/brand/clay.gif
    id: number
}
interface IProductProperties {
    price: number;
    quality: number;
    brand: number;
}
function parseProducts(html: any, url: string): IDictionary<IProduct> {
    let $html = $(html);

    try {
        let $tbl = isWindow($html, url)
            ? $html.filter("table.list")
            : $html.find("table.list");

        let $items = $tbl.find("a").has("img");
        if ($items.length === 0)
            throw new Error("не смогли найти ни одного продукта на " + url);

        let dict: IDictionary<IProduct> = {};
        $items.each((i, el) => {
            let $a = $(el);

            let _img = $a.find("img").eq(0).attr("src");

            // название продукта Спортивное питание, Маточное молочко и так далее
            let _name = $a.attr("title").trim();
            if (_name.length === 0)
                throw new Error("Имя продукта пустое.");

            // номер продукта
            let m = matchedOrError($a.attr("href"), /\d+/);
            let _id = numberfyOrError(m, 0);  // должно быть больше 0 полюбому

            dict[_img] = { id: _id, name: _name, img: _img };
        });

        return dict;
    }
    catch (err) {
        throw err;
    }
}
function parseTM(html: any, url: string): IDictionary<string> {
    let $html = $(html);

    try {
        let $imgs = isWindow($html, url)
            ? $html.filter("table.grid").find("img")
            : $html.find("table.grid").find("img");

        if ($imgs.length <= 0)
            throw new Error("Не найдено ни одного ТМ товара.");

        let dict: IDictionary<string> = {};
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

interface ICityRetailReport {
    product: IProduct;
    index: MarketIndex;
    size: number;
    sellerCount: number;
    companyCount: number;
    locals: IProductProperties;
    shops: IProductProperties;
}
function parseCityRetailReport(html: any, url: string): ICityRetailReport {
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
        let localBrand = numberfy($priceTbl.find("tr").eq(3).children("td").eq(0).text());   // может быть равен -

        // магазины
        let shopPrice = numberfyOrError($priceTbl.find("tr").eq(1).children("td").eq(1).text());
        let shopQual = numberfyOrError($priceTbl.find("tr").eq(2).children("td").eq(1).text());
        let shopBrand = numberfy($priceTbl.find("tr").eq(3).children("td").eq(1).text());   // может быть равен -

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