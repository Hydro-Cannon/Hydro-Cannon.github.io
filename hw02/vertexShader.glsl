#version 300 es
layout(location = 0) in vec3 aPos;
uniform vec2 uoffset;

void main() {
    gl_Position = vec4(aPos.xy + uoffset, aPos.z, 1.0);
}