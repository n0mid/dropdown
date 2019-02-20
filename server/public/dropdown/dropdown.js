window.initDropdown = window.initDropdown || function (selector, options) {

    var rootElem = document.querySelector(selector),
        listElem = null,
        inputElem = null,
        selectedElem = null,
        iconElem = null,

        isClientData,

        source = [],
        filteredSource = [],
        selectedItems = [],

        defaultOptions = {
            multiSelect: true,
            showAvatar: true
        };

    if (!rootElem) {
        throw new Error('Invalid selector: ' + selector);
    }

    options = Object.assign({}, defaultOptions, options);

    if (Array.isArray(options.data)) {
        isClientData = true;
        source = filteredSource = options.data;
    } else if (typeof options.url === 'string') {
        isClientData = false;
    } else {
        throw new Error('Invalid data');
    }

    _init();

    function _init() {
        rootElem.classList.add('dropdown-wrapper');

        inputElem = document.createElement('input');
        inputElem.type = 'text';
        inputElem.className = 'dropdown-input';
        rootElem.appendChild(inputElem);

        iconElem = document.createElement('div');
        iconElem.className = 'dropdown-input-icon';
        rootElem.appendChild(iconElem);

        listElem = document.createElement('div');
        listElem.className = 'dropdown-list-block';
        rootElem.appendChild(listElem);

        selectedElem = document.createElement('div');
        selectedElem.className = 'dropdown-selected-list';
        rootElem.appendChild(selectedElem);

        inputElem.addEventListener('focus', function () {
            if (listElem) {
                if (isClientData) {
                    _renderItems();
                    listElem.classList.add('dropdown-list-block__show');
                } else if (filteredSource.length > 0) {
                    listElem.classList.add('dropdown-list-block__show');
                }
            }
        });

        inputElem.addEventListener('blur', function () {
            if (listElem) {
                setTimeout(function () {
                    listElem.classList.remove('dropdown-list-block__show');
                }, 100);
            }
        });

        inputElem.addEventListener('input', _debounce(function (event) {
            var query = event.target.value;

            if (isClientData) {
                filteredSource = _filterSource(_getAllQueries(query));
                _renderItems();
            } else {
                if (query.length > 2) {
                    _renderItemsFromServer(_getAllQueries(query));
                }
            }
        }, 300));

        iconElem.addEventListener('click', function () {
            if (inputElem) {
                inputElem.focus();
            }
        });

        listElem.addEventListener('click', function (event) {
            var index  = _getIndexFromAttr(event.target, 'dropdown-item');

            if (index !== null) {
                if (options.multiSelect) {
                    selectedItems.push(filteredSource[index]);
                } else {
                    selectedItems = [filteredSource[index]];
                }

                _renderSelection();
            }
        });

        selectedElem.addEventListener('click', function (event) {
            var index  = _getIndexFromAttr(event.target, 'dropdown-selected-item-remove');

            if (index !== null) {
                selectedItems.splice(index, 1);

                _renderSelection();
            }
        });
    }

    function _getIndexFromAttr(elem, className) {
        while (elem && !elem.classList.contains(className)) {
            elem = elem.parentElement;
        }

        if (elem) {
            var index = +elem.getAttribute('data-item');
            if (!isNaN(index)) {
                return index;
            }
        }

        return null;
    }

    function _renderItems() {
        // virtual scroll
        while (listElem.firstChild) {
            listElem.removeChild(listElem.firstChild);
        }

        var html = '<div>';

        if (filteredSource.length > 0) {
            filteredSource.forEach(function (item, index) {
                html += ('<li class="dropdown-item '
                    + (options.showAvatar ? 'dropdown-item__with-avatar' : '')
                    + '" data-item="'
                    + index
                    + '">');
                if (options.showAvatar) {
                    html += '<img class="dropdown-item-avatar" src="' + item.avatar + '"</>';
                }
                html += '<div class="dropdown-item-title">' + item.firstname + ' ' + item.lastname + '</div>';
                html += '<div class="dropdown-item-subtitle">' + item.additionalInfo + '</div>';
                html += '</li>';
            });
        } else {
            html += '<div class="dropdown-list-message">Пользователь не найден</div>'
        }

        html += '</div>';

        listElem.insertAdjacentHTML('afterbegin', html);
    }

    function _renderSelection() {
        while (selectedElem.firstChild) {
            selectedElem.removeChild(selectedElem.firstChild);
        }

        var html = '';
        selectedItems.forEach(function (item, index) {
            html += '<div class="dropdown-selected-item">'
                + item.firstname
                + ' '
                + item.lastname
                + '<button class="dropdown-selected-item-remove" data-item="' + index + '">X</button></div>';
        });

        selectedElem.insertAdjacentHTML('beforeend', html);
    }

    function _filterSource(queries) {
        var result = [],
            sourceLength = source.length,
            queryLength = queries.length,
            i, j;

        for (i = 0; i < sourceLength; i++) {
            var item = source[i];

            for (j = 0; j < queryLength; j++) {
                var q = queries[j];
                if (item.firstname.toLowerCase().indexOf(q) !== -1 ||
                    item.lastname.toLowerCase().indexOf(q) !== -1 ||
                    item.additionalInfo.toLowerCase().indexOf(q) !== -1) {
                    result.push(item);

                    break;
                }
            }
        }


        return result;
    }

    function _debounce(func, delay) {
        var timer = null;

        return function () {
            var args = arguments;

            function onComplete() {
                func.apply(this, args);
                timer = null;
            }

            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(onComplete, delay);
        };
    }

    function _getAllQueries(query) {
        query = query.toLowerCase();

        var russian = ["а", "б", "в", "г", "д", "е", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я"];

        var translitToRus = {
            "a": "а",
            "b": "б",
            "v": "в",
            "g": "г",
            "d": "д",
            "e": "э",
            "zh": "ж",
            "z": "з",
            "i": "и",
            "y": "ы",
            "k": "к",
            "l": "л",
            "m": "м",
            "n": "н",
            "o": "о",
            "p": "п",
            "r": "р",
            "s": "с",
            "t": "т",
            "u": "у",
            "f": "ф",
            "kh": "х",
            "ts": "ц",
            "ch": "ч",
            "sh": "ш",
            "shch": "щ",
            "'": "ь",
            "\"" : "ь",
            "yu": "ю",
            "ya": "я"
        };
        var engToRus = {
            "f": "а",
            ",": "б",
            "<": "б",
            "d": "в",
            "u": "г",
            "l": "д",
            "t": "е",
            ";": "ж",
            ":": "ж",
            "p": "з",
            "b": "и",
            "q": "й",
            "r": "к",
            "k": "л",
            "v": "м",
            "y": "н",
            "j": "о",
            "g": "п",
            "h": "р",
            "c": "с",
            "n": "т",
            "e": "у",
            "a": "ф",
            "[": "х",
            "{": "х",
            "w": "ц",
            "x": "ч",
            "i": "ш",
            "o": "щ",
            "]": "ъ",
            "}": "ъ",
            "s": "ы",
            "m": "ь",
            "'": "э",
            "\"": "э",
            ".": "ю",
            ">": "ю",
            "z": "я"
        };
        var engTransiltToRus = {
            "ф": "а",
            "и": "б",
            "м": "в",
            "п": "г",
            "в": "д",
            "у": "э",
            "яр": "ж",
            "я": "з",
            "ш": "и",
            "н": "ы",
            "л": "к",
            "д": "л",
            "ь": "м",
            "т": "н",
            "щ": "о",
            "з": "п",
            "к": "р",
            "ы": "с",
            "е": "т",
            "г": "у",
            "а": "ф",
            "лр": "х",
            "еы": "ц",
            "ср": "ч",
            "ыр": "ш",
            "ырср": "щ",
            "э": "ь",
            "нг": "ю",
            "нф": "я"
        };

        var result = [query],
            length = query.length,
            i,
            fromTranslit = '',
            fromEng = '',
            fromEngTranslit = '';

        for (i = 0; i < length; i++) {
            fromTranslit += (translitToRus[query[i]] ? translitToRus[query[i]] : query[i]);
            fromEng += (engToRus[query[i]] ? engToRus[query[i]] : query[i]);
            fromEngTranslit += (engTransiltToRus[query[i]] ? engTransiltToRus[query[i]] : query[i]);
        }

        result.push(fromTranslit);
        result.push(fromEng);
        result.push(fromEngTranslit);

        return result;
    }

    function _renderItemsFromServer(query) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', options.url + '?query=' + query.join(','));

        xhr.send();

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status !== 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else {

                filteredSource = JSON.parse(xhr.response);
                _renderItems();
                listElem.classList.add('dropdown-list-block__show');
            }
        }
    }
};