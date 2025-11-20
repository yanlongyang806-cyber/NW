#include "vs_wind_inc.hlsl"

void do_instance(in float4 position_in, in float4 model_mat_x, in float4 model_mat_y, in float4 model_mat_z
#ifdef HAS_WIND
#ifdef DEPTH_ONLY
				, in float4 normal_in
#endif
#endif
#ifndef DEPTH_ONLY
				 , in float3 normal_in
#ifndef NO_NORMALMAP
				 , in float3 tangent_in, in float3 binormal_in
#endif
#endif
#ifdef HAS_WIND
				 , in float4 per_vertex_wind_params
#endif
#ifdef HAS_WIND || HAS_TRUNK_WIND
				 , in float4 inst_wind_params
#endif
				 , out float3 position_vs
#ifndef DEPTH_ONLY
				 , out float3 normal_vs, out float3 normal_ws
#ifndef NO_NORMALMAP
				 , out float3 tangent_vs, out float3 binormal_vs
#endif
#endif
				 , out float4 position_ws
				 )
{
	position_ws.x = dot(model_mat_x, position_in);
	position_ws.y = dot(model_mat_y, position_in);
	position_ws.z = dot(model_mat_z, position_in);
	position_ws.w = 1;

#ifndef DEPTH_ONLY
	// Transform to view space
	normal_ws.x = dot(model_mat_x.xyz, normal_in);
	normal_ws.y = dot(model_mat_y.xyz, normal_in);
	normal_ws.z = dot(model_mat_z.xyz, normal_in);
	normal_ws = normalize(normal_ws);
	normal_vs = mul_view_mat(normal_ws.xyz);

	#ifndef NO_NORMALMAP
		float3 temp_ws;

		temp_ws.x = dot(model_mat_x.xyz, tangent_in);
		temp_ws.y = dot(model_mat_y.xyz, tangent_in);
		temp_ws.z = dot(model_mat_z.xyz, tangent_in);
		tangent_vs = rangeCompress(normalize(mul_view_mat(temp_ws.xyz)));

		temp_ws.x = dot(model_mat_x.xyz, binormal_in);
		temp_ws.y = dot(model_mat_y.xyz, binormal_in);
		temp_ws.z = dot(model_mat_z.xyz, binormal_in);
		binormal_vs = rangeCompress(normalize(mul_view_mat(temp_ws.xyz)));
	#endif
#endif

#ifdef HAS_WIND
#ifdef DEPTH_ONLY
	//we need the ws normal
	float3 normal_ws;
	normal_ws.x = dot(model_mat_x.xyz, normal_in.xyz);
	normal_ws.y = dot(model_mat_y.xyz, normal_in.xyz);
	normal_ws.z = dot(model_mat_z.xyz, normal_in.xyz);
	normal_ws = normalize(normal_ws);
#endif
#endif

#ifdef HAS_TRUNK_WIND || HAS_WIND
	float3 scale_factor;
	scale_factor.x = model_mat_x.x;
	scale_factor.y = model_mat_y.y;
	scale_factor.z = model_mat_z.z;
	float3 trans;
	trans.x = model_mat_x.w;
	trans.y = model_mat_y.w;
	trans.z = model_mat_z.w;
	float4 trunk_wind_fact = do_trunk_wind(position_ws, inst_wind_params, scale_factor, trans);
	position_ws += trunk_wind_fact;
#endif
#ifdef HAS_WIND
	position_ws += do_wind(position_ws, normal_ws.xyz, per_vertex_wind_params, inst_wind_params, trunk_wind_fact);
#endif

	position_vs = mul_view_mat(position_ws).xyz;

}

