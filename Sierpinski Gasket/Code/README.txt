CS174A - Introduction to Computer Graphics - Fall 2014
Assignment #1

Jessica Pham
UID: 004153744

Used Sublime as a text editor and Firefox/Firebug as my web environment.

*Requirements 1-4 are implemented.

*Extra Credit

-------------
Overview of keyboard actions:
	'space bar' = change color randomly
	'right arrow' = Sierpinski Gasket Triangle
	'left arrow' = tree fractal
	'r' = rotate 30 degrees counter clockwise
-------------

	1. Used a uniform variable called "vColor" to alter the color of the fractal. The uniform variable is altered in javascript and is then passed to the fragment shader.

	2. With the variable created in part 1, I added a keyboard action that changed the color randomly when the "space bar" is pressed.

	3. The fractal I used was the tree fractal, which is implemented with the functions tree() and divideBranches(). Similarly to The Sierpinski Gasket algorithm, the tree fractal takes in a point and recursively divides the branches. The user can switch between the two fractals with the "right" and "left" arrow keys.

	4. I added a uniform matrix variable "vMatrix" in the vertex shader that is used to transform the vertex vector. When the key "r" is pressed, "vMatrix" is rotated +30 degrees (or 30 degrees counter clockwise) and transforms the vertex vector.