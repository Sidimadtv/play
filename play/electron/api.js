"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
var axios_1 = require("axios");
var electron_1 = require("electron");
var fs_1 = require("fs");
var iptv_playlist_parser_1 = require("iptv-playlist-parser");
var ipc_commands_1 = require("../shared/ipc-commands");
var playlist_utils_1 = require("../shared/playlist.utils");
var fs = require('fs');
var https = require('https');
var mpvAPI = require('node-mpv');
var createMpvInstance = function () { return new mpvAPI({}, ['--autofit=70%']); };
var mpv = createMpvInstance();
mpv.on('quit', function () { return (mpv = null); }).on('crash', function () { return (mpv = null); });
/** @deprecated - used only for migration */
var Nedb = require('nedb-promises');
/** @deprecated - used only for migration */
var userData = process.env['e2e']
    ? process.cwd() + '/e2e'
    : electron_1.app.getPath('userData');
/** @deprecated - used only for migration */
var dbPath = "".concat(userData, "/db/data.db");
/** @deprecated - used only for migration */
var db = new Nedb({
    filename: dbPath,
    autoload: true,
});
var agent = new https.Agent({
    rejectUnauthorized: false,
});
var Api = /** @class */ (function () {
    function Api() {
        var _this = this;
        electron_1.ipcMain
            .on(ipc_commands_1.PLAYLIST_PARSE_BY_URL, function (event, args) {
            try {
                axios_1.default
                    .get(args.url, { httpsAgent: agent })
                    .then(function (result) {
                    var parsedPlaylist = _this.parsePlaylist(result.data);
                    var playlistObject = (0, playlist_utils_1.createPlaylistObject)(args.title, parsedPlaylist, args.url, 'URL');
                    event.sender.send(ipc_commands_1.PLAYLIST_PARSE_RESPONSE, {
                        payload: playlistObject,
                    });
                });
            }
            catch (err) {
                event.sender.send(ipc_commands_1.ERROR, {
                    message: err.response.statusText,
                    status: err.response.status,
                });
            }
        })
            .on(ipc_commands_1.OPEN_FILE, function (event, args) {
            fs.readFile(args.filePath, 'utf-8', function (err, data) {
                if (err) {
                    console.log('An error ocurred reading the file :' +
                        err.message);
                    return;
                }
                var parsedPlaylist = _this.parsePlaylist(data);
                var playlistObject = (0, playlist_utils_1.createPlaylistObject)(args.fileName, parsedPlaylist, args.filePath, 'FILE');
                event.sender.send(ipc_commands_1.PLAYLIST_PARSE_RESPONSE, {
                    payload: playlistObject,
                });
            });
        })
            .on(ipc_commands_1.PLAYLIST_UPDATE, function (event, args) {
            if (args.filePath && args.id) {
                _this.fetchPlaylistByFilePath(args, event);
            }
            else if (args.url && args.id) {
                _this.fetchPlaylistByUrl(args, event);
            }
        })
            .on(ipc_commands_1.CHANNEL_SET_USER_AGENT, function (_event, args) {
            if (args.userAgent && args.referer) {
                _this.setUserAgent(args.userAgent, args.referer);
            }
            else {
                _this.setUserAgent(_this.defaultUserAgent, 'localhost');
            }
        })
            .on(ipc_commands_1.IS_PLAYLISTS_MIGRATION_POSSIBLE, function (event) {
            db.count({
                type: { $exists: false },
            }).then(function (count) {
                event.sender.send(ipc_commands_1.IS_PLAYLISTS_MIGRATION_POSSIBLE_RESPONSE, {
                    result: count > 0,
                    message: count > 0
                        ? "".concat(count, " playlists were found, which can be migrated from the database used in the last version of the application.")
                        : 'No playlists for migration',
                });
            });
        })
            .on(ipc_commands_1.AUTO_UPDATE_PLAYLISTS, 
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        function (event, playlists) { return __awaiter(_this, void 0, void 0, function () {
            var results, playlist, _i, playlists_1, element;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, playlists_1 = playlists;
                        _a.label = 1;
                    case 1:
                        if (!(_i < playlists_1.length)) return [3 /*break*/, 6];
                        element = playlists_1[_i];
                        if (!(element.url && element._id)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fetchPlaylistByUrl({
                                id: element._id,
                                title: element.title || '',
                                url: element.url,
                            })];
                    case 2:
                        playlist = _a.sent();
                        results.push(playlist);
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(element.filePath && element._id)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.fetchPlaylistByFilePath({
                                id: element._id,
                                title: element.title || '',
                                filePath: element.filePath,
                            })];
                    case 4:
                        playlist = _a.sent();
                        results.push(playlist);
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        event.sender.send(ipc_commands_1.AUTO_UPDATE_PLAYLISTS_RESPONSE, results.filter(function (item) { return item !== undefined; }));
                        return [2 /*return*/];
                }
            });
        }); })
            .on(ipc_commands_1.MIGRATE_PLAYLISTS, function (event) {
            _this.getAllPlaylists().then(function (playlists) {
                event.sender.send(ipc_commands_1.MIGRATE_PLAYLISTS_RESPONSE, {
                    payload: playlists,
                });
            });
        })
            .on(ipc_commands_1.DELETE_ALL_PLAYLISTS, function (event) {
            _this.removeAllPlaylists(event);
        })
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            .on(ipc_commands_1.OPEN_MPV_PLAYER, function (event, _a) {
            var url = _a.url;
            return __awaiter(_this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            if (mpv === null) {
                                mpv = createMpvInstance();
                            }
                            if (!mpv.isRunning()) return [3 /*break*/, 2];
                            return [4 /*yield*/, mpv.load(url)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 2: return [4 /*yield*/, mpv.start()];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, mpv.load(url)];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            error_1 = _b.sent();
                            console.log(error_1);
                            event.sender.send(ipc_commands_1.ERROR, {
                                message: 'Error: Something went wrong. Make sure that mpv player is installed on your system.',
                            });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        });
        // listeners for EPG events
        electron_1.ipcMain
            .on(ipc_commands_1.EPG_GET_PROGRAM, function (_event, arg) {
            return _this.workerWindow.webContents.send(ipc_commands_1.EPG_GET_PROGRAM, arg);
        })
            .on(ipc_commands_1.EPG_GET_CHANNELS, function (_event, arg) {
            return _this.workerWindow.webContents.send(ipc_commands_1.EPG_GET_CHANNELS, arg);
        })
            .on(ipc_commands_1.EPG_GET_CHANNELS_DONE, function (_event, arg) {
            return _this.mainWindow.webContents.send(ipc_commands_1.EPG_GET_CHANNELS_DONE, arg);
        })
            .on(ipc_commands_1.EPG_GET_PROGRAM_DONE, function (_event, arg) {
            _this.mainWindow.webContents.send(ipc_commands_1.EPG_GET_PROGRAM_DONE, arg);
        })
            .on(ipc_commands_1.EPG_FETCH, function (_event, arg) {
            return _this.workerWindow.webContents.send(ipc_commands_1.EPG_FETCH, arg === null || arg === void 0 ? void 0 : arg.url);
        })
            .on(ipc_commands_1.EPG_FETCH_DONE, function (_event, arg) {
            return _this.mainWindow.webContents.send(ipc_commands_1.EPG_FETCH_DONE, arg);
        })
            .on(ipc_commands_1.EPG_ERROR, function (_event, arg) {
            return _this.mainWindow.webContents.send(ipc_commands_1.EPG_ERROR, arg);
        })
            .on(ipc_commands_1.EPG_GET_CHANNELS_BY_RANGE, function (_event, arg) {
            _this.workerWindow.webContents.send(ipc_commands_1.EPG_GET_CHANNELS_BY_RANGE, arg);
        })
            .on(ipc_commands_1.EPG_GET_CHANNELS_BY_RANGE_RESPONSE, function (_event, arg) {
            return _this.mainWindow.webContents.send(ipc_commands_1.EPG_GET_CHANNELS_BY_RANGE_RESPONSE, arg);
        })
            .on(ipc_commands_1.EPG_FORCE_FETCH, function (_event, arg) {
            return _this.workerWindow.webContents.send(ipc_commands_1.EPG_FORCE_FETCH, arg);
        });
        this.setTitleBarListeners();
    }
    /**
     * Sets the user agent header for all http requests
     * @param userAgent user agent to use
     * @param referer referer to use
     */
    Api.prototype.setUserAgent = function (userAgent, referer) {
        if (userAgent === undefined || userAgent === null || userAgent === '') {
            userAgent = this.defaultUserAgent;
        }
        electron_1.session.defaultSession.webRequest.onBeforeSendHeaders(function (details, callback) {
            details.requestHeaders['User-Agent'] = userAgent;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            details.requestHeaders['Referer'] = referer;
            callback({ requestHeaders: details.requestHeaders });
        });
        console.log("Success: Set \"".concat(userAgent, "\" as user agent header"));
    };
    /**
     * Sets epg browser window
     * @param workerWindow
     */
    Api.prototype.setEpgWorkerWindow = function (workerWindow) {
        this.workerWindow = workerWindow;
        // store default user agent as fallback
        this.defaultUserAgent = this.workerWindow.webContents.getUserAgent();
    };
    /**
     * Sets browser window of the main app window
     * @param mainWindow
     */
    Api.prototype.setMainWindow = function (mainWindow) {
        this.mainWindow = mainWindow;
    };
    /**
     * Converts the fetched playlist string to the playlist object, updates it  in the database and sends the updated playlists array back to the renderer
     * @param id id of the playlist to update
     * @param playlistString updated playlist as string
     */
    Api.prototype.getRefreshedPlaylist = function (args, playlistString) {
        var parsedPlaylist = this.parsePlaylist(playlistString);
        var playlist = (0, playlist_utils_1.createPlaylistObject)(args.title, parsedPlaylist, args.url ? args.url : args.filePath, args.url ? 'URL' : 'FILE');
        return __assign(__assign({}, playlist), { _id: args.id });
    };
    Api.prototype.sendPlaylistRefreshResponse = function (playlistId, playlist, event) {
        event.sender.send(ipc_commands_1.PLAYLIST_UPDATE_RESPONSE, {
            message: "Success! The playlist was successfully updated (".concat(playlist.playlist.items.length, " channels)"),
            playlist: __assign(__assign({}, playlist), { _id: playlistId }),
        });
    };
    /**
     * Set default listeners for custom-titlebar
     */
    Api.prototype.setTitleBarListeners = function () {
        electron_1.ipcMain.on('window-minimize', function (event) {
            electron_1.BrowserWindow.fromWebContents(event.sender).minimize();
        });
        electron_1.ipcMain.on('window-maximize', function (event) {
            var window = electron_1.BrowserWindow.fromWebContents(event.sender);
            window.isMaximized() ? window.unmaximize() : window.maximize();
        });
        electron_1.ipcMain.on('window-close', function (event) {
            electron_1.BrowserWindow.fromWebContents(event.sender).close();
        });
        electron_1.ipcMain.on('window-is-maximized', function (event) {
            event.returnValue = electron_1.BrowserWindow.fromWebContents(event.sender).isMaximized();
        });
    };
    /**
     * Fetches the playlist from the given url and triggers the update operation
     * @param id id of the playlist to update
     * @param playlistString updated playlist as string
     * @param event ipc event to send the response back to the renderer
     */
    Api.prototype.fetchPlaylistByUrl = function (args, event) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var result, refreshedPlaylist, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!args.url)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get(args.url, { httpsAgent: agent })];
                    case 2:
                        result = _b.sent();
                        refreshedPlaylist = this.getRefreshedPlaylist(args, result.data);
                        if (event) {
                            this.sendPlaylistRefreshResponse(refreshedPlaylist._id, refreshedPlaylist, event);
                        }
                        else {
                            return [2 /*return*/, refreshedPlaylist];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        if (event)
                            event.sender.send(ipc_commands_1.ERROR, {
                                message: "File not found. Please check the entered playlist URL again.",
                                status: (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.status,
                            });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches the playlist from the given path from the file system and triggers the update operation
     * @param id id of the playlist to update
     * @param playlistString updated playlist as string
     * @param event ipc event to send the response back to the renderer
     */
    Api.prototype.fetchPlaylistByFilePath = function (args, event) {
        return __awaiter(this, void 0, void 0, function () {
            var refreshedPlaylist, playlist, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!args.filePath)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(args.filePath, 'utf-8')];
                    case 2:
                        playlist = _a.sent();
                        refreshedPlaylist = this.getRefreshedPlaylist(args, playlist);
                        if (event) {
                            this.sendPlaylistRefreshResponse(refreshedPlaylist._id, refreshedPlaylist, event);
                        }
                        else {
                            return [2 /*return*/, refreshedPlaylist];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** Sends an error message to the renderer process */
    Api.prototype.handleFileNotFoundError = function (error, event) {
        console.error(error);
        if (event) {
            event.sender.send(ipc_commands_1.ERROR, {
                message: "Sorry, playlist was not found (".concat(error.path, ")"),
                status: 'ENOENT',
            });
        }
    };
    /**
     * Parses string based array to playlist object
     * @param m3uString m3u playlist as string
     */
    Api.prototype.parsePlaylist = function (m3uString) {
        return (0, iptv_playlist_parser_1.parse)(m3uString);
    };
    /** @deprecated - used only for migration */
    Api.prototype.getAllPlaylists = function () {
        return db
            .find({ type: { $exists: false } })
            .sort({ position: 1, importDate: -1 });
    };
    /** @deprecated - used only for migration */
    Api.prototype.removeAllPlaylists = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var removeCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.remove({}, { multi: true })];
                    case 1:
                        removeCount = _a.sent();
                        console.info(removeCount, ' playlists were removed');
                        fs.unlink(dbPath, function (err) {
                            if (err && err.code == 'ENOENT') {
                                console.info("File doesn't exist, won't remove it.");
                            }
                            else if (err) {
                                console.error('Error occurred while trying to remove file');
                            }
                            else {
                                console.info("".concat(dbPath, " was deleted"));
                                event.sender.send(ipc_commands_1.IS_PLAYLISTS_MIGRATION_POSSIBLE_RESPONSE, {
                                    result: false,
                                });
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Api;
}());
exports.Api = Api;
//# sourceMappingURL=api.js.map