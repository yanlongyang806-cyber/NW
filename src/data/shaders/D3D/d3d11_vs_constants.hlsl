
// If any changes are made to the offsets in this file, make sure the changes are reflected in d3d9_vs_constants.hlsl
// Also in VsConstantBufferSizeEnum contained in rt_xstate.h
// If creating a new buffer, then it must be reflected in

// 7 registers
cbuffer SkyBuffer : register( b0 )
{
	uniform float3 sky_dome_direction_vs				: packoffset(c0);
	uniform float4 sky_dome_color_front					: packoffset(c1);
	uniform float4 sky_dome_color_back					: packoffset(c2);
	uniform float3 sky_dome_color_side					: packoffset(c3);

	uniform float4 fog_color_low						: packoffset(c4);	// For parameters for per-vertex fogging
	uniform float4 fog_color_high						: packoffset(c5);
	uniform float4 fog_dist								: packoffset(c6);
}

// 10 registers
cbuffer PerFrame : register( b1 )
{
	uniform float4x4 view_mat							: packoffset(c0);		// world -> view space

	uniform float4 screen_size							: packoffset(c4);	// (width, height, 1/width, 1/height)
	uniform float4 postprocess_tex_size					: packoffset(c5);	// (width, height, 1/virtual_width, 1/virtual_height)
	uniform float3 morph_and_vlight						: packoffset(c6);	// (morph amt, vlight multiplier, vlight offset)

	uniform float4 view_to_world_Y						: packoffset(c7);
	uniform float2 fog_height_params					: packoffset(c8);	// [low, 1/(high-low)]

	uniform float3 ambient_light						: packoffset(c9);
}

// 23 registers
cbuffer PerObject : register( b2 )
{
	uniform float4x4 projection_mat						: packoffset(c0);	// view -> clip space	(Objects may have force far depth, this goes here)
	uniform float4x4 modelview_mat						: packoffset(c4);	// model -> view space
	uniform float4x4 model_mat							: packoffset(c8);	// c25 - c28 : model -> world space
	uniform float2 xbox_instance_params					: packoffset(c12);	// (indices per object, index offset)
	#ifdef HAS_SKIN || HAS_BEND
		uniform float3 basepose_offset					: packoffset(c13);	// model -> basepose
	#else
		uniform float3 camera_position_vs				: packoffset(c13);	// camera position in viewspace, 0 only for the visual pass
	#endif

	uniform float4 color0								: packoffset(c14);
	uniform float4 vertex_light_params[8]				: packoffset(c15); // c32 - c39
}

// 5 registers
cbuffer SpecialObject : register( b3 )
{
	uniform float3 world_tex_params[2]					: packoffset(c0); // c40 - c41

	uniform float4 global_instance_param				: packoffset(c2);

	uniform float4 global_wind_params					: packoffset(c3);	// wind parameters for vertex shader wind
	uniform float4 exposure_transform					: packoffset(c4);
}

// 5 registers
cbuffer SpecialParameters : register( b4 )
{
#ifdef TERRAIN_HEIGHTMAP
	// Terrain constants
	uniform float4 terrain_lods							: packoffset(c0);	// use the general purpose registers
	uniform float4 terrain_color_and_geo_size			: packoffset(c1);	// use the general purpose registers

#endif


#ifdef ALPHA_FADE_PLANE
	uniform float4 alpha_fade_plane						: packoffset(c0);	// use the general purpose registers (plane equation)

	uniform float4x4 tex_splat_mat						: packoffset(c1);	// c46 - c49 use the general purpose registers (splat projection matrix)
#else

	#ifdef VS_TEXCOORD_SPLAT
		uniform float4x4 tex_splat_mat					: packoffset(c0);	// c45 - c48 use the general purpose registers (splat projection matrix)
	#endif

#endif

#ifdef STARFIELD
	// Starfield constants
	uniform float4 star_params							: packoffset(c0);	// use the general purpose registers

#endif
}

//--------------------
// 156 registers
cbuffer fastParticleAndAnimation : register( b5 )
{
#ifdef HAS_SKIN || HAS_BEND || CYLINDER_TRAIL
	uniform float4    bone_palette_as_float[156]		: packoffset(c0); // c50 - 205
#endif

#ifdef CYLINDER_TRAIL
	uniform float4    bone_constants[156]				: packoffset(c0); // c50 - 205
#endif

#ifdef FAST_PARTICLE
	uniform row_major float4x4 color					: packoffset(c0);
	uniform row_major float4x4 color_jitter				: packoffset(c4);
	uniform row_major float4x4 color_time				: packoffset(c8);

	uniform row_major float4x4 scale_rot				: packoffset(c12);
	uniform row_major float4x4 scale_rot_jitter			: packoffset(c16);
	uniform row_major float4x4 scale_rot_time			: packoffset(c20);
	uniform float4 color_time_scale						: packoffset(c24);
	uniform float4 scale_rot_time_scale					: packoffset(c25);
	uniform float4 tex_params							: packoffset(c26);
	uniform float4 spin_integrals						: packoffset(c27);
	uniform float4 scroll_and_animation					: packoffset(c28);
	uniform float4 more_params							: packoffset(c29);
	uniform float4 time_info							: packoffset(c30);
	uniform float4 scale_info							: packoffset(c31);
	uniform float4 hsv_info								: packoffset(c32);
	uniform float4 modulate_color						: packoffset(c33);

	#ifdef _PS3
		uniform float3x4 at_nodes[16]					: packoffset(c34);
	#else
		uniform float4x3 at_nodes[16]					: packoffset(c34);
	#endif
#endif
}