let formula = [];
let step = 10;
let fact = 0.1;
let viewPort = {
  // camara
  x: 0,
  y: 0,
};

let plotCircleSize = 30;

let zoom = 1;
let fixzoom = 0;
let realGridSize = 50;
let gridSize;

let polynomialFormula = [];
let inputData = [
  [], // filas
  [], // inputs
  [], // etiquetas
  [], // color
  [], // div
  [], // slider
  [], // boton de cerrar
];
let variables = {};
let slider;

let renderModeDescription = [
  "any equation (chunky)",
  "smooth limited (continuous)",
];

// el valor por el cual "y" se multiplica antes de renderizar
let finalMultiplier = [];

let renderMode = 1;
let showInfo = 0;

function setup() {
  console.log("setup");
  createCanvas(windowWidth, windowHeight);
  background(255);

  viewPort = {
    x: width / 2,
    y: height / 2,
  };

  createNewInput();
  inputData[6][0].hide()
  slider = createSlider(0.1, 10, 10, 0.1);

  noStroke();
  textSize(15);
  realGridSize = 128 * (1 / Math.pow(2, Math.round(Math.log2(zoom))));
  gridSize = realGridSize * zoom;

  // "cookies" (no son cookies) ---------------
  if (getItem("userWasHereBefore")) {
    console.log("user was here before");
    loadUserData();
  } else {
    console.log("user is new");
    storeItem("userWasHereBefore", "true");
    inputData[1][0].attribute("placeholder", "type here your formula");
    inputData[1][0].size(300);
  }
}
let userData = [];
function saveUserData() {
  console.log("SAVING...");
  userData = [];
  for (let i of inputData[1]) {
    userData.push(i.value());
  }
  console.log(userData);
  storeItem("userData", JSON.stringify(userData));
}
function loadUserData() {
  console.log("LOADING...");
  userData = JSON.parse(getItem("userData"));
  if (userData.length == 0) userData = [""];

  while (inputData[0].length != 0) {
    removeInput();
  }

  for (let i of userData) {
    createNewInput();
  }
  for (let i in inputData[1]) {
    inputData[1][i].value(userData[i]);
  }
  activateCorrectCloseButtons()
  processInput();
}

window.addEventListener("beforeunload", () => {
  saveUserData();
});

function createNewInput() {
  console.log("new input is being created");
  const fila = createDiv().addClass("fila");
  const inputs = createInput();
  const lable = createP("");
  const type = createColorPicker("black");
  const varDiv = createDiv().addClass("varDiv");
  const varSlider = createSlider(-10, 10, 0, 0.01);

  const closeButton = createButton("")
  
  
  //fila
  fila.parent("pack");

  //colorpicker
  type.parent(fila);
  type.class("color").hide();

  //varDiv
  varDiv.parent(fila);

  //input
  inputs.parent(varDiv);
  inputs.attribute("placeholder", "+");
  inputs.input(processInput);

  //slider
  const index = inputData[5].length;
  varSlider.parent(varDiv).hide();
  varSlider.input(() => changeVarValue(index, varSlider.value()));

  //lable
  lable.parent(fila);

  //boton de cerrar
  const indexB = inputData[6].length;
  closeButton.parent(fila)
  closeButton.class("closeButton")
  closeButton.mousePressed(() => removeInput(indexB))
  
  inputData[0].push(fila);
  inputData[1].push(inputs);
  inputData[2].push(lable);
  inputData[3].push(type);
  inputData[4].push(varDiv);
  inputData[5].push(varSlider);
  inputData[6].push(closeButton);
}
function removeInput(index = "last") {
  if (inputData[0].length < 1) return;
  if (index == inputData[0].length - 1) return;
  console.log("new input is being removed");
  if(index == "last"){
    const fila = inputData[0].pop()
    const inputs = inputData[1].pop()
    const lable = inputData[2].pop()
    const type = inputData[3].pop()
    const varDiv = inputData[4].pop()
    const varSlider = inputData[5].pop()
    const closeButton = inputData[6].pop()
    
    fila.remove();
    inputs.remove();
    lable.remove();
    type.remove();
    varDiv.remove();
    varSlider.remove();
    closeButton.remove();
    
  }else{
    const fila = inputData[0].splice(index,1)[0]
    const inputs = inputData[1].splice(index,1)[0]
    const lable = inputData[2].splice(index,1)[0]
    const type = inputData[3].splice(index,1)[0]
    const varDiv = inputData[4].splice(index,1)[0]
    const varSlider = inputData[5].splice(index,1)[0]
    const closeButton = inputData[6].splice(index,1)[0]
    
    fila.elt.style.transform = "translateX(-100vw)"
    setTimeout(() => { 
      fila.remove();
      inputs.remove();
      lable.remove();
      type.remove();
      varDiv.remove();
      varSlider.remove();
      closeButton.remove();
    }, 350)
    
    for(let i = index; i < inputData[0].length; i ++){
      inputData[6][i].mousePressed(() => removeInput(i))
    }
    processInput()
  }
}

