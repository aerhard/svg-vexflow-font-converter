var vm = require('vm');
var fs = require('fs');

var window = {};
this.window = {};

function include(path) {
  var code = fs.readFileSync(path, 'utf-8');
  vm.runInThisContext(code, path);
}

// include('../dependencies/excanvas_r3/excanvas.js');
include('../dependencies/jscanvas-1.0.5/jscanvas.js');
include('../dependencies/canvg-1.3/rgbcolor.js');
include('../dependencies/canvg-1.3/canvg.js');
include('./converter.js');

var DOMParser = require('xmldom').DOMParser;

var canvasDoc = new DOMParser().parseFromString(
'<canvas/>','text/xml');
// doc.documentElement.setAttribute('x','y');
// doc.documentElement.setAttributeNS('./lite','c:x','y2');
// var nsAttr = doc.documentElement.getAttributeNS('./lite','x')
// console.info(nsAttr)
// console.info(doc)

console.log( typeof jsContext2d);

console.log('hello');

Converter.prototype.loadFile = function(xmlDoc) {
  var result = fs.readFileSync(xmlDoc, 'utf-8');
  if (!result) {
    throw "Error loading xml document: '" + xmlDoc + "' cannot be loaded!"
  }
  return result;
};

Converter.prototype.createXMLDoc = function(str) {
  var xmlDoc, parser;
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(str, "text/xml");
  return xmlDoc;
};

Converter.prototype.runJsCanvas = function(svgXML, name) {
  var ycanvas = canvasDoc;
  xcanvas = new jsCanvas('jscanvastest');
  xcanvas.canvas.style.display = 'none';
  xcanvas.compile(svgXML, function() {
    eval(xcanvas.toString());
    var yctx = ycanvas.getContext('2d');
    var cantest = new jscanvastest(yctx);

  });
};

var config = {
  fontFile : '../dependencies/bravura-0.85/svg/Bravura.svg',
  glyphNamesFile : '../dependencies/smufl-metadata-0.85/glyphnames.json',
  // scale : 1.385,
  scale : 1,
  start : 0,
  end : 100,
  autoAdd : '.*'
};

var c = new Converter(config);
