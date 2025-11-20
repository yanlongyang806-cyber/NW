!!ARBfp1.0

OPTION ARB_precision_hint_fastest;

#include "utils.fph"
#include "fpparams.fph"
#include "DirectionalLight.fph"
#include "PointLight.fph"

TEMP mrt0, mrt1, mrt2, mrt3;
TEMP depth, outColor;
TEMP texcoord;

RCP texcoord.w, fragment.texcoord[0].w;
MUL texcoord, fragment.texcoord[0], texcoord.w;

TEX mrt0, texcoord, texture[0], 2D;
TEX mrt1, texcoord, texture[1], 2D;
TEX mrt2, texcoord, texture[2], 2D;
TEX mrt3, texcoord, texture[3], 2D;
TEX depth.x, texcoord, texture[4], 2D;

MOV outColor, 0;

#ifdef DIRECTIONAL_LIGHTING

	TEMP normal_vs, position_vs, temp1, temp2, temp3;
	
	EXTRACT_NORMAL(normal_vs, mrt1, mrt2.w)
	EXTRACT_POSITION(position_vs, depth.x, texcoord, inv_proj_mat, temp1)
	DIRECTIONAL_LIGHT(outColor, position_vs, normal_vs, mrt2, mrt3, mrt3.w, temp1, temp2, temp3)

#endif

#ifdef POINT_LIGHTING

	TEMP normal_vs, position_vs, temp1, temp2, temp3;
	
	EXTRACT_NORMAL(normal_vs, mrt1, mrt2.w)
	EXTRACT_POSITION(position_vs, depth.x, texcoord, inv_proj_mat, temp1)
	POINT_LIGHT(outColor, position_vs, normal_vs, mrt2, mrt3, mrt3.w, temp1, temp2, temp3)

#endif

MOV result.color.xyz, outColor;
MOV result.color.w, 1.0;

END
