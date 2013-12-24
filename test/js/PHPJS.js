/*
 * More info at: http://phpjs.org
 *
 * This is version: 3.25
 * php.js is copyright 2011 Kevin van Zonneveld.
 *
 * Portions copyright Brett Zamir (http://brett-zamir.me), Kevin van Zonneveld
 * (http://kevin.vanzonneveld.net), Onno Marsman, Theriault, Michael White
 * (http://getsprink.com), Waldo Malqui Silva, Paulo Freitas, Jonas Raoni
 * Soares Silva (http://www.jsfromhell.com), Jack, Philip Peterson, Legaev
 * Andrey, Ates Goral (http://magnetiq.com), Ratheous, Alex, Rafal Kukawski
 * (http://blog.kukawski.pl), Martijn Wieringa, lmeyrick
 * (https://sourceforge.net/projects/bcmath-js/), Nate, Enrique Gonzalez,
 * Philippe Baumann, Webtoolkit.info (http://www.webtoolkit.info/), Jani
 * Hartikainen, Ole Vrijenhoek, Ash Searle (http://hexmen.com/blog/), Carlos
 * R. L. Rodrigues (http://www.jsfromhell.com), travc, Michael Grier,
 * Erkekjetter, Johnny Mast (http://www.phpvrouwen.nl), Rafal Kukawski
 * (http://blog.kukawski.pl/), GeekFG (http://geekfg.blogspot.com), Andrea
 * Giammarchi (http://webreflection.blogspot.com), WebDevHobo
 * (http://webdevhobo.blogspot.com/), d3x, marrtins,
 * http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript,
 * pilus, stag019, T.Wild, Martin (http://www.erlenwiese.de/), majak, Marc
 * Palau, Mirek Slugen, Chris, Diplom@t (http://difane.com/), Breaking Par
 * Consulting Inc
 * (http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7),
 * gettimeofday, Arpad Ray (mailto:arpad@php.net), Oleg Eremeev, Josh Fraser
 * (http://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/),
 * Steve Hilder, mdsjack (http://www.mdsjack.bo.it), Kevin van Zonneveld
 * (http://kevin.vanzonneveld.net/), gorthaur, Aman Gupta, Sakimori, Joris,
 * Robin, Kankrelune (http://www.webfaktory.info/), Alfonso Jimenez
 * (http://www.alfonsojimenez.com), David, Felix Geisendoerfer
 * (http://www.debuggable.com/felix), Lars Fischer, Karol Kowalski, Imgen Tata
 * (http://www.myipdf.com/), Steven Levithan (http://blog.stevenlevithan.com),
 * Tim de Koning (http://www.kingsquare.nl), Dreamer, AJ, Paul Smith, KELAN,
 * Pellentesque Malesuada, felix, Michael White, Mailfaker
 * (http://www.weedem.fr/), Thunder.m, Tyler Akins (http://rumkin.com),
 * saulius, Public Domain (http://www.json.org/json2.js), Caio Ariede
 * (http://caioariede.com), Steve Clay, David James, madipta, Marco, Ole
 * Vrijenhoek (http://www.nervous.nl/), class_exists, T. Wild, noname, Arno,
 * Frank Forte, Francois, Scott Cariss, Slawomir Kaniecki, date, Itsacon
 * (http://www.itsacon.net/), Billy, vlado houba, Jalal Berrami,
 * ReverseSyntax, Mateusz "loonquawl" Zalega, john (http://www.jd-tech.net),
 * mktime, Douglas Crockford (http://javascript.crockford.com), ger, Nick
 * Kolosov (http://sammy.ru), Nathan, nobbler, Fox, marc andreu, Alex Wilson,
 * Raphael (Ao RUDLER), Bayron Guevara, Adam Wallner
 * (http://web2.bitbaro.hu/), paulo kuong, jmweb, Lincoln Ramsay, djmix,
 * Pyerre, Jon Hohle, Thiago Mata (http://thiagomata.blog.com), lmeyrick
 * (https://sourceforge.net/projects/bcmath-js/this.), Linuxworld, duncan,
 * Gilbert, Sanjoy Roy, Shingo, sankai, Oskar Larsson Högfeldt
 * (http://oskar-lh.name/), Denny Wardhana, 0m3r, Everlasto, Subhasis Deb,
 * josh, jd, Pier Paolo Ramon (http://www.mastersoup.com/), P, merabi, Soren
 * Hansen, EdorFaus, Eugene Bulkin (http://doubleaw.com/), Der Simon
 * (http://innerdom.sourceforge.net/), echo is bad, JB, LH, kenneth, J A R,
 * Marc Jansen, Stoyan Kyosev (http://www.svest.org/), Francesco, XoraX
 * (http://www.xorax.info), Ozh, Brad Touesnard, MeEtc
 * (http://yass.meetcweb.com), Peter-Paul Koch
 * (http://www.quirksmode.org/js/beat.html), Olivier Louvignes
 * (http://mg-crea.com/), T0bsn, Tim Wiel, Bryan Elliott, nord_ua, Martin, JT,
 * David Randall, Thomas Beaucourt (http://www.webapp.fr), Tim de Koning,
 * stensi, Pierre-Luc Paour, Kristof Coomans (SCK-CEN Belgian Nucleair
 * Research Centre), Martin Pool, Kirk Strobeck, Rick Waldron, Brant Messenger
 * (http://www.brantmessenger.com/), Devan Penner-Woelk, Saulo Vallory, Wagner
 * B. Soares, Artur Tchernychev, Valentina De Rosa, Jason Wong
 * (http://carrot.org/), Christoph, Daniel Esteban, strftime, Mick@el, rezna,
 * Simon Willison (http://simonwillison.net), Anton Ongson, Gabriel Paderni,
 * Marco van Oort, penutbutterjelly, Philipp Lenssen, Bjorn Roesbeke
 * (http://www.bjornroesbeke.be/), Bug?, Eric Nagel, Tomasz Wesolowski,
 * Evertjan Garretsen, Bobby Drake, Blues (http://tech.bluesmoon.info/), Luke
 * Godfrey, Pul, uestla, Alan C, Ulrich, Rafal Kukawski, Yves Sucaet,
 * sowberry, Norman "zEh" Fuchs, hitwork, Zahlii, johnrembo, Nick Callen,
 * Steven Levithan (stevenlevithan.com), ejsanders, Scott Baker, Brian Tafoya
 * (http://www.premasolutions.com/), Philippe Jausions
 * (http://pear.php.net/user/jausions), Aidan Lister
 * (http://aidanlister.com/), Rob, e-mike, HKM, ChaosNo1, metjay, strcasecmp,
 * strcmp, Taras Bogach, jpfle, Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), DxGx, kilops, Orlando,
 * dptr1988, Le Torbi, James (http://www.james-bell.co.uk/), Pedro Tainha
 * (http://www.pedrotainha.com), James, Arnout Kazemier
 * (http://www.3rd-Eden.com), Chris McMacken, Yannoo, jakes, gabriel paderni,
 * FGFEmperor, Greg Frazier, baris ozdil, 3D-GRAF, daniel airton wermann
 * (http://wermann.com.br), Howard Yeend, Diogo Resende, Allan Jensen
 * (http://www.winternet.no), Benjamin Lupton, Atli Þór, Maximusya, davook,
 * Tod Gentille, Ryan W Tenney (http://ryan.10e.us), Nathan Sepulveda, Cord,
 * fearphage (http://http/my.opera.com/fearphage/), Victor, Rafal Kukawski
 * (http://kukawski.pl), Matteo, Manish, Matt Bradley, Riddler
 * (http://www.frontierwebdev.com/), Alexander M Beedie, T.J. Leahy, Rafal
 * Kukawski, taith, Luis Salazar (http://www.freaky-media.com/), FremyCompany,
 * Rival, Luke Smith (http://lucassmith.name), Andrej Pavlovic, Garagoth, Le
 * Torbi (http://www.letorbi.de/), Dino, Josep Sanz (http://www.ws3.es/), rem,
 * Russell Walker (http://www.nbill.co.uk/), Jamie Beck
 * (http://www.terabit.ca/), setcookie, Michael, YUI Library:
 * http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html, Blues at
 * http://hacks.bluesmoon.info/strftime/strftime.js, Ben
 * (http://benblume.co.uk/), DtTvB
 * (http://dt.in.th/2008-09-16.string-length-in-bytes.html), Andreas, William,
 * meo, incidence, Cagri Ekin, Amirouche, Amir Habibi
 * (http://www.residence-mixte.com/), Kheang Hok Chin
 * (http://www.distantia.ca/), Jay Klehr, Lorenzo Pisani, Tony, Yen-Wei Liu,
 * Greenseed, mk.keck, Leslie Hoare, dude, booeyOH, Ben Bryan
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


function PHP_JS(fnm, modifier) {
    return {
        get_html_translation_table: function (table, quote_style) {
            var entities = {},
                hash_map = {},
                decimal, constMappingTable = {},
                constMappingQuoteStyle = {};
            var useTable = {},
                useQuoteStyle = {};

            // Translate arguments
            constMappingTable[0] = 'HTML_SPECIALCHARS';
            constMappingTable[1] = 'HTML_ENTITIES';
            constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
            constMappingQuoteStyle[2] = 'ENT_COMPAT';
            constMappingQuoteStyle[3] = 'ENT_QUOTES';
            useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
            useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

            if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
                throw new Error("Table: " + useTable + ' not supported');
                // return false;
            }

            entities['38'] = '&amp;';
            if (useTable === 'HTML_ENTITIES') {
                entities['160'] = '&nbsp;';
                entities['161'] = '&iexcl;';
                entities['162'] = '&cent;';
                entities['163'] = '&pound;';
                entities['164'] = '&curren;';
                entities['165'] = '&yen;';
                entities['166'] = '&brvbar;';
                entities['167'] = '&sect;';
                entities['168'] = '&uml;';
                entities['169'] = '&copy;';
                entities['170'] = '&ordf;';
                entities['171'] = '&laquo;';
                entities['172'] = '&not;';
                entities['173'] = '&shy;';
                entities['174'] = '&reg;';
                entities['175'] = '&macr;';
                entities['176'] = '&deg;';
                entities['177'] = '&plusmn;';
                entities['178'] = '&sup2;';
                entities['179'] = '&sup3;';
                entities['180'] = '&acute;';
                entities['181'] = '&micro;';
                entities['182'] = '&para;';
                entities['183'] = '&middot;';
                entities['184'] = '&cedil;';
                entities['185'] = '&sup1;';
                entities['186'] = '&ordm;';
                entities['187'] = '&raquo;';
                entities['188'] = '&frac14;';
                entities['189'] = '&frac12;';
                entities['190'] = '&frac34;';
                entities['191'] = '&iquest;';
                entities['192'] = '&Agrave;';
                entities['193'] = '&Aacute;';
                entities['194'] = '&Acirc;';
                entities['195'] = '&Atilde;';
                entities['196'] = '&Auml;';
                entities['197'] = '&Aring;';
                entities['198'] = '&AElig;';
                entities['199'] = '&Ccedil;';
                entities['200'] = '&Egrave;';
                entities['201'] = '&Eacute;';
                entities['202'] = '&Ecirc;';
                entities['203'] = '&Euml;';
                entities['204'] = '&Igrave;';
                entities['205'] = '&Iacute;';
                entities['206'] = '&Icirc;';
                entities['207'] = '&Iuml;';
                entities['208'] = '&ETH;';
                entities['209'] = '&Ntilde;';
                entities['210'] = '&Ograve;';
                entities['211'] = '&Oacute;';
                entities['212'] = '&Ocirc;';
                entities['213'] = '&Otilde;';
                entities['214'] = '&Ouml;';
                entities['215'] = '&times;';
                entities['216'] = '&Oslash;';
                entities['217'] = '&Ugrave;';
                entities['218'] = '&Uacute;';
                entities['219'] = '&Ucirc;';
                entities['220'] = '&Uuml;';
                entities['221'] = '&Yacute;';
                entities['222'] = '&THORN;';
                entities['223'] = '&szlig;';
                entities['224'] = '&agrave;';
                entities['225'] = '&aacute;';
                entities['226'] = '&acirc;';
                entities['227'] = '&atilde;';
                entities['228'] = '&auml;';
                entities['229'] = '&aring;';
                entities['230'] = '&aelig;';
                entities['231'] = '&ccedil;';
                entities['232'] = '&egrave;';
                entities['233'] = '&eacute;';
                entities['234'] = '&ecirc;';
                entities['235'] = '&euml;';
                entities['236'] = '&igrave;';
                entities['237'] = '&iacute;';
                entities['238'] = '&icirc;';
                entities['239'] = '&iuml;';
                entities['240'] = '&eth;';
                entities['241'] = '&ntilde;';
                entities['242'] = '&ograve;';
                entities['243'] = '&oacute;';
                entities['244'] = '&ocirc;';
                entities['245'] = '&otilde;';
                entities['246'] = '&ouml;';
                entities['247'] = '&divide;';
                entities['248'] = '&oslash;';
                entities['249'] = '&ugrave;';
                entities['250'] = '&uacute;';
                entities['251'] = '&ucirc;';
                entities['252'] = '&uuml;';
                entities['253'] = '&yacute;';
                entities['254'] = '&thorn;';
                entities['255'] = '&yuml;';
            }

            if (useQuoteStyle !== 'ENT_NOQUOTES') {
                entities['34'] = '&quot;';
            }
            if (useQuoteStyle === 'ENT_QUOTES') {
                entities['39'] = '&#39;';
            }
            entities['60'] = '&lt;';
            entities['62'] = '&gt;';


            // ascii decimals to real symbols
            for (decimal in entities) {
                if (entities.hasOwnProperty(decimal)) {
                    hash_map[String.fromCharCode(decimal)] = entities[decimal];
                }
            }

            return hash_map;
        },
        htmlentities: function (string, quote_style, charset, double_encode) {
            var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
                symbol = '';
                string = string == null ? '' : string + '';

            if (!hash_map) {
                return false;
            }

            if (quote_style && quote_style === 'ENT_QUOTES') {
                hash_map["'"] = '&#039;';
            }

            if (!!double_encode || double_encode == null) {
                for (symbol in hash_map) {
                    if (hash_map.hasOwnProperty(symbol)) {
                        string = string.split(symbol).join(hash_map[symbol]);
                    }
                }
            } else {
                string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
                    for (symbol in hash_map) {
                        if (hash_map.hasOwnProperty(symbol)) {
                            text = text.split(symbol).join(hash_map[symbol]);
                        }
                    }

                    return text + entity;
                });
            }

            return string;
        },
        rawurlencode: function (str) {
            str = (str + '').toString();
            return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
        },
        bin2hex: function (s) {
              var i, l, o = "", n;

              s += "";

              for (i = 0, l = s.length; i < l; i++) {
                n = s.charCodeAt(i).toString(16)
                o += n.length < 2 ? "0" + n : n;
              }

              return o;

        },
        sprintf: function () {
            var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
            var a = arguments,
                i = 0,
                format = a[i++];

            // pad()
            var pad = function (str, len, chr, leftJustify) {
            if (!chr) {
                chr = ' ';
            }
            var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
                return leftJustify ? str + padding : padding + str;
            };

            // justify()
            var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
                var diff = minWidth - value.length;
                if (diff > 0) {
                    if (leftJustify || !zeroPad) {
                        value = pad(value, minWidth, customPadChar, leftJustify);
                    } else {
                        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                    }
                }
                return value;
            };

            // formatBaseX()
            var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
                // Note: casts negative numbers to positive ones
                var number = value >>> 0;
                prefix = prefix && number && {
                    '2': '0b',
                    '8': '0',
                    '16': '0x'
                }[base] || '';
                value = prefix + pad(number.toString(base), precision || 0, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            };

            // formatString()
            var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
                if (precision != null) {
                    value = value.slice(0, precision);
                }
                return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
            };

            // doFormat()
            var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
                var number;
                var prefix;
                var method;
                var textTransform;
                var value;

                if (substring === '%%') {
                    return '%';
                }

                // parse flags
                var leftJustify = false,
                    positivePrefix = '',
                    zeroPad = false,
                    prefixBaseX = false,
                    customPadChar = ' ';
                var flagsl = flags.length;
                for (var j = 0; flags && j < flagsl; j++) {
                    switch (flags.charAt(j)) {
                        case ' ':
                            positivePrefix = ' ';
                            break;
                        case '+':
                            positivePrefix = '+';
                            break;
                        case '-':
                            leftJustify = true;
                            break;
                        case "'":
                            customPadChar = flags.charAt(j + 1);
                            break;
                        case '0':
                            zeroPad = true;
                            break;
                        case '#':
                            prefixBaseX = true;
                            break;
                    }
                }

                // parameters may be null, undefined, empty-string or real valued
                // we want to ignore null, undefined and empty-string values
                if (!minWidth) {
                    minWidth = 0;
                } else if (minWidth === '*') {
                    minWidth = +a[i++];
                } else if (minWidth.charAt(0) == '*') {
                    minWidth = +a[minWidth.slice(1, -1)];
                } else {
                    minWidth = +minWidth;
                }

                // Note: undocumented perl feature:
                if (minWidth < 0) {
                    minWidth = -minWidth;
                    leftJustify = true;
                }

                if (!isFinite(minWidth)) {
                    throw new Error('sprintf: (minimum-)width must be finite');
                }

                if (!precision) {
                    precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
                } else if (precision === '*') {
                    precision = +a[i++];
                } else if (precision.charAt(0) == '*') {
                    precision = +a[precision.slice(1, -1)];
                } else {
                    precision = +precision;
                }

                // grab value using valueIndex if required?
                value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

                switch (type) {
                    case 's':
                        return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
                    case 'c':
                        return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                    case 'b':
                        return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'o':
                        return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'x':
                        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'X':
                        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                    case 'u':
                        return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'i':
                    case 'd':
                        number = +value || 0;
                        number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
                        prefix = number < 0 ? '-' : positivePrefix;
                        value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                        return justify(value, prefix, leftJustify, minWidth, zeroPad);
                    case 'e':
                    case 'E':
                    case 'f': // Should handle locales (as per setlocale)
                    case 'F':
                    case 'g':
                    case 'G':
                        number = +value;
                        prefix = number < 0 ? '-' : positivePrefix;
                        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                        value = prefix + Math.abs(number)[method](precision);
                        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                    default:
                        return substring;
                }
            };

            return format.replace(regex, doFormat);
        },
        ord: function (string) {
            var str = string + '',
                code = str.charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
                var hi = code;
                if (str.length === 1) {
                    return code; // This is just a high surrogate with no following low surrogate, so we return its value;
                    // we could also throw an error as it is not a complete character, but someone may want to know
                }
                var low = str.charCodeAt(1);
                return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
            }
            if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
                return code; // This is just a low surrogate with no preceding high surrogate, so we return its value;
                // we could also throw an error as it is not a complete character, but someone may want to know
            }
            return code;
        },
        rawurldecode : function (str) {
            return decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function () {
                // PHP tolerates poorly formed escape sequences
                return '%25';
            }));
        },
        html_entity_decode: function (string, quote_style) {
            var hash_map = {},
                symbol = '',
                tmp_str = '',
                entity = '';

            tmp_str = string.toString();

            if (false === (hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
                return false;
            }

            // fix &amp; problem
            // http://phpjs.org/functions/get_html_translation_table:416#comment_97660
            delete(hash_map['&']);
            hash_map['&'] = '&amp;';

            for (symbol in hash_map) {
                entity = hash_map[symbol];
                tmp_str = tmp_str.split(entity).join(symbol);
            }
            tmp_str = tmp_str.split('&#039;').join("'");

            return tmp_str;
        }
    }
}

jSmart.prototype.PHPJS = PHP_JS;
