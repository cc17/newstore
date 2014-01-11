/**
 * Created with JetBrains PhpStorm.
 * User: pc
 * Date: 13-12-23
 * Time: 上午11:02
 * To change this template use File | Settings | File Templates.
 */
define(function (require){
    var $ = require('./jquery');
    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;


    /****html转义***********/
    var entityMap = {
        escape: {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;'
        }
    };
    var escapeReg = new RegExp('[' + ['&','<','>','"',"'"].join('') + ']', 'g');
    function strEscaper(string){
        if (string == null) return '';
        return ('' + string).replace(escapeReg, function(match) {
            return entityMap.escape[match];
        });
    };



    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    var template = function(text, data, settings) {
        var render;
        settings = $.extend({}, settings,templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, function(match) {
                return '\\' + escapes[match];
            });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'': strEscaper(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj','strEscaper',  source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data,strEscaper);
        var template = function(data) {
            return render.call(this, data);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };
    return template;
});