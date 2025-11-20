
// diffuseLightingValue.x is diffuse lighting component (0-1, with 0.5 being traditionally unlit)
// diffuseLightingValue.y is the shadowing term
// diffuseLightingValue.z is x*y (added per light)
#macro DIFFUSE_WARP_SAMPLER_PARAM
#ifdef HasDiffuseWarp
#ifdef D3D11
, in Texture2D diffuse_warp, in SamplerState samdiffuse_warp, in float diffuse_warp_y
#else
, in sampler2D diffuse_warp, in float samdiffuse_warp, in float diffuse_warp_y
#endif
#else
#endif
#endmacro

#macro DIFFUSE_WARP_SAMPLER_CALL2
#ifdef HasDiffuseWarp
, diffuse_warp, samdiffuse_warp, diffuse_warp_y
#else
#endif
#endmacro


void standardAccumulation(inout float3 diffuseComponent, inout float3 diffuseLightingValue, inout float3 specularComponent, in float3 shadow_term, 
	in float spec_exponent, in float2 light_bleed, in float3 N_vs, in float3 reflect_vs, in float3 view_vs, in float3 bitangent,
	in float3 lightdir_vs, in float light_falloff_term, in float3 light_shadow_mask, in float3 light_shadow_color,
	in float3 light_ambient_term, in float3 light_diffuse_term, in float3 light_spec_term,
	in float light_type_minus_one
	DIFFUSE_WARP_SAMPLER_PARAM()
	)
{
	float2 localDiffuseLightingValue = float2(0, 1);
	light_falloff_term *= light_falloff_term;

	float diffuse_val_scalar = dot(N_vs, lightdir_vs);
	localDiffuseLightingValue.x = (diffuse_val_scalar * 0.5 + 0.5) * light_falloff_term;
	diffuse_val_scalar = diffuse_val_scalar * light_bleed.y + light_bleed.x;
#ifdef HasDiffuseWarp
	#ifdef TestNoDiffuseWarp
		float diffuse_val = saturate(diffuse_val_scalar);
	#else
		float3 diffuse_val = sampleTex2D(diffuse_warp, float2(diffuse_val_scalar * 0.5 + 0.5, diffuse_warp_y)).xyz;
	#endif
#else
	float diffuse_val = saturate(diffuse_val_scalar);
#endif

	// backlighting for directional lights
#ifndef TestNoDirectionalBacklight
	if (1)
	{
		float secondary_diffuse_val = saturate(-diffuse_val_scalar);
		light_ambient_term = (light_type_minus_one<=0)?secondary_diffuse_val*light_ambient_term:light_ambient_term;
	}
#endif


#ifdef NO_SHADOW
	float spec_shadow_val = 1;
	// don't have to do this, it's 1!  localDiffuseLightingValue.y = spec_shadow_val;
#else
	float spec_shadow_val = 1 - saturate(dot(shadow_term, light_shadow_mask));
	#ifdef TINT_SHADOW
		float3 shadow_tint_color = light_shadow_color;
		light_diffuse_term = lerp(shadow_tint_color, light_diffuse_term, spec_shadow_val);
		localDiffuseLightingValue.y = spec_shadow_val;
	#else
		light_diffuse_term *= spec_shadow_val;
		localDiffuseLightingValue.y = light_falloff_term * (spec_shadow_val - 1) + 1;
	#endif
#endif

	diffuseLightingValue.x += localDiffuseLightingValue.x;
	diffuseLightingValue.y *= localDiffuseLightingValue.y;
	diffuseLightingValue.z += localDiffuseLightingValue.x*localDiffuseLightingValue.y;

#ifdef TestNoAmbientFalloff
	diffuseComponent += light_ambient_term + light_falloff_term * light_diffuse_term * diffuse_val;
#elseifdef TestAmbientFalloffShadowCorrection
	diffuseComponent += light_falloff_term * (light_ambient_term * (1 - diffuse_val * spec_shadow_val) + light_diffuse_term * diffuse_val);
#else
	diffuseComponent += light_falloff_term * lerp(light_ambient_term, light_diffuse_term, diffuse_val);
#endif

#ifndef NO_SPECULAR
	#ifdef AnisotropicSpec
		#ifndef NO_NORMALMAP
			float specular_val = 1 - saturate( abs(dot( reflect_vs * -1, bitangent ) + dot( lightdir_vs, bitangent )) );
		#else
			float specular_val = saturate( dot( lightdir_vs, reflect_vs ) );
		#endif
	#else
		float specular_val = saturate( dot( lightdir_vs, reflect_vs ) );
	#endif
	specular_val = pow(specular_val, spec_exponent);
	specularComponent += light_falloff_term * spec_shadow_val * specular_val * light_spec_term;
#endif
}


