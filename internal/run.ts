import { spawn, type SpawnOptionsWithoutStdio } from "child_process";
import { randomBytes } from "crypto";
import { unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";

type RunCommandOutput = {
    exitCode: number;
    output: string;
}

type RunCommandInput = {
    command: string;
    args?: string[];
    options?: SpawnOptionsWithoutStdio;
    stdin?: string;
}

const runOsCommand = async ({ command, args, options, stdin }: RunCommandInput): Promise<RunCommandOutput> => {
    if (!options) {
        options = {};
    }
    options.env = { ...process.env, "TOKEN": "redacted", "CLIENT_ID": "redacted" }
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, options);
        let output = '';
        if (stdin && child.stdin.writable) {
            child.stdin.write(stdin);
        }
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        child.stderr.on('data', (data) => {
            output += data.toString();
        });

        child.on('close', (code) => {
            resolve({ output, exitCode: 0 });
        });

        child.on('error', (err) => {
            resolve({ output, exitCode: 1 });
        });
    });
}

const runPython = async (filepath: string): Promise<RunCommandOutput> => runOsCommand({
    command: "/usr/bin/env",
    args: ["python3", filepath]
})

const runGo = async (filepath: string): Promise<RunCommandOutput> => runOsCommand({
    command: "/usr/bin/env",
    args: ["go", "run", filepath]
})

const prepareSourceFile = (sourceCode: string, language: string): [string, () => void] => {

    const directory = tmpdir();
    let filename = randomBytes(16).toString('hex');

    if (language == "python") {
        filename += ".py";
    } else if (language == "go") {
        filename += ".go";
    } else {
        throw new Error("not implemented.")
    }

    console.log(sourceCode);

    const filePath = path.join(directory, filename);
    writeFileSync(filePath, sourceCode);

    return [filePath, () => {
        unlinkSync(filePath)
    }]

}


export const runCode = async (fileSource: string, language: string): Promise<RunCommandOutput> => {


    const [tempFilePath, cleanup] = prepareSourceFile(fileSource, language);

    let output: RunCommandOutput | undefined;

    switch (language) {
        case "python":
            output = await runPython(tempFilePath)
            break
        case "go":
            output = await runGo(tempFilePath)
            console.log(output)
            break
        default:
            output = { output: "Language not supported.", exitCode: -1 }
    }

    cleanup();
    return output;


} 