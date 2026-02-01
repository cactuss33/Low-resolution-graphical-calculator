let formula = [];
let step = 10;
let fact = 0.1;
let viewPort = {
  x: 0,
  y: 0,
};

let zoom = 1

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
  createNewInput()
  slider = createSlider(0.1, 10, 10, 0.1);
}
function createNewInput(){
  //crea un nuevo input para formula
  functionInput.push();
  let lastFunctionIndex = functionInput.length
  functionInput[lastFunctionIndex] = createInput();
  functionInput[lastFunctionIndex].input(drawFunction);
  functionInput[lastFunctionIndex].parent("pack");
  functionInput[lastFunctionIndex].attribute('placeholder', '+')
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
//--------------

function draw() {
  //movimiento con las flechas
  if (document.activeElement !== functionInput.elt) {
    if (keyIsDown(RIGHT_ARROW)) viewPort.x -= 4;
    if (keyIsDown(LEFT_ARROW)) viewPort.x += 4;
    if (keyIsDown(DOWN_ARROW)) viewPort.y -= 4;
    if (keyIsDown(UP_ARROW)) viewPort.y += 4;
    if (keyIsDown(187)) zoom -= 0.01;
    if (keyIsDown(189)) zoom += 0.01;
    if (keyIsDown) drawFunction();
  }
  
  //crear nuevo input al ver que el ultimo ya esta lleno
  if(functionInput[functionInput.length - 1].value() != ""){
    createNewInput()
  }
  if(functionInput.length > 1 && functionInput[functionInput.length - 2].value() == ""){
    functionInput[functionInput.length - 1].remove()
    functionInput.pop()
  }

}
function keyPressed() {
  //test
  if (key == "q") {
    // noLoop();
    step = 4;
    background(220);
    drawFunction();
  }
  //--------
  if(key == "Escape"){
    document.activeElement.blur();
  }
}
function drawFunction() {
  //se encarga de dibujar un frame
  
  fact = slider.value();
  background(255);
  
  //se reinician todas las variables
  formula = [];
  polynomialFormula = [];
  variables = {};

  //estas variables se crean aqui para no estar creando y destruyendo variables locales en cada for
  //para optimizar
  let lastFormula = "";
  let varName = "";
  let varValue = 0;
  
  
  //extraer cada grupo de polinomios de cada input
  for (let i = 0; i < functionInput.length; i++) {
    //operar cada formula
    lastFormula = functionInput[i].value();
    formula.push(lastFormula);

    
    //si contiene el prefijo "var" tratar como una variable y skippear el "analisis" de la formula
    if (lastFormula.slice(0, 3) == "var") {
      lastFormula = lastFormula.slice(3);
      varName = lastFormula.replace(/[^a-zA-Z]/g, "").split("")[0];
      varValue = lastFormula.replace(/[^0-9.-]/g, "");
      if (varName != undefined) variables[varName] = float(varValue);
      continue;
    }

    if (lastFormula != "")
      polynomialFormula.push(formulaToPolynomial(lastFormula));
    //if polynomialFormula is undefined set to ""
    if (polynomialFormula[polynomialFormula.length - 1] == "undefined")
      polynomialFormula[polynomialFormula.length - 1] = "";
  }

  //optimizacion
  let result = 0;
  let nextColor = 0;
  
  //loop que recorre cada pixel
  //coord x -> coord y -> cada formula -> cada polinomio
  for (let x = 0; x < width; x += step) {
    //cada x
    for (let y = 0; y < height; y += step) {
      //cada y
      for (let o = 0; o < polynomialFormula.length; o++) {
        //cada formula indiv
        result = 0;
        for (let i = 0; i < polynomialFormula[o].length; i++) {
          //cada polinomio
          result += evaluate(
            polynomialFormula[o][i],
            x - viewPort.x,
            y - viewPort.y,
            { ...variables } //pasa una copia
          );
        }
        
        //guardar el color del pixel
        nextColor = abs(result) * fact;
        
        //si es blanco no dibujar nada
        if (nextColor < 255) {
          fill(nextColor);
          square(x, y, step);
        }
        
        //dibujar ejes de coordenadas
        if (abs(x - viewPort.x) <= 5 || abs(y - viewPort.y) <= 5) {
          fill("rgb(89,141,89)");
          square(x, y, step);
        }
      }
    }
  }
  //fragmento innecesario
  textAlign(RIGHT)
  fill("black");
  textSize(15)
  text(
    "screen dimensions: " + width + "x" + height,
    width - 10,
    height - 10
  )
  text(
    "pixel sensibility: " + fact,
    width - 10,
    height - 30
  )
  text(
    "rendered graphs: " + polynomialFormula.length,
    width - 10,
    height - 50
  )
  text(
    "x: " + -round(viewPort.x - width / 2) + ", y: " + round(viewPort.y - height / 2),
    width - 10,
    height - 70
  );
  text(
    "fps: " + round(1000/deltaTime),
    width - 10,
    height - 90
  )
  //-----------
}

function evaluate(polinomi, x, y, vars) {
  // x = (x - viewPort.x)*zoom + viewPort.x
  // y = (y - viewPort.y)*zoom + viewPort.y
  //esta funcion se encarga de evaluar el valor de un solo polinomio
  //le pasas la x, y a evaluar y el objeto {vars} que contiene un diccionario con el valor de las variables creadas por el usuario
  
  //invierte el eje y porque el 0, 0 se encuentra en la esquina superior izquierda
  y *= -1;

  //resta de bools que se traduce en un integer
  let sign = polinomi.includes("+") - polinomi.includes("-");

  if (sign != 0) polinomi = polinomi.slice(1);
  else sign = 1;

  //extraer los numeros del polinomio
  let number = float(polinomi.replace(/\D/g, ""));
  if (Number.isNaN(number)) number = 1;

  polinomi = polinomi.slice(number.length);

  
  //1. busca todos los simbolos de elevar al cuadrado
  //2. por cada $ se eleva el valor anterior
  //3. si es x o y se multiplica pero si es una variable del usuariose busca si esa variable existe y luego se sobreescribe el valor por la version elevada
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

  //todas las variables se multiplican por el numero
  if (polinomi.includes("x")) number *= x;
  if (polinomi.includes("y")) number *= y;

  for (let u in vars) {
    if (polinomi.includes(u)) number *= vars[u];
  }

  number *= sign;
  return number;
}
function formulaToPolynomial(formula) {
  //la funcion se encarga de pasar el texto y pasarlo a polinomios
  //se asegura que no haya una igualdad para que se pueda comparar con 0
  
  //divide la formula por el "=" creando dos elementos de una lista
  let segments = formula.replace(/\s+/g, "").split("=");

  //divide el primer segmento en polinomios
  segments[0] = segments[0].split(/(?=[+-])/);
  
  if (segments.length == 2) { //se hay una igualdad en la formula original:
    
    //divide el segundo segmento en polinomios
    segments[1] = segments[1].split(/(?=[+-])/);
    
    //recorre cada polinomio pasandolo en su version inversa al segmento 1
    for (let i = 0; i < segments[1].length; i++) {
      let currentEval = segments[1][i];
      if (currentEval[0] == "-") currentEval = "+" + currentEval.slice(1);
      if (currentEval[0] == "+") currentEval = "-" + currentEval.slice(1);
      else currentEval = "-" + currentEval;
      segments[0].push(currentEval);
    
    }
  }
  
  //devuelve el primer segmento
  //deberia contener toda la formula igualada "= 0"
  return segments[0];
}