// mouse && camera
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

function mouseWheel(event) {
  if (event.delta < 0) {
    zoom += (zoom / 50 / (1000 / deltaTime / 60)) * 4;
  } else {
    zoom -= (zoom / 50 / (1000 / deltaTime / 60)) * 4;
  }
  fixzoom = Math.log2(zoom)
  realGridSize = 128 * (1 / Math.pow(2, Math.round(fixzoom)));
  gridSize = realGridSize * zoom;
}

function draw() {
  // movimiento con las flechas
  if (keyIsDown(RIGHT_ARROW)) viewPort.x -= 4;
  if (keyIsDown(LEFT_ARROW)) viewPort.x += 4;
  if (keyIsDown(DOWN_ARROW)) viewPort.y -= 4;
  if (keyIsDown(UP_ARROW)) viewPort.y += 4;
  if (keyIsDown(187) && zoom < 200)
    zoom += zoom / 50 / (1000 / deltaTime / 60);
  if (keyIsDown(189) && zoom > 0.01)
    zoom -= zoom / 50 / (1000 / deltaTime / 60);

  // ---------- loop -------------------------------------------------
  if (keyIsDown(187) || keyIsDown(189)) {
    fixzoom = Math.log2(zoom)
    realGridSize = 128 * (1 / Math.pow(2, Math.round(fixzoom)));
    gridSize = realGridSize * zoom;
  }

  background(255);
  if (renderMode == 1) {
    stroke("black");
    strokeWeight(0.4);
    textAlign(LEFT);
    for (let x = 0; x < width + 50; x += gridSize) {
      line(x + (viewPort.x % gridSize), 0, x + (viewPort.x % gridSize), height);
      text(
        round(((x + (viewPort.x % gridSize) - viewPort.x) / zoom) * 100) / 100,
        x + (viewPort.x % gridSize) + 10,
        viewPort.y - 10
      );
    }
    for (let y = 0; y < height + 50; y += gridSize) {
      line(0, y + (viewPort.y % gridSize), width, y + (viewPort.y % gridSize));
      text(
        -round(((y + (viewPort.y % gridSize) - viewPort.y) / zoom) * 100) / 100,
        viewPort.x + 10,
        y + (viewPort.y % gridSize) - 10
      );
    }
  }

  drawFunction();
  // -----------------------------------------------------------------

  // crear nuevo input al ver que el ultimo ya esta lleno
  if (inputData[1][inputData[1].length - 1].value() != ""){
    createNewInput();
    activateCorrectCloseButtons()
  }
  // eliminar input
  if (inputData[0].length > 1 && inputData[1][inputData[1].length - 2].value() == ""){
    removeInput();
    activateCorrectCloseButtons()
  }
  // textAlign(BOTTOM)
  text(round(fixzoom * 5),10,height - 10)
}

function activateCorrectCloseButtons(){
  let lastInputIndex = inputData[6].length
  for(let i = 0; i < lastInputIndex; i ++){
    if(i == lastInputIndex - 1)
      inputData[6][i].hide()
    else
      inputData[6][i].show()
  }
}

function keyPressed() {
  if (key == "Escape") {
    document.activeElement.blur();
  }
  if (key == "ñ") {
    if (renderMode == 0) renderMode = 1;
    else if (renderMode == 1) renderMode = 0;
  }
  if (key == "i") {
    if (showInfo == 0) showInfo = 1;
    else if (showInfo == 1) showInfo = 0;
  }
}

// estas variables se crean aqui para no estar creando y destruyendo variables locales en cada for
// para optimizar
let lastFormula = "";
let varName = "";
let varValue = 0;
let toRenderAfter = [];

