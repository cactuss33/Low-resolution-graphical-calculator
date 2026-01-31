let formula = [];
let step = 10;
let fact = 0.1;
let viewPort = {
  x: 0,
  y: 0,
};
let polynomialFormula = [];
let functionInput = [];
let variables = {};
let slider;

function setup() {
  createCanvas(windowWidth, windowHeight - 50);
  background(255);
  viewPort = {
    x: width / 2,
    y: height / 2,
  };
  noStroke();

  for (let i = 0; i < 10; i++) {
    // create all inputs
    functionInput.push();
    functionInput[i] = createInput();
    functionInput[i].input(drawFunction);
    functionInput[i].parent("pack");
    functionInput[i].attribute('placeholder', '')
  }
  slider = createSlider(0.1, 10, 10, 0.1);
}

//mouse && camera
let startPointX = 0;
let startPointY = 0;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
function mousePressed() {
  isDragging = true;
  startPointX = mouseX;
  startPointY = mouseY;
  offsetX = viewPort.x;
  offsetY = viewPort.y;
}
function touchStarted() {
  isDragging = true;
  startPointX = mouseX;
  startPointY = mouseY;
  offsetX = viewPort.x;
  offsetY = viewPort.y;
}
function mouseDragged() {
  if (isDragging) {
    viewPort.x = offsetX + (mouseX - startPointX);
    viewPort.y = offsetY + (mouseY - startPointY);
  }
}
function touchMoved(event) {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (event.target === canvas) event.preventDefault();
    if (isDragging) {
      viewPort.x = offsetX + (mouseX - startPointX);
      viewPort.y = offsetY + (mouseY - startPointY);
    }
  }
}
function mouseReleased() {
  isDragging = false;
}
function touchEnded() {
  isDragging = false;
}
// --------------

function draw() {
  if (document.activeElement !== functionInput.elt) {
    if (keyIsDown(RIGHT_ARROW)) viewPort.x -= 4;
    if (keyIsDown(LEFT_ARROW)) viewPort.x += 4;
    if (keyIsDown(DOWN_ARROW)) viewPort.y -= 4;
    if (keyIsDown(UP_ARROW)) viewPort.y += 4;
    if (keyIsDown) drawFunction();
  }
}

function keyPressed() {
  if (key == "q") {
    noLoop();
    step = 4;
    background(220);
    drawFunction();
  }
}

function drawFunction() {
  fact = slider.value();
  background(255);
  fill("black");
  textAlign(RIGHT)
  text(
    round(viewPort.x - width / 2) + ", " + round(viewPort.y - height / 2),
    width - 30,
    height - 30
  );

  formula = [];
  polynomialFormula = [];
  variables = {};

  let lastFormula = "";
  let varName = "";
  let varValue = 0;

  for (let i = 0; i < 10; i++) {
    // operar cada formula
    lastFormula = functionInput[i].value();
    formula.push(lastFormula);

    if (lastFormula.slice(0, 3) == "var") {
      lastFormula = lastFormula.slice(3);
      varName = lastFormula.replace(/[^a-zA-Z]/g, "").split("")[0];
      varValue = lastFormula.replace(/[^0-9.]/g, "");
      if (varName != undefined) variables[varName] = float(varValue);
      continue;
    }

    if (lastFormula != "")
      polynomialFormula.push(formulaToPolynomial(lastFormula));
    //if polynomialFormula is undefined set to ""
    if (polynomialFormula[polynomialFormula.length - 1] == "undefined")
      polynomialFormula[polynomialFormula.length - 1] = "";
  }

  //  main thing
  let result = 0;
  let nextColor = 0;
  for (let x = 0; x < width; x += step) {
    // cada x
    for (let y = 0; y < height; y += step) {
      // cada y
      for (let o = 0; o < polynomialFormula.length; o++) {
        // cada formula indiv
        result = 0;
        for (let i = 0; i < polynomialFormula[o].length; i++) {
          // cada polinomio
          result += evaluate(
            polynomialFormula[o][i],
            x - viewPort.x,
            y - viewPort.y,
            { ...variables } // pasa una copia
          );
        }
        nextColor = abs(result) * fact;
        if (nextColor < 255) {
          fill(nextColor);
          square(x, y, step);
        }
        if (abs(x - viewPort.x) <= 5 || abs(y - viewPort.y) <= 5) {
          fill("rgb(89,141,89)");
          square(x, y, step);
        }
      }
    }
  }
}

function evaluate(polinomi, x, y, vars) {
  //the screen is upside down
  y *= -1;

  let sign = polinomi.includes("+") - polinomi.includes("-");

  if (sign != 0) polinomi = polinomi.slice(1);
  else sign = 1;

  let number = float(polinomi.replace(/\D/g, ""));
  if (Number.isNaN(number)) number = 1;

  polinomi = polinomi.slice(number.length);

  for (let i = 0; i < polinomi.length; i++) {
    if (polinomi[i] == "$") {
      switch (polinomi[i - 1]) {
        case "x":
          x *= x;
          break;
        case "y":
          y *= y;
          break;
        default:
          if (polinomi[i - 1] in vars)
            vars[polinomi[i - 1]] *= vars[polinomi[i - 1]];

          break;
      }
    }
  }

  if (polinomi.includes("x")) number *= x;
  if (polinomi.includes("y")) number *= y;

  for (let u in vars) {
    if (polinomi.includes(u)) number *= vars[u];
  }

  number *= sign;
  return number;
}

function formulaToPolynomial(formula) {
  let segments = formula.replace(/\s+/g, "").split("=");

  segments[0] = segments[0].split(/(?=[+-])/);
  if (segments.length == 2) {
    segments[1] = segments[1].split(/(?=[+-])/);
    for (let i = 0; i < segments[1].length; i++) {
      let currentEval = segments[1][i];
      if (currentEval[0] == "-") currentEval = "+" + currentEval.slice(1);
      if (currentEval[0] == "+") currentEval = "-" + currentEval.slice(1);
      else currentEval = "-" + currentEval;
      segments[0].push(currentEval);
    }
  }
  return segments[0];
}