//---------------------------------------------------------------------------------------------------------------------------


void lightDirectional(inout float3 diffuseComponent, inout float3 diffuseLightingValue, inout float3 specularComponent, in float3 shadow_term, 
	in float spec_exponent, in float2 light_bleed, in float3 N_vs, in float3 reflect_vs, in float3 view_vs, in float3 bitangent,
	in float3 lightdir_vs, in float3 light_secondary_diffuse,
	in float3 light_diffuse, in float3 light_specular, in float3 light_shadow_mask, in float3 light_shadow_color
	DIFFUSE_WARP_SAMPLER_PARAM()
	)
{
	standardAccumulation(diffuseComponent, diffuseLightingValue, specularComponent, shadow_term, spec_exponent, light_bleed, N_vs, reflect_vs, view_vs, bitangent,
		lightdir_vs, 1, light_shadow_mask, light_shadow_color, light_secondary_diffuse, light_diffuse, light_specular,
		0
		DIFFUSE_WARP_SAMPLER_CALL2()
		);
}

void lightPoint(inout float3 diffuseComponent, inout float3 diffuseLightingValue, inout float3 specularComponent, in float3 shadow_term, 
	in float spec_exponent, in float2 light_bleed, in float3 N_vs, in float3 reflect_vs, in float3 view_vs, in float3 bitangent,
	in float3 light_pos_vs, in float3 position_vs, in float light_one_plus_inner_radius_over_dradius, in float light_neg_inv_dradius,
	in float3 light_diffuse, in float3 light_ambient, in float3 light_specular, in float3 light_shadow_mask, in float3 light_shadow_color,
	in float light_type_minus_one
	DIFFUSE_WARP_SAMPLER_PARAM()
	)
{
	float3 lightdir_vs = light_pos_vs - position_vs; // light vector (towards light)
	float lightdir_length = length(lightdir_vs);

	// distance falloff
	float light_falloff_term = mad_sat1(lightdir_length, light_neg_inv_dradius, light_one_plus_inner_radius_over_dradius);

	#ifdef _XBOX
	[branch] if (light_falloff_term > 0)
	#endif
	{
		lightdir_vs *= 1.f / lightdir_length; // normalize

		standardAccumulation(diffuseComponent, diffuseLightingValue, specularComponent, shadow_term, spec_exponent, light_bleed, N_vs, reflect_vs, view_vs, bitangent,
			lightdir_vs, light_falloff_term, light_shadow_mask, light_shadow_color, light_ambient, light_diffuse, light_specular,
			light_type_minus_one
			DIFFUSE_WARP_SAMPLER_CALL2()
			);
	}
}

void lightSpot(inout float3 diffuseComponent, inout float3 diffuseLightingValue, inout float3 specularComponent, in float3 shadow_term, 
	in float spec_exponent, in float2 light_bleed, in float3 N_vs, in float3 reflect_vs, in float3 view_vs, in float3 bitangent,
	in float3 light_dir_vs, in float3 light_pos_vs, in float3 position_vs, in float light_one_plus_inner_radius_over_dradius, 
	in float light_neg_inv_dradius, in float light_neg_cos_outer_angle_over_d_cos_angle, in float light_inv_d_cos_angle,
	in float3 light_diffuse, in float3 light_ambient, in float3 light_specular, in float3 light_shadow_mask, in float3 light_shadow_color,
	in float light_type_minus_one
	DIFFUSE_WARP_SAMPLER_PARAM()
	)
{
	float3 lightdir_vs = light_pos_vs - position_vs; // light vector (towards light)
	float lightdir_length = length(lightdir_vs);

	// distance falloff
	float light_falloff_term = mad_sat1(lightdir_length, light_neg_inv_dradius, light_one_plus_inner_radius_over_dradius);
	
	#ifdef _XBOX
	[branch] if (light_falloff_term > 0)
	#endif
	{
		lightdir_vs *= 1.f / lightdir_length; // normalize

		// angular falloff
		light_falloff_term *= mad_sat1(dot(-lightdir_vs, light_dir_vs), light_inv_d_cos_angle, light_neg_cos_outer_angle_over_d_cos_angle);
#ifdef SM20
		// SM20 cards are failing on STO only on Spot+Spot, take out ambient from spots makes it work, and should still look good enough
		//  if this light combo is ever used
		light_ambient = 0;
#endif
		
		standardAccumulation(diffuseComponent, diffuseLightingValue, specularComponent, shadow_term, spec_exponent, light_bleed, N_vs, reflect_vs, view_vs, bitangent,
			lightdir_vs, light_falloff_term, light_shadow_mask, light_shadow_color, light_ambient, light_diffuse, light_specular,
			light_type_minus_one
			DIFFUSE_WARP_SAMPLER_CALL2()
			);
	}
}

