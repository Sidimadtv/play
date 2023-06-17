"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistUpdateState = void 0;
/**
 * An interface that describe the possible states of the playlist update/refresh process
 */
var PlaylistUpdateState;
(function (PlaylistUpdateState) {
    PlaylistUpdateState[PlaylistUpdateState["UPDATED"] = 0] = "UPDATED";
    PlaylistUpdateState[PlaylistUpdateState["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    PlaylistUpdateState[PlaylistUpdateState["NOT_UPDATED"] = 2] = "NOT_UPDATED";
})(PlaylistUpdateState = exports.PlaylistUpdateState || (exports.PlaylistUpdateState = {}));
//# sourceMappingURL=playlist.interface.js.map