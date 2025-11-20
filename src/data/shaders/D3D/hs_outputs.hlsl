

struct HS_OUTPUT_STANDARD
{
	float4 position_clip			: WORLDPOS;
#ifndef NOPIXELSHADER
	float4 texcoords				: TEXCOORD0;
	float4 position_vs				: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
	float4 color0					: TEXCOORD2;
	float4 instanceParam			: TEXCOORD3;
	
	#ifndef DEPTH_ONLY

		float4 hemisphere_dir_vs_and_unused	: TEXCOORD4;	// xyz: hemisphere lighting direction (unless NO_NORMALMAP, then nothing)
															// w:   unused
		float4 vpos_xyw_and_unused: TEXCOORD5;	// xyz: view space position.xyw (for terrain_heightmap, detail fade alpha)
																// w:   ambient intensity for HALFTONE
		float4 normal_vs_and_unused			: TEXCOORD6;

		#ifndef VERTEX_ONLY_LIGHTING
			float4 vertex_lighting				: TEXCOORD7;
		#endif
		#ifndef NO_NORMALMAP
			float3 tangent_vs				: COLOR0;		// view space tangent, range compressed
			float3 binormal_vs				: COLOR1;		// view space binormal, range compressed
		#else
			#ifdef SINGLE_DIRLIGHT
				float4 sdl_values			: COLOR0;		// N*L, L*R
			#elifdef VERTEX_ONLY_LIGHTING
				float4 diffuse_value			: COLOR0;		// alpha is specular_value
			#endif
			float4 backlight_params			: COLOR1;		// xy - backlight, zw - unused
		#endif
	#endif
#endif
};

struct HS_PatchConstOut
{
	float edgeTess[3]		: SV_TessFactor;
	float insideTess		: SV_InsideTessFactor;
#ifdef PN_TRIANGLES
	float3 pnControlNet[10]	: BLENDWEIGHT0;
#endif
};