void lightProjector(inout float3 diffuseComponent, inout float3 diffuseLightingValue, inout float3 specularComponent, in float3 shadow_term, 
	in float spec_exponent, in float2 light_bleed, in float3 N_vs, in float3 reflect_vs, in float3 view_vs, in float3 bitangent,
	in float3 light_matrix_x, in float3 light_matrix_y, in float3 light_matrix_z, 
	in float3 light_pos_vs, in float3 position_vs, 
	in float light_one_plus_inner_radius_over_dradius, in float light_neg_inv_dradius, 
	in float light_min_tan_x_over_delta, in float light_neg_inv_delta_tan_x, 
	in float light_min_tan_y_over_delta, in float light_neg_inv_delta_tan_y, 
	in SAMPLER_PARAM1_TYPE() light_projected_texture,
	in SAMPLER_PARAM2_TYPE() samlight_projected_texture,
	in float3 light_shadow_color, in float3 light_ambient,
	in float3 light_diffuse, in float3 light_specular, in float3 light_shadow_mask,
	in float light_type_minus_one
	DIFFUSE_WARP_SAMPLER_PARAM()
	)
{
	float3 lightdir_vs = light_pos_vs - position_vs; // 1 instruction
	float lightspace_y = dot(light_matrix_y, lightdir_vs); // 1 instruction

	float mad_src = -lightspace_y;

	if (light_type_minus_one < 3) // 5 instructions extra from this block
	{
		// directional/point/spot, only really needed for point/spot
		mad_src = length(lightdir_vs);
	}

	// distance falloff, only along the light's y-axis
	// For non-projectors, this is instead doing distance-based falloff
	float light_falloff_term = mad_sat1(mad_src, light_neg_inv_dradius, light_one_plus_inner_radius_over_dradius); // 2 instructions (can't use two constant registers in a single instruction)
	// Prevent projector light above the emitter, does nothing for non-projector (always positive mad_src)
	light_falloff_term *= step(-mad_src, 0); // 2 instructions

	#ifdef _XBOX
	[branch] if (light_falloff_term > 0)
	#endif
	{
		float2 projected_pos;
		float3 x_dot_param = light_matrix_x;

		if (light_type_minus_one == 2) // only 1 instructions added by this block!
		{
			// Spot light
			// two mad_sat1 parameters used below are really: light_inv_d_cos_angle, light_neg_cos_outer_angle_over_d_cos_angle
			x_dot_param = light_matrix_y; // light_dir_vs for spot
		}

		projected_pos.x = dot(x_dot_param, lightdir_vs); // 1 instruction
		projected_pos.y = dot(light_matrix_z, lightdir_vs); // 1 instruction
		projected_pos = projected_pos / -mad_src; // 2 instructions - doing projection for projector, normalize for spot, discarded (mad * 0 below) for everything else

#ifndef SM20 // just to get it to compile for now - in practice SM20 uses vertexOnlyLighting anyway
		// angular falloff

		// projector needs abs(ppx), spot needs the result to be saturated, so doing the saturation on the input for spot
		float ppx = (projected_pos.x);
		if (light_type_minus_one == 2) // adds 2 instructions
			ppx = saturate(ppx);

		light_falloff_term *= mad_sat1(abs(ppx), light_neg_inv_delta_tan_x, light_min_tan_x_over_delta); // 4 instructions (can't use two constant registers in a single instruction)
		light_falloff_term *= mad_sat1(abs(projected_pos.y), light_neg_inv_delta_tan_y, light_min_tan_y_over_delta);

		// sample the projected texture
		float2 texcoord = 0.5 + 0.5 * float2(projected_pos.x * -light_neg_inv_delta_tan_x / light_min_tan_x_over_delta, projected_pos.y * light_neg_inv_delta_tan_y / light_min_tan_y_over_delta);
		light_diffuse *= sampleTex2DNoMips(light_projected_texture, texcoord).xyz;
#endif

		standardAccumulation(diffuseComponent, diffuseLightingValue, specularComponent, shadow_term, spec_exponent, light_bleed, N_vs, reflect_vs, view_vs, bitangent,
			normalize(lightdir_vs), light_falloff_term, light_shadow_mask, light_shadow_color, light_ambient, light_diffuse, light_specular,
			light_type_minus_one
			DIFFUSE_WARP_SAMPLER_CALL2()
			);
	}
}

