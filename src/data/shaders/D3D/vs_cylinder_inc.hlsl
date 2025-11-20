
void do_cylinder(in float boneidx, in float4 position_in, out float3 position_vs
#ifndef DEPTH_ONLY
				 , out float3 normal_vs, out float3 normal_ws
	#ifndef NO_NORMALMAP
				 , out float3 tangent_vs, out float3 binormal_vs
	#endif
#endif
				 , out float4 position_ws
				 )
{
	float4x4 rotmat = ConstantFetchRotationMatrix(boneidx);
	position_ws = mul(rotmat, position_in);

#ifndef DEPTH_ONLY
	normal_ws = position_ws.xyz;
	#ifndef NO_NORMALMAP
		float4 tangent_ws = float4(rotmat[0][2], rotmat[1][2], rotmat[2][2], 0);
	#endif
#endif




	float4 center_and_radius = ConstantFetchCenterAndRadius(boneidx);
	position_ws.xyz *= center_and_radius.w;
	position_ws.xyz += center_and_radius.xyz;

	position_vs = mul_view_mat(position_ws).xyz;


#ifndef DEPTH_ONLY
	normal_vs = mul_view_mat(float4(normal_ws,0)).xyz;
	#ifndef NO_NORMALMAP
		tangent_vs = mul_view_mat(tangent_ws).xyz;
		binormal_vs = cross(normal_vs, tangent_vs);
	#endif
#endif

}

