#include "vs_wind_inc.hlsl"

void do_standard(in float4 position_in
#ifdef HAS_WIND
#ifdef DEPTH_ONLY
				, in float3 normal_in
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
	position_ws = mul_model_mat(position_in, model_mat);
	position_ws.w = 1;
	
	#ifndef DEPTH_ONLY
		#ifdef NO_SKEW_NORMALS
			// Doesn't quite fix everything, and is too expensive for the small benefit on some objects - better would be a separate matrix
			float4x4 model_mat_copy = model_mat;
			model_mat_copy[0].xyz = normalize(model_mat_copy[0].xyz);
			model_mat_copy[1].xyz = normalize(model_mat_copy[1].xyz);
			model_mat_copy[2].xyz = normalize(model_mat_copy[2].xyz);

			// Transform to view space
			normal_ws = normalize(mul_model_mat(normal_in, model_mat_copy).xyz);
			normal_vs = mul_view_mat(normal_ws.xyz);
			#ifndef NO_NORMALMAP
				float4x4 modelview_mat_copy = modelview_mat;
				modelview_mat_copy[0].xyz = normalize(modelview_mat_copy[0].xyz);
				modelview_mat_copy[1].xyz = normalize(modelview_mat_copy[1].xyz);
				modelview_mat_copy[2].xyz = normalize(modelview_mat_copy[2].xyz);
				tangent_vs = rangeCompress(normalize(mul_modelview_mat(float4(tangent_in.xyz,0), modelview_mat_copy).xyz));
				binormal_vs = rangeCompress(normalize(mul_modelview_mat(float4(binormal_in.xyz,0), modelview_mat_copy).xyz));
			#endif
		#else
			// Transform to view space
			normal_ws = normalize(mul_model_mat(normal_in, model_mat).xyz);
			normal_vs = mul_view_mat(normal_ws.xyz);
			#ifndef NO_NORMALMAP
				tangent_vs = rangeCompress(normalize(mul_modelview_mat(float4(tangent_in.xyz,0), modelview_mat).xyz));
				binormal_vs = rangeCompress(normalize(mul_modelview_mat(float4(binormal_in.xyz,0), modelview_mat).xyz));
			#endif
		#endif
	#endif

#ifdef HAS_WIND
#ifdef DEPTH_ONLY
	//we need the ws normal
	float3 normal_ws = normalize(mul_model_mat(normal_in, model_mat).xyz);
#endif
#endif

#ifdef HAS_TRUNK_WIND || HAS_WIND
	float3 scale_factor;
	scale_factor.x = model_mat[0].x;
	scale_factor.y = model_mat[1].y;
	scale_factor.z = model_mat[2].z;
	float3 trans = get_model_pos();
	float4 trunk_wind_fact = do_trunk_wind(position_ws, inst_wind_params, scale_factor, trans);
	position_ws += trunk_wind_fact;
#endif
#ifdef HAS_WIND
	position_ws += do_wind(position_ws, normal_ws.xyz, per_vertex_wind_params, inst_wind_params, trunk_wind_fact);
#endif

	position_vs = mul_view_mat(position_ws).xyz;

}
