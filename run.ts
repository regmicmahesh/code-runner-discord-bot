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

export const runCommand = async ({ command, args, options, stdin }: RunCommandInput): Promise<RunCommandOutput> => {
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

export const runPython = async (filepath: string): Promise<RunCommandOutput> => runCommand({
    command: "/usr/bin/env",
    args: ["python3", filepath]
})

export const runGo = async (filepath: string): Promise<RunCommandOutput> => runCommand({
    command: "/usr/bin/env",
    args: ["go", "run", filepath]
})

export const prepareSourceFile = (sourceCode: string, language: string): [string, () => void] => {

    const directory = tmpdir();
    let filename = randomBytes(16).toString('hex');

    if (language == "python") {
        filename += ".py";
    } else if (language == "go") {
        filename += ".go";
    } else {
        throw new Error("not implemented.")
    }

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
            break
        default:
            output = { output: "Language not supported.", exitCode: -1 }
    }

    cleanup();
    return output;


} 