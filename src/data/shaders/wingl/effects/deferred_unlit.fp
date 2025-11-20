!!ARBfp1.0

OPTION ARB_precision_hint_fastest;

#include "utils.fph"
#include "fpparams.fph"
#include "DirectionalLight.fph"
#include "PointLight.fph"

TEMP mrt0, mrt1, mrt2, mrt3;
TEMP depth, outColor;

TEX mrt0, fragment.texcoord[0], texture[0], 2D;
TEX mrt1, fragment.texcoord[0], texture[1], 2D;
TEX mrt2, fragment.texcoord[0], texture[2], 2D;
TEX mrt3, fragment.texcoord[0], texture[3], 2D;
TEX depth.x, fragment.texcoord[0], texture[4], 2D;

MOV outColor, mrt0; # unlit color

#ifdef DIRECTIONAL_LIGHTING

	TEMP normal_vs, position_vs, temp1, temp2, temp3;
	
	EXTRACT_NORMAL(normal_vs, mrt1, mrt2.w)
	EXTRACT_POSITION(position_vs, depth.x, fragment.texcoord[0], inv_proj_mat, temp1)
	DIRECTIONAL_LIGHT(outColor, position_vs, normal_vs, mrt2, mrt3, mrt3.w, temp1, temp2, temp3)

#endif

#ifdef POINT_LIGHTING

	TEMP normal_vs, position_vs, temp1, temp2, temp3;
	
	EXTRACT_NORMAL(normal_vs, mrt1, mrt2.w)
	EXTRACT_POSITION(position_vs, depth.x, fragment.texcoord[0], inv_proj_mat, temp1)
	POINT_LIGHT(outColor, position_vs, normal_vs, mrt2, mrt3, mrt3.w, temp1, temp2, temp3)

#endif

MOV result.color.xyz, outColor;
MOV result.color.w, 1.0;
MOV result.depth, depth.x;

END
