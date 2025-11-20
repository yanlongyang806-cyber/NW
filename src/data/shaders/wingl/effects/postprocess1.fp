!!ARBfp1.0

OPTION ARB_precision_hint_fastest;

TEMP depth;
TEMP depthDD;
TEMP depthFD;
TEMP textureOffset;

PARAM edgeColor = program.local[0];

# Sample the depth texture
ADD textureOffset, fragment.texcoord[0], { -0.0015625000000000001, 0.0 };
TEX depthDD.x, textureOffset, texture[2], 2D;

ADD textureOffset, fragment.texcoord[0], { 0.0, -0.0020833333333333333  };
TEX depthDD.y, textureOffset, texture[2], 2D;

TEX depth.xyz, fragment.texcoord[0], texture[2], 2D;

ADD textureOffset, fragment.texcoord[0], { 0.0015625000000000001, 0.0 };
TEX depthFD.x, textureOffset, texture[2], 2D;

ADD textureOffset, fragment.texcoord[0], { 0.0, 0.0020833333333333333 };
TEX depthFD.y, textureOffset, texture[2], 2D;

MAD depth.xy, depth, { -2.0, -2.0 }, depthFD;
ADD depth.xy, depth, depthDD;


# sum the gradients, then expand [ 0.25, 1.0 ] interval to fill [0,1], and clamp it:
# depth = abs( depth )
ABS depth, depth;
# depth.x = ( ( depth.x + depth.y ) * 12000 - 0.25 ) / 0.75;
ADD depth.x, depth.x, depth.y;
MUL depth.x, depth.x, 12000.0;
SUB depth.x, depth.x, 0.25;
MUL_SAT depth.x, depth.x, 1.33333333;

MOV result.color.xyz, edgeColor;

MOV result.color.w, depth.x;
# Debug: display some of the edge calculations
# MUL result.color.rg, depth, { 12000.0, 12000.0 };

# PARAM debug_color = {0.5, 0.9, 0.5, 1.0};
# MOV result.color, debug_color;

END
