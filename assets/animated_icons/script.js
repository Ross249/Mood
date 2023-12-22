var arr = document.getElementsByClassName('line');

function disappearRight() {
	el.removeEventListener("animationend", disappearRight);
	el.addEventListener('animationend', appearPop);
	
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('appear-left');
		arr[i].classList.add('disappear-right');
	}
}

function appearPop() {
	el.removeEventListener("animationend", appearPop)
	el.addEventListener('animationend', disappearPop);
	
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('disappear-right');
		arr[i].classList.add('appear-pop');
	}
}

function disappearPop() {
	el.removeEventListener("animationend", disappearPop)
	el.addEventListener('animationend', appearMid);
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('appear-pop');
		arr[i].classList.add('disappear-pop');
	}
}

function appearMid() {
	el.removeEventListener("animationend", appearMid)
	el.addEventListener('animationend', disappearMid);
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('disappear-pop');
		arr[i].classList.add('appear-middle');
	}
}

function disappearMid() {
	el.removeEventListener("animationend", disappearMid)
	el.addEventListener('animationend', appearLeft);
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('appear-middle');
		arr[i].classList.add('disappear-middle');
	}
}

function appearLeft() {
	el.removeEventListener("animationend", appearLeft)
	el.addEventListener('animationend', disappearRight);
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('disappear-middle');
		arr[i].classList.add('appear-left');
	}
}

var el = document.querySelector("#last-line");
el.addEventListener("animationend", disappearRight);