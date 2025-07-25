const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const inputData = {
    data: [{
        content: `The Vocational Training Council (VTC) and the Hong Kong Police Force signed a Memorandum of Understanding (MoU) to jointly promote talent training and foster the development of vocational and professional education and training (VPET). Under this MoU, both parties will collaborate on training programme development, student internship opportunities, as well as on-the-job training for the Police Force. The MoU signing ceremony took place last Friday (28 February) at the Chai Wan campus of the Hong Kong Institute of Vocational Education (IVE), a member institution of VTC.`
    }]
};

function getPythonPath() {
    const platform = os.platform();
    if (platform === 'win32') {
        return path.join(os.homedir(), '.pyenv', 'pyenv-win', 'versions', '3.12.2', 'python.exe');
    } else {
        return 'python3';
    }
}

function runSummarizer(content) {
    return new Promise((resolve, reject) => {
        console.log('Starting summarization with content:', content);

        const inputData = {
            data: [{ content }]
        };

        const pythonPath = getPythonPath();
        console.log('Using Python path:', pythonPath);

        const scriptPath = path.join(__dirname, 'summary', 'summary.py');
        console.log('Script path:', scriptPath);

        const pythonProcess = spawn(pythonPath, [scriptPath]);

        let output = '';
        let error = '';

        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err);
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });

        pythonProcess.stdin.on('error', (err) => {
            console.error('Error writing to stdin:', err);
            reject(new Error(`Error writing to stdin: ${err.message}`));
        });

        pythonProcess.stdout.on('data', (data) => {
            console.log('Received data from Python:', data.toString());
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);

            if (code === 0) {
                try {
                    const trimmedOutput = output.trim();
                    console.log('Final output:', trimmedOutput);

                    if (!trimmedOutput) {
                        reject(new Error('No output received from Python script'));
                        return;
                    }

                    const summary = trimmedOutput
                        .split('\n')
                        .filter(line => !line.includes('Using device:'))
                        .join('')
                        .trim();

                    resolve(summary);
                } catch (err) {
                    console.error('Error processing Python output:', err);
                    reject(new Error(`Error processing Python output: ${err.message}`));
                }
            } else {
                reject(new Error(`Python process failed with code ${code}: ${error || 'Unknown error'}`));
            }
        });

        try {
            console.log('Sending input data:', JSON.stringify(inputData));
            pythonProcess.stdin.write(JSON.stringify(inputData));
            pythonProcess.stdin.end();
        } catch (err) {
            console.error('Error sending input data:', err);
            reject(new Error(`Error sending input data: ${err.message}`));
        }
    });
}

// 使用實際的測試數據
async function test() {
    try {
        const result = await runSummarizer(inputData.data[0].content);
        console.log('Test result:', result);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

if (require.main === module) {
    test();
}

module.exports = { runSummarizer };