#include "define_inc.hlsl"

//------------------------ Constants ------------------------//

#ifdef D3D11
#include "d3d11_ps_constants.hlsl"
#else
#include "d3d9_ps_constants.hlsl"
#endif

//------------------------ End Constants ------------------------//

#ifdef SM30

// this is effectively a transpose mult.  You probably want comul.  TODO - rename these?  [RMARR - 8/20/12]
float4 mul_invview_mat(in float4 v) {
#ifdef _PS3
    return mul(v, invview_mat);
#else
    return mul(invview_mat, v.xyz);
#endif
}
float3 comul_invview_mat(in float3 v) {
#ifdef _PS3
    return mul(invview_mat, float4(v,0)).xyz;
#else
    return mul(float4(v,0), invview_mat).xyz;
#endif
}
float3 comul_invview_mat(in float4 v) {
#ifdef _PS3
    return mul(invview_mat, v).xyz;
#else
    return mul(v, invview_mat).xyz;
#endif
}

#elseifdef ReflectionCubemap

Error: Cubemap reflections require shader model 3.0 or higher!

#endif

// DO NOT USE REGISTERS 11 AND UP!  THEY ARE RESERVED FOR MATERIAL INPUTS!

//------------------------ End Constants ------------------------//


#include "shared_inc.hlsl"


#ifdef VERTEX_ONLY_LIGHTING
#define NO_NORMALMAP
#undef SHADOW_BUFFER
#endif

struct PS_INPUT_NORMAL
{
	#ifdef SM30
	#ifndef TRANSGAMING
		float4 position_screen  			: SV_Position;
	#endif
	#endif
	float4 texcoords						: TEXCOORD0;	// ST0 and ST1 packed
	float4 position_vs						: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
	float4 color0							: TEXCOORD2;
	float4 instanceParam					: TEXCOORD3;
	
	#ifndef DEPTH_ONLY

		// vpos.xyw are used in place of position_screen when SM30 is not available
		float4 hemisphere_dir_vs_and_unused	: TEXCOORD4;	// xyz: hemisphere lighting direction
															// w:   unsued screen space position.x
		float4 vpos_xyw_and_unused: TEXCOORD5;	// xyz: screen space position.xyw (for terrain_heightmap, detail fade alpha)
															// w:   unused
		float4 normal_vs_and_unused			: TEXCOORD6;	// xyz: view space normal
															// w:   unused

		#ifndef VERTEX_ONLY_LIGHTING
			float4 vertex_lighting				: TEXCOORD7;	// alpha is vertex ambient occlusion value, rgb is vertex lighting values, (plus ambient on <SM30)
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

	#ifndef DEPTH_ONLY
		#ifdef SM30
			// Use fragmentIsFrontFacingSign or fragmentIsFrontFacingBool to access these members with a 
			// particular interpretation. The DX9 value in particular only has a sign bit, not a numerical
			// value, and the DX11 value is a bool. Use the existing accessors or add a new one, if 
			// appropriate, rather than directly touching these members.
			#ifdef D3D11
				bool facing						: SV_IsFrontFace;
			#else
				float facing					: VFACE;
			#endif
		#endif
	#endif
};

float fragmentIsFrontFacingSign(const PS_INPUT_NORMAL fragment)
{
	#ifndef DEPTH_ONLY
		#ifdef SM30
			return (fragment.facing > 0) * 2 - 1;
		#else
			return 1.0;
		#endif
	#else
		return 1.0;
	#endif
}

bool fragmentIsFrontFacingBool(const PS_INPUT_NORMAL fragment)
{
	#ifndef DEPTH_ONLY
		#ifdef SM30
			return fragment.facing > 0;
		#else
			return true;
		#endif
	#else
		return true;
	#endif
}

struct PS_INPUT_SIMPLE
{
	#ifdef SM30
	#ifndef TRANSGAMING
		float4 position_screen  			: SV_Position;
	#endif
	#endif
	float4 texcoord		: TEXCOORD0;
};

