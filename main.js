const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImg = document.querySelector(".save-img"),
    undo = document.querySelector(".undo"),
    redo = document.querySelector(".redo"),
    ctx = canvas.getContext("2d");


// Creates array of currentstates
let history = [];
let currentState = -1;

//Starting conditions for loading page
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool ="brush",
brushWidth = 5,
selectedColor = "#000";


//Sets starting canvas
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;

    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    currentState++;
}
//Makes the mouse alling with the drawing on canvas
window.addEventListener("load", () =>{
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
})
//Rectangle drawing function
const drawRect = (e) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

//Circle drawing function
const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ?ctx.fill() : ctx.stroke();
}

//Triangle drawing fuction
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY)
    ctx.closePath();
    fillColor.checked ?ctx.fill() : ctx.stroke();
}

//drawing function
const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;


    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//Determine which function to use when drawing
const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else {
        drawTriangle(e);
    }
}
//Undo
const undoLastAction = () => {
    if (currentState > 0) {
        currentState--;
        ctx.putImageData(history[currentState], 0, 0);
    }
}
//redo
const redoLastAction = () => {
    if (currentState < history.length - 1) {
        currentState++;
        ctx.putImageData(history[currentState], 0, 0);
    }
}
//Selects the tool and makes it active
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});

//Sizeslider for brush width
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

//Color button
colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});
//the color picker
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});
//Clear canvas function
clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();

    // Save the state after clearing
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    currentState++;
});
//Save as image function
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});
//undo
undo.addEventListener("click", undoLastAction);

document.addEventListener("keydown", function (event){
    if (event.ctrlKey && event.key === "z") {
        undoLastAction();
    }
});
//redo
redo.addEventListener("click", redoLastAction);
document.addEventListener("keydown", function (event){
    if (event.ctrlKey && event.key === "x") {
        redoLastAction();
    }
});

//Start draw
canvas.addEventListener("mousedown", startDraw);
//Draw
canvas.addEventListener("mousemove", drawing);
//Stop draw and save to history
canvas.addEventListener("mouseup", () => {
    isDrawing = false;

    if (currentState < history.length - 1) {
        history = history.slice(0, currentState + 1);
    }
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    currentState++;
});

