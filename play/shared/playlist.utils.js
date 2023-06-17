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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaylistObject = exports.getFilenameFromUrl = exports.createFavoritesPlaylist = exports.aggregateFavoriteChannels = void 0;
var uuid_1 = require("uuid");
var constants_1 = require("./constants");
/**
 * Aggregates favorite channels as objects from all available playlists
 * @param playlists all available playlists
 * @returns an array with favorite channels from all playlists
 */
function aggregateFavoriteChannels(playlists) {
    var favorites = [];
    playlists.forEach(function (playlist) {
        var _a;
        if (((_a = playlist.favorites) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            playlist.playlist.items.forEach(function (channel) {
                if (playlist.favorites.includes(channel.id) ||
                    playlist.favorites.includes(channel.url)) {
                    favorites.push(channel);
                }
            });
        }
    });
    return favorites;
}
exports.aggregateFavoriteChannels = aggregateFavoriteChannels;
/**
 * Creates a simplified playlist object which is used for global favorites
 * @param channels channels list
 * @returns simplified playlist object
 */
function createFavoritesPlaylist(channels) {
    return {
        _id: constants_1.GLOBAL_FAVORITES_PLAYLIST_ID,
        count: channels.length,
        playlist: {
            items: channels,
        },
        filename: 'Global favorites',
    };
}
exports.createFavoritesPlaylist = createFavoritesPlaylist;
/**
 * Returns last segment (part after last slash "/") of the given URL
 * @param value URL as string
 */
var getFilenameFromUrl = function (value) {
    if (value && value.length > 1) {
        return value.substring(value.lastIndexOf('/') + 1);
    }
    return 'Untitled playlist';
};
exports.getFilenameFromUrl = getFilenameFromUrl;
/**
 * Creates a playlist object
 * @param name name of the playlist
 * @param playlist playlist to save
 * @param urlOrPath absolute fs path or url of the playlist
 * @param uploadType upload type - by file or via an url
 */
var createPlaylistObject = function (name, playlist, urlOrPath, uploadType) {
    return __assign(__assign({ _id: (0, uuid_1.v4)(), filename: name, title: name, count: playlist.items.length, playlist: __assign(__assign({}, playlist), { items: playlist.items.map(function (item) { return (__assign({ id: (0, uuid_1.v4)() }, item)); }) }), importDate: new Date().toISOString(), lastUsage: new Date().toISOString(), favorites: [], autoRefresh: false }, (uploadType === 'URL' ? { url: urlOrPath } : {})), (uploadType === 'FILE' ? { filePath: urlOrPath } : {}));
};
exports.createPlaylistObject = createPlaylistObject;
//# sourceMappingURL=playlist.utils.js.map