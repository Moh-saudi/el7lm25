"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/hyphenate-style-name";
exports.ids = ["vendor-chunks/hyphenate-style-name"];
exports.modules = {

/***/ "(ssr)/./node_modules/hyphenate-style-name/index.js":
/*!****************************************************!*\
  !*** ./node_modules/hyphenate-style-name/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* eslint-disable no-var, prefer-template */\r\nvar uppercasePattern = /[A-Z]/g\r\nvar msPattern = /^ms-/\r\nvar cache = {}\r\n\r\nfunction toHyphenLower(match) {\r\n  return '-' + match.toLowerCase()\r\n}\r\n\r\nfunction hyphenateStyleName(name) {\r\n  if (cache.hasOwnProperty(name)) {\r\n    return cache[name]\r\n  }\r\n\r\n  var hName = name.replace(uppercasePattern, toHyphenLower)\r\n  return (cache[name] = msPattern.test(hName) ? '-' + hName : hName)\r\n}\r\n\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hyphenateStyleName);\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaHlwaGVuYXRlLXN0eWxlLW5hbWUvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLGtCQUFrQiIsInNvdXJjZXMiOlsid2VicGFjazovL2VsN2xtLy4vbm9kZV9tb2R1bGVzL2h5cGhlbmF0ZS1zdHlsZS1uYW1lL2luZGV4LmpzP2E0YzMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdmFyLCBwcmVmZXItdGVtcGxhdGUgKi9cclxudmFyIHVwcGVyY2FzZVBhdHRlcm4gPSAvW0EtWl0vZ1xyXG52YXIgbXNQYXR0ZXJuID0gL15tcy0vXHJcbnZhciBjYWNoZSA9IHt9XHJcblxyXG5mdW5jdGlvbiB0b0h5cGhlbkxvd2VyKG1hdGNoKSB7XHJcbiAgcmV0dXJuICctJyArIG1hdGNoLnRvTG93ZXJDYXNlKClcclxufVxyXG5cclxuZnVuY3Rpb24gaHlwaGVuYXRlU3R5bGVOYW1lKG5hbWUpIHtcclxuICBpZiAoY2FjaGUuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgIHJldHVybiBjYWNoZVtuYW1lXVxyXG4gIH1cclxuXHJcbiAgdmFyIGhOYW1lID0gbmFtZS5yZXBsYWNlKHVwcGVyY2FzZVBhdHRlcm4sIHRvSHlwaGVuTG93ZXIpXHJcbiAgcmV0dXJuIChjYWNoZVtuYW1lXSA9IG1zUGF0dGVybi50ZXN0KGhOYW1lKSA/ICctJyArIGhOYW1lIDogaE5hbWUpXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGh5cGhlbmF0ZVN0eWxlTmFtZVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/hyphenate-style-name/index.js\n");

/***/ })

};
;