//---------------------------------------------------------------------------------------------------------------------------

float sampleSingle(in SAMPLER_PARAM1_TYPE() shadowmap_texture,
				   in SAMPLER_PARAM2_COMPARISON_TYPE() samshadowmap_texture,
				   in float4 coord_in, in float4 shadowmap_size)
{
	float4 coord = coord_in;//float4(coord_in.xy, coord_in.z, 0);
#ifdef D3D11
	return shadowmap_texture.SampleCmpLevelZero(samshadowmap_texture, coord.xy, coord.z).x;
#else
	#ifdef NVIDIA
		// nvidia specific
		return tex2Dproj(shadowmap_texture, coord).x;
	#else
		return tex2Dproj(shadowmap_texture, coord).x > coord.z / coord.w;
	#endif
#endif
}

float samplePCF(in SAMPLER_PARAM1_TYPE() shadowmap_texture,
				in SAMPLER_PARAM2_COMPARISON_TYPE() samshadowmap_texture,
				in float3 coord_in, in float2 offset, in float4 shadowmap_size)
{
	float4 coord = float4(coord_in.xy + offset * shadowmap_size.zw, coord_in.z, 0);

#ifdef TRANSGAMING
	return sampleSingle(
		shadowmap_texture,
		samshadowmap_texture,
		float4(coord.xyz,1),
		shadowmap_size);
#else

#ifdef D3D11
	return shadowmap_texture.SampleCmpLevelZero(samshadowmap_texture, coord.xy, coord.z).x;
#else
#ifdef NVIDIA
	// nvidia specific
	return tex2Dlod(shadowmap_texture, coord).x;
#else
	float2 vLerpFactor = frac(shadowmap_size.xy * coord.xy);
	float4 fShadow;
	fShadow.x = sampleTex2DNoMips(shadowmap_texture, coord.xy).x;
	fShadow.y = sampleTex2DNoMips(shadowmap_texture, float2(coord.x + shadowmap_size.z, coord.y)).x;
	fShadow.z = sampleTex2DNoMips(shadowmap_texture, float2(coord.x, coord.y + shadowmap_size.w)).x;
	fShadow.w = sampleTex2DNoMips(shadowmap_texture, coord.xy + shadowmap_size.zw).x;

	#ifdef _XBOX
		fShadow = 1-fShadow; // xbox specific, inverted depth values
	#endif
	fShadow = coord.z < fShadow;
	return lerp(lerp(fShadow.x, fShadow.y, vLerpFactor.x ),
				lerp(fShadow.z, fShadow.w, vLerpFactor.x ),
				vLerpFactor.y);
#endif
#endif

#endif
}

float shadowPCF4(in SAMPLER_PARAM1_TYPE() shadowmap_texture,
				 in SAMPLER_PARAM2_COMPARISON_TYPE() samshadowmap_texture,
				 in float4 shadow_coord, in float4 shadowmap_size)
{
	float3 shadow_coord2 = shadow_coord.xyz / shadow_coord.w;
	return samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(0, 0), shadowmap_size);
}

