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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron = require('electron');
var ipcRenderer = electron.ipcRenderer;
var zlib = require('zlib');
var parser = require('epg-parser');
var axios = require('axios');
var ipc_commands_1 = require("../shared/ipc-commands");
// EPG data store
var EPG_DATA = {
    channels: [],
    programs: [],
};
var EPG_DATA_MERGED = {};
var loggerLabel = '[EPG Worker]';
/** List with fetched EPG URLs */
var fetchedUrls = [];
/**
 * Fetches the epg data from the given url
 * @param epgUrl url of the epg file
 */
var fetchEpgDataFromUrl = function (epgUrl) {
    try {
        var axiosConfig = {};
        if (epgUrl.endsWith('.gz')) {
            axiosConfig = {
                responseType: 'arraybuffer',
            };
        }
        axios
            .get(epgUrl.trim(), axiosConfig)
            .then(function (response) {
            console.log(loggerLabel, 'url content was fetched...');
            var data = response.data;
            if (epgUrl.endsWith('.gz')) {
                console.log(loggerLabel, 'start unzipping...');
                zlib.gunzip(data, function (_err, output) {
                    parseAndSetEpg(output);
                });
            }
            else {
                parseAndSetEpg(data);
            }
        })
            .catch(function (err) {
            console.log(loggerLabel, err);
            ipcRenderer.send(ipc_commands_1.EPG_ERROR);
        });
    }
    catch (error) {
        console.log(loggerLabel, error);
        ipcRenderer.send(ipc_commands_1.EPG_ERROR);
    }
};
/**
 * Parses and sets the epg data
 * @param xmlString xml file content from the fetched url as string
 */
var parseAndSetEpg = function (xmlString) {
    console.log(loggerLabel, 'start parsing...');
    var parsedEpg = parser.parse(xmlString.toString());
    EPG_DATA = {
        channels: __spreadArray(__spreadArray([], EPG_DATA.channels, true), parsedEpg.channels, true),
        programs: __spreadArray(__spreadArray([], EPG_DATA.programs, true), parsedEpg.programs, true),
    };
    // map programs to channels
    EPG_DATA_MERGED = convertEpgData();
    ipcRenderer.send(ipc_commands_1.EPG_FETCH_DONE);
    console.log(loggerLabel, 'done, parsing was finished...');
};
var convertEpgData = function () {
    var _a;
    var result = {};
    (_a = EPG_DATA === null || EPG_DATA === void 0 ? void 0 : EPG_DATA.programs) === null || _a === void 0 ? void 0 : _a.forEach(function (program) {
        var _a;
        if (!result[program.channel]) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            var channel = (_a = EPG_DATA === null || EPG_DATA === void 0 ? void 0 : EPG_DATA.channels) === null || _a === void 0 ? void 0 : _a.find(function (channel) { return channel.id === program.channel; });
            result[program.channel] = __assign(__assign({}, channel), { programs: [program] });
        }
        else {
            result[program.channel] = __assign(__assign({}, result[program.channel]), { programs: __spreadArray(__spreadArray([], result[program.channel].programs, true), [program], false) });
        }
    });
    return result;
};
// fetches epg data from the provided URL
ipcRenderer.on(ipc_commands_1.EPG_FETCH, function (event, epgUrl) {
    console.log(loggerLabel, 'epg fetch command was triggered');
    if (fetchedUrls.indexOf(epgUrl) > -1) {
        ipcRenderer.send(ipc_commands_1.EPG_FETCH_DONE);
        return;
    }
    fetchedUrls.push(epgUrl);
    fetchEpgDataFromUrl(epgUrl);
});
// returns the epg data for the provided channel name and date
ipcRenderer.on(ipc_commands_1.EPG_GET_PROGRAM, function (event, args) {
    var _a, _b, _c, _d, _e;
    var channelName = (_a = args.channel) === null || _a === void 0 ? void 0 : _a.name;
    var tvgId = (_c = (_b = args.channel) === null || _b === void 0 ? void 0 : _b.tvg) === null || _c === void 0 ? void 0 : _c.id;
    if (!EPG_DATA || !EPG_DATA.channels)
        return;
    var foundChannel = (_d = EPG_DATA === null || EPG_DATA === void 0 ? void 0 : EPG_DATA.channels) === null || _d === void 0 ? void 0 : _d.find(function (epgChannel) {
        if (tvgId && tvgId === epgChannel.id) {
            return epgChannel;
        }
        else if (epgChannel.name.find(function (nameObj) {
            if (nameObj.value &&
                nameObj.value.trim() === channelName.trim())
                return nameObj;
        })) {
            return epgChannel;
        }
    });
    if (foundChannel) {
        var programs = (_e = EPG_DATA === null || EPG_DATA === void 0 ? void 0 : EPG_DATA.programs) === null || _e === void 0 ? void 0 : _e.filter(function (ch) { return ch.channel === foundChannel.id; });
        ipcRenderer.send(ipc_commands_1.EPG_GET_PROGRAM_DONE, {
            payload: { channel: foundChannel, items: programs },
        });
    }
    else {
        console.log('EPG program for the channel was not found...');
        ipcRenderer.send(ipc_commands_1.EPG_GET_PROGRAM_DONE, {
            payload: { channel: {}, items: [] },
        });
    }
});
ipcRenderer.on(ipc_commands_1.EPG_GET_CHANNELS, function () {
    ipcRenderer.send(ipc_commands_1.EPG_GET_CHANNELS_DONE, {
        payload: EPG_DATA,
    });
});
ipcRenderer.on(ipc_commands_1.EPG_GET_CHANNELS_BY_RANGE, function (event, args) {
    ipcRenderer.send(ipc_commands_1.EPG_GET_CHANNELS_BY_RANGE_RESPONSE, {
        payload: Object.entries(EPG_DATA_MERGED)
            .slice(args.skip, args.limit)
            .map(function (entry) { return entry[1]; }),
    });
});
ipcRenderer.on(ipc_commands_1.EPG_FORCE_FETCH, function (event, url) {
    fetchEpgDataFromUrl(url);
});
//# sourceMappingURL=epg-worker.js.map