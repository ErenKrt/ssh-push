const core = require('@actions/core');

const inputsNames= [
    "HOST",
    "PORT",
    "USERNAME",
    "PRIVATE_KEY",
    "SOURCE",
    "EXCLUDE",
    "ZIPNAME",
    "OUTDIR",
    "SCRIPTS",
];

const inputs= {
    WORKSPACE: process.env.GITHUB_WORKSPACE
}

inputsNames.map(x=>{
    inputs[x]= core.getInput(x) || null;
})

module.exports=inputs;