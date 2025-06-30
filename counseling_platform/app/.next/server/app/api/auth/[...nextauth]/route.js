"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "./action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.js&appDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.js&appDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_vishesh_Downloads_AI_Counseling_Web_App_counseling_platform_app_app_api_auth_nextauth_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.js */ \"(rsc)/./app/api/auth/[...nextauth]/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"/Users/vishesh/Downloads/AI_Counseling_Web_App/counseling_platform/app/app/api/auth/[...nextauth]/route.js\",\n    nextConfigOutput,\n    userland: _Users_vishesh_Downloads_AI_Counseling_Web_App_counseling_platform_app_app_api_auth_nextauth_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLmpzJmFwcERpcj0lMkZVc2VycyUyRnZpc2hlc2glMkZEb3dubG9hZHMlMkZBSV9Db3Vuc2VsaW5nX1dlYl9BcHAlMkZjb3Vuc2VsaW5nX3BsYXRmb3JtJTJGYXBwJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRnZpc2hlc2glMkZEb3dubG9hZHMlMkZBSV9Db3Vuc2VsaW5nX1dlYl9BcHAlMkZjb3Vuc2VsaW5nX3BsYXRmb3JtJTJGYXBwJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUMwRDtBQUN2STtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8/MjQ1OSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvdmlzaGVzaC9Eb3dubG9hZHMvQUlfQ291bnNlbGluZ19XZWJfQXBwL2NvdW5zZWxpbmdfcGxhdGZvcm0vYXBwL2FwcC9hcGkvYXV0aC9bLi4ubmV4dGF1dGhdL3JvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy92aXNoZXNoL0Rvd25sb2Fkcy9BSV9Db3Vuc2VsaW5nX1dlYl9BcHAvY291bnNlbGluZ19wbGF0Zm9ybS9hcHAvYXBwL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.js&appDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.js":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nvar __importDefault = (void 0) && (void 0).__importDefault || function(mod) {\n    return mod && mod.__esModule ? mod : {\n        \"default\": mod\n    };\n};\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\nexports.POST = exports.GET = exports.dynamic = void 0;\nconst next_auth_1 = __importDefault(__webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\"));\nconst auth_config_1 = __webpack_require__(/*! @/lib/auth-config */ \"(rsc)/./lib/auth-config.js\");\nexports.dynamic = \"force-dynamic\";\nconst handler = (0, next_auth_1.default)(auth_config_1.authOptions);\nexports.GET = handler;\nexports.POST = handler;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLElBQUlBLGtCQUFrQixDQUFDLE1BQUcsS0FBSyxPQUFHLEVBQUVBLGVBQWUsSUFBSyxTQUFVQyxHQUFHO0lBQ2pFLE9BQU8sT0FBUUEsSUFBSUMsVUFBVSxHQUFJRCxNQUFNO1FBQUUsV0FBV0E7SUFBSTtBQUM1RDtBQUNBRSw4Q0FBNkM7SUFBRUcsT0FBTztBQUFLLENBQUMsRUFBQztBQUM3REQsWUFBWSxHQUFHQSxXQUFXLEdBQUdBLGVBQWUsR0FBRyxLQUFLO0FBQ3BELE1BQU1LLGNBQWNWLGdCQUFnQlcsbUJBQU9BLENBQUMsMERBQVc7QUFDdkQsTUFBTUMsZ0JBQWdCRCxtQkFBT0EsQ0FBQyxxREFBbUI7QUFDakROLGVBQWUsR0FBRztBQUNsQixNQUFNUSxVQUFVLENBQUMsR0FBR0gsWUFBWUksT0FBTyxFQUFFRixjQUFjRyxXQUFXO0FBQ2xFVixXQUFXLEdBQUdRO0FBQ2RSLFlBQVksR0FBR1EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hcHAvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS5qcz9kYTFhIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QT1NUID0gZXhwb3J0cy5HRVQgPSBleHBvcnRzLmR5bmFtaWMgPSB2b2lkIDA7XG5jb25zdCBuZXh0X2F1dGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibmV4dC1hdXRoXCIpKTtcbmNvbnN0IGF1dGhfY29uZmlnXzEgPSByZXF1aXJlKFwiQC9saWIvYXV0aC1jb25maWdcIik7XG5leHBvcnRzLmR5bmFtaWMgPSBcImZvcmNlLWR5bmFtaWNcIjtcbmNvbnN0IGhhbmRsZXIgPSAoMCwgbmV4dF9hdXRoXzEuZGVmYXVsdCkoYXV0aF9jb25maWdfMS5hdXRoT3B0aW9ucyk7XG5leHBvcnRzLkdFVCA9IGhhbmRsZXI7XG5leHBvcnRzLlBPU1QgPSBoYW5kbGVyO1xuIl0sIm5hbWVzIjpbIl9faW1wb3J0RGVmYXVsdCIsIm1vZCIsIl9fZXNNb2R1bGUiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsIlBPU1QiLCJHRVQiLCJkeW5hbWljIiwibmV4dF9hdXRoXzEiLCJyZXF1aXJlIiwiYXV0aF9jb25maWdfMSIsImhhbmRsZXIiLCJkZWZhdWx0IiwiYXV0aE9wdGlvbnMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/auth-config.js":
/*!****************************!*\
  !*** ./lib/auth-config.js ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nvar __awaiter = (void 0) && (void 0).__awaiter || function(thisArg, _arguments, P, generator) {\n    function adopt(value) {\n        return value instanceof P ? value : new P(function(resolve) {\n            resolve(value);\n        });\n    }\n    return new (P || (P = Promise))(function(resolve, reject) {\n        function fulfilled(value) {\n            try {\n                step(generator.next(value));\n            } catch (e) {\n                reject(e);\n            }\n        }\n        function rejected(value) {\n            try {\n                step(generator[\"throw\"](value));\n            } catch (e) {\n                reject(e);\n            }\n        }\n        function step(result) {\n            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);\n        }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __importDefault = (void 0) && (void 0).__importDefault || function(mod) {\n    return mod && mod.__esModule ? mod : {\n        \"default\": mod\n    };\n};\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\nexports.authOptions = void 0;\nconst credentials_1 = __importDefault(__webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\"));\nconst prisma_adapter_1 = __webpack_require__(/*! @next-auth/prisma-adapter */ \"(rsc)/./node_modules/@next-auth/prisma-adapter/dist/index.js\");\nconst db_1 = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.js\");\nconst bcryptjs_1 = __importDefault(__webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\"));\nexports.authOptions = {\n    adapter: (0, prisma_adapter_1.PrismaAdapter)(db_1.prisma),\n    providers: [\n        (0, credentials_1.default)({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            authorize (credentials) {\n                return __awaiter(this, void 0, void 0, function*() {\n                    if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password)) {\n                        return null;\n                    }\n                    const user = yield db_1.prisma.user.findUnique({\n                        where: {\n                            email: credentials.email\n                        }\n                    });\n                    if (!user) {\n                        return null;\n                    }\n                    const passwordsMatch = yield bcryptjs_1.default.compare(credentials.password, user.password);\n                    if (!passwordsMatch) {\n                        return null;\n                    }\n                    // Check if user is approved (admins are always approved)\n                    if (user.role === \"VOLUNTEER\" && user.approvalStatus !== \"APPROVED\") {\n                        throw new Error(\"Account pending approval or rejected\");\n                    }\n                    return {\n                        id: user.id,\n                        email: user.email,\n                        name: user.name,\n                        role: user.role,\n                        approvalStatus: user.approvalStatus\n                    };\n                });\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        jwt ({ token, user }) {\n            return __awaiter(this, void 0, void 0, function*() {\n                if (user) {\n                    token.role = user.role;\n                    token.approvalStatus = user.approvalStatus;\n                }\n                return token;\n            });\n        },\n        session ({ session, token }) {\n            return __awaiter(this, void 0, void 0, function*() {\n                if (token) {\n                    session.user.id = token.sub;\n                    session.user.role = token.role;\n                    session.user.approvalStatus = token.approvalStatus;\n                }\n                return session;\n            });\n        }\n    },\n    pages: {\n        signIn: \"/login\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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anM/OGViZCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5hdXRoT3B0aW9ucyA9IHZvaWQgMDtcbmNvbnN0IGNyZWRlbnRpYWxzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIm5leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHNcIikpO1xuY29uc3QgcHJpc21hX2FkYXB0ZXJfMSA9IHJlcXVpcmUoXCJAbmV4dC1hdXRoL3ByaXNtYS1hZGFwdGVyXCIpO1xuY29uc3QgZGJfMSA9IHJlcXVpcmUoXCJAL2xpYi9kYlwiKTtcbmNvbnN0IGJjcnlwdGpzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImJjcnlwdGpzXCIpKTtcbmV4cG9ydHMuYXV0aE9wdGlvbnMgPSB7XG4gICAgYWRhcHRlcjogKDAsIHByaXNtYV9hZGFwdGVyXzEuUHJpc21hQWRhcHRlcikoZGJfMS5wcmlzbWEpLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICAoMCwgY3JlZGVudGlhbHNfMS5kZWZhdWx0KSh7XG4gICAgICAgICAgICBuYW1lOiBcImNyZWRlbnRpYWxzXCIsXG4gICAgICAgICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICAgICAgICAgIGVtYWlsOiB7IGxhYmVsOiBcIkVtYWlsXCIsIHR5cGU6IFwiZW1haWxcIiB9LFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoY3JlZGVudGlhbHMgPT09IG51bGwgfHwgY3JlZGVudGlhbHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNyZWRlbnRpYWxzLmVtYWlsKSB8fCAhKGNyZWRlbnRpYWxzID09PSBudWxsIHx8IGNyZWRlbnRpYWxzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjcmVkZW50aWFscy5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSB5aWVsZCBkYl8xLnByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlcmU6IHsgZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzc3dvcmRzTWF0Y2ggPSB5aWVsZCBiY3J5cHRqc18xLmRlZmF1bHQuY29tcGFyZShjcmVkZW50aWFscy5wYXNzd29yZCwgdXNlci5wYXNzd29yZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFzc3dvcmRzTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHVzZXIgaXMgYXBwcm92ZWQgKGFkbWlucyBhcmUgYWx3YXlzIGFwcHJvdmVkKVxuICAgICAgICAgICAgICAgICAgICBpZiAodXNlci5yb2xlID09PSAnVk9MVU5URUVSJyAmJiB1c2VyLmFwcHJvdmFsU3RhdHVzICE9PSAnQVBQUk9WRUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjY291bnQgcGVuZGluZyBhcHByb3ZhbCBvciByZWplY3RlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogdXNlci5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm92YWxTdGF0dXM6IHVzZXIuYXBwcm92YWxTdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgXSxcbiAgICBzZXNzaW9uOiB7XG4gICAgICAgIHN0cmF0ZWd5OiBcImp3dFwiLFxuICAgIH0sXG4gICAgY2FsbGJhY2tzOiB7XG4gICAgICAgIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4ucm9sZSA9IHVzZXIucm9sZTtcbiAgICAgICAgICAgICAgICAgICAgdG9rZW4uYXBwcm92YWxTdGF0dXMgPSB1c2VyLmFwcHJvdmFsU3RhdHVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb24udXNlci5pZCA9IHRva2VuLnN1YjtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB0b2tlbi5yb2xlO1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLnVzZXIuYXBwcm92YWxTdGF0dXMgPSB0b2tlbi5hcHByb3ZhbFN0YXR1cztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb247XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHBhZ2VzOiB7XG4gICAgICAgIHNpZ25JbjogXCIvbG9naW5cIixcbiAgICB9LFxufTtcbiJdLCJuYW1lcyI6WyJfX2F3YWl0ZXIiLCJ0aGlzQXJnIiwiX2FyZ3VtZW50cyIsIlAiLCJnZW5lcmF0b3IiLCJhZG9wdCIsInZhbHVlIiwicmVzb2x2ZSIsIlByb21pc2UiLCJyZWplY3QiLCJmdWxmaWxsZWQiLCJzdGVwIiwibmV4dCIsImUiLCJyZWplY3RlZCIsInJlc3VsdCIsImRvbmUiLCJ0aGVuIiwiYXBwbHkiLCJfX2ltcG9ydERlZmF1bHQiLCJtb2QiLCJfX2VzTW9kdWxlIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJleHBvcnRzIiwiYXV0aE9wdGlvbnMiLCJjcmVkZW50aWFsc18xIiwicmVxdWlyZSIsInByaXNtYV9hZGFwdGVyXzEiLCJkYl8xIiwiYmNyeXB0anNfMSIsImFkYXB0ZXIiLCJQcmlzbWFBZGFwdGVyIiwicHJpc21hIiwicHJvdmlkZXJzIiwiZGVmYXVsdCIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwicGFzc3dvcmRzTWF0Y2giLCJjb21wYXJlIiwicm9sZSIsImFwcHJvdmFsU3RhdHVzIiwiRXJyb3IiLCJpZCIsInNlc3Npb24iLCJzdHJhdGVneSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic3ViIiwicGFnZXMiLCJzaWduSW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth-config.js\n");

/***/ }),

