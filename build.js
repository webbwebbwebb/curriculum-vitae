const pdf = require('html-pdf');
const path = require('path');
const marked = require('marked');
const fs = require('fs-extra');

const CONTENT_PLACEHOLDER = '[!!CONTENT_HERE!!]';
const SOURCE_DIRECTORY = 'src/';
const OUTPUT_DIRECTORY = 'dist/';
const OUTPUT_PATH = OUTPUT_DIRECTORY + 'index.html';

fs.readFile(SOURCE_DIRECTORY + 'index.content.md', 'utf8', (err, data) => {
    const content = marked(data);
    fs.readFile(SOURCE_DIRECTORY + 'index.template.html', 'utf8', (err, template) => {
        const outputHTML = template.replace(CONTENT_PLACEHOLDER, content);
        fs.ensureDir(OUTPUT_DIRECTORY, err => {
            if(err) {
                return console.error(err);
            }
            fs.writeFile(OUTPUT_PATH, outputHTML, (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('saved ' + OUTPUT_PATH);

                fs.copy(SOURCE_DIRECTORY + 'assets', OUTPUT_DIRECTORY + 'assets', err => {
                    if (err) {
                        return console.error(err);
                    } 
                  
                    console.log('copied ' + SOURCE_DIRECTORY + 'assets to ' + OUTPUT_DIRECTORY + 'assets');
                    
                    var htmlWithAbsolutePaths = outputHTML.replace(/href="\/assets\//g, 'href="file:///' + path.join(__dirname, OUTPUT_DIRECTORY, 'assets/'));
                    var pdfOptions = { 
                        format: 'A4',
                        orientation: 'portrait',
                        border: {
                            top: '1cm',
                            right: '1cm',
                            bottom: '1cm',
                            left: '1cm'
                          }
                    };

                    pdf.create(htmlWithAbsolutePaths, pdfOptions).toFile(OUTPUT_DIRECTORY + 'mjwcv.pdf', function(err, res) {
                        if (err) { 
                            return console.log(err);
                        }
                        console.log('saved PDF to ' + res.filename);
                    });
                });
            });
        });

    });
});