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

async function createFontsStylesheet(template) {
    const fontDirectory = SOURCE_DIRECTORY + 'assets/fonts/vollkorn/'
    const regular = await fs.readFile(fontDirectory + 'Vollkorn-Regular.ttf');
    stylesheet = template.replace('[!!VOLLKHORN_REGULAR_DATA!!]', regular.toString('base64'));

    const bold = await fs.readFile(fontDirectory + 'Vollkorn-Bold.ttf');
    stylesheet = stylesheet.replace('[!!VOLLKHORN_BOLD_DATA!!]', bold.toString('base64'));

    const italic = await fs.readFile(fontDirectory + 'Vollkorn-Italic.ttf');
    stylesheet = stylesheet.replace('[!!VOLLKHORN_ITALIC_DATA!!]', italic.toString('base64'));

    const boldItalic = await fs.readFile(fontDirectory + 'Vollkorn-BoldItalic.ttf');
    stylesheet = stylesheet.replace('[!!VOLLKHORN_BOLD_ITALIC_DATA!!]', boldItalic.toString('base64'));

    await fs.writeFile(OUTPUT_DIRECTORY + 'assets/fonts.css', stylesheet)
}

function createPDF(html) {
    var htmlWithAbsolutePaths = html;

    htmlWithAbsolutePaths = htmlWithAbsolutePaths
        //.replace('assets/print.css', 'assets/print-pdf.css')
        .replace(/href="\/assets\//g, ('href="file:///' + path.join(__dirname, OUTPUT_DIRECTORY, 'assets/')).replace(/\\/g, '/'));

    console.log(htmlWithAbsolutePaths);

    pdf.create(htmlWithAbsolutePaths, PDF_OPTIONS).toFile(PDF_OUTPUT_PATH, function(err, res) {
        if (err) return console.error(err);

        console.log('saved PDF to ' + res.filename);

        updateMetadata(res.filename, PDF_METADATA);
    });
}

function updateMetadata(filePath, metadata) {
    const exiftoolProcess = new exiftool.ExiftoolProcess(exiftoolBinary);
    exiftoolProcess
        .open()
        .then(() => exiftoolProcess.writeMetadata(filePath, metadata, ['overwrite_original', 'codedcharacterset=utf8']))
        .then(() => console.log(`updated metadata for ${filePath}`))
        .then(() => exiftoolProcess.close())
        .catch(console.error);
}

fs.readFile(SOURCE_DIRECTORY + 'index.content.md', 'utf8', (err, data) => {
    const content = marked(data);
    fs.readFile(SOURCE_DIRECTORY + 'index.template.html', 'utf8', (err, template) => {
        const outputHTML = template.replace(CONTENT_PLACEHOLDER, content);

        fs.remove(OUTPUT_DIRECTORY, err => {
            if (err) return console.error(err);

            fs.ensureDir(OUTPUT_DIRECTORY, err => {
                if (err) return console.error(err);

                fs.writeFile(HTML_OUTPUT_PATH, outputHTML, (err) => {
                    if (err) return console.error(err);

                    console.log('saved ' + HTML_OUTPUT_PATH);
    
                    fs.copy(SOURCE_DIRECTORY + 'assets', OUTPUT_DIRECTORY + 'assets', err => {
                        if (err) return console.error(err);

                        fs.copy(SOURCE_DIRECTORY + 'assets/icons/favicon/favicon.ico', OUTPUT_DIRECTORY + 'favicon.ico', err => {
                            if (err) return console.error(err);

                            console.log('copied ' + SOURCE_DIRECTORY + 'assets to ' + OUTPUT_DIRECTORY + 'assets');

                            fs.readFile(SOURCE_DIRECTORY + 'fonts.template.css', 'utf8', (err, fontTemplate) => { 
                                createFontsStylesheet(fontTemplate).then(() => {
                                    createPDF(outputHTML);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});