function processInput() {
  console.log("processInput");

  formula = [];
  polynomialFormula = [];
  variables = {};
  toRenderAfter = [];
  finalMultiplier = new Array(formula.length).fill(1);

  // extraer cada grupo de polinomios de cada input
  for (let i = 0; i < inputData[1].length; i++) {
    let inputType = "";
    // operar cada input
    lastFormula = inputData[1][i].value();
    formula.push(lastFormula); // carga en formula los valores

    // si contiene el prefijo "var" tratar como una variable y skippear el "analisis" de la formula
    if (lastFormula.slice(0, 3) == "var") {
      inputType = "var";
      lastFormula = lastFormula.slice(3);
      varName = lastFormula.replace(/[^a-zA-Z]/g, "").split("")[0];
      varValue = lastFormula.replace(/[^0-9.-]/g, "");

      if (varName == undefined && lastFormula.length == 0) varName = "z";

      if (varValue == "" && lastFormula.length == 0) varValue = 0;

      inputData[1][i].value("var " + varName + " = " + varValue);

      variables[varName] = float(varValue);

      if (inputData[5][i].value != varValue) inputData[5][i].value(varValue);

      if (inputData[5][i].elt.style.display === "none") inputData[5][i].show();
    } else if (inputData[5][i].elt.style.display !== "none")
      inputData[5][i].hide();

    // si contiene el prefijo "plot" tratar como un punto a dibujar
    if (lastFormula.slice(0, 4) == "plot") {
      inputType = "plot";

      lastFormula = lastFormula.slice(4);
      varName = lastFormula
        .split("=")[0]
        .replace(/[^a-zA-Z]/g, "")
        .split("")
        .join("");
      varValue = [0, 0];
      if (lastFormula.includes("(") && lastFormula.includes(")"))
        varValue = lastFormula.split("(")[1].split(")")[0].split(",");

      if (inputData[1][i].elt === document.activeElement) {
        if (varName == "" && varValue.length == 1) varName = "point";
        if (varValue.length != 2) varValue = [0, 0];
      }

      // recomponer la sintaxi
      inputData[1][i].value(
        "plot " + varName + " = (" + varValue[0] + "," + varValue[1] + ")"
      );

      if (varValue.length == 2) {
        varValue = [
          formulaToPolynomial(String(varValue[0]), i),
          formulaToPolynomial(String(varValue[1]), i),
        ];

        toRenderAfter.push({
          type: "plot",
          id: i,
          name: varName,
          value: varValue,
        });
      }
    }

    // analizar formula
    if (lastFormula != "")
      polynomialFormula.push(formulaToPolynomial(lastFormula, i));

    // si polynomialFormula es undefined, set to ""
    if (polynomialFormula[polynomialFormula.length - 1] == "undefined")
      polynomialFormula[polynomialFormula.length - 1] = "";

    // controlar si el selector de color esta visible o no
    if (
      inputType == "plot" ||
      (inputType == "" && polynomialFormula[i] != undefined)
    ) {
      if (inputData[3][i].elt.style.display === "none") inputData[3][i].show();
    } else {
      if (inputData[3][i].elt.style.display !== "none") inputData[3][i].hide();
    }

    // actualizar la etiqueta que muestra la evaluacion de la formula (si es debido)
    if (showInfo == 1) {
      if (i == inputData[2].length - 1) inputData[2][i].html("upToCreate");
      else if (polynomialFormula[i] == undefined)
        inputData[2][i].html("undefined");
      else inputData[2][i].html(polynomialFormula[i].join(" "));
    } else inputData[2][i].html("");
  }
}

function changeVarValue(n, value) {
  lastFormula = inputData[1][n].value();
  lastFormula = lastFormula.slice(3);
  varName = lastFormula.replace(/[^a-zA-Z]/g, "").split("")[0];
  inputData[1][n].value("var " + varName + " = " + value);
  processInput();
}