float shadowPCF16(in SAMPLER_PARAM1_TYPE() shadowmap_texture,
				  in SAMPLER_PARAM2_COMPARISON_TYPE() samshadowmap_texture,
				  in float4 shadow_coord, in float4 shadowmap_size)
{
	float3 shadow_coord2 = shadow_coord.xyz / shadow_coord.w;
	float4 fShadow, shadowMapWeights = float4( 0.25f, 0.25f, 0.25f, 0.25f );

	fShadow.x = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-0.5f, -0.5f), shadowmap_size);
	fShadow.y = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 0.5f, -0.5f), shadowmap_size);
	fShadow.z = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-0.5f,  0.5f), shadowmap_size);
	fShadow.w = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 0.5f,  0.5f), shadowmap_size);
	return dot(fShadow, shadowMapWeights);
}

float shadowPCF48(in SAMPLER_PARAM1_TYPE() shadowmap_texture,
				  in SAMPLER_PARAM2_COMPARISON_TYPE() samshadowmap_texture,
				  in float4 shadow_coord, in float4 shadowmap_size)
{
	float3 shadow_coord2 = shadow_coord.xyz / shadow_coord.w;
	float4 fShadow, shadowMapWeights;
	float outVal;

	shadowMapWeights = float4( 0.0625f, 0.0625f, 0.0625f, 0.0625f );

	fShadow.x = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-0.5f, -1.5f), shadowmap_size);
	fShadow.y = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 0.5f, -1.5f), shadowmap_size);
	fShadow.z = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-0.5f,  1.5f), shadowmap_size);
	fShadow.w = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 0.5f,  1.5f), shadowmap_size);
	outVal = dot(fShadow, shadowMapWeights);

	fShadow.x = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-1.5f, -0.5f), shadowmap_size);
	fShadow.y = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-1.5f, -0.5f), shadowmap_size);
	fShadow.z = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 1.5f,  0.5f), shadowmap_size);
	fShadow.w = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 1.5f,  0.5f), shadowmap_size);
	outVal += dot(fShadow, shadowMapWeights);

	shadowMapWeights = float4( 0.125f, 0.125f, 0.125f, 0.125f );

	fShadow.x = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-0.5f, -0.5f), shadowmap_size);
	fShadow.y = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 0.5f, -0.5f), shadowmap_size);
	fShadow.z = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2(-0.5f,  0.5f), shadowmap_size);
	fShadow.w = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, float2( 0.5f,  0.5f), shadowmap_size);
	outVal += dot(fShadow, shadowMapWeights);

	return outVal;
}

float shadowPCFPoisson(in SAMPLER_PARAM1_TYPE() shadowmap_texture,
					   in SAMPLER_PARAM2_COMPARISON_TYPE() samshadowmap_texture,
				       in float4 shadow_coord, in float4 shadowmap_size, in float poisson_kernel_size)
{
	float3 shadow_coord2 = shadow_coord.xyz / shadow_coord.w;
	float2 jitterFactor = poisson_kernel_size * rangeExpand2(frac(frac(shadowmap_size.xy * shadow_coord2.xy) * float2( 18428.4f, 23614.3f)));
	float4 fShadow, shadowMapWeights = float4( 0.25f, 0.25f, 0.25f, 0.25f );

	fShadow.x = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, jitterFactor * float2(-0.5f, -0.5f), shadowmap_size);
	fShadow.y = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, jitterFactor * float2( 0.5f, -0.5f), shadowmap_size);
	fShadow.z = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, jitterFactor * float2(-0.5f,  0.5f), shadowmap_size);
	fShadow.w = samplePCF(shadowmap_texture, samshadowmap_texture, shadow_coord2, jitterFactor * float2( 0.5f,  0.5f), shadowmap_size);
	return dot(fShadow, shadowMapWeights);
}

#macro shadowLookup(shadowmap_texture, samshadowmap_texture, shadow_coord, shadowmap_size, poisson_kernel_size)
#ifdef POISSON_SHADOWS
	shadowPCFPoisson(shadowmap_texture, samshadowmap_texture, shadow_coord, shadowmap_size, poisson_kernel_size)
#else
	shadowPCF4(shadowmap_texture, samshadowmap_texture, shadow_coord, shadowmap_size)
#endif
#endmacro

#macro shadowLookupSingle(shadowmap_texture, samshadowmap_texture, shadow_coord, shadowmap_size)
	sampleSingle(shadowmap_texture, samshadowmap_texture, shadow_coord, shadowmap_size)
#endmacro

