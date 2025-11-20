
void do_skinning(in int4 boneidxs, in float4 boneweights, in float3 position_in
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
				 , out float4 position_ws
				 )
{
	int bone_idx;
	float4 position_bp;
	float4x4 bone_matrix;
	#ifndef DEPTH_ONLY
		#ifndef NO_NORMALMAP
			float3 tangent_ws, binormal_ws;
		#endif
	#endif

	position_bp = float4(position_in + basepose_offset, 1);

#ifdef TWO_BONE_SKINNING
	// Set the weights to simulate the appropriate number of bones
	boneweights.zw = 0;
	float invtotal = 1.f/dot(boneweights.xyzw, 1);
	boneweights.xyzw = boneweights.xyzw * invtotal;
#endif
	// BONE 0
	bone_matrix = ConstantFetchBoneMatrix(boneidxs.x);
	position_ws.xyz = boneweights.x * mul_bone_matrix(bone_matrix, position_bp).xyz;
	#ifndef DEPTH_ONLY
		normal_ws = boneweights.x * mul_bone_matrix(bone_matrix, normal_in).xyz;
		#ifndef NO_NORMALMAP
			tangent_ws = boneweights.x * mul_bone_matrix(bone_matrix, tangent_in).xyz;
			binormal_ws = boneweights.x * mul_bone_matrix(bone_matrix, binormal_in).xyz;
		#endif
	#endif

	// BONE 1
	bone_matrix = ConstantFetchBoneMatrix(boneidxs.y);
	position_ws.xyz += boneweights.y * mul_bone_matrix(bone_matrix, position_bp).xyz;
	#ifndef DEPTH_ONLY
		normal_ws += boneweights.y * mul_bone_matrix(bone_matrix, normal_in).xyz;
		#ifndef NO_NORMALMAP
			tangent_ws += boneweights.y * mul_bone_matrix(bone_matrix, tangent_in).xyz;
			binormal_ws += boneweights.y * mul_bone_matrix(bone_matrix, binormal_in).xyz;
		#endif
	#endif

#ifndef TWO_BONE_SKINNING
	// BONE 2
	bone_matrix = ConstantFetchBoneMatrix(boneidxs.z);
	position_ws.xyz += boneweights.z * mul_bone_matrix(bone_matrix, position_bp).xyz;
	#ifndef DEPTH_ONLY
		normal_ws += boneweights.z * mul_bone_matrix(bone_matrix, normal_in).xyz;
		#ifndef NO_NORMALMAP
			tangent_ws += boneweights.z * mul_bone_matrix(bone_matrix, tangent_in).xyz;
			binormal_ws += boneweights.z * mul_bone_matrix(bone_matrix, binormal_in).xyz;
		#endif
	#endif

	// BONE 3
	bone_matrix = ConstantFetchBoneMatrix(boneidxs.w);
	position_ws.xyz += boneweights.w * mul_bone_matrix(bone_matrix, position_bp).xyz;
	#ifndef DEPTH_ONLY
		normal_ws += boneweights.w * mul_bone_matrix(bone_matrix, normal_in).xyz;
		#ifndef NO_NORMALMAP
			tangent_ws += boneweights.w * mul_bone_matrix(bone_matrix, tangent_in).xyz;
			binormal_ws += boneweights.w * mul_bone_matrix(bone_matrix, binormal_in).xyz;
		#endif
	#endif
#endif
	
	position_ws.w = 1;

	// Transform to view space
	position_vs = mul_view_mat(position_ws).xyz;
	#ifndef DEPTH_ONLY
		normal_ws = normalize(normal_ws);
		normal_vs = mul_view_mat(normal_ws.xyz);
		#ifndef NO_NORMALMAP
			tangent_vs = rangeCompress(normalize(mul_view_mat(tangent_ws.xyz)));
			binormal_vs = rangeCompress(normalize(mul_view_mat(binormal_ws.xyz)));
		#endif
	#endif
}

