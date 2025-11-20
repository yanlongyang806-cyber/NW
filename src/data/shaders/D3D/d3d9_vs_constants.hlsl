
// If any changes are made to the offsets in this file, make sure the changes are reflected in d3d11_vs_constants.hlsl
// Also in VsConstantBufferSizeEnum contained in rt_xstate.h





	uniform float3 sky_dome_direction_vs				: register(c0);
	uniform float4 sky_dome_color_front					: register(c1);
	uniform float4 sky_dome_color_back					: register(c2);
	uniform float3 sky_dome_color_side					: register(c3);

	uniform float4 fog_color_low						: register(c4);	// For parameters for per-vertex fogging
	uniform float4 fog_color_high						: register(c5);
	uniform float4 fog_dist								: register(c6);





	uniform float4x4 view_mat							: register(c7);		// world -> view space

	uniform float4 screen_size							: register(c11);	// (width, height, 1/width, 1/height)
	uniform float4 postprocess_tex_size					: register(c12);	// (width, height, 1/virtual_width, 1/virtual_height)
	uniform float3 morph_and_vlight						: register(c13);	// (morph amt, vlight multiplier, vlight offset)

	uniform float4 view_to_world_Y						: register(c14);
	uniform float2 fog_height_params					: register(c15);	// [low, 1/(high-low)]

	uniform float3 ambient_light						: register(c16);





	uniform float4x4 projection_mat						: register(c17);	// view -> clip space	(Objects may have force far depth, this goes here)
	uniform float4x4 modelview_mat						: register(c21);	// model -> view space
	uniform float4x4 model_mat							: register(c25);	// c25 - c28 : model -> world space
	uniform float2 xbox_instance_params					: register(c29);	// (indices per object, index offset)
	#ifdef HAS_SKIN || HAS_BEND
		uniform float3 basepose_offset					: register(c30);	// model -> basepose
	#else
		uniform float3 camera_position_vs				: register(c30);	// camera position in viewspace, 0 only for the visual pass
	#endif

	uniform float4 color0								: register(c31);
	uniform float4 vertex_light_params[8]				: register(c32); // c32 - c39





	uniform float3 world_tex_params[2]					: register(c40); // c40 - c41

	uniform float4 global_instance_param				: register(c42);

	uniform float4 global_wind_params					: register(c43);	// wind parameters for vertex shader wind
	uniform float4 exposure_transform					: register(c44);





#ifdef TERRAIN_HEIGHTMAP
	// Terrain constants
	uniform float4 terrain_lods							: register(c45);	// use the general purpose registers
	uniform float4 terrain_color_and_geo_size			: register(c46);	// use the general purpose registers
	uniform float4 terrain_padding[3]					: register(c47);	// use the general purpose registers
#endif


#ifdef ALPHA_FADE_PLANE
	uniform float4 alpha_fade_plane						: register(c45);	// use the general purpose registers (plane equation)

	uniform float4x4 tex_splat_mat						: register(c46);	// c46 - c49 use the general purpose registers (splat projection matrix)

#else
	#ifdef VS_TEXCOORD_SPLAT
		uniform float4x4 tex_splat_mat					: register(c45);	// c45 - c48 use the general purpose registers (splat projection matrix)
	#endif
#endif


#ifdef STARFIELD
	// Starfield constants
	uniform float4 star_params							: register(c45);	// use the general purpose registers
	uniform float4 starfield_padding[4]					: register(c46);
#endif








#ifdef HAS_SKIN || HAS_BEND || CYLINDER_TRAIL
	uniform float4    bone_palette_as_float[156]		: register(c50); // c50 - 205
#endif

#ifdef CYLINDER_TRAIL
	uniform float4    bone_constants[156]				: register(c50); // c50 - 205
#endif

#ifdef FAST_PARTICLE
	uniform row_major float4x4 color					: register(c50);
	uniform row_major float4x4 color_jitter				: register(c54);
	uniform row_major float4x4 color_time				: register(c58);

	uniform row_major float4x4 scale_rot				: register(c62);
	uniform row_major float4x4 scale_rot_jitter			: register(c66);
	uniform row_major float4x4 scale_rot_time			: register(c70);
	uniform float4 color_time_scale						: register(c74);
	uniform float4 scale_rot_time_scale					: register(c75);
	uniform float4 tex_params							: register(c76);
	uniform float4 spin_integrals						: register(c77);
	uniform float4 scroll_and_animation					: register(c78);
	uniform float4 more_params							: register(c79);
	uniform float4 time_info							: register(c80);
	uniform float4 scale_info							: register(c81);
	uniform float4 hsv_info								: register(c82);
	uniform float4 modulate_color						: register(c83);

	#ifdef _PS3
		uniform float3x4 at_nodes[16]					: register(c84);
	#else
		uniform float4x3 at_nodes[16]					: register(c84);
	#endif
#endif
