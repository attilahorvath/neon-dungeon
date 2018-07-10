function componentCount(type) {
  switch (type) {
  case 'float':
    return 1;
  case 'vec2':
    return 2;
  case 'vec3':
    return 3;
  case 'vec4':
    return 4;
  case 'mat3':
    return 9;
  case 'mat4':
    return 16;
  }
}

function parseShader(combinedShaders, pattern) {
  let matchResult;
  const result = [];

  while ((matchResult = pattern.exec(combinedShaders)) !== null) {
    result.push(
      { name: matchResult[3], components: componentCount(matchResult[2]) }
    );
  }

  return result;
}

export default class Shader {
  constructor(gl, vertexShaderSource, fragmentShaderSource) {
    const combinedShaders = `${vertexShaderSource}\n${fragmentShaderSource}`;

    this.uniforms = parseShader(combinedShaders,
      /uniform\s+(\w+\s+)*(\w+)\s+(\w+)\s*;/g);
    this.attributes = parseShader(combinedShaders,
      /attribute\s+(\w+\s+)*(\w+)\s+(\w+)\s*;/g);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    for (const uniform of this.uniforms) {
      this[uniform.name] = gl.getUniformLocation(this.program, uniform.name);
    }

    for (const attribute of this.attributes) {
      this[attribute.name] = gl.getAttribLocation(this.program, attribute.name);
    }

    this.vertexSize = this.attributes
      .reduce((acc, attribute) => acc + attribute.components, 0);
  }

  use(gl) {
    gl.useProgram(this.program);

    let offset = 0;

    for (const attribute of this.attributes) {
      gl.enableVertexAttribArray(this[attribute.name]);
      gl.vertexAttribPointer(this[attribute.name], attribute.components,
        gl.FLOAT, false, this.vertexSize * 4, offset);

      offset += attribute.components * 4;
    }
  }
}
