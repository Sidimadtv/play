# IPTV Player

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/Sidimadtv/all/sidi/assets/images/logo.png" " title="Free IPTV player application" />
</p>

## Features

- M3u and M3u8 playlists support 📺
- Upload playlists from a file system 📂
- Add remote playlists via URL 🔗
- Playlists auto-update feature
- Open playlist from the file system
- Search for channels 🔍
- EPG support (TV Guide) with detailed info
- TV archive/catchup/timeshift
- Group-based channels list
- Save channels as favorites
- Global favorites aggregated from all playlists
- HTML video player with hls.js support or Video.js based player
- Internalization, currently 7 languages are supported (en, ru, de, ko, es, zh, fr)
- Set custom "User Agent" header for a playlist
- Re-fetch/auto-update playlists
- Light and Dark theme




## How to build

Requirements: node.js with npm.

1. Clone this repository and install all project dependencies with:
   ```
   $ npm install
   ```

2. To build the application on your local machine use one of the following commands:
   ```
   # linux
   $ npm run electron:build:linux
   ```

   ```
   #mac
   $ npm run electron:build:mac
   ```

   ```
   # windows
   $ npm run electron:build:windows
   ```

This command will produce the distributable assets in the `release` folder based on the configuration from electron-builder which is stored in `electron-builder.json` and `package.json`. Check the [API description of electron-builder](https://www.electron.build/) and adapt the configuration if you need some special configuration for you environment.

*Note: Don’t expect that you can build app for all platforms on one platform. [Read details](https://www.electron.build/multi-platform-build)*

## Development

The first thing to do is to install all the necessary dependencies:

  ```
  $ npm install
  ```

To develop an application in PWA and Electron mode, you need to run the application with a command:

  ```
  $ npm run start
  ```

The Electron version of the application will open in a separate window, and the PWA version will be available in the browser at http://localhost:4200.

If you want to run only the angular app without electron, in this case you can use the command:

  ```
  $ npm run ng:serve
  ```


