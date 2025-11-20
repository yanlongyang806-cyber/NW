// HAS_SKIN in this is only temporary for testing purposes

struct VS_OUTPUT_NORMAL
{
#ifdef TESSELLATION
	float4 position_clip				: WORLDPOS;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
#else
	float4 position_clip				: SV_POSITION;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
#endif
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
		float4 normal_vs_and_unused			: TEXCOORD6;	// xyz: view space normal (x is distance to plane for ALPHA_FADE_PLANE)
															// w:   unused

		#ifndef VERTEX_ONLY_LIGHTING
			float4 vertex_lighting				: TEXCOORD7;
		#endif
		#ifndef NO_NORMALMAP
			float3 tangent_vs				: COLOR0;		// view space tangent, range compressed
			float3 binormal_vs				: COLOR1;		// view space binormal, range compressed
		#else
			#ifdef SINGLE_DIRLIGHT
				#ifdef SM30
					float4 sdl_values			: COLOR0;		// N*L, L*R
				#else
					float4 diffuse_value		: COLOR0;		// alpha is specular_value
				#endif
			#elifdef VERTEX_ONLY_LIGHTING
				float4 diffuse_value			: COLOR0;		// alpha is specular_value
			#endif
			float4 backlight_params			: COLOR1;		// xy - backlight, zw - unused
		#endif
	#endif
#endif
};

struct VS_OUTPUT_SPRITE
{
#ifdef TESSELLATION
	float4 position_clip			: WORLDPOS;
#else
	float4 position_clip			: SV_POSITION;
#endif
	#ifdef POSTPROCESSING
		float4 texcoord				: TEXCOORD0;
	#endif
	float4 position_vs			: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
	
	#ifndef POSTPROCESSING
		float4 color0				: TEXCOORD2;	// matches VS_OUTPUT_NORMAL to allow mixing normal VS and sprite PS for particles
	#endif
	#ifdef CYLINDER_TRAIL
		//float3 center_vs			: TEXCOORD3;
		//float  radius_vs			: TEXCOORD4;
	#endif
};

struct VS_OUTPUT_PARTICLE
{
#ifdef TESSELLATION
	float4 position_clip			: WORLDPOS;
#else
	float4 position_clip			: SV_POSITION;
#endif
	// First to match PS_INPUT_NORMAL and PS_INPUT_PARTICLE ordering for DX11
	//float4 unused				: TEXCOORD4;	// xyz: unused
	//											// w:   unused
	float4 vpos_xyw_and_unused	: TEXCOORD5;	// xyz: view space position.xyw
												// w:   unused
	//float4 unused				: TEXCOORD6;	// xyz: unused
	//											// w:   unused

	float4 position_vs			: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
	float2 texcoord				: TEXCOORD0;
	float4 color				: TEXCOORD2;
	float4 fogvalues			: TEXCOORD3;
	
};