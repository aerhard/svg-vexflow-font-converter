var Converter = function(cfg) {
  this.cfg = cfg;
  this.prepareJsCanvas();
  this.convert();

  this.tempOut = null;
  this.tempMaxX = null;
  this.tempMinX = null;
};

Converter.prototype = {

  loadFile : function(xmlDoc) {
    if (window.XMLHttpRequest) {
      xmlhttp = new XMLHttpRequest();
    } else {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", xmlDoc, false);
    xmlhttp.send();
    var result = xmlhttp.responseText;
    if (!result)
      throw "Error loading xml document: '" + xmlDoc + "' cannot be loaded!"
    return result;
  },

  createXMLDoc : function(str) {
    var xmlDoc, parser;
    if (window.DOMParser) {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(str, "text/xml");
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(str);
    }
    return xmlDoc;
  },

  scale : function(val) {
    return Math.round(val * this.cfg.scale);
  },

  convert : function() {
    var me = this;
    var vexFont = {};
    var vexGlyphs = {};
    var pre = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="full" width="700px" height="800px" viewBox="-400 -400 1200 1800">';
    var post = '</svg>';
    var svg = this.createXMLDoc(this.loadFile(this.cfg.fontFile));
    var g, fileGlyphNamesOriginal, fileGlyphNames = {};
    if (this.cfg.glyphNamesFile) {
      fileGlyphNamesOriginal = JSON.parse(this.loadFile(this.cfg.glyphNamesFile));
      for (g in fileGlyphNamesOriginal) {
        if (fileGlyphNamesOriginal[g].codepoint) {
          fileGlyphNames[fileGlyphNamesOriginal[g].codepoint.replace(/U\+/, 'uni')] = g;
        }
      }
    }
    window.g = fileGlyphNames;
    var fontFaceEl = svg.getElementsByTagName('font-face')[0];
    var all = svg.getElementsByTagName('glyph');
    if (!this.cfg.glyphNames) {
      this.cfg.glyphNames = {};
    }
    // if no regex is specified, set one that never matches
    if (this.cfg.autoAdd === undefined || this.cfg.autoAdd === null || this.cfg.autoAdd === '') {
      this.cfg.autoAdd = '^\b$';
    }
    var regex = new RegExp(this.cfg.autoAdd);
    var count = 0;
    var ii = this.cfg.start || 0;
    var len = (this.cfg.end) ? Math.min(this.cfg.end, all.length) : all.length;
    for (ii; ii < len; ii += 1) {
      this.tempOut = '';
      this.tempMaxX = 0;
      this.tempMinX = 0;
      var ele = all[ii];
      var d = ele.getAttribute('d');
      var glyphName = ele.getAttribute('glyph-name').replace(/_.*/, '');
      if (regex.test(glyphName) || this.cfg.glyphNames.hasOwnProperty(glyphName)) {
        this.runJsCanvas(pre + '<path d="' + d + '" transform="scale(1, -1) translate (0,-800)"/>' + post, glyphName);
        if (this.cfg.glyphNames[glyphName]) {
          glyphName = this.cfg.glyphNames[glyphName];
        } else if (fileGlyphNames[glyphName]) {
          glyphName = fileGlyphNames[glyphName];
        }
        vexGlyphs[glyphName] = {
          x_min : this.tempMinX,
          x_max : this.tempMaxX,
          ha : me.scale(+ele.getAttribute('horiz-adv-x')),
          o : this.tempOut
        };
        count++;
      }
    }

    var summary = document.getElementById('summary');
    summary.textContent = count + ' Glyphs converted';

    // TODO: throw errors

    var bbox = fontFaceEl.getAttribute('bbox');
    bbox = bbox.split(' ');

    vexFont = {
      glyphs : vexGlyphs,
      familyName : fontFaceEl.getAttribute('font-family'),
      underlineThickness : me.scale(+fontFaceEl.getAttribute('underline-thickness')),
      underlinePosition : me.scale(+fontFaceEl.getAttribute('underline-position')),
      boundingBox : {
        // TODO check if order of bbox coordinates is correct
        "xMin" : +bbox[0],
        "yMin" : +bbox[1],
        "xMax" : +bbox[2],
        "yMax" : +bbox[3]
      },
      resolution : me.scale(+fontFaceEl.getAttribute('units-per-em')),
      ascender : me.scale(+fontFaceEl.getAttribute('ascent')),
      descender : me.scale(+fontFaceEl.getAttribute('descent')),

      cssFontWeight : "normal",
      cssFontStyle : "normal",
    };

    vexFont.lineHeight = vexFont.ascender - vexFont.descender;

    var el = document.getElementById('source');

    // TODO automatically add credits from src file
    el.innerHTML = '<div style="font-family:monospace">' + 'Vex.Flow.Font = ' + JSON.stringify(vexFont) + ';</div>';

  },

  // TODO solve with inheritance!?
  prepareJsCanvas : function() {
    var me = this;
    jsContext2d.prototype.emitFuncOrig = jsContext2d.prototype.emitFunc;
    jsContext2d.prototype.emitFunc = function(fn, args, fnprefix) {
      this.emitFuncOrig(fn, args, fnprefix);
      if (argstr.length) {
        me.addToVex(fn, argstr.substr(0, argstr.length - 1));
      }
    };
  },

  addToVex : function(fn, arg) {
    var me = this, isBezier = false;
    switch (fn) {
      case 'bezierCurveTo':
        isBezier = true;
        this.tempOut += 'b ';
        break;
      case 'lineTo':
        this.tempOut += 'l ';
        break;
      case'moveTo':
        this.tempOut += 'm ';
        break;
      case'quadraticCurveTo':
        this.tempOut += 'q ';
        break;
      // default:
      // console.log(fn);
      //return;
    }
    arg = arg.replace(/,/g, ' ');
    var argTokens = arg.split(' ');

    if (isBezier) {
      var lastTwo = argTokens.splice(-2);
      argTokens.unshift(lastTwo[0], lastTwo[1]);
    }

    var token;
    for (var i = 0; i < argTokens.length; i += 1) {
      token = me.scale(+argTokens[i]);
      this.tempOut += token + ' ';
      if (!(i % 2)) {
        this.tempMaxX = Math.max(token, this.tempMaxX);
        this.tempMinX = Math.min(token, this.tempMinX);
      }
    }
  },

  runJsCanvas : function(svgXML, name) {
    var ycanvas = document.getElementById('canvas');
    xcanvas = new jsCanvas('jscanvastest');
    xcanvas.canvas.style.display = 'none';
    xcanvas.compile(svgXML, function() {
      eval(xcanvas.toString());
      var yctx = ycanvas.getContext('2d');
      var cantest = new jscanvastest(yctx);

    });
  }
};

