
void do_bend(in float3 position_in
#ifndef DEPTH_ONLY
			 , in float3 normal_in
#ifndef NO_NORMALMAP
			 , in float3 tangent_in, in float3 binormal_in
#endif
#endif
			 , out float3 position_vs
#ifndef DEPTH_ONLY
			 , out float3 normal_vs, out float3 normal_ws
#ifndef NO_NORMALMAP
			 , out float3 tangent_vs, out float3 binormal_vs
#endif
#endif
#ifndef NOPIXELSHADER
			 , out float2 texcoords_zw
#endif
			 , out float4 position_ws
			 )
{
	float4 position_bp;
	float4 position_offset, baseoffset0, baseoffset1, rotated_offset;
	#ifndef DEPTH_ONLY
		#ifndef NO_NORMALMAP
			float3 tangent_ws, binormal_ws;
		#endif
	#endif
	
	float4x3 upmatrix = (float4x3)ConstantFetchBoneMatrix(3);
	
	float inv_geom_length = upmatrix[0].z;
	float geom_stretch = upmatrix[1].z;
	float distance_offset = upmatrix[2].z;
	float output_length = upmatrix[3].x;

	float weight = position_in.z * inv_geom_length;

	float3 spline_up = float3(upmatrix[0].x, upmatrix[1].x, upmatrix[2].x)*(1-weight) + float3(upmatrix[0].y, upmatrix[1].y, upmatrix[2].y)*weight;
	spline_up = normalize(spline_up);

	position_bp = float4(position_in.xy, 0, 1);

	float4x3 mat = (float4x3)ConstantFetchBoneMatrix(0);

	float4 pos_coeffs = float4(
		(1-weight)*(1-weight)*(1-weight), weight*weight*weight,
		3*weight*(1-weight)*(1-weight), 3*weight*weight*(1-weight)  );

	float4 tan_coeffs = float4(
		(-3*weight*weight+6*weight-3), (3*weight*weight),
		(9*weight*weight-12*weight+3), (-9*weight*weight+6*weight) );

	// Get position and tangent
	float3 spline_pos = mul(pos_coeffs, mat);
	float3 spline_tan = mul(tan_coeffs, mat);
	spline_tan = normalize(spline_tan) + 0.0000001; // JE/DR: This was added to prevent the compiler from generating different code for doing the normalize on the DEPTH_ONLY pass compared to the color pass - sometimes

	// Compute the local transform
	float3 spline_binorm = cross(spline_tan, spline_up);
	float3x3 spline_rotation = float3x3(spline_binorm * geom_stretch, spline_up * geom_stretch, spline_tan);

	// Apply the rotation
	position_ws.xyz = mul(position_bp.xyz, spline_rotation);
	#ifndef DEPTH_ONLY
		normal_ws = normalize(mul(normal_in, spline_rotation)).xyz;
		#ifndef NO_NORMALMAP
			tangent_ws = mul(tangent_in, spline_rotation);
			binormal_ws = mul(binormal_in, spline_rotation);
		#endif
	#endif

	position_ws.xyz += spline_pos;

	position_ws.w = 1;

	float2x2 uv_rot = { upmatrix[3].y, upmatrix[3].z, -upmatrix[3].z, upmatrix[3].y };
	float2 coords = { weight * output_length + distance_offset, -position_bp.x * geom_stretch };


	// Transform to view space
	position_vs = mul_view_mat(position_ws).xyz;
	#ifndef DEPTH_ONLY
		normal_vs = mul_view_mat(float4(normal_ws, 0)).xyz;
		#ifndef NO_NORMALMAP
			tangent_vs = rangeCompress(normalize(mul_view_mat(float4(tangent_ws, 0)).xyz));
			binormal_vs = rangeCompress(normalize(mul_view_mat(float4(binormal_ws, 0)).xyz));
		#endif
	#endif
	#ifndef NOPIXELSHADER
		texcoords_zw = mul(coords, uv_rot);
	#endif
}
