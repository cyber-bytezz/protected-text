#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p,vec2(127.1,311.7)), 
                 dot(p,vec2(269.5,183.3)), 
                 dot(p,vec2(419.2,371.9)));
    return fract(sin(q)*43758.5453);
}

vec3 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);

    vec3 m = vec3(8.0);
    for(int j=-2; j<=2; j++)
    for(int i=-2; i<=2; i++) {
        vec2 g = vec2(float(i),float(j));
        vec3 o = hash3(n + g);
        vec2 r = g + 0.5 + 0.5*sin(u_time + 6.2831*o);
        float d = length(r - f);
        if( d<m.x ) {
            m = vec3(d, o.y, o.z);
        }
    }
    return m;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy)/u_resolution.y;
    uv *= 1.0 + 0.5*sin(0.5*u_time);
    
    vec3 c = voronoi(8.0*uv + 0.5*u_mouse);
    
    float f = smoothstep(0.0, 0.5, c.x);
    vec3 col = 0.5 + 0.5*sin(c.y*3.0 + c.z*6.0 + 5.0*vec3(0.0,1.0,2.0));
    col *= mix(1.0, 0.3, f);
    
    gl_FragColor = vec4(col,1.0);
}