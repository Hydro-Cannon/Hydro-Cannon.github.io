// Get the canvas and WebGL 2 context
import { setupText, resizeAspectRatio } from '../util/util.js';
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set initial canvas size
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Initialize WebGL settings
gl.viewport(0, 0, canvas.width, canvas.height);


// Set clear color to black
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Function to compile shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Function to create shader program
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}


async function init() {
    const vsSource = await fetch('vertexShader.glsl').then(res => res.text());
    const fsSource = await fetch('fragmentShader.glsl').then(res => res.text());
    setupText(canvas, "Use arrow keys to move the rectangle");
    const program1 = createProgram(gl, vsSource, fsSource);

    if (!program1) {
        console.error('Failed to create shader programs.');
        return;
    }

    gl.useProgram(program1);

    const offsetLoc = gl.getUniformLocation(program1, "uoffset");
    if (offsetLoc === null) {
        console.error('Uniform uoffset not found.');
        return;
    }   
    // Rectangle vertices
    const vertices = new Float32Array([
        //triangle 1
        -0.1, -0.1, 0.0,  // Bottom left
        0.1, -0.1, 0.0,  // Bottom right
        0.1,  0.1, 0.0,  // Top right
        -0.1,  0.1, 0.0,   // Top left
    ]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Create vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Link vertex data
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);


    startRendering(program1, vao, offsetLoc);
}

function startRendering(program1, vao, offsetLoc) {
    let offsetX = 0.0;
    let offsetY = 0.0;

    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false
    };

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program1);
        gl.bindVertexArray(vao);
        gl.uniform2f(offsetLoc, offsetX, offsetY);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    resizeAspectRatio(gl, canvas);
    window.addEventListener('resize', () => {
        requestAnimationFrame(render);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key in keys) {
            keys[e.key] = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            keys[e.key] = false;
            e.preventDefault();
        }
    });

    function animate() {
        const step = 0.01;
        if (keys.ArrowLeft)  offsetX -= step;
        else if (keys.ArrowRight) offsetX += step;
        else if (keys.ArrowUp)    offsetY += step;
        else if (keys.ArrowDown)  offsetY -= step;
        offsetX = Math.max(-0.9, Math.min(0.9, offsetX));
        offsetY = Math.max(-0.9, Math.min(0.9, offsetY));
        render();
        requestAnimationFrame(animate);
    }
    animate();
}

// Start rendering
init();