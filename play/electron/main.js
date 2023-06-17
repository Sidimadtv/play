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
/* eslint-disable no-useless-catch */
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var api_1 = require("./api");
var menu_1 = require("./menu");
var autoUpdater = require('electron-updater').autoUpdater;
var _a = require('custom-electron-titlebar/main'), setupTitlebar = _a.setupTitlebar, attachTitlebarToWindow = _a.attachTitlebarToWindow;
var contextMenu = require('electron-context-menu');
var Store = require('electron-store');
var store = new Store();
var WINDOW_BOUNDS = 'WINDOW_BOUNDS';
setupTitlebar();
var win = null;
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
var api = new api_1.Api();
contextMenu();
require('@electron/remote/main').initialize();
function createWindow() {
    // Create the browser window.
    win = new electron_1.BrowserWindow(__assign({ width: 1000, height: 800, webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            allowRunningInsecureContent: serve ? true : false,
            contextIsolation: false,
            webSecurity: false,
        }, resizable: true, darkTheme: true, icon: path.join(__dirname, '../dist/assets/icons/icon.png'), titleBarStyle: 'hidden', frame: false, minWidth: 400, minHeight: 500, title: 'S!d!m@D-IPTV' }, store.get(WINDOW_BOUNDS)));
    attachTitlebarToWindow(win);
    require('@electron/remote/main').enable(win.webContents);
    win.webContents.on('will-navigate', function (event, url) {
        if (!url.startsWith('file://')) {
            event.preventDefault();
            electron_1.shell.openExternal(url);
        }
    });
    if (serve) {
        win.webContents.openDevTools();
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, '../dist/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
    }
    win.on('close', function () {
        store.set(WINDOW_BOUNDS, win === null || win === void 0 ? void 0 : win.getNormalBounds());
    });
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    return win;
}
/**
 * Creates hidden window for EPG worker
 * Hidden window is used as an additional thread to avoid blocking of the UI by long operations
 */
function createEpgWorkerWindow() {
    var window = new electron_1.BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    window.loadFile('./electron/epg-worker.html');
    if (serve) {
        window.webContents.openDevTools();
    }
    window.once('ready-to-show', function () {
        api.setEpgWorkerWindow(window);
    });
    return window;
}
try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    // Added 400 ms to fix the black background issue while using transparent window. More details at https://github.com/electron/electron/issues/15947
    electron_1.app.on('ready', function () {
        // create main window and set menu
        var win = createWindow();
        var menu = new menu_1.AppMenu(win);
        electron_1.Menu.setApplicationMenu(menu.getMenu());
        api.setMainWindow(win);
        // create hidden window for epg worker
        createEpgWorkerWindow();
        autoUpdater.on('update-available', function () {
        });
        autoUpdater.on('update-not-available', function () {
            win.webContents.executeJavaScript("Swal.fire({\n        title: 'Atualiza\u00E7\u00F5es',\n        html: 'N\u00E3o h\u00E1 atualiza\u00E7\u00F5es dispon\u00EDveis.',\n        icon: 'error'\n    });");
        });
        autoUpdater.on('update-downloaded', function () {
        });
        autoUpdater.on('download-progress', function (progressObj) {
            win.webContents.executeJavaScript("Swal.fire({\n        title: 'Baixando atualiza\u00E7\u00E3o',\n        html: 'Speed: ".concat(progressObj.bytesPerSecond, " - ").concat(~~progressObj.percent, "% [").concat(progressObj.transferred, "/").concat(progressObj.total, "',\n        allowOutsideClick: false,\n        onBeforeOpen: () => {\n            Swal.showLoading();\n        }\n    });"));
        });
        autoUpdater.on('update-downloaded', function () {
            win.webContents.executeJavaScript("Swal.fire({\n        title: 'Reiniciando o aplicativo',\n        html: 'Aguente firme, reiniciando o aplicativo para atualiza\u00E7\u00E3o!',\n        allowOutsideClick: false,\n        onBeforeOpen: () => {\n            Swal.showLoading();\n        }\n    });");
            autoUpdater.quitAndInstall();
        });
    });
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            win = createWindow();
            var menu = new menu_1.AppMenu(win);
            electron_1.Menu.setApplicationMenu(menu.getMenu());
            api.setMainWindow(win);
        }
    });
    electron_1.app.on('before-quit', function () {
        store.set(WINDOW_BOUNDS, win === null || win === void 0 ? void 0 : win.getNormalBounds());
    });
}
catch (e) {
    // Catch Error
    throw e;
}
//# sourceMappingURL=main.js.map