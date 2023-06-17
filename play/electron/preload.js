var customTitlebar = require('custom-electron-titlebar');
var ipcRenderer = require('electron').ipcRenderer;
window.addEventListener('DOMContentLoaded', function () {
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#000'),
        onMinimize: function () { return ipcRenderer.send('window-minimize'); },
        onMaximize: function () { return ipcRenderer.send('window-maximize'); },
        onClose: function () { return ipcRenderer.send('window-close'); },
        isMaximized: function () { return ipcRenderer.sendSync('window-is-maximized'); },
        onMenuItemClick: function (commandId) {
            return ipcRenderer.send('menu-event', commandId);
        },
    });
});
//# sourceMappingURL=preload.js.map