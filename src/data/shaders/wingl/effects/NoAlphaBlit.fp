!!ARBfp1.0

OPTION ARB_precision_hint_fastest;

TEMP texture0;
TEX texture0, fragment.texcoord[0], texture[0], 2D;

# LRP texture0, texture0.w, texture0, {1.0, 0, 1.0, 1.0};

MOV texture0.w, 1;
MOV result.color, texture0;

END