struct PS_INPUT_SPRITE
{
	#ifdef SM30
	#ifndef TRANSGAMING
		float4 position_screen  			: SV_Position;
	#endif
	#endif
	#ifdef MULTI_CHANNEL
		float4 texcoord						: TEXCOORD0;
	#else
		float4 texcoord						: TEXCOORD0;
	#endif

	float4 position_vs						: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG

	#ifdef MULTI_CHANNEL
		float4 color						: TEXCOORD2;	// matches VS_OUTPUT_NORMAL to allow mixing normal VS and sprite PS for particles
	#else
		float4 color						: TEXCOORD2;	// matches VS_OUTPUT_NORMAL to allow mixing normal VS and sprite PS for particles
	#endif

	// DX11TODO: Can we remove this block?
	#ifndef SM30
		// alternatives to VPOS for SM20:
		// matches VS_OUTPUT_NORMAL to allow mixing normal VS and sprite PS for particles
		float4 hemisphere_dir_vs_and_unsued	: TEXCOORD4;
		float4 vpos_xyw_and_unused			: TEXCOORD5;
		float4 normal_vs_and_unused			: TEXCOORD6;           
	#endif
};

struct PS_INPUT_PARTICLE
{
	#ifdef SM30
	#ifndef TRANSGAMING
		float4 position_screen  			: SV_Position;
	#endif
	#endif
	#ifndef SM30
		// matches VS_OUTPUT_NORMAL to allow mixing normal VS and sprite PS for particles
		float4 hemisphere_dir_vs_and_unused	: TEXCOORD4;
	#endif
		float4 vpos_xyw_and_unused: TEXCOORD5;
	#ifndef SM30
		float4 normal_vs_and_unused			: TEXCOORD6;           
	#endif

	float4 position_vs						: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
	float2 texcoord							: TEXCOORD0;
	float4 color							: TEXCOORD2;	// matches VS_OUTPUT_NORMAL to allow mixing normal VS and sprite PS for particles
	float4 fogvalues						: TEXCOORD3;
};

struct PS_INPUT_CYLINDER_TRAIL
{
	#ifdef SM30
	#ifndef TRANSGAMING
		float4 position_screen  			: SV_Position;
	#endif
	#endif
	float2 texcoord							: TEXCOORD0;
	float4 position_vs						: TEXCOORD1;	// view space position, world space fog height interpolater fog_value if VERTEX_FOG
	float4 color							: TEXCOORD2;
	//float3 center_vs						: TEXCOORD3;
	//float  radius_vs						: TEXCOORD4;
};


// These don't seem valid anymore, fog_dist.z/w are used for high fog values
// #ifdef VOLUME_FOG
// #macro PS_CONSTANT_FOG_DENSITY
// fog_dist.z
// #endmacro
// #macro PS_CONSTANT_FOG_AMBIENT_SCATTER
// fog_dist.w
// #endmacro
// #endif

#ifdef STEREOSCOPIC
SAMPLER_DECL(stereoscopic_sampler, 13);
#endif

SAMPLER_DECL_CUBE(cubemap_lookup_texture, 14);

#ifdef MANUAL_DEPTH_TEST
	SAMPLER_DECL(depth_buffer_sampler, 15);
#elifdef SHADOW_BUFFER
	SAMPLER_DECL(shadow_buffer_texture, 15);
#endif

// -----------------------------------------------------------------------

// tex2Dlod and texCUBElod do not get pulled outside dynamic branches, 
// but they also are not supported on SM2, so use these wrappers instead.

