const path= require('path');
const fs= require('fs');

const addSsh= (name, privateKey)=>{
    const dir= path.join(process.env.HOME || __dirname, '.ssh');
    const filePath= path.join(dir,name);

    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    if(!fs.existsSync(`${dir}/known_hosts`)){
        fs.writeFileSync(`${dir}/known_hosts`,'', {
            encoding: 'utf-8',
            mode: 0o600
        })
    }

    fs.writeFileSync(filePath,privateKey,{
        encoding: 'utf-8',
        mode: 0o600
    });
}

module.exports= { addSsh };