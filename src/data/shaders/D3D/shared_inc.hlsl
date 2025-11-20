#ifdef D3D11
#macro SAMPLER_PARAM1_TYPE
Texture2D
#endmacro
#else
#macro SAMPLER_PARAM1_TYPE
sampler2D
#endmacro
#endif

#ifdef D3D11
#macro SEM_COLOR(num)
SV_Target##num
#endmacro
#else
#macro SEM_COLOR(num)
COLOR##num
#endmacro
#endif

#ifdef D3D11
#macro SEMCOLOR
SV_Target
#endmacro
#else
#macro SEMCOLOR
COLOR
#endmacro
#endif

#ifdef D3D11
#macro SAMPLER_PARAM1_TYPE_3D
Texture3D
#endmacro
#else
#macro SAMPLER_PARAM1_TYPE_3D
sampler3D
#endmacro
#endif

#ifdef D3D11
#macro SAMPLER_PARAM1_TYPE_CUBE
TextureCube
#endmacro
#else
#macro SAMPLER_PARAM1_TYPE_CUBE
samplerCUBE
#endmacro
#endif

#ifdef D3D11
#macro SAMPLER_PARAM2_TYPE
SamplerState
#endmacro
#else
#macro SAMPLER_PARAM2_TYPE
float
#endmacro
#endif

#ifdef D3D11
#macro SAMPLER_PARAM2_COMPARISON_TYPE
SamplerComparisonState
#endmacro
#else
#macro SAMPLER_PARAM2_COMPARISON_TYPE
float
#endmacro
#endif

#ifdef D3D11
#macro SAMPLER_DECL(name, num)
Texture2D name          : register(t##num);
SamplerState sam##name	: register(s##num)
#endmacro
#else
#macro SAMPLER_DECL(name, num)
sampler2D name          : register(s##num);
static const float sam##name = 0
#endmacro
#endif

#ifdef D3D11
#macro SAMPLER_DECL_CUBE(name, num)
TextureCube name        : register(t##num);
SamplerState sam##name	: register(s##num)
#endmacro
#else
#macro SAMPLER_DECL_CUBE(name, num)
samplerCUBE name        : register(s##num);
static const float sam##name = 0
#endmacro
#endif

float4 sampleTex2DLodInternal(in SAMPLER_PARAM1_TYPE() t,
					  in SAMPLER_PARAM2_TYPE() samp,
					  float2 uvs,
					  float miplevel)
{
	#ifdef D3D11
		return t.SampleLevel(samp, uvs, miplevel);
	#elseifdef SM30
		return tex2Dlod(t, float4(uvs, 0, miplevel));
	#else
		return tex2D(t, uvs);
	#endif
}

#macro sampleTex2DLod(s, uvs, miplevel)
sampleTex2DLodInternal(s, sam##s, uvs, miplevel)
#endmacro




float3 toTangentSpace(in float3 tangent, in float3 binormal, in float3 normal, in float3 invec)
{
	float3 outvec;
	outvec.x = dot(tangent, invec);
	outvec.y = dot(binormal, invec);
	outvec.z = dot(normal, invec);
	return outvec;
}
 
float3 fromTangentSpace(in float3 tangent, in float3 binormal, in float3 normal, in float3 invec)
{
	return (invec.x * tangent) + (invec.y * binormal) + (invec.z * normal);
}

// -----------------------------------------------------------------------

float getLuminance(float3 color)
{
	return dot(color, float3(0.299f, 0.587f, 0.114f));
}

float getIntensity(in float3 color)
{
	return max(max(color.r, color.g), color.b);
}
float getIntensityQuick(in float3 color)
{
	return 0.8*dot(color, float3(0.5, 0.6, 0.5));
}

// -----------------------------------------------------------------------

float interp(in float minval, in float maxval, in float val)
{
	float bottom = maxval - minval;
	return (bottom < 0) ? (1 - saturate((val - maxval) / (-bottom))) : saturate((val - minval) / bottom);
}

float interp_safe(in float minval, in float maxval, in float val)
{
	return saturate((val - minval) / (maxval - minval));
}

float3 rangeCompress(in float3 v)
{
	return v * 0.5 + 0.5;
}

float rangeCompress1(in float v)
{
	return v * 0.5 + 0.5;
}

float3 rangeExpand(in float3 v)
{
	return v * 2.0 - float3(1.0, 1.0, 1.0);
}

float rangeExpand1(in float v)
{
	return v * 2.0 - 1.0;
}

float2 rangeExpand2(in float2 v)
{
	return v * 2.0 - float2(1.0, 1.0);
}

float3 dxt5nmExpand(in float4 v)
{
	float3 dxt5nm;
	dxt5nm.xy = rangeExpand2(v.wy);
	dxt5nm.z = sqrt(saturate(1 - dot(dxt5nm.xy, dxt5nm.xy)));
	return dxt5nm;
}


float mad_sat1(in float m1, in float m2, in float a)
{
	return saturate(m1 * m2 + a);
}

float3 mad_sat3(in float3 m1, in float3 m2, in float3 a)
{
	return saturate(m1 * m2 + a);
}

float4 mad_sat4(in float4 m1, in float4 m2, in float4 a)
{
	return saturate(m1 * m2 + a);
}

// -----------------------------------------------------------------------

float4 calcHemisphereLighting(in float3 N_vs, in float3 hemisphere_dir_vs)
{
	float sky_val = dot(N_vs, hemisphere_dir_vs);
#ifdef SIDE_AS_RIMLIGHT
	float3 hemisphere_lighting = 0; // side/rim light is additive elsewhere
#else
	float2 tangent = float2(sky_dome_color_front.w, sky_dome_color_back.w);
	float side_mod = dot(N_vs.xy, tangent);
	float3 hemisphere_lighting = sky_dome_color_side.xyz * (1 - abs(sky_val)) * (0.7 + side_mod * side_mod * 0.3f); // omni-directional side lighting
#endif
	float groundlight_param=0;
#ifdef HALFTONE
	hemisphere_lighting += sky_dome_color_front.xyz * saturate(sky_val);
	hemisphere_lighting += sky_dome_color_back.xyz * saturate(-sky_val);
	groundlight_param = -sky_val;
#else
	hemisphere_lighting += lerp(sky_dome_color_back.xyz, sky_dome_color_front.xyz, rangeCompress1(sky_val)); // front and back lighting
#endif
	return float4(hemisphere_lighting, groundlight_param);
}

// -----------------------------------------------------------------------

float2 calcUVProjection(in float3 tangent, in float3 binormal, in float3 invec)
{
	float horizDotP = -dot(tangent,invec);
	float vertDotP = -dot(binormal,invec);
	return float2(horizDotP, vertDotP);
}