/*
 * Inspire Me Debug.js
 *
 * Copyright 2016 Inspire Me. (http://inspireme.dk)
 * Dual licensed under the MIT or GPL licenses.
 * http://inspireme.dk/open-source-licenses
 *
 * http://inspireme.dk
 *
 * Description:
 * Debug object or array variables.
 * Debug a variable by using:
 * watch(variable, label (optional));
 */
 var $debug = {
    //Variables
    interval: false,
    listeners: [],
    debugWindow: false,
    prefix: 'js_debug',
    settings: {
        interval: 100,
        typeColors: {
            array: '#B88700',
            object: '#B84500',
            string: '#56b02e',
            number: '#89bdff',
            bool: '#AC00C6',
            null: '#7A7A7A',
            unknown: '#FFF'
        }
    },

    /**
     * Add a listener
     */
    addListener: function(element, name, modify)
    {
        //Bind the change event
        $debug.listeners.push({
            namespace: false,
            object: element,
            savedValue: false,
            name: name,
            modify: modify,
            collapsed: false
        });
    },

    /**
     * Digest
     */
    digest: function()
    {
        //Loop through the listeners
        $debug.listeners.forEach(function (listener) {
            if(debugWindow)
            {
                //Create namespace?
                if(!listener.namespace)
                {
                    //Create the namespace
                    var namespace = document.createElement('div');
                    namespace.setAttribute('class', 'namespace');

                    //Get the debug id
                    var debugId = listener.name.replace(/\W+/g, "");

                    //Collapse?
                    if(parseInt($debug.getCookie(debugId+"_collapsed")))
                        namespace.className += " collapsed";

                    //Set the debug id
                    namespace.setAttribute('data-debugid', debugId);

                    //Append this to the debug window
                    debugWindow.appendChild(namespace);  

                    //Save the namespace
                    listener.namespace = namespace;
                }

                //Get the string element
                var stringElement = JSON.stringify(listener.object, function(key, val) {
                    return (typeof val === 'function') ? '' + val : val;
                });

                //Get the hash
                var hash = $debug.md5(stringElement);

                //Check the hash
                if(listener.savedValue != hash)
                {
                    //Switch the types
                    $debug.setNamespace(listener);

                    //Set the saved value
                    listener.savedValue = hash;
                }
            }
        });
    },

    /**
     * Unwatch
     */
    unWatch: function(variable)
    {
        //Find the correct variable in the listener
        Object.keys($debug.listeners).forEach(function(key) {
            //Get the value
            var listener = $debug.listeners[key];

            //Does this match?
            if(variable == listener.object)
            {
                //Remove this from the listeners
                delete $debug.listeners[key];

                //Remove the namespace
                listener.namespace.parentNode.removeChild(listener.namespace);
            }
        });
    },

    /**
     * Set a namespace
     */
    setNamespace: function(listener)
    {
        //Set the name
        listener.namespace.innerHTML = '<span class="name">'+(listener.name == '' ? '('+(Array.isArray(listener.object) ? 'array' : (typeof listener.object))+')' : listener.name)+(listener.modify ? '<span class="nameLabel">(editable)</span>' : '')+'<div class="collapse" onclick="$debug.collapse(this);"></div></span>';

        //Start the content
        var content = '<div class="content">';

        //Switch the types
        switch ((Array.isArray(listener.object) ? "array" : typeof listener.object)) {
            case "function":
                content += 'Cannot track functions';
                break; 
            case "object":
            case "array":
                content += $debug.getObjectChildren(listener.object, listener.modify);
                break;
            default: 
                content += 'Can only track objects and arrays directly';
        }

        //End the content
        listener.namespace.innerHTML += content+'</div>';
    },

    /**
     * Collapse
     */
    collapse: function(element)
    {
        //Get the namespace
        var namespace = element.parentElement.parentElement;

        //Collapse
        namespace.classList.toggle('collapsed');

        //Set the cookie
        var debugId = namespace.dataset.debugid;
        if(namespace.dataset.debugid != "")
            $debug.setCookie(debugId+"_collapsed", (namespace.classList.contains('collapsed') ? 1 : 0));
    },

    /**
     * Get the object children
     */
    getObjectChildren: function(object, modify, level)
    {
        //Set level
        if(typeof level === "undefined")
            level = 0;

        //Print the start
        var html = '<ul class="level-'+level+'">';

            //Loop through the elements
            Object.keys(object).forEach(function(key) {
                //Get the value
                var value = object[key];

                //Switch the types
                if(value === null)
                    html += '<li>'+key+': <span class="value" style="color: '+$debug.c('null')+';">null</span></li>';
                else if(typeof value === "function")
                    html += '<li><span style="color: '+$debug.c('function')+';">function</span></li>';
                else if(Array.isArray(value))
                    html += '<li>'+key+': <span style="color: '+$debug.c('array')+';">(array)</span>'+$debug.getObjectChildren(value, modify, (level+1))+'</li>';
                else if(typeof value === "object")
                    html += '<li>'+key+': <span style="color: '+$debug.c('object')+';">(object)</span>'+$debug.getObjectChildren(value, modify, (level+1))+'</li>';
                else if(typeof value === "number")
                    html += '<li>'+key+': <span style="color: '+$debug.c('number')+';">'+(modify ? '<input type="text" value="'+value+'" />' : value)+'</span></li>';
                else if(typeof value === "string")
                    html += '<li>'+key+': <span style="color: '+$debug.c('string')+';">'+(modify ? '<input type="text" value="'+value+'" />' : value)+'</span></li>';
                else if(typeof value === "boolean")
                    html += '<li>'+key+': <span style="color: '+$debug.c('bool')+';">'+(value ? 'true' : 'false')+'</span></li>';
                else
                    html += '<li style="color: '+$debug.c('unknown')+';">'+key+': <span class="value">unknown type ('+(typeof value)+')</span></li>';
            });

        //End
        html += '</ul>';

        //Return
        return html;
    },

    /**
     * Init function
     */
    init: function()
    {
        //Get the debug window
        debugWindow = document.querySelector(".debugWindow");

        //Create the debug window
        if(!debugWindow)
        {
            //Create the element
            debugWindow = document.createElement('div');
            debugWindow.setAttribute('class', 'debugWindow');

            //Append this to the body
            document.body.appendChild(debugWindow);

            //Add the styling
            var headStyle = document.createElement('style');
            headStyle.setAttribute('type', 'text/css');

            //Add the styling
            $debug.addStyling(headStyle, ".debugWindow", "position: fixed; top: 0px; right: 0px; z-index: 10000;");
            $debug.addStyling(headStyle, ".debugWindow .namespace", "position: relative; background-color: #222; color: #FFF; font-size: 11px; font-family: Courier; box-sizing: border-box; min-width: 215px; max-width: 280px; margin: 5px; border-radius: 4px; -webkit-box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.3); -moz-box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.3); box-shadow: 0px 1px 1px 0px rgba(0,0,0,0.3);");
            $debug.addStyling(headStyle, ".debugWindow .namespace .name", "display: block; padding: 5px 21px 5px 5px; border-bottom: 1px solid #444; background-color: #000; border-radius: 5px 5px 0 0;");
            $debug.addStyling(headStyle, ".debugWindow .namespace .name .nameLabel", "color: #ACACAC;");
            $debug.addStyling(headStyle, ".debugWindow .namespace .name .collapse", "cursor: pointer; right: 7px; top: 9.5px; opacity: .4; position: absolute; width: 0; height: 0; border-style: solid; border-width: 7px 5px 0 5px; border-color: #ffffff transparent transparent transparent;");
            $debug.addStyling(headStyle, ".debugWindow .namespace.collapsed .name", "border-radius: 5px; border-bottom: 0;");
            $debug.addStyling(headStyle, ".debugWindow .namespace.collapsed .name .collapse", "top: 9px; border-width: 0 5px 7px 5px; border-color: transparent transparent #ffffff transparent;");
            $debug.addStyling(headStyle, ".debugWindow .namespace .name .collapse:hover", "opacity: 1;");
            $debug.addStyling(headStyle, ".debugWindow .namespace .content", "padding: 5px;");
            $debug.addStyling(headStyle, ".debugWindow .namespace .content input[type='text']", "outline: 0; border: 0; background-color: transparent; color: inherit; font-size: inherit; font-family: inherit;");
            $debug.addStyling(headStyle, ".debugWindow .namespace .content input[type='text']:focus", "background-color: #3A3827;");
            $debug.addStyling(headStyle, ".debugWindow .namespace.collapsed .content", "display: none;");
            $debug.addStyling(headStyle, ".debugWindow .namespace ul, .debugWindow .namespace ul li", "list-style: none; margin: 0; padding: 0;");
            $debug.addStyling(headStyle, ".debugWindow .namespace ul:not(.level-0)", "padding-left: 10px!important;");
            $debug.addStyling(headStyle, ".debugWindow .namespace ul li", "list-style: none; margin: 0; padding: 0;");

            //Append this to the body
            document.head.appendChild(headStyle);
        }

        //Start the interval
        if(!$debug.interval)
        {
            //Start the interval
            interval = setInterval(function() {
                //Digest
                $debug.digest();
            }, $debug.settings.interval)    
        }

    },

    //Add styling
    addStyling: function(target, identifier, styling) {
        target.appendChild(document.createTextNode(identifier+'{'+styling+'}'));
    },

    //Simple stringify
    simpleStringify: function(object)
    {
        var simpleObject = {};
        for(var prop in object)
        {
            if(!object.hasOwnProperty(prop))
                continue;
            if(typeof(object[prop]) == 'object')
                continue;
            if(typeof(object[prop]) == 'function')
                continue;
            simpleObject[prop] = object[prop];
        }

        //Return cleaned up JSON
        return JSON.stringify(simpleObject);
    },

    //Set a cookie
    setCookie: function(cname, cvalue, exdays)
    {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = $debug.settings.prefix + cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    //Get a cookie
    getCookie: function(cname)
    {
        var name = $debug.settings.prefix + cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i <ca.length; i++)
        {
            var c = ca[i];
            while(c.charAt(0)==' ')
                c = c.substring(1);
            if(c.indexOf(name) == 0)
                return c.substring(name.length,c.length);
        }
        return "";
    },

    //Get a color
    c: function(color)
    {
        //Return the color
        return $debug.settings.typeColors[color];
    },

    //MD5
    md5: function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]| (G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()}
};

/**
 * Watch function
 */
function watch(variable, name, modify)
{
    //Preset
    if(typeof name === "undefined")
        name = "";
    if(typeof variable === "undefined")
        return false;
    if(typeof modify === "undefined")
        modify = false;

    //Init
    $debug.init();

    //Add a listener
    $debug.addListener(variable, name, modify);
}

/**
 * Unwatch function
 */
function unWatch(variable)
{
    //Remove listener
    if(typeof variable !== "undefined")
    {
        //Init
        $debug.init();

        //Remove listener
        $debug.unWatch(variable);
    }
}