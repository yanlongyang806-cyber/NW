!!ARBfp1.0

OPTION ARB_precision_hint_fastest;
#ifdef USE_ARB_FOG
OPTION ARB_fog_linear;
#endif

#ifdef DEFERRED_LIGHTING
#ifdef ATI
	OPTION ATI_draw_buffers;
#else
	OPTION ARB_draw_buffers;
#endif
#endif

#include "utils.fph"
#include "fpparams.fph"
#include "PointLight.fph"
#include "DirectionalLight.fph"


# PARAM	f_position_vs	= fragment.texcoord[1];
# PARAM	f_normal_vs		= fragment.texcoord[2];

# #ifdef HAS_BUMP
# 	PARAM	f_tangent_vs	= fragment.texcoord[3];
# 	PARAM	f_binormal_vs	= fragment.texcoord[4];
# #endif

%PARAMS%

%TEMPS%

%CODE%

# Parameters from snippets, need to get passed on down for deferred rendering
#   %LitColor% - color to be lit
#   %Normal% - normal in tangent space
#   %UnlitColor% - color to be added
#   %SpecularExponent% - power of specular over 128
#   %SpecularValue% - glossiness
#   %SpecularColor% - specular color

TEMP N_vs;

#ifdef HAS_BUMP
	TEMP N_ts;
	MOV N_ts, %Normal%;
	FROMTANGENTSPACE(N_vs, fragment.texcoord[3], fragment.texcoord[4], fragment.texcoord[2], N_ts)
	NORMALIZE(N_vs)
#else
	#ifdef SHOWNORMALS
		TEMP N_ts;
		MOV N_ts, {0, 0, 1, 0};
	#endif
	MOV N_vs, fragment.texcoord[2];
#endif


# #########################################################
# compute colors

TEMP albedo, unlit_color, spec_color;

MOV albedo, %LitColor%;

MAD unlit_color.xyz, %LitColor%, ambientColor, %UnLitColor%;
MAX unlit_color.w, %LitColor%, %UnLitColor%;

MUL spec_color, %SpecularColor%, %SpecularValue%;

#ifndef NoAlphaCutout
	#ifndef SHOWALPHA
		SGE unlit_color.w, unlit_color.w, 0.6;
	#endif
#endif
#ifdef HANDLES_COLOR_TINT
	MUL unlit_color.w, unlit_color.w, color0.w;
#else
	MUL unlit_color, unlit_color, color0;
	MUL albedo, albedo, color0;
#endif

#ifndef NOALPHAKILL
	# kill the fragment if the alpha is 0
	SUB N_vs.w, unlit_color.w, 0.001;
	KIL N_vs.w;
#endif

# fog multiplier
TEMP fog;
SUB fog.x, state.fog.params.z, fragment.fogcoord.x;
MUL_SAT fog.x, state.fog.params.w, fog.x;

#ifdef DEFERRED_LIGHTING

	# store fog inverse in fog.y
	SUB fog.y, 1, fog.x;

	# fogged unlit color
	MUL unlit_color, fog.x, unlit_color;
	MAD result.color[0].xyz, fog.y, state.fog.color, unlit_color;

	# specular color * gloss * fogmultiplier
	MUL result.color[3].xyz, spec_color, fog.x;

	# specular exponent
	MOV result.color[3].w, %SpecularExponent%;

	# normal
#	MOV result.color[1].xy, N_vs;
	RANGECOMPRESS(result.color[1].xy, N_vs)
	SLT result.color[2].w, N_vs.z, 0; # output 1 if z < 0

	# albedo * fogmultiplier
	MUL result.color[2].xyz, albedo, fog.x;

#else

	TEMP temp1, temp2, temp3;
	ALIAS outColor = unlit_color;

	#ifdef DIRECTIONAL_LIGHTING
		DIRECTIONAL_LIGHT(outColor, fragment.texcoord[1], N_vs, albedo, spec_color, %SpecularExponent%, temp1, temp2, temp3)
	#endif

	#ifdef POINT_LIGHTING
		POINT_LIGHT(outColor, fragment.texcoord[1], N_vs, albedo, spec_color, %SpecularExponent%, temp1, temp2, temp3)
	#endif

	# outColor.xyz = lerp(fogcolor.xyz, outColor.xyz, fogamount);
	LRP outColor.xyz, fog.x, outColor, state.fog.color;

	#ifdef SHOWALPHA
		LRP outColor.xyz, outColor.w, {1, 0, 0, 1}, {0, 1, 1, 1};
	#endif

	#ifdef SHOWNORMALS
		MOV outColor.xyz, N_vs;
	#endif

	MOV result.color, outColor;

#endif

#ifdef TEXCOORDS0
	FRC result.color.xy, fragment.texcoord[0];
	MOV result.color.z, 0;
#endif

END
