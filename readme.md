# paramon

paramon is a tool for parsing command line arguments. Its agenda is to make it nice to make nice command line options.

## Usage

paramon currently supports two different methods: ``` readFlags ``` and ``` readFormat ``` .

readFlags sorts arguments into arrays based on flags, like this:

### example1.js

```javascript

console.log(require('paramon').readFlags(process.argv));

```

### Input / Output

```

$ node example1.js storm -xuv halberd hack --xuv rock -a -b --comb bomb tomb
{ '$!extra': [ 'storm', 'hack', 'tomb' ],
  x: true,
  u: true,
  v: 'halberd',
  xuv: 'rock',
  a: true,
  b: true,
  comb: 'bomb' }

```

``` readFormat ``` parses arguments based on rules and a format specification. It also automatically generates help message (customizable / removable).

### bombshell

```javascript

var args = require('paramon').readFormat(process.argv, {
        name:   'bombshell',
        usage:  'filename {options}',
        params: [
                {
                        name:   'bombPath',
                        args:   ['--bomb-path', '-p'],
                        desc:   'The path to the bomb.',
                },
                {
                        name:   'shellActive',
                        args:   ['--active', '-a'],
                        desc:   'Makes the bomb active.',
                        // A toggled flag.
                        maxParams: 0,
                },
                {
                        name:   'altPaths',
                        args:   ['--altpaths', '-A'],
                        desc:   'Paths to the other bombs.',
                        // Accept parameter count of one to infinity.
                        minParams: 1,
                        maxParams: -1
                },
                {
                        name:   'names',
                        args:   ['--names', '-n'],
                        desc:   'Names of the shell and the bomb.',
                        // Accept two parameters.
                        minParams: 2,
                        maxParams: 2
                },
                {
                        name:   'boo',
                        args:   ['--boo', '-b'],
                        desc:   'Outputs "boo" or the value of this argument.',
                        onfound: function(boo){
                                console.log(boo || 'boo');
                        }
                },
        ]
});

console.log(args);

```

### Input / Output

```

$ node bombshell --help
Usage:
bombshell filename {options}
Options / flags:
	--help -h	Shows this screen.
	--bomb-path -p	The path to the bomb.
	--active -a	Makes the bomb active.
	--altpaths -A	Paths to the other bombs.
	--names -n	Names of the shell and the bomb.
	--boo -b	Outputs "boo" or the value of this argument.

$ node bombshell tap -a --boo Toop lap --altpaths a b c d --names gumpy dumpy rap -p f/g gap
Toop
{ '$!stray': [ 'tap', 'lap', 'rap', 'gap' ],
  bombPath: 'f/g',
  shellActive: true,
  altPaths: 'a',
  names: [ 'gumpy', 'dumpy' ],
  boo: 'Toop' }

```