function drawFunction() {
  // se encarga de dibujar un frame

  // optimizacion
  let result = 0;
  let nextColor = 0;
  // solucion para poder dibujar cada funcion, guarda cada punto y de cada x en la lista para luego poder hacer la linea seguida
  let lastPointX = new Array(formula.length).fill(0);
  let lastPointY = new Array(formula.length).fill(0);

  // evaluacion por pixel ->
  if (renderMode == 0) {
    // --------------------------------------
    console.log("using old render");
    fact = slider.value();
    // loop que recorre cada pixel
    // coord x -> coord y -> cada formula -> cada polinomio
    for (let x = 0; x < width; x += step) {
      // cada x
      for (let y = 0; y < height; y += step) {
        // cada y
        for (let o = 0; o < polynomialFormula.length; o++) {
          // cada formula indiv

          let copyVariables = { ...variables };
          result = 0;
          for (let i = 0; i < polynomialFormula[o].length; i++) {
            // cada polinomio
            result += evaluate(
              polynomialFormula[o][i],
              x - viewPort.x,
              y - viewPort.y,
              copyVariables
            );
          }

          // guardar el color del pixel
          nextColor = abs(result) * fact;

          // si es blanco no dibujar nada
          if (nextColor < 255) {
            fill(nextColor);
            square(x, y, step);
          }
        }
        // dibujar ejes de coordenadas
        if (abs(x - viewPort.x) <= 5 || abs(y - viewPort.y) <= 5) {
          fill("rgb(89,141,89)");
          square(x, y, step);
        }
      }
    }
  }

  // evaluacion por x ->
  if (renderMode == 1) {
    // --------------------------------------
    push();

    stroke("black");
    strokeWeight(0.4);

    //dibujar eje de cordenadas
    strokeWeight(4);
    stroke("rgb(89,141,89)");
    line(viewPort.x, 0, viewPort.x, height);
    line(0, viewPort.y, width, viewPort.y);
    strokeWeight(5);

    stroke("black");

    //recorrer cada x
    for (let x = 0; x < width; x += step / 4) {
      //recorrer cada formula
      for (let o = 0; o < polynomialFormula.length; o++) {
        if (finalMultiplier[o] == "" || finalMultiplier[o] == undefined) {
          continue;
        }
        let copyVariables = { ...variables };
        result = 0;

        // cada formula indiv
        for (let i = 0; i < polynomialFormula[o].length; i++) {
          // cada polinomio
          result += evaluate(
            polynomialFormula[o][i],
            (x - viewPort.x) / zoom,
            0,
            copyVariables // pasa una copia
          );
        }

        result *= zoom;

        if (result != 0) result /= finalMultiplier[o];
        //si x es igual a 0 duplicar punto dos veces
        if (x == 0) {
          lastPointX[o] = x;
          lastPointY[o] = result + viewPort.y;
        }

        //dibujar el segmento
        stroke(inputData[3][o].color());
        // console.log(inputData[3][0].color())
        line(lastPointX[o], lastPointY[o], x, result + viewPort.y);

        lastPointX[o] = x;
        lastPointY[o] = result + viewPort.y;
      }
    }
    pop();
  }

  // afterRender (encargado de dibujar puntos y en un futuro mas objetos de la interfaz)
  push();
  let incomingY, incomingX;
  for (let i of toRenderAfter) {
    if (i.type == "plot") {
      let copyVariables = { ...variables };
      result = 0;
      for (let u = 0; u < i.value[0].length; u++) {
        // cada polinomio
        result += evaluate(i.value[0][u], 0, 0, copyVariables);
      }
      incomingX = result;

      copyVariables = { ...variables };
      result = 0;
      for (let u = 0; u < i.value[1].length; u++) {
        // cada polinomio
        result += evaluate(i.value[1][u], 0, 0, copyVariables);
      }
      incomingY = result;

      textAlign(CENTER);
      textStyle(BOLD);
      textSize(20);
      strokeWeight(2);
      //i.id es la id
      fill(inputData[3][i.id].color());
      stroke("white");
      if (i.name != undefined)
        text(
          i.name,
          float(incomingX) * zoom + viewPort.x,
          -float(incomingY) * zoom + viewPort.y + 30
        );
      // i.value corresponde a una lista con coordenadas -> [40,80]
      // stroke("black")
      circle(
        float(incomingX) * zoom + viewPort.x,
        -float(incomingY) * zoom + viewPort.y,
        plotCircleSize
      );
      noStroke();
      // console.log("wanna draw a point at: " + i.value + ", with the name: " + i.name)
    }
  }
  pop();

  // mostrar informacion
  if (showInfo == 1) {
    textAlign(RIGHT);
    noStroke();
    fill("black");
    i = 10;
    text(
      "render mode (toggle ñ): " + renderModeDescription[renderMode],
      width - 10,
      height - i
    );
    i += 20;
    text("screen dimensions: " + width + "x" + height, width - 10, height - i);
    i += 20;
    text("pixel sensibility: " + fact, width - 10, height - i);
    i += 20;
    text(
      "rendered graphs: " + polynomialFormula.length,
      width - 10,
      height - i
    );
    i += 20;
    text(
      "x: " +
        -round(viewPort.x - width / 2) +
        ", y: " +
        round(viewPort.y - height / 2),
      width - 10,
      height - i
    );
    i += 20;
    text("fps: " + round(1000 / deltaTime), width - 10, height - i);
  }
  // -----------
}

