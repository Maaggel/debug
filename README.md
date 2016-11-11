# debug.js

A debugging library for javaScript.
By including this, you can watch variables (objects and arrays for now).
This will show a debug window for each variable watched, that will reflect any changes in the tracked elements

## Getting Started

To getting started, include the debug.js or debug.min.js in your project.
```
<script src="debug.min.js"></script>
```

After including the debug.js file, you can watch a variable using the command
```
watch((mixed)variable, (string)label (optional));
```

You can unwatch/stop watching if using the following command
```
unWatch((mixed)variable);
```

#### Example
[View on JSFiddle](https://jsfiddle.net/fbdp2bq0/)
```
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>debug.js example</title>
		<script src="debug.min.js"></script>
		<script>
			var obj = {
				1: Math.random(),
				2: Math.random()
			};

			//Ready function
			(function() {
				//Watch the object
				watch(obj, "My object");

				//Change the value every two seconds
				setInterval(function() {
					obj[1] = Math.random();
					obj[2] = Math.random();
				}, 2000);

				//Unwatch the variable
				setTimeout(function() {
					unWatch(obj);
				}, 10000);
			})();
		</script>
	</head>

	<body></body>
</html>
```


### Prerequisities

debug.js doesn't use any external libraries, and is made in pure javaScript.
To remember the collapsed setting etc. it is using cookies.

## Releases
<strong>1.0.0</strong> Base release
<ul>
	<li>Main debugging script done</li>
	<li>Listen to object and arrays only</li>
</ul>

## To-do
<ol>
	<li>Add editable variables *</li>
	<li>Add other types than object and array for listening **</li>
</ol>

\* Editable variables is inspired by the way Unity3D allows you to change any variable on the fly. If the variable are only used for initialization etc. this will, ofcause, not have that much of an effect.

\*\* This poses the issue, that there aren't any reliable listener functions. By using only objects and arrays, the references are only that - references. So watching the variable is posible.

## Authors

* **Mikkel Bundgaard @ Inspire Me** - *Initial work* - [Maaggel](https://github.com/maaggel)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/Maaggel/debug/blob/master/LICENSE) file for details