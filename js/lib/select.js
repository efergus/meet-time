'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var e = React.createElement;
var Selection = /*#__PURE__*/function (_React$Component) {
  _inherits(Selection, _React$Component);
  var _super = _createSuper(Selection);
  function Selection() {
    _classCallCheck(this, Selection);
    return _super.apply(this, arguments);
  }
  _createClass(Selection, [{
    key: "render",
    value: function render() {
      var props = this.props;
      var style = {
        left: props.left,
        top: props.top,
        // width: props.width,
        height: props.height
      };
      return /*#__PURE__*/React.createElement("div", {
        style: style,
        className: "selection"
      }, /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement("div", {
        className: "round pink"
      }, props.children)));
    }
  }]);
  return Selection;
}(React.Component);
var Day = /*#__PURE__*/function (_React$Component2) {
  _inherits(Day, _React$Component2);
  var _super2 = _createSuper(Day);
  function Day(props) {
    var _this;
    _classCallCheck(this, Day);
    _this = _super2.call(this, props);
    _this.ref = React.createRef();
    _this.state = {
      sid: 1
    };
    _this.stored = {
      height: 0
    };
    return _this;
  }
  _createClass(Day, [{
    key: "selections",
    value: function selections() {
      var selections = this.props.selections;
      var elems = [];
      var height = this.stored.height / this.props.rows;
      for (var i in selections) {
        var span = selections[i][1] - selections[i][0];
        elems.push( /*#__PURE__*/React.createElement(Selection, {
          key: selections[i][0],
          left: 0,
          top: height * selections[i][0],
          height: height * span
        }, "Times"));
      }
      return elems;
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.stored = {
        height: this.ref.current.offsetHeight
      };
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "day",
        ref: this.ref
      }, " ", this.selections(), " ");
    }
  }]);
  return Day;
}(React.Component);
function minmax(a, b) {
  if (a < b) {
    return [a, b];
  }
  return [b, a];
}
function bounds(a, b) {
  return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}