/***/ "(rsc)/./lib/db.js":
/*!*******************!*\
  !*** ./lib/db.js ***!
  \*******************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nvar _a;\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\nexports.prisma = void 0;\nconst client_1 = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\nconst globalForPrisma = globalThis;\nexports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient();\nif (true) globalForPrisma.prisma = exports.prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIuanMiLCJtYXBwaW5ncyI6IkFBQWE7QUFDYixJQUFJQTtBQUNKQyw4Q0FBNkM7SUFBRUcsT0FBTztBQUFLLENBQUMsRUFBQztBQUM3REQsY0FBYyxHQUFHLEtBQUs7QUFDdEIsTUFBTUcsV0FBV0MsbUJBQU9BLENBQUMsc0NBQWdCO0FBQ3pDLE1BQU1DLGtCQUFrQkM7QUFDeEJOLGNBQWMsR0FBRyxDQUFDSCxLQUFLUSxnQkFBZ0JILE1BQU0sTUFBTSxRQUFRTCxPQUFPLEtBQUssSUFBSUEsS0FBSyxJQUFJTSxTQUFTSSxZQUFZO0FBQ3pHLElBQUlDLElBQXlCLEVBQ3pCSCxnQkFBZ0JILE1BQU0sR0FBR0YsUUFBUUUsTUFBTSIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8uL2xpYi9kYi5qcz8zZGM5Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9hO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5wcmlzbWEgPSB2b2lkIDA7XG5jb25zdCBjbGllbnRfMSA9IHJlcXVpcmUoXCJAcHJpc21hL2NsaWVudFwiKTtcbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXM7XG5leHBvcnRzLnByaXNtYSA9IChfYSA9IGdsb2JhbEZvclByaXNtYS5wcmlzbWEpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IG5ldyBjbGllbnRfMS5QcmlzbWFDbGllbnQoKTtcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKVxuICAgIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBleHBvcnRzLnByaXNtYTtcbiJdLCJuYW1lcyI6WyJfYSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZXhwb3J0cyIsInZhbHVlIiwicHJpc21hIiwiY2xpZW50XzEiLCJyZXF1aXJlIiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsIlByaXNtYUNsaWVudCIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/uuid","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/oidc-token-hash","vendor-chunks/bcryptjs","vendor-chunks/preact","vendor-chunks/object-hash","vendor-chunks/lru-cache","vendor-chunks/@next-auth"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.js&appDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fvishesh%2FDownloads%2FAI_Counseling_Web_App%2Fcounseling_platform%2Fapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();