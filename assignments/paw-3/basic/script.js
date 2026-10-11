const dial = document.querySelector("#dial");
const rotor = document.querySelector("#rotor");
const numBuffer = document.querySelector("#num-buffer");
const operatorBuffer = document.querySelector("#operator-buffer");
const output = document.querySelector("#number");
const hint = document.querySelector("#hint");
const holes = document.querySelectorAll(".hole");

let drag = null;
let rotation = 0;
let animationId = 0;

const STOP_ANGLE = 115;
const DIGIT_OFFSET = 5;
const DIGIT_ANGLES = {
  1: 55,
  2: 22,
  3: -11,
  4: -44,
  5: -77,
  6: -110,
  7: -143,
  8: -176,
  9: -209,
  0: -242,
};
const DIGIT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
let bufferNumber = "";
let inputNumber = "";

let aNumber = null;
let bNumber = null;
let resultNumber = null;
let operator = null;

function renderNumber() {
  operatorBuffer.textContent = operator ? `(${operator})` : "";

  numBuffer.textContent = bufferNumber;
  output.textContent = inputNumber !== "" ? inputNumber : "_";
}

function calculate() {
  if (aNumber === null || bNumber === null || operator === null) {
    return;
  }

  const a = Number(aNumber);
  const b = Number(bNumber);
  let result;

  switch (operator) {
    case "+":
      result = a + b;
      break;

    case "-":
      result = a - b;
      break;

    case "/":
      result = a / b;
      break;

    case "*":
      result = a * b;
      break;

    default:
      return;
  }

  resultNumber = result;
}

document.querySelectorAll(".operator").forEach((op) => {
  op.addEventListener("click", (e) => {
    const selectedOperator = e.target.dataset.operator;

    if (selectedOperator === "=") {
      bNumber = parseInt(inputNumber);

      calculate();

      aNumber = null;
      bNumber = null;

      bufferNumber = "";
      inputNumber = resultNumber.toString();
      operator = null;
      renderNumber();
      return;
    } else if (selectedOperator !== "=" && aNumber && inputNumber != "") {
      operator = selectedOperator;
      bNumber = parseInt(inputNumber);

      calculate();

      aNumber = resultNumber;
      bNumber = null;
      bufferNumber = resultNumber.toString();
      inputNumber = "";
      renderNumber();
      return;
    }

    operator = selectedOperator;

    if (inputNumber === "" && aNumber === null) {
      return;
    }

    aNumber = aNumber ?? Number(inputNumber);
    bNumber = null;

    bufferNumber = aNumber.toString();
    inputNumber = "";

    renderNumber();
  });
});

document.querySelector("#clear").addEventListener("click", (e) => {
  aNumber = null;
  bNumber = null;
  resultNumber = null;
  operator = null;

  bufferNumber = "";
  inputNumber = "";

  renderNumber();
});

function pointerAngle(event) {
  const rect = dial.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);

  return (Math.atan2(x, -y) * 180) / Math.PI;
}

function normalize(angle) {
  return ((angle % 360) + 360) % 360;
}

function clockwiseDistance(from, to) {
  return normalize(to - from);
}

function renderRotation(degrees) {
  rotation = degrees;
  rotor.style.transform = `rotate(${degrees}deg)`;
}

function animateHome() {
  cancelAnimationFrame(animationId);
  rotor.style.transition = "transform 350ms cubic-bezier(.2,.8,.2,1)";
  renderRotation(0);

  window.setTimeout(() => {
    rotor.style.transition = "none";
  }, 380);
}

function getDragged() {
  if (!drag) return 0;

  const maxTravel = drag.startDigitAngle + DIGIT_OFFSET;
  const travel = Math.min(drag.travelled, maxTravel);
  const dragged = drag.startRotation + travel;

  return dragged;
}

holes.forEach((hole) => {
  hole.addEventListener("pointerdown", (event) => {
    if (drag) return;

    event.preventDefault();
    cancelAnimationFrame(animationId);

    rotor.style.transition = "none";

    const digit = hole.dataset.digit;
    const pointer = pointerAngle(event);
    const startDigitAngle = normalize(STOP_ANGLE - DIGIT_ANGLES[digit]);

    drag = {
      hole,
      digit,
      startPointer: pointer,
      previousPointer: pointer,
      startDigitAngle,
      travelled: 0,
      startRotation: rotation,
      lastDelta: 0,
    };

    hole.classList.add("dragging");
    hole.setPointerCapture(event.pointerId);
  });

  hole.addEventListener("pointermove", (event) => {
    if (!drag || drag.hole !== hole) return;

    const current = pointerAngle(event);
    let delta = current - drag.previousPointer;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    drag.previousPointer = current;

    if (delta > 0) {
      drag.travelled += delta;
    }

    drag.lastDelta = delta;

    let dragged = getDragged();
    renderRotation(dragged);
  });

  hole.addEventListener("pointerup", (event) => {
    if (!drag || drag.hole !== hole) return;

    let selectedDigit = 0;
    const dragged = getDragged();

    for (const digit of DIGIT_ORDER) {
      const angle = DIGIT_ANGLES[digit];
      const dragAngle = STOP_ANGLE - angle;

      if (dragged <= dragAngle + DIGIT_OFFSET) {
        selectedDigit = digit;
        break;
      }
    }

    hole.classList.remove("dragging");
    drag = null;

    inputNumber += selectedDigit;
    renderNumber();

    animateHome();
  });

  hole.addEventListener("pointercancel", () => {
    if (!drag || drag.hole !== hole) return;
    hole.classList.remove("dragging");
    drag = null;
    animateHome();
  });
});