function selection_add(selections_list, selection) {
  if (!selections_list.length) {
    return [selection];
  }
  var n = selections_list.length;
  var selections = [];
  var i = 0;
  for (; i < n && selections_list[i][1] < selection[0]; i++) {
    selections.push(selections_list[i]);
  }
  var span = selection;
  for (; i < n && selections_list[i][0] <= selection[1]; i++) {
    span = bounds(selections_list[i], span);
  }
  selections.push(span);
  for (; i < n; i++) {
    selections.push(selections_list[i]);
  }
  return selections;
}
function range_overlaps(range, val) {
  return range[0] <= val && range[1] > val;
}
function selection_remove(selections_list, val) {
  var selections = selections_list.filter(function (x) {
    return !range_overlaps(x, val);
  });
  return selections;
}
function _is_selected(selections_list, pos) {
  return selections_list.some(function (x) {
    return range_overlaps(x, pos);
  });
}
function set_bit(byte_arr, bit_idx) {
  var idx = Math.floor(bit_idx / 8);
  var offset = bit_idx % 8;
  var val = byte_arr[idx];
  byte_arr[idx] = val | 1 << 7 - offset;
}
function get_bit(byte_arr, bit_idx) {
  var idx = Math.floor(bit_idx / 8);
  var offset = bit_idx % 8;
  var val = byte_arr[idx];
  return (val >> 7 - offset & 1) > 0;
}
function b64safe(b64) {
  var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return reverse ? b64.replace(/-/g, "+").replace(/_/g, "/") : b64.replace(/\+/g, "-").replace(/\//g, "_");
}
function encode_string(string) {
  return b64safe(btoa(string));
}
function encode_buffer(byte_array) {
  return encode_string(String.fromCharCode.apply(String, _toConsumableArray(byte_array)));
}
function decode_string(string) {
  return atob(b64safe(string, true));
}
function decode_buffer(buffer_string) {
  var characters = decode_string(buffer_string);
  var nums = new Array(characters.length).fill(null).map(function (_, i) {
    return characters.charCodeAt(i);
  });
  return new Uint8Array(nums);
}
function bitmask(selections_list, rows) {
  var cols = selections_list.length;
  var size = Math.ceil(rows * cols / 8);
  var bits = new ArrayBuffer(size);
  var view = new Uint8Array(bits);
  for (var col = 0; col < cols; col++) {
    var _iterator = _createForOfIteratorHelper(selections_list[col]),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var span = _step.value;
        for (var row = span[0]; row < span[1]; row++) {
          set_bit(view, row + col * rows);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  return view;
}
var Schedule = /*#__PURE__*/function (_React$Component3) {
  _inherits(Schedule, _React$Component3);
  var _super3 = _createSuper(Schedule);
  function Schedule(props) {
    var _this2;
    _classCallCheck(this, Schedule);
    _this2 = _super3.call(this, props);
    _this2.ref = React.createRef();
    _this2.stored = {
      width: null,
      height: null,
      selectors: []
    };
    _this2.state = {
      begin: null,
      anchor: null,
      active: null,
      selection: Array(props.cols).fill([])
    };
    return _this2;
  }
  _createClass(Schedule, [{
    key: "register_selector",
    value: function register_selector(x) {
      this.stored.selectors.push(x);
    }
  }, {
    key: "select",
    value: function select(grid_a, grid_b) {
      if (!grid_a || !grid_b) {
        return this.state.selection;
      }
      var cols = minmax(grid_a[0], grid_b[0]);
      var rows = minmax(grid_a[1], grid_b[1]);
      rows[1] += 1;
      var selection = Array(this.props.cols).fill(null);
      for (var i in selection) {
        if (i >= cols[0] && i <= cols[1]) {
          selection[i] = selection_add(this.state.selection[i], rows);
        } else {
          selection[i] = this.state.selection[i].slice();
        }
      }
      return selection;
    }
  }, {
    key: "deselect",
    value: function deselect(grid_pos) {
      var selection_list = selection_remove(this.state.selection[grid_pos[0]], grid_pos[1]);
      var selection = this.state.selection.slice();
      selection[grid_pos[0]] = selection_list;
      return selection;
    }
  }, {
    key: "update_others",
    value: function update_others() {
      var selection_mask = bitmask(this.select(this.state.anchor, this.state.active), this.props.rows);
      var _iterator2 = _createForOfIteratorHelper(this.stored.selectors),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var f = _step2.value;
          f(selection_mask);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "is_selected",
    value: function is_selected(grid_pos) {
      return _is_selected(this.state.selection[grid_pos[0]], grid_pos[1]);
    }
  }, {
    key: "getGrid",
    value: function getGrid(loc) {
      return [Math.floor(loc[0] / this.stored.width * this.props.cols), Math.floor(loc[1] / this.stored.height * this.props.rows)];
    }
  }, {
    key: "handleMouse",
    value: function handleMouse(e) {
      if (!this.stored.width) {
        return;
      }
      var rect = this.ref.current.getBoundingClientRect();
      var loc = [e.clientX - rect.left, e.clientY - rect.top];
      var press = this.getGrid(loc);
      var begin = this.state.begin;
      var active = this.state.active;
      var anchor = this.state.anchor;
      var selection = this.state.selection;
      // click and drag, delete clicking top of thing doesn't work
      if (e.buttons) {
        active = press.slice();
      }
      if (!this.state.anchor && e.buttons) {
        begin = press.slice();
        var _iterator3 = _createForOfIteratorHelper(this.state.selection[press[0]]),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var span = _step3.value;
            for (var i = 0; i <= 1; i++) {
              if (span[i] - i == press[1]) {
                selection = this.deselect(press);
                press[1] = span[1 - i] - (1 - i) * 1;
                break;
              }
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        anchor = press;
      } else if (begin && !e.buttons) {
        var is_clicked = begin.every(function (x, i) {
          return x === press[i];
        });
        if (is_clicked && this.is_selected(press)) {
          selection = this.deselect(press);
        } else {
          selection = this.select(anchor, press);
        }
        begin = null;
        anchor = null;
        active = null;
      }
      this.setState({
        begin: begin,
        anchor: anchor,
        active: active,
        selection: selection
      });
      this.update_others(selection);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.stored = _objectSpread(_objectSpread({}, this.stored), {}, {
        width: this.ref.current.offsetWidth,
        height: this.ref.current.offsetHeight
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;
      var selection = this.select(this.state.anchor, this.state.active);
      var days = Array(this.props.cols).fill(null).map(function (_, i) {
        return /*#__PURE__*/React.createElement(Day, {
          key: i,
          rows: _this3.props.rows,
          selections: selection[i]
        });
      });
      var mouse_handle = function mouse_handle(e) {
        return _this3.handleMouse(e);
      };
      return /*#__PURE__*/React.createElement("div", {
        ref: this.ref,
        className: "schedule noselect",
        onMouseMove: mouse_handle,
        onMouseDown: mouse_handle,
        onMouseUp: mouse_handle
      }, days);
    }
  }]);
  return Schedule;
}(React.Component);
var Root = /*#__PURE__*/function (_React$Component4) {
  _inherits(Root, _React$Component4);
  var _super4 = _createSuper(Root);
  function Root(props) {
    var _this4;
    _classCallCheck(this, Root);
    _this4 = _super4.call(this, props);
    _this4.ref = React.createRef();
    _this4.form = React.createRef();
    return _this4;
  }
  _createClass(Root, [{
    key: "register_selector",
    value: function register_selector(x) {
      if (this.ref.current) {
        this.ref.current.register_selector(x);
      }
    }
  }, {
    key: "submit",
    value: function submit() {
      var mask = bitmask(this.ref.current.state.selection, 24);
      this.form.current.value = encode_buffer(mask);
    }
  }, {
    key: "render",
    value: function render() {
      var _this5 = this;
      return /*#__PURE__*/React.createElement("div", {
        className: "hz schedule-card"
      }, /*#__PURE__*/React.createElement("div", {
        className: "spacer"
      }), /*#__PURE__*/React.createElement("div", {
        className: "schedule-block"
      }, /*#__PURE__*/React.createElement(Schedule, {
        cols: 5,
        rows: 24,
        ref: this.ref
      }), /*#__PURE__*/React.createElement("form", {
        action: window.location.pathname + "/submit",
        method: "post",
        onSubmit: function onSubmit() {
          return _this5.submit();
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        name: "name",
        placeholder: "Anonymous"
      }), /*#__PURE__*/React.createElement("input", {
        ref: this.form,
        type: "hidden",
        name: "submit",
        value: ""
      }), /*#__PURE__*/React.createElement("input", {
        type: "submit",
        value: "Submit"
      }))), /*#__PURE__*/React.createElement("div", {
        className: "spacer"
      }), /*#__PURE__*/React.createElement("div", {
        className: "spacer"
      }), /*#__PURE__*/React.createElement("div", {
        className: "schedule-block"
      }, /*#__PURE__*/React.createElement(Chunks, {
        cols: 5,
        rows: 24,
        register_selector: function register_selector(x) {
          return _this5.register_selector(x);
        }
      })), /*#__PURE__*/React.createElement("div", {
        className: "spacer"
      }));
    }
  }]);
  return Root;
}(React.Component);
function rgba(r, g, b, a) {
  return "rgba(" + [r, g, b, a].join() + ")";
}
function Box(props) {
  var margin = props.pad || "0.2em";
  var style = {
    marginLeft: margin,
    marginRight: margin
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "shield"
  }, /*#__PURE__*/React.createElement("div", {
    style: style,
    className: "box",
    onMouseOver: props.onMouseOver
  }, props.children));
}
function Chunk(props) {
  var amt = props.amount;
  var max = props.max;
  var color = amt > 0 ? amt === 1.0 ? rgba(255, 0, 255, 1) : rgba(0, 128, 255, (amt + 0.3) / 1.3) : rgba(0, 0, 0, 0);
  var style = {
    top: props.top,
    height: props.height || props.bottom - props.top,
    backgroundColor: color
  };
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement(Box, {
    onMouseOver: props.setActive
  }, props.children));
}
function ChunkCol(props) {
  var full = props.full;
  var amts = props.amounts;
  var rows = amts.length;
  var ref = React.useRef(null);
  var _React$useState = React.useState(1),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    height = _React$useState2[0],
    setHeightState = _React$useState2[1];
  React.useEffect(function () {
    setHeightState(ref.current.offsetHeight);
  });
  var chunks = new Array(amts.length).fill(null).map(function (_, i) {
    return /*#__PURE__*/React.createElement(Chunk, {
      key: i,
      top: height / rows * i,
      height: height / rows,
      amount: amts[i] / full,
      setActive: function setActive() {
        return props.setActive(i);
      }
    });
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "day"
  }, chunks);
}
function get_selection_graph(selections) {
  var names = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (!names) {
    names = Object.keys(selections).sort();
  }
  var ans = {};
  var _iterator4 = _createForOfIteratorHelper(names),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var name = _step4.value;
      var sel = selections[name];
      for (var i = 0; i < sel.length * 8; i++) {
        if (get_bit(sel, i)) {
          if (ans[i] === undefined) ans[i] = [];
          ans[i].push(name);
        }
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  return ans;
}
function get_selection_matrix(selection_dict, rows, cols) {
  var ans = new Array(cols).fill(null).map(function (_) {
    return new Array(rows).fill(null);
  });
  for (var c = 0; c < cols; c++) {
    for (var r = 0; r < rows; r++) {
      var idx = r + c * rows;
      if (selection_dict[idx]) {
        ans[c][r] = selection_dict[idx];
      } else {
        ans[c][r] = [];
      }
    }
  }
  return ans;
}
function get_selection_amounts(selection_matrix) {
  return selection_matrix.map(function (x) {
    return x.map(function (x) {
      return x.length;
    });
  });
}
function matching_mask(list_a, list_b) {
  var eq = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (a, b) {
    return a === b;
  };
  var mask = new Array(list_a.length).fill(false);
  var mask_idx = 0;
  var subset_idx = 0;
  while (mask_idx < list_a.length && subset_idx < list_b.length) {
    if (eq(list_a[mask_idx], list_b[subset_idx])) {
      mask[mask_idx] = true;
      mask_idx++;
      subset_idx++;
    } else {
      mask_idx++;
    }
  }
  return mask;
}
function get_active_name_mask(active, all_names, selection_matrix) {
  if (!active) {
    return new Array(all_names.length).fill(true);
  }
  var selected = selection_matrix[active.col][active.row];
  return matching_mask(all_names, selected);
}
function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }
  return arr.slice(1).reduce(function (xs, x, i) {
    return xs.concat([sep, x]);
  }, [arr[0]]);
}
function ShowName(props) {
  var active_class = props.active ? "active" : "inactive";
  return /*#__PURE__*/React.createElement("span", {
    className: active_class
  }, props.name);
}
function ShowActiveNames(props) {
  // console.log(props.mask, props.names);
  var names = props.names.map(function (x, i) {
    return /*#__PURE__*/React.createElement(ShowName, {
      key: i,
      name: x,
      active: props.mask[i]
    });
  });
  var name_list = intersperse(names, ", ");
  var count = props.mask.reduce(function (acc, x) {
    return acc + (x ? 1 : 0);
  }, 0);
  var summary = props.show_count ? /*#__PURE__*/React.createElement("span", null, count, "/", props.mask.length) : "";
  return /*#__PURE__*/React.createElement("div", null, summary, " ", name_list);
}
function Chunks(props) {
  var _React$useState3 = React.useState([]),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    user_selection = _React$useState4[0],
    setUserSelection = _React$useState4[1];
  var _React$useState5 = React.useState({}),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    other_selections = _React$useState6[0],
    setOtherSelections = _React$useState6[1];
  var _React$useState7 = React.useState(null),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    active = _React$useState8[0],
    _setActive = _React$useState8[1];
  React.useEffect(function () {
    get_selections().then(function (x) {
      setOtherSelections(x);
    });
  }, []);
  React.useEffect(function () {
    props.register_selector(setUserSelection);
  });
  var rows = props.rows;
  var cols = props.cols;
  var any_user_selections = user_selection.reduce(function (a, x) {
    return a | x;
  }, 0);
  var selections = any_user_selections ? _objectSpread({
    You: user_selection
  }, other_selections) : other_selections;
  var all_names = Object.keys(selections).sort();
  var selection_graph = get_selection_graph(selections, all_names);
  var selection_matrix = get_selection_matrix(selection_graph, rows, cols);
  var amounts = get_selection_amounts(selection_matrix);
  var name_mask = get_active_name_mask(active, all_names, selection_matrix);
  var full = all_names.length || 1;
  var chunk_cols = Array(props.cols).fill(null).map(function (_, i) {
    return /*#__PURE__*/React.createElement(ChunkCol, {
      key: i,
      amounts: amounts[i],
      full: full,
      setActive: function setActive(r) {
        return _setActive({
          col: i,
          row: r
        });
      }
    });
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "schedule",
    onMouseLeave: function onMouseLeave() {
      return _setActive(null);
    }
  }, chunk_cols), /*#__PURE__*/React.createElement(ShowActiveNames, {
    names: all_names,
    mask: name_mask,
    show_count: active !== null
  }));
}
function get_selections() {
  return _get_selections.apply(this, arguments);
}
function _get_selections() {
  _get_selections = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var response, data, key;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch(window.location.pathname + "/q");
          case 2:
            response = _context.sent;
            _context.next = 5;
            return response.json();
          case 5:
            data = _context.sent;
            for (key in data) {
              data[key] = decode_buffer(data[key]);
            }
            return _context.abrupt("return", data);
          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _get_selections.apply(this, arguments);
}
var domContainer = document.getElementById('root');
var root = ReactDOM.createRoot(domContainer);
root.render(e(Root));