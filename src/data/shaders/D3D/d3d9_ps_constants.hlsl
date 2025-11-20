// Changes to this file also need to be reflected in d3d11_ps_constants.hlsl as well as XRenderlib.h

// managed block
uniform float4 inv_screen_params			: register(c0);		// to get screen texture coords: inv_screen_params.xy * position_screen.xy + inv_screen_params.zw
uniform float4 proj_mat_Z					: register(c1);
uniform float4 proj_mat_W					: register(c2);
uniform float4 depth_range					: register(c3);		// [farz, 1/farz, near_size.x/nearz, near_size.y/nearz]
// end managed block

uniform float4 sky_dome_color_front			: register(c4);
uniform float4 sky_dome_color_back			: register(c5);
uniform float4 sky_dome_color_side			: register(c6); //.w is the SSAO direct light attenuation amount

uniform float4 fog_color_low				: register(c7);
uniform float4 fog_color_high				: register(c8);
uniform float4 fog_dist						: register(c9);

uniform float4 exposure_transform			: register(c10);

#ifdef SM30

uniform float4 ambient_light				: register(c124);

#ifdef _PS3
uniform float3x4 invview_mat	: register(c125);	// c125-c127
#else
uniform column_major float4x3 invview_mat	: register(c125);	// c125-c127
#endif

uniform float4 screen_resolution		: register(c128);
#endif

#macro PS_CONSTANT_MATERIAL_BUFFER_START
#endmacro
#macro PS_CONSTANT_MATERIAL_BUFFER_END
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM0
register(c11)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM1
register(c12)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM2
register(c13)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM3
register(c14)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM4
register(c15)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM5
register(c16)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM6
register(c17)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM7
register(c18)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM8
register(c19)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM12
register(c23)
#endmacro