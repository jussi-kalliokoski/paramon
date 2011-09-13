var paramon = (function(global, paramon){

paramon = this;

/**
 * Groups arguments under flags.
 *
 * Named flags start with two dashes (--), and the name can be of any length.
 * Single flags start with a single dash (-), and are one character in length. Multiple single flags can be specified in the same word, but arguments are applied only to the last one.
 *
 * @param {Array} argv The argv array to process.
 * @return {Object} The arguments grouped under flags.
*/
paramon.readFlags = function(argv){
	var	flags = {
			'$!extra': []
		},
		i, p, s, n;
	argv = [].slice.call(argv, 2);
	for (i=0; i<argv.length; i++){
		n = String(argv[i + 1])[0] === '-';
		if (argv[i].indexOf('--') === 0){
			flags[argv[i].substr(2)] = n || argv[i + 1] || true; 
			!n && i++;
		} else if (argv[i][0] === '-') {
			s = argv[i].substr(1);
			while (s.length > 1){
				flags[s[0]] = true;
				s = s.substr(1);
			}
			flags[s] = n || argv[i + 1] || true; 
			!n && i++;
		} else {
			flags['$!extra'].push(argv[i]);
		}
	}
	return flags;
};

/**
 * Reads a parameter of a specified format from the arguments and attaches it by its name to a specified object.
 *
 * @param {Array} argv The argument list from which to capture the parameter.
 * @param {paramon.Parameter} format The format information of the parameter.
 * @param {Object} ret The object to attach the resulting information to.
 * @throws {SyntaxError} When the parameter is not of specified format.
*/

paramon.readParam = function(argv, format, ret){
	var	params	= [],
		i, n, pos;
	for (i=0; i<format.args.length; i++){
		pos = argv.indexOf(format.args[i]);
		if (pos !== -1){
			pos++;
			for (n=0; (format.maxParams === -1 || n<format.maxParams) && argv[pos+n] && argv[pos+n][0] !== '-' ; n++){
				params.push(argv[pos+n]);
			}
			argv.splice(pos - 1, 1 + params.length);
			if (format.minParams > params.length){
				throw new SyntaxError(format.name + ' (' + format.args.join(', ') + ') requires at least ' + (format.minParams === 1 ? 'one parameter.' : format.minParams + ' parameters.'));
			}
			if (format.validation){
				if (format.validation.isArray){
					format.validation.forEach(function(validation, param){
						param = params[param];
						if (!validation.exec(param)){
							throw new SyntaxError(format.name + ' parameter ' + param + ' is not of valid form ( ' + validation + ' ).');
						}
					});
				} else {
					params.forEach(function(param){
						if (!format.validation.exec(param)){
							throw new SyntaxError(format.name + ' parameter ' + param + ' is not of valid form ( ' + format.validation + ' ).');
						}
					});
				}
			}
			ret[format.name] = format.maxParams < 2 ? (format.maxParams ? params[0] : true ) : params;
			format.onfound && format.onfound.apply(format, params);
		}
	}
	if (format.required){
		throw new SyntaxError(format.name + ' (' + format.args.join(', ') + ') is a required parameter.');
	}
};

/**
 * Processes the argv according to a specified format.
 *
 * @param {Array} argv The argv array to process.
 * @param {paramon.Format} format The format according to which to process.
 * @return {Object} The resulting parameters.
 * @throws {SyntaxError} If parameters aren't as specified by the format.
*/

paramon.readFormat = function(argv, format){
	argv = argv || global.process.argv;
	var	args	= [].slice.call(argv, 2),
		ret	= {'$!stray': args},
		i;
	format = format instanceof paramon.Format ? format : new paramon.Format(format);
	format.helpParams.split(';').forEach(function(p){
		p = args.indexOf(p);
		if (p !== -1){
			args.splice(p, 1);
			format.onHelp();
			format.onhelp();
		}
	});
	format.params.forEach(function(param){
		paramon.readParam(args, param, ret);
	});
	return ret;
};

/**
 * Creates a paramon Format object, according to which arguments can be processed.
 *
 * @constructor
 * @this {paramon.Format}
 * @param {Object} overrides The object that has the values that override the defaults.
*/

paramon.Format = function Format(overrides){
	var k, p = [];
	for (k in overrides){
		if (overrides.hasOwnProperty(k)){
			this[k] = overrides[k];
		}
	}
	for (k=0; k<this.params.length; k++){
		p[k] = new paramon.Parameter(this.params[k]);
	}
	this.params = p;
};

paramon.Format.prototype = {
	params:		null,
	name:		'app',
	usage:		'{options}',
	onHelp:		function(){
		var l = this.helpParams.split(';').join(' ').length;
		function pad(str){
			return str + Array(Math.ceil((l - str.length) / 8) + +!((l - str.length) % 8) + 1).join('\t');
		}
		console.log('Usage:');
		console.log(this.name + ' ' + this.usage);
		console.log('Options / flags:');
		this.params.forEach(function(param){
			l = Math.max(l, param.args.join(' ').length);
		});
		console.log('\t' + pad(this.helpParams.split(';').join(' ')) + 'Shows this screen.');
		this.params.forEach(function(param){
			console.log('\t' + pad(param.args.join(' ')) + param.desc);
		});
	},
	onhelp: function(){
		global.process && global.process.exit();
	},
	helpParams:	'--help;-h'
};

/**
 * Creates a paramon Parameter object, according to which an argument can be gathered.
 *
 * @constructor
 * @this {paramon.Parameter}
 * @param {Object} overrides The object that has the values that override the defaults.
*/
paramon.Parameter = function Parameter(overrides){
	var k, p = [];
	for (k in overrides){
		if (overrides.hasOwnProperty(k)){
			this[k] = overrides[k];
		}
	}
};

paramon.Parameter.prototype = {
	maxParams:	1,
	minParams:	0,
	required:	false,
};

}).call(typeof exports === 'undefined' ? {} : exports, typeof window === 'undefined' ? global : window);
