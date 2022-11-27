#!/usr/bin/env node

const { NodeSSH } = require('node-ssh')
const JSZip = require('jszip');
const jetpack = require("fs-jetpack");
const fs= require('fs');
const path = require('path');
const zip = new JSZip()
const ssh = new NodeSSH()
const core = require('@actions/core');

const {
    WORKSPACE,
    HOST,
    PORT,
    USERNAME,
    PRIVATE_KEY,
    EXCLUDE,
    SCRIPTS,
    SOURCE,
    ZIPNAME,
    OUTDIR
}= require('./inputs');

const { addSsh } = require('./key')

const source = `${WORKSPACE}/${SOURCE || ''}`;

const createZip= (zipName, exclude)=>{
    return new Promise((resolve,reject)=>{
        jetpack.cwd(source).find({
            matching:exclude!=null ? exclude.split('\n').map(x=>"!"+x.trim()) : ["*"]
        }).map(x=>{
          zip.file(x,fs.readFileSync(path.join(source,x)))
        })

        zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
            .pipe(fs.createWriteStream(zipName))
            .on('finish', ()=>resolve());
    })
}

const putZip= (zipRootDir, zipName)=>{
    return new Promise((resolve,reject)=>{
        ssh.putFile(zipName, path.join(zipRootDir,zipName)).then(()=>resolve(), error=> reject(error))
    });
}

const execAsync= (command, params=[])=>{
    return new Promise((resolve,reject)=>{
        ssh.execCommand(command,params).then(x=>{
            if(x.stderr){
                reject(x.stderr)
            }else
                resolve(x.stdout);
        });
    });
}

const executeScripts= async (scripts)=>{
    const scs= scripts.split('\n').map(x=>x.trim());

    if((scs.length==0) || (scs.length==1 && scs[0]=="")) return Promise.resolve();

    const tasks= scs.map(x=>
        execAsync(x)
            .then(res=>{
                console.log(`=================================`)
                console.log(`Command "${x}" Executed Succesfully`);
                console.log(`Response:\n${res}`)
                console.log(`=================================`)
            })
            .catch(err=>{
                console.log(`=================================`)
                console.log(`Command "${x}" cant Executed Succesfully`);
                console.log(`Error:\n${err}`)
                console.log(`=================================`)
            })
    );

    await Promise.all(tasks);
}

const main = async()=>{
    addSsh("deploy_key",PRIVATE_KEY);
    console.log("✔️ Private key added on machine");

    await ssh.connect({
        host: HOST,
        username: USERNAME,
        privateKey: PRIVATE_KEY,
        port: PORT
    });
    await createZip(ZIPNAME, EXCLUDE);
    console.log(`✔️ Created zip as "${ZIPNAME}"`);

    const baseDir= OUTDIR||`/home/${USERNAME}`;

    await putZip(baseDir,ZIPNAME);

    console.log(`✔️ Transfered "${ZIPNAME}" to "${baseDir}/${ZIPNAME}" via "${HOST+'@'+USERNAME}"`);

    if(SCRIPTS){
      await executeScripts(SCRIPTS);
    }

    console.log("✔️ Transfer Done");
    ssh.dispose();
}

try {
    main();
} catch (error) {
    core.setFailed(error.message);
}
