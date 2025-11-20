// Changes to this file also need to be reflected in d3d9_ps_constants.hlsl as well as XRenderlib.h

// PF = Per Frame
// PP = Per Primative
// PA = Per Action

cbuffer ViewingPF : register( b0 )
{
	// managed block
	uniform float4 inv_screen_params			: packoffset(c0);		// to get screen texture coords: inv_screen_params.xy * position_screen.xy + inv_screen_params.zw
	uniform float4 proj_mat_Z					: packoffset(c1);
	uniform float4 proj_mat_W					: packoffset(c2);
	uniform float4 depth_range					: packoffset(c3);		// [farz, 1/farz, near_size.x/nearz, near_size.y/nearz]
	// end managed block
}

cbuffer SkyPA : register( b1 )
{
	uniform float4 sky_dome_color_front			: packoffset(c0);
	uniform float4 sky_dome_color_back			: packoffset(c1);
	uniform float4 sky_dome_color_side			: packoffset(c2); //.w is the SSAO direct light attenuation amount

	uniform float4 fog_color_low				: packoffset(c3);
	uniform float4 fog_color_high				: packoffset(c4);
	uniform float4 fog_dist						: packoffset(c5);

	uniform float4 exposure_transform			: packoffset(c6);
}

// material and light parameters will go into cbuffers b2 and b3 respectively

// separated from the above perframe buffer due to how these constants are less necessary than the above ones and so are not used in shader models lower than 3.
cbuffer MiscPF : register( b4 )
{
	uniform float4 ambient_light				: packoffset(c0);

	#ifdef _PS3
	uniform float3x4 invview_mat	: packoffset(c1);	// c1-c13
	#else
	uniform column_major float4x3 invview_mat	: packoffset(c1);	// c1-c3
	#endif

	uniform float4 screen_resolution		: packoffset(c4);
}

// separated from the above perframe buffer due to how these constants are less necessary than the above ones and so are not used in shader models lower than 3.
cbuffer DebugPF : register( b5 )
{
	uniform float4 debug_parms				: packoffset(c0);
}

#macro PS_CONSTANT_MATERIAL_BUFFER_START
cbuffer MaterialPP : register ( b2 )
{
#endmacro
#macro PS_CONSTANT_MATERIAL_BUFFER_END
}
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM0
packoffset(c0)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM1
packoffset(c1)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM2
packoffset(c2)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM3
packoffset(c3)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM4
packoffset(c4)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM5
packoffset(c5)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM6
packoffset(c6)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM7
packoffset(c7)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM8
packoffset(c8)
#endmacro
#macro PS_CONSTANT_MATERIAL_PARAM12
packoffset(c12)
#endmacro