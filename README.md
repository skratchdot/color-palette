# color-palette

[![Build Status](https://travis-ci.org/skratchdot/color-palette.png?branch=master)](https://travis-ci.org/skratchdot/color-palette)
[![Dependency Status](https://david-dm.org/skratchdot/color-palette.svg)](https://david-dm.org/skratchdot/color-palette)
[![devDependency Status](https://david-dm.org/skratchdot/color-palette/dev-status.svg)](https://david-dm.org/skratchdot/color-palette#info=devDependencies)


## Description

color-palette is a command line tool that uses
[phantomjs](http://phantomjs.org/) and [color-thief](https://github.com/lokesh/color-thief)
to get a color palette from a website or an image.
Any resource that can be opened in phantomjs can be used.


## Installation

Install the command line tool globally by running:

    npm install -g color-palette


## Usage

    Usage: color-palette [options] <resource>


## Options

    -h, --help               output usage information
    -v, --version            output the version number
    -s, --size <size>        the target size of the color palette (might return +/- 2)
    -q, --quality <quality>  the quality of the colors (0 is highest, 10 is default)
    -i, --image              add image to output
    -o, --output [type]      specify the output type: text, json, or html


## Examples

Get a color palette for google.com
```bash
$ color-palette http://google.com
      Resource: http://google.com
       Success: true
Dominant Color: #2d2f2e
       Palette: #dcd7d2,#2b2b2b,#2a5fe3,#d94835,#30a28f,#7a7a7a,#049451
```

Get a color palette for amazon.com, output should be in json format
```bash
$ color-palette -o json http://amazon.com
{
  "resource": "http://amazon.com",
  "uri": "http://amazon.com",
  "success": true,
  "dominantColor": "#253a4f",
  "palette": [
    "#24364b",
    "#dadbda",
    "#84454a",
    "#c38f3d",
    "#758b9d",
    "#ad8989",
    "#2ea9c3"
  ]
}
```

Get an html report for amazon.com and open it
```bash
$ color-palette -o html http://amazon.com > output.html & open output.html

# alternative version if you're using OSX w/ homebrew `brew install browser`:
$ color-palette -o html http://amazon.com > output.html | browser
```

Get a color palette for reddit.com, include a screenshot in the json output
```bash
color-palette -i -j http://reddit.com > output.json
```
***NOTE: when including the image switch, the output is very large
due to the base64 encoded image data uri***


## License

Copyright (c) 2014 skratchdot  
Licensed under the MIT license.

