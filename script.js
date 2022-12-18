const startAppBtn = document.getElementById('start')
startAppBtn.onclick = function () {

	const div = document.createElement('div')

	div.innerHTML = `
		<div class="score">
			<div id="player-score">-1</div>
			<div class="line-score"></div>
			<div id="computer-score">0</div>
		</div>

		<div class="ball" id="ball"></div>
		<div class="paddle left" id="player-paddle"></div>
		<div class="paddle right" id="computer-paddle"></div>
	`
	document.body.append(div)
	document.body.classList.add('cursorNone')

	startAppBtn.remove()

	const gameBall = new ball(document.getElementById('ball'))
	const playerPaddle = new paddle(document.getElementById('player-paddle'))
	const computerPaddle = new paddle(document.getElementById('computer-paddle'))
	const playerScoreElement = document.getElementById('player-score')
	const computerScoreElement = document.getElementById('computer-score')

	let lastTime

	function update(time) {
		if (lastTime !== null) {
			const delta = time - lastTime

			gameBall.update(delta, [playerPaddle.rect(), computerPaddle.rect()])

			computerPaddle.update(delta, gameBall.y)

			if (isLose()) handLose()
		}

		lastTime = time
		window.requestAnimationFrame(update)
	}

	function isLose() {
		const rect = gameBall.rect()
		return rect.right >= window.innerWidth || rect.left <= 0
	}

	function handLose() {
		const rect = gameBall.rect()

		if (rect.right >= window.innerWidth) {
			playerScoreElement.textContent = parseInt(playerScoreElement.textContent) + 1
		} else {
			computerScoreElement.textContent = parseInt(computerScoreElement.textContent) + 1
		}

		gameBall.reset()
		computerPaddle.reset()
		playerPaddle.reset()
	}

	document.addEventListener('pointermove', e => {
		playerPaddle.position = (e.y / window.innerHeight) * 100
	})

	window.requestAnimationFrame(update)
}



// ball



const IMITIAL_V = 0.00025
const V_INCREASE = 0.00001

class ball {
	constructor(ballElement) {
		this.ballElement = ballElement
		this.reset()
	}

	get x() {
		return parseFloat(getComputedStyle(this.ballElement).getPropertyValue('--x'))
	}

	set x(value) {
		this.ballElement.style.setProperty('--x', value)
	}


	get y() {
		return parseFloat(getComputedStyle(this.ballElement).getPropertyValue('--y'))
	}

	set y(value) {
		this.ballElement.style.setProperty('--y', value)
	}

	rect() {
		return this.ballElement.getBoundingClientRect()
	}

	reset() {
		this.x = 50
		this.y = 50

		this.direction = { x: 0 }
		while (Math.abs(this.direction.x <= 0.2) || Math.abs(this.direction.x >= 0.9)) {
			const heading = randomNumbBetween(0, 2 * Math.PI)
			this.direction = { x: Math.cos(heading), y: Math.sin(heading) }
		}
		this.v = IMITIAL_V
	}

	update(delta, paddleRects) {
		this.x += this.direction.x * this.v * delta
		this.y += this.direction.y * this.v * delta
		this.v += V_INCREASE * delta

		const rect = this.rect()

		if (rect.bottom >= window.innerHeight || rect.top <= 0) {
			this.direction.y *= -1
		}

		if (paddleRects.some(r => isCollision(r, rect))) {
			this.direction.x *= -1
		}
	}
}

function randomNumbBetween(min, max) {
	return Math.random() * (max - min) + min
}

function isCollision(rect1, rect2) {
	return (
		rect1.left <= rect2.right &&
		rect1.right >= rect2.left &&
		rect1.top <= rect2.bottom &&
		rect1.bottom >= rect2.top)
}



// paddle



const vComputer = 0.02

class paddle {
	constructor(paddleElement) {
		this.paddleElement = paddleElement
		this.reset()
	}

	get position() {
		return parseFloat(
			getComputedStyle(this.paddleElement).getPropertyValue('--position'))
	}

	set position(value) {
		this.paddleElement.style.setProperty('--position', value)
	}

	rect() {
		return this.paddleElement.getBoundingClientRect()
	}

	reset() {
		this.position = 50
	}

	update(delta, ballHeight) {
		this.position += vComputer * delta * (ballHeight - this.position)
	}
}