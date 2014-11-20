Jessica Pham
UID: 004153744

Requirements 1-7: DONE
1. Got simple WebGL window to display without error.
2. Used tetrahedron function to make subdivisions for sphere approximation. 
3. Created two normal arrays to hold flat or smooth shading for each object.
4. Have a sun and four orbiting planets, each with different scaling factors and orbit speeds.
5. Made sun the point light source and did appropriate shading/lighting for each planet.
	- sun = flat-shading
	- white planet = low complexity, flat shading, specular highlight
	- green planet = low-medium complexity, Gouraud shading, specular highlight
	- blue planet = high complexity, Phong shading, specular highlight
	- orange = medium complexity, smooth shading, no specular highlight
6. Reused keyboard navigation system
	Overview of keyboard actions:
		'up arrow' = increases the altitude of the camera
		'down arrow' = decreases the altitude of the camera
		'right arrow' = turn the camera to the right
		'left arrow' = turn the camera to the left
		'i' = move forward
		'm' = move backward
		'j' = move left
		'k' = move right
		'r' = reset view to starting position
		'n' = makes field of view narrower
		'w' = makes field of view wider
7. Implemented Phong shading model.

Extra Credit 1: DONE
Added orbiting moon around clam smooth water planet.