const pdf = require('html-pdf');
const path = require('path');
const { marked } = require('marked');
const fs = require('fs-extra');
const exiftool = require('node-exiftool');
const exiftoolBinary = require('dist-exiftool');

const CONTENT_PLACEHOLDER = '[!!CONTENT_HERE!!]';
const SOURCE_DIRECTORY = 'src/';
const OUTPUT_DIRECTORY = 'dist/';
const HTML_OUTPUT_PATH = OUTPUT_DIRECTORY + 'index.html';

const PDF_OUTPUT_PATH = OUTPUT_DIRECTORY + 'mjwcv.pdf';
const PDF_OPTIONS = { 
    localUrlAccess: true,
    format: 'A4',
    orientation: 'portrait',
    border: {
        top: '1cm',
        right: '1cm',
        bottom: 0,
        left: '1cm'
        }
};
const PDF_METADATA = {
    Title: 'Curriculum Vitae - Mark Webb',
    Author: 'Mark Webb (mark@summerhousesoftware.co.uk)',
    Subject: 'An overview of Mark\'s skills, experience and education',
    Keywords: 'contract, cv, developer, resume, software, work'
}

async function clean() {
    console.log('cleaning output');
    await fs.rm(OUTPUT_DIRECTORY, {recursive:true, force:true});
    await fs.mkdir(OUTPUT_DIRECTORY);
}

async function generateHtml() {
    console.log('generating HTML from markdown');
    const markdownContent = await fs.readFile(SOURCE_DIRECTORY + 'index.content.md', {encoding:'utf8'});
    const htmlContent = marked(markdownContent);
    const htmlTemplate = await fs.readFile(SOURCE_DIRECTORY + 'index.template.html', {encoding:'utf8'});
    const htmlOutput = htmlTemplate.replace(CONTENT_PLACEHOLDER, htmlContent);
    await fs.writeFile(HTML_OUTPUT_PATH, htmlOutput);
    console.log('saved ' + HTML_OUTPUT_PATH);
    
    return htmlOutput;
}

async function copyAssets(){
    console.log('copying assets');
    await fs.copy(SOURCE_DIRECTORY + 'assets', OUTPUT_DIRECTORY + 'assets');
    await fs.copy(SOURCE_DIRECTORY + 'assets/icons/favicon/favicon.ico', OUTPUT_DIRECTORY + 'favicon.ico');
    console.log('copied ' + SOURCE_DIRECTORY + 'assets to ' + OUTPUT_DIRECTORY + 'assets');
}

async function generatePDF(html) {
    var htmlWithAbsolutePaths = html
        .replace(/href="\/assets\//g, 'href="file:///' + path.join(__dirname, OUTPUT_DIRECTORY, 'assets/'));

    if(process.platform === 'linux') {
        /* building the PDF version on linux requires locally installed fonts and different scaling */
        htmlWithAbsolutePaths = htmlWithAbsolutePaths
        //.replace('<link rel="stylesheet" href="/assets/fonts.css">', '')
        .replace('assets/print.css', 'assets/print-pdf.css');
    }

    const pdfResource = await new Promise((resolve, reject) => {
        pdf.create(htmlWithAbsolutePaths, PDF_OPTIONS)
           .toFile(PDF_OUTPUT_PATH, (err, res) => {
               if(err) {
                   reject(err);
                } else {
                    resolve(res);
                }
        })
    });

    console.log('saved PDF to ' + pdfResource.filename);

    await updateMetadata(pdfResource.filename, PDF_METADATA);
}

async function updateMetadata(filePath, metadata) {
    const exiftoolProcess = new exiftool.ExiftoolProcess(exiftoolBinary);
    await exiftoolProcess.open();
    try {
        await exiftoolProcess.writeMetadata(filePath, metadata, ['overwrite_original', 'codedcharacterset=utf8']);
        console.log(`updated metadata for ${filePath}`);
    } finally {
        await exiftoolProcess.close();
    }
}

async function build() {
    
    await clean();
    
    const htmlOutput = await generateHtml();

    await copyAssets();

    await generatePDF(htmlOutput)
}

(async () => {
    try{
        await build();
    } catch (ex) {
        console.error(ex);
    }
})();