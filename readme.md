# ✨ SSH for GitHub Actions

[GitHub Action](https://github.com/features/actions) for publish your app via SSH and execute commands.

[![Actions Status](https://github.com/erenkrt/ssh-push/actions/workflows/main.yml/badge.svg)](https://github.com/erenkrt/ssh-push/actions)

## Variables

See [action.yml](./action.yml) for more detailed information.

* `HOST` - ssh remote host
* `PORT` - ssh protocol port, default is `22`
* `USERNAME` - ssh username
* `PRIVATE_KEY` - private ssh key
* `SOURCE` - folder to be transferred
* `EXCLUDE` - exlude paths or file in source folder with glob features
* `ZIPNAME` - Using zip for stability at transfer, file name of zip, default is `build.zip`
* `OUTDIR` - remote host path to copy zip, default is `/home/YourName/`
* `SCRIPTS` - execute commands after transfer source file

## Usage

Executing remote ssh commands.

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
        private_key: ${{ secrets.PRIVATE_KEY }}
        source: "dist/"
        #exclude: |
        #  *.exe
        #scripts: |
        #  cd /home/eren/test && unzip myZipname.zip && rm -r *.zip
        #  cat /home/eren/test/index.js
        #zipname: "myZipname.zip"
        #outdir: "/home/eren/test"
```

### Setting up a SSH Key

```bash
cd ~/.ssh/

ssh-keygen -t rsa -b 4096

> Enter file in which to save the key (/home/username/.ssh/id_rsa): github_actions
> Enter passphrase (empty for no passphrase):
> Enter same passphrase again:

cat github_actions
```

<h4>Set <b>github_actions</b> content to <b>PRIVATE_KEY</b> secret.</h4>

<hr/>

### Examples

#### Multiple Exclude with glob and normals

```yaml
    uses: ErenKrt/ssh-push@main
    with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        private_key: ${{ secrets.PRIVATE_KEY }}
        source: "dist/"
        exclude: |
          *.exe
          test.txt
```

#### Multiple scripts with glob and normals

```yaml
    uses: ErenKrt/ssh-push@main
    with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        private_key: ${{ secrets.PRIVATE_KEY }}
        source: "dist/"
        scripts: |
          whoami
          ls
```