# SVG-VexFlow font converter

## Status

Alpha

## Prerequisites

A local installation of NodeJS and the Node Package Manager (npm). 

## Installation

If Grunt is not installed globally on your computer, run `npm install -g grunt`. Then, from the root directory of the converter, type:

```
$ npm install -g bower grunt-cli
$ npm install
$ bower install
```
 
## Instructions

Change conversion options in `converter.html`. Type `grunt run` to launch a server on localhost:8000 and navigate to `localhost:8000/src/converter.html` in your browser. The output will be rendered to the DOM and can be copied from there.

## Note

Depending on the size of the font file (preconfigured is the very large Bravura font), the conversion may temporarily freeze or even crash your browser. If you experience a browser crash, reduce the number of glyphs in `converter.html`. 

## Licence

Copyright © 2014, Alexander Erhard

Licensed under the Apache License, Version 2.0 (the "License"); you
may not use this file except in compliance with the License.  You may
obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied.  See the License for the specific language governing
permissions and limitations under the License.
