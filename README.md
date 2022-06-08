# curriculum-vitae
This project is how I maintain my CV.

I edit the content in Markdown format, then use the build script to generate HTML and PDF copies of my resume.

The latest is hosted at https://webbwebbwebb.co.uk/
<img src="screenshot.png?raw=true" alt="screenshot of CV on webbwebbwebb.co.uk" width=800>

## Requirements
Node v12.3.0 or later (required by http-server)

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