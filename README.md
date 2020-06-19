# curriculum-vitae
This project is how I maintain my CV.

I edit the content in Markdown format, then use the build script to generate HTML and PDF copies of my resume.

The latest is hosted at https://webbwebbwebb.co.uk/
![screenshot of CV on webbwebbwebb.co.uk](screenshot.png?raw=true)

## Requirements
Node v10.16.0 or later

## Build
```
npm install
npm run build
```

## Serve
(Assuming a successful build)
```
npm run serve
```
then browse to http://localhost:8081

## Dev
The dev command will serve the site while watching for changes in the src directory
```
npm run dev
```