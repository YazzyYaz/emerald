const request = require('request');
const tar = require('tar');
const path = require('path');
const fs = require('fs');
const dmg = require('dmg');
const shell = require('shelljs');
const os = require('os');
const ora = require('ora');
const extract = tar.x({
  cwd: path.resolve(__dirname, '../')
});

const spinner = ora('emerald-wallet: Downloading and Unpacking');
spinner.start();

const platform = os.platform();
const rootPath = path.resolve(__dirname, '../');

switch (platform) {
  case 'darwin':
    const osxFile = fs.createWriteStream(path.resolve(rootPath, 'EmeraldWallet.dmg'));
    return request('http://builds.etcdevteam.com/emerald-wallet/v1.0.x/EmeraldWallet-mac-v1.0.0+78-cfb48df.dmg')
      .pipe(osxFile)
      .on('finish', () => {
        const processCwd = process.cwd();
        const emeraldDmg = `${processCwd}/EmeraldWallet.dmg`;
        dmg.mount(emeraldDmg, (err, path) => {
          shell.cp('-R', `${path}/EmeraldWallet.app`, `${processCwd}/EmeraldWallet.app`)
          dmg.unmount(path, (err) => {
            if (err) {
              return spinner.fail(`An error occurred: ${JSON.stringify(err)}`);
            }
            spinner.succeed('emerald-wallet: finished installation');
          });
        });
      });
  case 'linux':
    const linuxFile = fs.createWriteStream(path.resolve(rootPath, 'EmeraldWallet.AppImage'));
    return request('http://builds.etcdevteam.com/emerald-wallet/v1.0.x/EmeraldWallet-linux-x86_64-v1.0.0+55-e427cf9.AppImage')
      .pipe(linuxFile)
      .on('finish', () => {
        shell.exec(`chmod u+x ${path.resolve(rootPath, 'EmeraldWallet.AppImage')}`);
        spinner.succeed('emerald-wallet: finished installation');
      });
  case 'win32':
    const windowsFile = fs.createWriteStream(path.resolve(rootPath, 'EmeraldWallet.exe'));
      return request('http://builds.etcdevteam.com/emerald-wallet/v1.0.x/EmeraldWallet-win-v1.0.0+55-e427cf9.exe').pipe(windowsFile).on('finish', () => {
      spinner.succeed('emerald-wallet: finished installation');
    });
}
