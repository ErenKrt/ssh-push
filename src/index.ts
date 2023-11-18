import * as core from '@actions/core';
import JSZip from 'jszip';
import { NodeSSH, type Config } from 'node-ssh';
import path from 'path';
import fs from 'fs';
import jetpack from 'fs-jetpack';
import os from 'os';

const ssh = new NodeSSH();

async function connectSSH(options: Config) {
  core.info(`Connecting SSH...`);
  try {
    await ssh.connect(options);
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}

function createZip(SOURCE: string, files: string[]) {
  core.info(`Creating archive...`);
  const archive = new JSZip();
  files.forEach(file => {
    archive.file(file, fs.readFileSync(path.join(SOURCE, file)));
  });
  return archive;
}

async function uploadArchive(archive: JSZip, destination: string) {
  core.info(`Archive uploading...`);
  const bytes = await archive.generateAsync({ type: 'nodebuffer' });
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ssh-push'));
  const zipName = path.join(tempDir, 'test.zip');
  await fs.promises.writeFile(zipName, bytes);
  await ssh.putFile(zipName, destination, null, {
    step: (uploaded: number, nb: number, fsize: number) => {
      const percentage = ((uploaded / fsize) * 100).toFixed(0);
      core.info(`Uploading archive %${percentage}`);
    },
  });
  core.info(`Archive uploaded...`);
}

async function executeScripts(scripts: string[]) {
  for (const cmd of scripts) {
    core.info(`Executing ${cmd}`);
    await ssh.execCommand(cmd.trim());
  }
}

export async function run() {
  const sshOptions: Config = {
    host: core.getInput('Host'),
    username: core.getInput('Username'),
    password: core.getInput('Password'),
  };

  await connectSSH(sshOptions);

  const SOURCE = core.getInput('Source');
  const DESTINATION = core.getInput('Destination');

  if (!fs.existsSync(SOURCE)) {
    ssh.dispose();
    core.setFailed(`No source as ${SOURCE}`);
    return;
  }

  const files = await jetpack.cwd(SOURCE).findAsync({
    files: true,
  });

  const archive = createZip(SOURCE, files);
  await uploadArchive(archive, DESTINATION);

  const SCRIPTS: string[] = core.getMultilineInput('Scripts');
  if (SCRIPTS.length > 0) {
    await executeScripts(SCRIPTS);
  }

  ssh.dispose();
  core.setOutput('Done', 'yes');
}