float4 sampleTex2DNoMipsInternal(in SAMPLER_PARAM1_TYPE() t,
					 in SAMPLER_PARAM2_TYPE() samp,
					 float2 uvs)
{
	#ifdef D3D11
		return t.SampleLevel(samp, uvs, 0);
	#elseifdef SM30
		return tex2Dlod(t, float4(uvs, 0, 1));
	#else
		return tex2D(t, uvs);
	#endif
}
#macro sampleTex2DNoMips(s, uvs)
sampleTex2DNoMipsInternal(s, sam##s, uvs)
#endmacro

float4 sampleTexCubeLodInternal(in SAMPLER_PARAM1_TYPE_CUBE() t,
						in SAMPLER_PARAM2_TYPE() samp,
						float3 uvs,
						float miplevel)
{
	#ifdef D3D11
		return t.SampleLevel(samp, uvs, miplevel);
	#elseifdef SM30
		return texCUBElod(t, float4(uvs, miplevel));
	#else
		return texCUBE(t, uvs);
	#endif
}
#macro sampleTexCubeLod(s, uvs, miplevel)
sampleTexCubeLodInternal(s, sam##s, uvs, miplevel)
#endmacro

float4 sampleTexCubeNoMipsInternal(in SAMPLER_PARAM1_TYPE_CUBE() s,
					 in SAMPLER_PARAM2_TYPE() samp,
					 in float3 t)
{
#ifdef D3D11
	return s.SampleLevel(samp, t, 0);
#elseifdef SM30
	return texCUBElod(s, float4(t, 0));
#else
	return texCUBE(s, t);
#endif
}
#macro sampleTexCubeNoMips(s, uvs)
sampleTexCubeNoMipsInternal(s, sam##s, uvs)
#endmacro

float4 sampleTex2DInternal(in SAMPLER_PARAM1_TYPE() s,
				   in SAMPLER_PARAM2_TYPE() t,
				   in float2 uvs)
{
	#ifdef D3D11
	return s.Sample(t, uvs);
	#else
	return tex2D(s, uvs);
	#endif
}
#macro sampleTex2D(s, uvs)
sampleTex2DInternal(s, sam##s, uvs)
#endmacro

float4 sampleTex2DProjInternal(in SAMPLER_PARAM1_TYPE() s,
				   in SAMPLER_PARAM2_TYPE() t,
				   in float4 uvs)
{
	#ifdef D3D11
	return s.Sample(t, uvs.xy/uvs.w); // DX11TODO: if this is used anywhere, ensure this is this right
	#else
	return tex2Dproj(s, uvs);
	#endif
}
#macro sampleTex2DProj(s, uvs)
sampleTex2DProjInternal(s, sam##s, uvs)
#endmacro

float4 sampleTex3DInternal(in SAMPLER_PARAM1_TYPE_3D() s,
				   in SAMPLER_PARAM2_TYPE() t,
				   in float3 uvs)
{
	#ifdef D3D11
	return s.Sample(t, uvs);
	#else
	return tex3D(s, uvs);
	#endif
}
#macro sampleTex3D(s, uvs)
sampleTex3DInternal(s, sam##s, uvs)
#endmacro

float4 sampleTexCubeInternal(in SAMPLER_PARAM1_TYPE_CUBE() s,
					 in SAMPLER_PARAM2_TYPE() t,
					 in float3 uvs)
{
	#ifdef D3D11
	return s.Sample(t, uvs);
	#else
	return texCUBE(s, uvs);
	#endif
}
#macro sampleTexCube(s, uvs)
sampleTexCubeInternal(s, sam##s, uvs)
#endmacro


// -----------------------------------------------------------------------

float4 GetIntersectionWithEllipsoid(
#ifdef _PS3
    float3x4 matEllipsoidInv, 
#else
    column_major float4x3 matEllipsoidInv, 
#endif
    float3 ray_vs, out float4 normal, int bCullPixels )
{
	float ray_length = length( ray_vs );

#ifdef _PS3
	float3 org_vs = float3( matEllipsoidInv[0][3], matEllipsoidInv[1][3], matEllipsoidInv[2][3] );
	ray_vs = mul( matEllipsoidInv, float4( ray_vs, 0 ) );
#else
	float3 org_vs = matEllipsoidInv[3];
	ray_vs = mul( float4( ray_vs, 0 ), matEllipsoidInv );
#endif

	float4 t;
	t = 0.0f;

	float a = dot( ray_vs, ray_vs );
	float b = 2 * dot( ray_vs, org_vs );
	float c = dot( org_vs, org_vs ) - 1;
	normal = 0.0f;

	float discriminant = b * b - 4.0f * a * c;
	if ( bCullPixels )
		clip( discriminant );
	if ( discriminant >= 0.0f )
	{
		discriminant = sqrt( discriminant );

		t.y = ( -b - discriminant ) / ( 2 * a );
		t.z = ( -b + discriminant ) / ( 2 * a );

		// sort intersection order to give a properly ordered interval
		t.yz = float2( min( t.y, t.z ), max( t.y, t.z ) );

		// intersect the interval with [0,1]. 
		t.yz = min( max( t.yz, 0.0f ), 1.0f );

		float3 hitPoint = org_vs + ray_vs * t.y;
#ifndef CONSTANT_DENSITY
		// integral of simple density function - distance to z-axis is density
		float3 exitDelta = ray_vs * ( t.z - t.y );

		t.w = 1 - dot( hitPoint, hitPoint ) - 
			dot( hitPoint, exitDelta ) - 
			0.3333333 * dot( exitDelta, exitDelta );
#endif

		// length of ray-ellipsoid intersection
		t.x = ( t.z - t.y ) * ray_length;

		normal.xyz = hitPoint;
	}

	//normal.w = dot( normal.xyz, normalize( ray_vs ) );

	return t;
}

//////////////////////////////////////////////////////////////////////

float3 ToneMapLDR(float3 color)
{
#ifdef NO_EXPOSURE | UBERLIGHT_DEBUG
	return color;
#else
	return color * exposure_transform.x;
#endif
}

float3 InvToneMapLDR(float3 color)
{
#ifdef NO_EXPOSURE | UBERLIGHT_DEBUG
	return color;
#else
	return color * exposure_transform.y;
#endif
}

float InvToneMapLDRIntensityToIntensity(float lum)
{
#ifdef NO_EXPOSURE | UBERLIGHT_DEBUG
	return lum;
#else
	return lum * exposure_transform.y;
#endif
}

float InvToneMapLDRToLuminance(float3 color)
{
	return InvToneMapLDRIntensityToIntensity(getIntensity(color));
}

float3 ToneMapHDR(float3 color)
{
	return color * exposure_transform.z;
}

float3 InvToneMapHDR(float3 color)
{
	return color * exposure_transform.w;
}

#macro InvToneMapScreen(ldr_texture, coord, color_out)
{
	color_out = sampleTex2DNoMipsInternal(ldr_texture, sam##ldr_texture, coord);
#ifdef HAS_HDR_TEXTURE
	if (getIntensity(color_out.xyz) >= 1)
	{
		color_out.xyz = InvToneMapHDR(sampleTex2DNoMipsInternal(hdr_texture, sam##hdr_texture, coord));
	}
	else
#endif
	{
		color_out.xyz = InvToneMapLDR(color_out.xyz);
	}
}
#endmacro

////////////////////////////////////////////////////////////////////////
//// Fogging
#macro fogApply(color, volume_fog_matrix, position_vs, cam_dist)
{
	#ifdef VOLUME_FOG
	{
		color.xyz = fogApplyVolumeFog(color.xyz, volume_fog_matrix, position_vs.xyz);
	}
	#elifdef VERTEX_FOG
	{
		color.xyz = fogApplyVertexFog(color.xyz, position_vs.w);
	}
	#else
	{
		color.xyz = fogApplyDefault(color.xyz, cam_dist, position_vs.w);
	}
	#endif
}
#endmacro

/// Volume fog interface:
#ifdef VOLUME_FOG
float3 fogAttenLight(float3 lightColor, float3 fogColor, float distance, float fogDensity)
{
	return lerp(fogColor, lightColor, exp(fogDensity * distance));
}

float3 fogApplyVolumeFog(float3 color, 
#ifdef _PS3
    float3x4 fog_matrix, 
#else
    column_major float4x3 fog_matrix, 
#endif
    float3 position_vs)
{
	float4 normal = float4( 0.7071, 0.0, 0.7071, 0.0 );
	float4 t = GetIntersectionWithEllipsoid( fog_matrix, position_vs, normal, 0 );
	return fogAttenLight(color, fog.color.rgb, max(0.0, t.x * t.w));
}
#endif

/// Vertex fog interface:
float3 fogApplyVertexFog(float3 color, float fogvalue)
{
	return float3(lerp(color, fog_color_low.xyz, fogvalue));
}

/// Default fog interface:
float3 fogApplyDefault(float3 color, float distance_to_camera, float fog_height_coord)
{
	float fog_coord_low = saturate((distance_to_camera - fog_dist.x) * fog_dist.y) * fog_color_low.a;
	float fog_coord_high = saturate((distance_to_camera - fog_dist.z) * fog_dist.w) * fog_color_high.a;
	fog_height_coord = saturate(fog_height_coord);
//		fog_height_coord = sqrt(fog_height_coord);

	// this is equal to lerp(lerp(color, fog_color_low.rgb, fog_coord_low), lerp(color, fog_color_high.rgb, fog_coord_high), fog_height_coord)
	return color + lerp(fog_coord_low * (fog_color_low.rgb - color), 
						fog_coord_high * (fog_color_high.rgb - color), 
						fog_height_coord);
}

#ifdef SM30
	#ifndef TRANSGAMING
		#define CAN_DO_POSITION_SCREEN
	#endif
#endif

#macro getVPos(out, v)
{
	#ifdef CAN_DO_POSITION_SCREEN
		out = v.position_screen.xy;
	#else
		#ifndef DEPTH_ONLY
		{
			float2 pos;
			pos.x = (v.vpos_xyw_and_unused.x / v.vpos_xyw_and_unused.z + 1) / 2;
			pos.y = 1 - (v.vpos_xyw_and_unused.y / v.vpos_xyw_and_unused.z + 1) / 2;

			out = (pos - inv_screen_params.zw) / inv_screen_params.xy;
		}
		#else
			out = float2(0,0);
		#endif
	#endif
}
#endmacro

#macro getVPosNormalized(out, v)
{
	#ifdef CAN_DO_POSITION_SCREEN
		#ifdef D3D11

			#ifdef ATI
				out = inv_screen_params.xy * v.position_screen.xy;
			#else
				out = inv_screen_params.xy * v.position_screen.xy + inv_screen_params.zw;
			#endif

		#else		
			#ifdef _PS3
				out = inv_screen_params.xy * v.position_screen.xy;
			#else
				out = inv_screen_params.xy * v.position_screen.xy + inv_screen_params.zw;
			#endif
		#endif
	#else
		#ifndef DEPTH_ONLY
		{
			float2 pos;
			pos.x = (v.vpos_xyw_and_unused.x / v.vpos_xyw_and_unused.z + 1) / 2;
			pos.y = 1 - (v.vpos_xyw_and_unused.y / v.vpos_xyw_and_unused.z + 1) / 2;
			
			out = pos;
		}
		#else
			out = float2(0,0);
		#endif
	#endif
}
#endmacro

float calculateDepthOfField(in float zdepth, in float scale, in float4 params1, in float3 params2, in float eff_border_blur, out float is_sky)
{
	float focusRate = zdepth < params1.x ? params1.z : params1.w;
	float blur_delta = min(1.0, (zdepth - params1.x) * focusRate);
	is_sky = saturate(zdepth * params2.y + params2.x);
	float ret = lerp(saturate((blur_delta + params1.y) * scale), params2.z, is_sky);
	return saturate(max(ret, eff_border_blur));
}


float3 applyLocalContrast(in float3 orig_color, in float3 blur_color, in float local_contrast_scale, in float unsharp_amount, in float unsharp_threshold)
{
	float3 diff = orig_color - blur_color.rgb;

	float local_contrast_amount = saturate(local_contrast_scale * (getIntensity(-diff)));
	orig_color = lerp(float3(0.5f, 0.5f, 0.5f), orig_color, local_contrast_amount + 1);;

	float3 unsharp_masked = orig_color + unsharp_amount*(diff);
	float amount = saturate( (getIntensity(abs(diff)) - unsharp_threshold) * 8); // quickly ramp up to applying the unsharp mask after the threshold
	orig_color = lerp(orig_color, unsharp_masked, amount);
	return orig_color;
}

float4 nw_mapsnap_sampleTexcolorInternal(in SAMPLER_PARAM1_TYPE() s,
					in SAMPLER_PARAM2_TYPE() t)
{
	float4 avg_color;

	float2 uv = float2(0.23,0.23);

	avg_color =  sampleTex2DInternal(s, t, uv);
	uv[0] += 0.1;
	avg_color += sampleTex2DInternal(s, t, uv);
	uv[0] -= 0.2;
	avg_color += sampleTex2DInternal(s, t, uv);
	uv[1] += 0.2;
	avg_color += sampleTex2DInternal(s, t, uv);
	uv[0] += 0.2;
	avg_color += sampleTex2DInternal(s, t, uv);

	avg_color /= 5;

	return avg_color;
}
#macro nw_mapsnap_sampleTexcolor(s)
nw_mapsnap_sampleTexcolorInternal(s, sam##s)
#endmacro

float3 nw_mapsnap_colorize(in float3 color)
{
//return color;

	float3 parchment_color = float3(0.6,0.6,0.55);

	float intensity = (color.x+color.y+color.z)/3;

	float3 factors;

	float minval = min(min(color.r,color.g),color.b)+0.001;
	float3 diff;
	diff.r = color.r-minval;
	diff.g = color.g-minval;
	diff.b = color.b-minval;

	factors.x = diff.r*diff.r-diff.g*diff.b;
	factors.y = diff.g*diff.g-diff.r*diff.b;
	factors.z = diff.b*diff.b-diff.r*diff.g;

	float fGreenFactor = color.g/(min(color.b,color.r)+0.001);

	//color.r = color.g = color.b = fGreenFactor;

	//color.g += color.g*fGreenFactor;
	//color.b += color.b*fGreenFactor;
	if (fGreenFactor > 1.2)
	{
		color.g += min(0.3*(fGreenFactor-1.2),0.15);
	}

	// brown out the low end

	float adjust_factor = 0.4;//max(0.0,0.7-not_badness);

	color += parchment_color*adjust_factor;

	return saturate(color/(1+adjust_factor));

	//return float3(abs(factors.x),abs(factors.y),abs(factors.z));

	//return float3(0,0,0);
}

float3 calcIsoBar( float3 baseColor, float value, float scale )
{
	float3 outColor = baseColor * scale;
	float2 gradOfValue = float2(ddx(value), ddy(value));
	float spreadOfValue = (abs(gradOfValue.x) + abs(gradOfValue.y)) * 2.5;
	float integerLevel = floor(value + 0.5);
	float barWeight = saturate(abs(value - integerLevel) / length(gradOfValue));
	if (value >= integerLevel - spreadOfValue && value <= integerLevel + spreadOfValue)
	{
		float3 barColor = float3(1, 1, 1);
		// highlight the contours near integer levels
		if (integerLevel == 1)
			barColor = float3(.25,0,0);
		else
		if (integerLevel == 2)
			barColor = float3(0,.25,0);
		else
		if (integerLevel == 3)
			barColor = float3(0,0,.25);
		else
		if (integerLevel == 4)
			barColor = float3(1,0,0);
		else
		if (integerLevel == 5)
			barColor = float3(0,1,0);
		else
		if (integerLevel == 6)
			barColor = float3(0,0,1);
		else
		if (integerLevel == 7)
			barColor = float3(1,1,0);
		else
		if (integerLevel == 8)
			barColor = float3(0,1,1);
		outColor = lerp(barColor, outColor, barWeight);
	}
	return outColor;
}
/////////////////////////////////////////////////////////////////////////
