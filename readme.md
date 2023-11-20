# ✨ SSH for GitHub Actions

[GitHub Action](https://github.com/features/actions) for publish your app via SSH and execute commands.

[![Actions Status](https://github.com/erenkrt/ssh-push/actions/workflows/main.yml/badge.svg)](https://github.com/erenkrt/ssh-push/actions)

## Variables

See [action.yml](./action.yml) for more detailed information.

* `HOST` - SSH remote host
* `PORT` - SSH protocol port, default is `22`
* `USERNAME` - SSH username
* `PASSWORD` - Password of ssh user
* `SOURCE` - Folder to be transferred
* `DESTINATION` - Destination of source file as archive on remote host
* `SCRIPTS` - Execute commands after transfer source file

## Usage

```yaml
on: [push]

jobs:
  deployment_job:
    runs-on: ubuntu-latest
    name: Deployment Job
    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16

    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present

    - name: SSH
        uses: ErenKrt/ssh-push@main
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          password: ${{ secrets.PASSWORD }}
          source: "./dist"
          destination: "/home/eren/web.zip"
          #scripts: |
          #  rm -r /home/eren/erencandev && mkdir /home/eren/erencandev
          #  cd /home/eren/erencandev && mv /home/eren/web.zip . &&
          #  unzip web.zip && rm -r web.zip
          #  rm -r /home/eren/erencandev/node_modules
          #  sudo -s && cd /home/eren/erencandev/ && npm i
          #  pm2 restart 1
```