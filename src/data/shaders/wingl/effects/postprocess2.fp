!!ARBfp1.0

OPTION ARB_precision_hint_fastest;

TEMP texture0;
TEX texture0, fragment.texcoord[0], texture[0], 2D;

TEMP desat;

DP3 desat, texture0, {0.3, 0.4, 0.3, 0};
MUL desat, desat.x, {1.0, 0.6, 0.2}; # Sepia tone

LRP result.color.xyz, 0.8, desat, texture0;
MOV result.color.w, 1.0;

MOV result.color, texture0;
END
