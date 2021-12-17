"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _unfetch = _interopRequireDefault(require("unfetch"));

var _minisearch = _interopRequireDefault(require("minisearch"));

const _excluded = ["id"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class App extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    const miniSearch = new _minisearch.default({
      fields: ['artist', 'title'],
      storeFields: ['year'],
      processTerm: (term, _fieldName) => term.length <= 1 || stopWords.has(term) ? null : term.toLowerCase()
    });
    ['handleSearchChange', 'handleSearchKeyDown', 'handleSuggestionClick', 'handleSearchClear', 'handleAppClick', 'setSearchOption', 'performSearch', 'setFromYear', 'setToYear'].forEach(method => {
      this[method] = this[method].bind(this);
    });
    this.searchInputRef = /*#__PURE__*/_react.default.createRef();
    this.state = {
      matchingSongs: [],
      songsById: null,
      searchValue: '',
      ready: false,
      suggestions: [],
      selectedSuggestion: -1,
      fromYear: 1965,
      toYear: 2015,
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        fields: ['title', 'artist'],
        combineWith: 'OR',
        filter: null
      },
      miniSearch
    };
  }

  componentDidMount() {
    (0, _unfetch.default)('billboard_1965-2015.json').then(response => response.json()).then(allSongs => {
      const songsById = allSongs.reduce((byId, song) => {
        byId[song.id] = song;
        return byId;
      }, {});
      this.setState({
        songsById
      });
      const {
        miniSearch
      } = this.state;
      return miniSearch.addAll(allSongs);
    }).then(() => {
      this.setState({
        ready: true
      });
    });
  }

  handleSearchChange(_ref) {
    let {
      target: {
        value
      }
    } = _ref;
    this.setState({
      searchValue: value
    });
    const matchingSongs = value.length > 1 ? this.searchSongs(value) : [];
    const selectedSuggestion = -1;
    const suggestions = this.getSuggestions(value);
    this.setState({
      matchingSongs,
      suggestions,
      selectedSuggestion
    });
  }

  handleSearchKeyDown(_ref2) {
    let {
      which,
      key,
      keyCode
    } = _ref2;
    let {
      suggestions,
      selectedSuggestion,
      searchValue
    } = this.state;

    if (key === 'ArrowDown') {
      selectedSuggestion = Math.min(selectedSuggestion + 1, suggestions.length - 1);
      searchValue = suggestions[selectedSuggestion].suggestion;
    } else if (key === 'ArrowUp') {
      selectedSuggestion = Math.max(0, selectedSuggestion - 1);
      searchValue = suggestions[selectedSuggestion].suggestion;
    } else if (key === 'Enter' || key === 'Escape') {
      selectedSuggestion = -1;
      suggestions = [];
      this.searchInputRef.current.blur();
    } else {
      return;
    }

    const matchingSongs = this.searchSongs(searchValue);
    this.setState({
      suggestions,
      selectedSuggestion,
      searchValue,
      matchingSongs
    });
  }

  handleSuggestionClick(i) {
    let {
      suggestions
    } = this.state;
    const searchValue = suggestions[i].suggestion;
    const matchingSongs = this.searchSongs(searchValue);
    this.setState({
      searchValue,
      matchingSongs,
      suggestions: [],
      selectedSuggestion: -1
    });
  }

  handleSearchClear() {
    this.setState({
      searchValue: '',
      matchingSongs: [],
      suggestions: [],
      selectedSuggestion: -1
    });
  }

  handleAppClick() {
    this.setState({
      suggestions: [],
      selectedSuggestion: -1
    });
  }

  setSearchOption(option, valueOrFn) {
    if (typeof valueOrFn === 'function') {
      this.setState(_ref3 => {
        let {
          searchOptions
        } = _ref3;
        return {
          searchOptions: _objectSpread(_objectSpread({}, searchOptions), {}, {
            [option]: valueOrFn(searchOptions[option])
          })
        };
      }, this.performSearch);
    } else {
      this.setState(_ref4 => {
        let {
          searchOptions
        } = _ref4;
        return {
          searchOptions: _objectSpread(_objectSpread({}, searchOptions), {}, {
            [option]: valueOrFn
          })
        };
      }, this.performSearch);
    }
  }

  setFromYear(year) {
    this.setState(_ref5 => {
      let {
        toYear,
        searchOptions
      } = _ref5;
      const fromYear = parseInt(year, 10);

      if (fromYear <= 1965 && toYear >= 2015) {
        return {
          fromYear,
          searchOptions: _objectSpread(_objectSpread({}, searchOptions), {}, {
            filter: null
          })
        };
      } else {
        const filter = _ref6 => {
          let {
            year
          } = _ref6;
          year = parseInt(year, 10);
          return year >= fromYear && year <= toYear;
        };

        return {
          fromYear,
          searchOptions: _objectSpread(_objectSpread({}, searchOptions), {}, {
            filter
          })
        };
      }
    }, this.performSearch);
  }

  setToYear(year) {
    this.setState(_ref7 => {
      let {
        fromYear,
        searchOptions
      } = _ref7;
      const toYear = parseInt(year, 10);

      if (fromYear <= 1965 && toYear >= 2015) {
        return {
          toYear,
          searchOptions: _objectSpread(_objectSpread({}, searchOptions), {}, {
            filter: null
          })
        };
      } else {
        const filter = _ref8 => {
          let {
            year
          } = _ref8;
          year = parseInt(year, 10);
          return year >= fromYear && year <= toYear;
        };

        return {
          toYear,
          searchOptions: _objectSpread(_objectSpread({}, searchOptions), {}, {
            filter
          })
        };
      }
    }, this.performSearch);
  }

  searchSongs(query) {
    const {
      miniSearch,
      songsById,
      searchOptions
    } = this.state;
    return miniSearch.search(query, searchOptions).map(_ref9 => {
      let {
        id
      } = _ref9;
      return songsById[id];
    });
  }

  performSearch() {
    const {
      searchValue
    } = this.state;
    const matchingSongs = this.searchSongs(searchValue);
    this.setState({
      matchingSongs
    });
  }

  getSuggestions(query) {
    const {
      miniSearch,
      searchOptions
    } = this.state;

    const prefix = (term, i, terms) => i === terms.length - 1;

    return miniSearch.autoSuggest(query, _objectSpread(_objectSpread({}, searchOptions), {}, {
      prefix,
      boost: {
        artist: 5
      }
    })).filter((_ref10, _, _ref11) => {
      let {
        suggestion,
        score
      } = _ref10;
      let [first] = _ref11;
      return score > first.score / 4;
    }).slice(0, 5);
  }

  render() {
    const {
      matchingSongs,
      searchValue,
      ready,
      suggestions,
      selectedSuggestion,
      searchOptions,
      fromYear,
      toYear
    } = this.state;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "App",
      onClick: this.handleAppClick
    }, /*#__PURE__*/_react.default.createElement("article", {
      className: "main"
    }, ready ? /*#__PURE__*/_react.default.createElement(Header, {
      onChange: this.handleSearchChange,
      onKeyDown: this.handleSearchKeyDown,
      selectedSuggestion: selectedSuggestion,
      onSuggestionClick: this.handleSuggestionClick,
      onSearchClear: this.handleSearchClear,
      value: searchValue,
      suggestions: suggestions,
      searchInputRef: this.searchInputRef,
      searchOptions: searchOptions,
      setSearchOption: this.setSearchOption,
      setFromYear: this.setFromYear,
      setToYear: this.setToYear,
      fromYear: fromYear,
      toYear: toYear
    }) : /*#__PURE__*/_react.default.createElement(Loader, null), matchingSongs && matchingSongs.length > 0 ? /*#__PURE__*/_react.default.createElement(SongList, {
      songs: matchingSongs
    }) : ready && /*#__PURE__*/_react.default.createElement(Explanation, null)));
  }

}