// ------------ procesamiento de formulas ------------------

// estas variables se crean aqui para no estar creando y destruyendo variables locales en cada for
// para optimizar
let sign;
let number;
function evaluate(polinomi, x, y, vars) {
  // esta funcion se encarga de evaluar el valor de un solo polinomio
  // le pasas la x, y a evaluar y el objeto {vars} que contiene un diccionario con el valor de las variables creadas por el usuario

  // invierte el eje y porque el 0, 0 se encuentra en la esquina superior izquierda
  y *= -1;

  // resta de bools que se traduce en un integer
  sign = polinomi.includes("+") - polinomi.includes("-");

  if (sign != 0) polinomi = polinomi.slice(1);
  else sign = 1;

  // extraer los numeros del polinomio
  number = float(polinomi.replace(/\D/g, ""));
  if (Number.isNaN(number)) number = 1;

  polinomi = polinomi.slice(number.length);

  // 1. busca todos los simbolos de elevar al cuadrado
  // 2. por cada $ se eleva el valor anterior
  // 3. si es x o y se multiplica pero si es una variable del usuariose busca si esa variable existe y luego se sobreescribe el valor por la version elevada
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

  // todas las variables se multiplican por el numero
  if (polinomi.includes("x")) number *= x;
  if (polinomi.includes("y")) number *= y;

  for (let u in vars) {
    if (polinomi.includes(u)) number *= vars[u];
  }

  number *= sign;
  return number;
}

// estas variables se crean aqui para no estar creando y destruyendo variables locales en cada "for"
// para optimizar
let segments;
let currentEval;
let yPolynoms;

function formulaToPolynomial(formula, index = 1) {
  // la funcion se encarga de pasar el texto y pasarlo a polinomios
  // se asegura que no haya una igualdad para que se pueda comparar con 0

  // divide la formula por el "=" creando dos elementos de una lista
  segments = formula.replace(/\s+/g, "").split("=");

  // divide el primer segmento en polinomios
  segments[0] = segments[0].split(/(?=[+-])/);

  if (segments.length == 2) {
    // si hay una igualdad en la formula original:

    // divide el segundo segmento en polinomios
    segments[1] = segments[1].split(/(?=[+-])/);

    // recorre cada polinomio pasandolo en su version inversa i al segmento 1
    for (let i = 0; i < segments[1].length; i++) {
      currentEval = segments[1][i];
      if (currentEval[0] == "-") currentEval = "+" + currentEval.slice(1);
      else if (currentEval[0] == "+") currentEval = "-" + currentEval.slice(1);
      else currentEval = "-" + currentEval;
      segments[0].push(currentEval);
    }
  }

  // si renderMode == 0 devuelve el primer segmento
  // deberia contener toda la formula igualada "= 0"

  // si renderMode != 0 continua para aislar la y
  // deberia contener toda la formula igualada a "= y"

  if (renderMode == 0) {
    return segments[0];
  }

  yPolynoms = [];
  for (let i in segments[0]) {
    if (segments[0][i].includes("y")) {
      yPolynoms.push(segments[0][i]);
      segments[0].splice(i, 1);
    }
  }
  if (yPolynoms != "" && yPolynoms[0].includes("-")) {
    for (let i in segments[0]) {
      currentEval = segments[0][i];
      if (currentEval[0] == "-") currentEval = "+" + currentEval.slice(1);
      else if (currentEval[0] == "+") currentEval = "-" + currentEval.slice(1);
      else currentEval = "-" + currentEval;
      segments[0][i] = currentEval;
    }
  }
  if (yPolynoms != "") {
    number = float(yPolynoms[0].replace(/\D/g, ""));
    if (Number.isNaN(number)) number = 1;
    finalMultiplier[index] = number;
  }
  return segments[0];
}
