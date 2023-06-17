"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppMenu = void 0;
var electron_1 = require("electron");
var ipc_commands_1 = require("../shared/ipc-commands");
var openAboutWindow = require('about-window').default;
var AppMenu = /** @class */ (function () {
    function AppMenu(appWindow) {
        /** Application menu */
        this.menu = new electron_1.Menu();
        this.window = appWindow;
        this.initMenu();
    }
    /**
     * Creates context menu
     * @param win browser window object
     */
    AppMenu.prototype.initMenu = function () {
        this.menu.append(this.getFileMenu());
        // copy-paste shortcuts workaround for mac os
        if (process.platform === 'darwin') {
            this.menu.append(this.getEditMenu());
        }
        this.menu.append(this.getHelpMenu());
    };
    /**
     * Return the application menu
     */
    AppMenu.prototype.getMenu = function () {
        return this.menu;
    };
    /**
     * Creates and returns the file menu
     * @param win application window
     */
    AppMenu.prototype.getFileMenu = function () {
        var _this = this;
        return new electron_1.MenuItem({
            label: 'OptionS',
            submenu: [
                {
                    label: 'Add a New Playlist',
                    click: function () {
                        if (!_this.window.isDestroyed())
                            _this.window.webContents.send(ipc_commands_1.VIEW_ADD_PLAYLIST);
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Settings',
                    click: function () {
                        if (!_this.window.isDestroyed())
                            _this.window.webContents.send(ipc_commands_1.VIEW_SETTINGS);
                    },
                },
                {
                    type: 'separator',
                },
                {
                    label: 'EXIT',
                    click: function () { return electron_1.app.quit(); },
                    accelerator: '',
                },
            ],
        });
    };
    /**
     * Creates and returns the edit menu
     * @param win application window
     */
    AppMenu.prototype.getHelpMenu = function () {
        return new electron_1.MenuItem({
            label: '',
            submenu: [
                {
                    label: '',
                },
            ],
        });
    };
    /**
     * Creates and returns the help menu
     * @param win application window
     */
    AppMenu.prototype.getEditMenu = function () {
        return new electron_1.MenuItem({
            label: 'Edit',
            submenu: [
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'delete' },
            ],
        });
    };
    return AppMenu;
}());
exports.AppMenu = AppMenu;
//# sourceMappingURL=menu.js.map