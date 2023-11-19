import path from 'path';
import * as main from '../src'
import * as core from '@actions/core'

describe("upload tests",()=>{

    const getInputSpy= jest.spyOn(core, 'getInput');
    const getMultilineInputSpy = jest.spyOn(core, 'getMultilineInput');
    const setFailedSpy = jest.spyOn(core, 'setFailed');
    const infoSpy = jest.spyOn(core, 'info');
    const setOutputSpy = jest.spyOn(core, 'setOutput');

    const inputs = { } as any;

    describe("run() tests", ()=>{
        beforeEach(()=>{
            getMultilineInputSpy.mockImplementation(input => inputs[input as string]);
            getInputSpy.mockImplementation(input => inputs[input as string]);
            infoSpy.mockImplementation(console.log);
        });

        afterEach(()=>{
            jest.clearAllMocks();
            jest.resetAllMocks();
        })

        test("upHost", async()=>{
            inputs.host="0.0.0.0";
            inputs.username= "eren";
            inputs.password= "";
            inputs.source = path.join(__dirname,"../testFiles/");
            inputs.destination= "/home/eren/ssh-test/eren.zip";
            inputs.scripts= [`sudo -s`, `mv ${inputs.destination} /home/eren/ssh-test/a.zip`,`cd /home/eren/ssh-test/ && chmod +x *`];
            await main.run();
            expect(true).toBe(true);
        },500000)

    })

})