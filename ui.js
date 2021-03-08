'use strict';
const React = require('react');
const { Text, Box } = require('ink');
const { useState, useEffect, useRef, useContext } = require('react');
const { default: StdinContext } = require('ink/build/components/StdinContext');
const importJsx = require('import-jsx');
const EndGame = importJsx('./EndGame');

// Button constants for control:
const ARROW_UP = "\u001B[B";
const ARROW_DOWN = "\u001B[A";
const ARROW_LEFT = "\u001B[D";
const ARROW_RIGHT = "\u001B[C";

// Game field size:
const FIELD_SIZE = 16;
const FIELD_ROW = [...new Array(FIELD_SIZE).keys()];

// Food coordinates:
let foodItem = {
	x: Math.floor(Math.random() * FIELD_SIZE),
	y: Math.floor(Math.random() * FIELD_SIZE)
}

// Directions of movement:
const DIRECTION = {
	RIGHT: {x: 1, y: 0},
	LEFT: {x: -1, y: 0},
	TOP: {x: 0, y: 1},
	BOTTOM: {x: 0, y: -1},
}

// new hook from article https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
	const savedCallback = useRef();
  
	// Remember the latest callback:
	useEffect(() => {
	  savedCallback.current = callback;
	}, [callback]);
  
	// Set up the interval:
	useEffect(() => {
	  function tick() {
		savedCallback.current();
	  }
	  if (delay !== null) {
		let id = setInterval(tick, delay);
		return () => clearInterval(id);
	  }
	}, [delay]);
}

// Food and snake section items:
function getItem(x, y, snakeSegments) {
	if (foodItem.x === x && foodItem.y === y) {
		return (
			<Text color="red"> &#10084; </Text>
		)
	}

	for (let segment of snakeSegments) {
		if (segment.x === x && segment.y === y) {
			return (
				<Text color="green"> &#9674; </Text>
			)
		}
	}
}

// Limit by field borders:
function limitByField(j) {
	if (j >= FIELD_SIZE) {
		return 0;
	}
	if (j < 0) {
		return FIELD_SIZE - 1;
	}
	return j;
}

// Snake movement:
function newSnakePosition(segments, direction) {
	const [head] = segments;
	const newHead = {
		x: limitByField(head.x + direction.x), 
		y: limitByField(head.y + direction.y)
	}

	if(collidesWithFood(newHead, foodItem)) {
		foodItem = {
			x: Math.floor(Math.random() * FIELD_SIZE),
			y: Math.floor(Math.random() * FIELD_SIZE)
		};
		return [newHead, ...segments];
	}

	return [newHead, ...segments.slice(0, -1)];
}


// Food and snake collision:
function collidesWithFood(head, foodItem) {
	return head.x === foodItem.x && head.y === foodItem.y;
}

// Snake Game App:
const App = () => {

	// Starting position of the snake:
	const [snakeSegments, setSnakeSegments] = useState([
		{x: 8, y:8},
		{x: 8, y:7},
		{x: 8, y:6}
	]);

	// reaction to pressing arrows:
	const [direction, setDirection] = useState(DIRECTION.LEFT);
	const {stdin, setRawMode} = useContext(StdinContext);

	useEffect(() => {
		setRawMode(true);
		stdin.on('data', data => {
			const value = data.toString();
			if (value == ARROW_UP) {
				setDirection(DIRECTION.TOP)
			}
			if (value == ARROW_DOWN) {
				setDirection(DIRECTION.BOTTOM)
			}
			if (value == ARROW_LEFT) {
				setDirection(DIRECTION.LEFT)
			}
			if (value == ARROW_RIGHT) {
				setDirection(DIRECTION.RIGHT)
			}
		});
	}, []);

	// conditions for crossing with itself:
	const [head, ...tail] = snakeSegments;
	const intersectsWithItselfs = tail.some(segment => segment.x === head.x && segment.y === head.y)

	// add interval for the game:
	useInterval(() => {
		setSnakeSegments(segments => newSnakePosition(segments, direction))
	}, intersectsWithItselfs ? null : 200)

	return (
		// Game layout:
		<Box flexDirection="column" alignItems="center">

			{/* Name of game */}
			<Text>
				<Text color="green">Snake</Text> Game
			</Text>

			{/* condition for game or gameover */}
			{intersectsWithItselfs ? (
				<EndGame size={FIELD_SIZE} />
			) : (
				<Box flexDirection="column">
					{FIELD_ROW.map(y => (
						<Box key={y}>
							{FIELD_ROW.map(x => (
								<Box key={x}><Text>{getItem(x, y, snakeSegments) || " . "}</Text></Box>
							))}
						</Box>
					))}
				</Box>
			)}
			
		</Box>
	);
};

module.exports = App;