const SongList = _ref12 => {
  let {
    songs
  } = _ref12;
  return /*#__PURE__*/_react.default.createElement("ul", {
    className: "SongList"
  }, songs.map(_ref13 => {
    let {
      id
    } = _ref13,
        props = _objectWithoutProperties(_ref13, _excluded);

    return /*#__PURE__*/_react.default.createElement(Song, _extends({}, props, {
      key: id
    }));
  }));
};

const Song = _ref14 => {
  let {
    title,
    artist,
    year,
    rank
  } = _ref14;
  return /*#__PURE__*/_react.default.createElement("li", {
    className: "Song"
  }, /*#__PURE__*/_react.default.createElement("h3", null, capitalize(title)), /*#__PURE__*/_react.default.createElement("dl", null, /*#__PURE__*/_react.default.createElement("dt", null, "Artist:"), " ", /*#__PURE__*/_react.default.createElement("dd", null, capitalize(artist)), /*#__PURE__*/_react.default.createElement("dt", null, "Year:"), " ", /*#__PURE__*/_react.default.createElement("dd", null, year), /*#__PURE__*/_react.default.createElement("dt", null, "Billboard Position:"), " ", /*#__PURE__*/_react.default.createElement("dd", null, rank)));
};

const Header = props => /*#__PURE__*/_react.default.createElement("header", {
  className: "Header"
}, /*#__PURE__*/_react.default.createElement("h1", null, "Song Search"), /*#__PURE__*/_react.default.createElement(SearchBox, props));

const SearchBox = _ref15 => {
  let {
    onChange,
    onKeyDown,
    onSuggestionClick,
    onSearchClear,
    value,
    suggestions,
    selectedSuggestion,
    searchInputRef,
    searchOptions,
    setSearchOption,
    setFromYear,
    setToYear,
    fromYear,
    toYear
  } = _ref15;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "SearchBox"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "Search"
  }, /*#__PURE__*/_react.default.createElement("input", {
    type: "text",
    value: value,
    onChange: onChange,
    onKeyDown: onKeyDown,
    ref: searchInputRef,
    autoComplete: "none",
    autoCorrect: "none",
    autoCapitalize: "none",
    spellCheck: "false"
  }), /*#__PURE__*/_react.default.createElement("button", {
    className: "clear",
    onClick: onSearchClear
  }, "\xD7")), suggestions && suggestions.length > 0 && /*#__PURE__*/_react.default.createElement(SuggestionList, {
    items: suggestions,
    selectedSuggestion: selectedSuggestion,
    onSuggestionClick: onSuggestionClick
  }), /*#__PURE__*/_react.default.createElement(AdvancedOptions, {
    options: searchOptions,
    setOption: setSearchOption,
    setFromYear: setFromYear,
    setToYear: setToYear,
    fromYear: fromYear,
    toYear: toYear
  }));
};

const SuggestionList = _ref16 => {
  let {
    items,
    selectedSuggestion,
    onSuggestionClick
  } = _ref16;
  return /*#__PURE__*/_react.default.createElement("ul", {
    className: "SuggestionList"
  }, items.map((_ref17, i) => {
    let {
      suggestion
    } = _ref17;
    return /*#__PURE__*/_react.default.createElement(Suggestion, {
      value: suggestion,
      selected: selectedSuggestion === i,
      onClick: event => onSuggestionClick(i, event),
      key: i
    });
  }));
};

const Suggestion = _ref18 => {
  let {
    value,
    selected,
    onClick
  } = _ref18;
  return /*#__PURE__*/_react.default.createElement("li", {
    className: `Suggestion ${selected ? 'selected' : ''}`,
    onClick: onClick
  }, value);
};

const AdvancedOptions = _ref19 => {
  let {
    options,
    setOption,
    setFromYear,
    setToYear,
    fromYear,
    toYear
  } = _ref19;

  const setField = field => _ref20 => {
    let {
      target: {
        checked
      }
    } = _ref20;
    setOption('fields', fields => {
      return checked ? [...fields, field] : fields.filter(f => f !== field);
    });
  };

  const setKey = function (key) {
    let trueValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let falseValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return _ref21 => {
      let {
        target: {
          checked
        }
      } = _ref21;
      setOption(key, checked ? trueValue : falseValue);
    };
  };

  const {
    fields,
    combineWith,
    fuzzy,
    prefix
  } = options;
  return /*#__PURE__*/_react.default.createElement("details", {
    className: "AdvancedOptions"
  }, /*#__PURE__*/_react.default.createElement("summary", null, "Advanced options"), /*#__PURE__*/_react.default.createElement("div", {
    className: "options"
  }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("b", null, "Search in fields:"), /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
    type: "checkbox",
    checked: fields.includes('title'),
    onChange: setField('title')
  }), "Title"), /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
    type: "checkbox",
    checked: fields.includes('artist'),
    onChange: setField('artist')
  }), "Artist")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("b", null, "Search options:"), /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
    type: "checkbox",
    checked: !!prefix,
    onChange: setKey('prefix')
  }), " Prefix"), /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
    type: "checkbox",
    checked: !!fuzzy,
    onChange: setKey('fuzzy', 0.2)
  }), " Fuzzy")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("b", null, "Combine terms with:"), /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
    type: "radio",
    checked: combineWith === 'OR',
    onChange: setKey('combineWith', 'OR', 'AND')
  }), " OR"), /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement("input", {
    type: "radio",
    checked: combineWith === 'AND',
    onChange: setKey('combineWith', 'AND', 'OR')
  }), " AND")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("b", null, "Filter:"), /*#__PURE__*/_react.default.createElement("label", null, "from year:", /*#__PURE__*/_react.default.createElement("select", {
    value: fromYear,
    onChange: _ref22 => {
      let {
        target: {
          value
        }
      } = _ref22;
      return setFromYear(value);
    }
  }, years.filter(year => year <= toYear).map(year => /*#__PURE__*/_react.default.createElement("option", {
    key: year,
    value: year
  }, year)))), /*#__PURE__*/_react.default.createElement("label", null, "to year:", /*#__PURE__*/_react.default.createElement("select", {
    value: toYear,
    onChange: _ref23 => {
      let {
        target: {
          value
        }
      } = _ref23;
      return setToYear(value);
    }
  }, years.filter(year => year >= fromYear).map(year => /*#__PURE__*/_react.default.createElement("option", {
    key: year,
    value: year
  }, year)))))));
};

const Explanation = () => /*#__PURE__*/_react.default.createElement("p", null, "This is a demo of the ", /*#__PURE__*/_react.default.createElement("a", {
  href: "https://github.com/lucaong/minisearch"
}, "MiniSearch"), " JavaScript library: try searching through more than 5000 top songs and artists in ", /*#__PURE__*/_react.default.createElement("em", null, "Billboard Hot 100"), " from year 1965 to 2015. This example demonstrates search (with prefix and fuzzy match) and auto-completion.");

const Loader = _ref24 => {
  let {
    text
  } = _ref24;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "Loader"
  }, text || 'loading...');
};

const capitalize = string => string.replace(/(\b\w)/gi, char => char.toUpperCase());

const stopWords = new Set(['the', 'a', 'an', 'and']);
const years = [];

for (let y = 1965; y <= 2015; y++) {
  years.push(y);
}

var _default = App;
exports.default = _default;