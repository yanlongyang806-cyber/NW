#include "define_inc.hlsl"

//------------------------ Constants ------------------------//

#ifdef D3D11
#include "d3d11_vs_constants.hlsl"
#else
#include "d3d9_vs_constants.hlsl"
#endif

//------------------------ End Constants ------------------------//

//------------------------ Begin Super Generic Functions ------------------------//

float4 mul_modelview_mat(in float4 v, in float4x4 modelview_mat_to_use) {
#ifdef _PS3
    return mul(v, modelview_mat_to_use);
#else
    return mul(modelview_mat_to_use, v);
#endif
}

float4 mul_view_mat(in float4 v) {
#ifdef _PS3
    return mul(v, view_mat);
#else
    return mul(view_mat, v);
#endif
}
float3 mul_view_mat(in float3 v) {
#ifdef _PS3
    return mul(float4(v.xyz, 0), view_mat).xyz;
#else
    return mul(view_mat, float4(v, 0)).xyz;
#endif
}

float4 mul_projection_mat(in float4 v) {
#ifdef _PS3
    return mul(v, projection_mat);
#else
    return mul(projection_mat, v);
#endif
}

float3 get_model_pos() {
#ifdef _PS3
    return model_mat[3].xyz;
#else
    return float3(model_mat[0].w,model_mat[1].w,model_mat[2].w);
#endif
}
float4 mul_model_mat(in float4 v, in float4x4 model_mat_use) {
#ifdef _PS3
    return mul(v, model_mat_use);
#else
#ifdef _XBOX
    return mul(model_mat_use, v);
#else
	// try to keep this as close to what happens in the instancing vertex shader 
	// so we get the same depth values in the zprepass and the visual pass
    return float4(
        dot(model_mat_use[0], v),
        dot(model_mat_use[1], v),
        dot(model_mat_use[2], v),
        dot(model_mat_use[3], v)
    );
#endif
#endif
}
float3 mul_model_mat(in float3 v, in float4x4 model_mat_use) {
#ifdef _PS3
    return mul(float4(v.xyz, 0), model_mat_use).xyz;
#else
    return mul(model_mat_use, float4(v, 0)).xyz;
#endif
}

//------------------------ End Super Generic Functions ------------------------//


#include "shared_inc.hlsl"

#ifdef _XBOX
	#ifdef IS_INSTANCED
		#define XBOX_INSTANCED
	#endif
#endif

// INPUTS

// note: if any of these are changed, the xbox instancing custom vfetch in normal.vhl must be changed to match
struct VS_INPUT
{
#ifndef CYLINDER_TRAIL
	float3 position			: POSITION;
	#ifndef NO_NORMAL_NO_TEXCOORD
		float3 normal			: NORMAL;
		#ifndef VS_TEXCOORD_SPLAT
			float4 texcoords		: TEXCOORD0;
		#endif
	#endif
#else
	float angle				: TEXCOORD5;
	int boneidx				: TEXCOORD4;
#endif
	

#ifdef HAS_VARIABLE_COLOR
	float4 color			: COLOR0;
#elif HAS_VERTEX_LIGHT
	float3 vertex_light		: COLOR0;
#endif

#ifdef HAS_VERTEX_COLOR
	float4 vertex_color		: COLOR1;
#endif

#ifndef NO_NORMALMAP
#ifndef CYLINDER_TRAIL
	float3	tangent			: TEXCOORD1;
	float3	binormal		: TEXCOORD2;
#endif
#endif

#ifdef IS_INSTANCED

	float4	model_mat_x		: TEXCOORD3;
	float4	model_mat_y 	: TEXCOORD4;
	float4	model_mat_z 	: TEXCOORD5;
	float4	instance_color	: TEXCOORD6;
	float4	instance_param	: TEXCOORD7;

#else

	#ifdef HAS_SKIN
		int4	boneidxs	: TEXCOORD4;
		float4	boneweights	: TEXCOORD5;
	#endif

	#ifdef HAS_MORPH
		float3	position2	: TEXCOORD6;
		float3	normal2		: TEXCOORD7;
	#elif TIGHTEN_UP
		float tighten_up	: TEXCOORD6;
	#endif

#endif
};

struct VS_INPUT_SPRITE
{
#ifndef CYLINDER_TRAIL
	float3 position			: POSITION;
#endif
#ifndef NO_TEXCOORD
	float4 texcoord			: TEXCOORD0;
#endif
#ifdef HAS_VARIABLE_COLOR
	float4 color			: COLOR;
#endif
#ifdef TIGHTEN_UP
	float tighten_up		: TEXCOORD6;
#endif
#ifdef CYLINDER_TRAIL
	float angle				: TEXCOORD5;
	int boneidx				: TEXCOORD4;
#endif

};

struct VS_INPUT_PARTICLE
{
	float3 position			: POSITION;
	float4 texcoord			: TEXCOORD0;
	float4 color			: COLOR;
	//float tighten_up		: TEXCOORD6;
};

struct VS_INPUT_FASTPARTICLE
{
	float3		position		: POSITION;
	int2		corner_nodeidx	: TEXCOORD4;
	float		time			: TEXCOORD5;
	float		seed			: TEXCOORD6;
	float		alpha			: TEXCOORD7;
#ifdef STREAK
	float3		streak_dir		: NORMAL;
#endif
};

struct VS_INPUT_POSTPROCESS
{
	float3 position		: POSITION;
    float4 texcoords	: TEXCOORD0;
};

struct VS_INPUT_STARFIELD
{
	float3 position		: POSITION;
	float3 normal		: NORMAL;
	float4 texcoords	: TEXCOORD0;
	float4 boneweights	: TEXCOORD5;
};


#ifdef HAS_SKIN || HAS_BEND || CYLINDER_TRAIL


float4 mul_bone_matrix(in float4x4 bone_matrix, in float4 v) {
#ifdef _PS3
    return mul(bone_matrix, v);
#else
    return mul(v, bone_matrix);
#endif
}
float3 mul_bone_matrix(in float4x4 bone_matrix, in float3 v) {
#ifdef _PS3
    return mul(bone_matrix, float4(v.xyz, 0)).xyz;
#else
    return mul(float4(v.xyz, 0), bone_matrix).xyz;
#endif
}

	float4x4 ConstantFetchBoneMatrix(int BoneIndex) // Actually BoneIndex * 3
	{
#ifdef _PS3
		return float4x4(bone_palette_as_float[BoneIndex+0],
						bone_palette_as_float[BoneIndex+1],
						bone_palette_as_float[BoneIndex+2],
						float4(0,0,0,1));
#else	
	    //return float4x3(bone_palette_as_float[BoneIndex], bone_palette_as_float[BoneIndex+1], bone_palette_as_float[BoneIndex+2]);
	    //return bone_palette[BoneIndex].bone_matrix;
		
		// Despite being bloated looking, this translates well when in assembly.  Maybe there's a more succint way to write this though
		return float4x4(float4(bone_palette_as_float[BoneIndex+0].x, bone_palette_as_float[BoneIndex+1].x, bone_palette_as_float[BoneIndex+2].x, 0),
						float4(bone_palette_as_float[BoneIndex+0].y, bone_palette_as_float[BoneIndex+1].y, bone_palette_as_float[BoneIndex+2].y, 0),
						float4(bone_palette_as_float[BoneIndex+0].z, bone_palette_as_float[BoneIndex+1].z, bone_palette_as_float[BoneIndex+2].z, 0),
						float4(bone_palette_as_float[BoneIndex+0].w, bone_palette_as_float[BoneIndex+1].w, bone_palette_as_float[BoneIndex+2].w, 1));
#endif
	}

//	float4 ConstantFetchBoneScale(int BoneIndex)
//	{
//	    return bone_palette[BoneIndex].bone_scale;
//	}

#endif


#ifdef CYLINDER_TRAIL
	float4x4 ConstantFetchRotationMatrix(int BoneIndex)
	{
		float3 PYR = bone_constants[BoneIndex*3].xyz;
		float4x4 rot_mat;
		float cosP, sinP, cosY, sinY, cosR, sinR;
		
		sincos(PYR.x, sinP, cosP);
		sincos(PYR.y, sinY, cosY);
		sincos(PYR.z, sinR, cosR);
		sinP = -sinP;
		sinY = -sinY;
		sinR = -sinR;
		
		rot_mat[0][0] = cosY * cosR;
		rot_mat[1][0] = cosY * sinR;
		rot_mat[2][0] = sinY;
		rot_mat[3][0] = 0;
		
		float temp = sinP * sinY;
		rot_mat[0][1] = -temp * cosR - cosP * sinR;
		rot_mat[1][1] = cosP * cosR - temp * sinR;
		rot_mat[2][1] = sinP * cosY;
		rot_mat[3][1] = 0;
		
		temp = cosP * -sinY;
		rot_mat[0][2] = temp * cosR + sinP * sinR;
		rot_mat[1][2] = temp * sinR - sinP * cosR;
		rot_mat[2][2] = cosP * cosY;
		rot_mat[3][2] = 0;

		rot_mat[0][3] = 0;
		rot_mat[1][3] = 0;
		rot_mat[2][3] = 0;
		rot_mat[3][3] = 1;

		return rot_mat;
	}
	float4 ConstantFetchCenterAndRadius(int BoneIndex)
	{
		return bone_constants[BoneIndex*3 + 1];
	}
	float4 ConstantFetchColor(int BoneIndex)
	{
		return bone_constants[BoneIndex*3 + 2];
	}
	float ConstantFetchTexCoord(int BoneIndex)
	{
		return bone_constants[BoneIndex*3][3];
	}
#endif



// -------------------------------------------------------------------------
// OUTPUTS

#include "vs_outputs.hlsl"


float4 getColor0(VS_INPUT vIn)
{
	float4 color0_out;

	#ifdef IS_INSTANCED
		color0_out = vIn.instance_color;
	#elif HAS_VARIABLE_COLOR
		color0_out = vIn.color;
        #ifdef SRGB_VERTEX_COLOR
            //approximate srgb color values with gamma 2.0
            color0_out.rgb *= vIn.color.rgb;
        #endif
	#else
		color0_out = color0;
	#endif


	#ifdef HAS_VERTEX_COLOR
		#ifndef HAS_WIND
			color0_out.rgb *= vIn.vertex_color.rgb;
            #ifdef SRGB_VERTEX_COLOR
                //approximate srgb color values with gamma 2.0
                color0_out.rgb *= vIn.vertex_color.rgb;
            #endif
        #endif
	#endif

	#ifdef CYLINDER_TRAIL
		color0_out = ConstantFetchColor(vIn.boneidx);
	#endif


	return color0_out;
}

float4 getInstanceParam(VS_INPUT vIn)
{
	#ifdef IS_INSTANCED
		return vIn.instance_param;
	#else
		return global_instance_param;
	#endif
}

#ifndef IS_INSTANCED
float4 getColor0Explicit(float3 tintcolor, float4 vertex_color)
{
	float4 color0_out = color0;
	color0_out.rgb *= vertex_color.rgb * tintcolor;
	return color0_out;
}

float4 getColor0NoVertex(float3 tintcolor)
{
	return float4(tintcolor * color0.rgb, color0.a);
}
#endif

float3 getVertexLighting(VS_INPUT vIn)
{
	float3 vertex_lighting = 0;
	#ifdef HAS_VERTEX_LIGHT
		#ifndef NoVertexLighting
			float3 vertex_light_value = morph_and_vlight.z + vIn.vertex_light.xyz * morph_and_vlight.y;
			vertex_lighting.rgb += vertex_light_value;
		#endif
	#endif
	return vertex_lighting;
}

float4 getAmbientColorNoVertex()
{
	#ifdef ShowVertexLighting || ShowLightingNoAmbient
		return float4(0, 0, 0, 1);
	#elifdef VERTEX_ONLY_LIGHTING
		return float4(ambient_light.rgb, 1);
	#elifdef SM30
		return float4(0, 0, 0, 1); // calculated in pixel shader
	#else
		return float4(ambient_light.rgb, 1);
	#endif
}

float4 getAmbientColor(VS_INPUT vIn)
{
	float4 ambient_color = getAmbientColorNoVertex();
	#ifdef HAS_VERTEX_COLOR
		#ifndef HAS_WIND
			ambient_color.a = vIn.vertex_color.a; // ambient occlusion
		#else
			ambient_color.a = 1;
		#endif
	#else
		ambient_color.a = 1;
	#endif
	return ambient_color;
}


float fogCalculateHeightCoord(float3 position_vs)
{
	float world_height = dot(view_to_world_Y, float4(position_vs, 1));
	return (world_height - fog_height_params.x) * fog_height_params.y;
}

// Simple fog (for SM20)
float fogVertexFog( float distance_to_camera )
{
	float fog_coord_low = saturate((distance_to_camera - fog_dist.x) * fog_dist.y) * fog_color_low.a;
	//return float4(fog_color_low.xyz*fog_coord_low, (1-fog_coord_low));
	return fog_coord_low;
}

void calcClipPosition(out float4 position_clip, in float3 position_vs)
{
	position_clip = mul_projection_mat(float4(position_vs, 1));

#ifdef FAR_DEPTH_RANGE
	//position_clip.xy /= position_clip.w;
	//position_clip.z = dot(far_depth_proj_Z, float4(position_vs, 1));
	//position_clip.w = dot(far_depth_proj_W, float4(position_vs, 1));
	//position_clip.xy *= position_clip.w;
#endif
}

#ifndef DEPTH_ONLY


void doVertexLighting(inout VS_OUTPUT_NORMAL vOut, in float3 normal_ws, in float4 ambient_color, in float3 vertex_lighting)
{
	#ifndef NO_SKY_AMBIENT
		#ifdef ShowLightingNoAmbient

		#elseifdef VERTEX_ONLY_LIGHTING
			#define ACTUALLY_DO_SKY_AMBIENT
		#elseifdef NO_NORMALMAP
			#ifndef SM30
				#define ACTUALLY_DO_SKY_AMBIENT
			#endif
		#endif
	#endif

	#ifdef ACTUALLY_DO_SKY_AMBIENT
		// for outdoors where there is a sky dome
		ambient_color.rgb += calcHemisphereLighting(vOut.normal_vs_and_unused.xyz, sky_dome_direction_vs).xyz;
		#ifdef SIDE_AS_RIMLIGHT
			ambient_color.rgb += sky_dome_color_side * saturate(dot(vOut.normal_vs_and_unused.xyz, float3(0.9, 0, -0.4356)) * 1.5 - 0.5); // uni-direcitonal side lighting
		#endif
	#else
		vOut.hemisphere_dir_vs_and_unused.xyz = sky_dome_direction_vs;
	#endif

	float3 view_vs = normalize(-vOut.position_vs.xyz);

	#ifdef NO_NORMALMAP
	{
		float v0 = dot(normalize(vOut.normal_vs_and_unused.xyz + float3(0, -0.65, 0)), view_vs) * 1.8;
		float v1 = -dot(vOut.normal_vs_and_unused.xyz, view_vs);
		vOut.backlight_params = float4(v0, v1, 0, 0);
		//vOut.backlight_params.rgb = view_vs;
	}
	#endif

	#ifndef NO_NORMALMAP
		vOut.vertex_lighting = ambient_color + float4(vertex_lighting, 0);
	#elifdef SINGLE_DIRLIGHT
	{
		float3 lightdir_vs = vertex_light_params[0].xyz;
		float3 light_diffuse_term = vertex_light_params[1].xyz;
		float3 light_secondary_diffuse_term = vertex_light_params[2].xyz;

		float vertex_diffusedot = dot(vOut.normal_vs_and_unused.xyz, lightdir_vs);

		#ifdef SINGLE_DIRLIGHT_SPECULAR_IN_VS
			// Specular
			float vertex_specular_val = dot(lightdir_vs, reflect(view_vs, vOut.normal_vs_and_unused.xyz));
		#else
			float vertex_specular_val = 0;
		#endif

		vOut.vertex_lighting = ambient_color + float4(vertex_lighting, 0);
		#ifdef SM30
			vOut.sdl_values.xy = 0.5f * float2(vertex_diffusedot, vertex_specular_val) + 0.5f;
			vOut.sdl_values.zw = 1;
		#else
			float vertex_diffuse_val = saturate(vertex_diffusedot);
			float3 vertex_diffuse_prod = light_diffuse_term * vertex_diffuse_val;
			float vertex_secondary_diffuse_val = saturate(-vertex_diffusedot);
			float3 vertex_secondary_diffuse_prod = light_secondary_diffuse_term * vertex_secondary_diffuse_val;
			vOut.vertex_lighting.rgb += vertex_secondary_diffuse_prod;
			vOut.diffuse_value = float4(vertex_diffuse_prod*0.25, saturate(vertex_specular_val));
		#endif

	}
	#elifdef VERTEX_ONLY_LIGHTING
		//vOut.vertex_lighting = 0; // unused and undefined
		vOut.diffuse_value = float4(vertex_lighting.rgb, 0);

		// 2 spot lights (implicity supports dir and point as well)
		#ifdef ONE_VERTEX_LIGHT
		const int i = 0;
		#else
		for (int i=0; i<2; i++)
		#endif
		{
			float3 light_diffuse_term = vertex_light_params[0 + i*4].xyz;
			float3 light_pos_vs = vertex_light_params[1 + i*4].xyz;
			float3 lightdir_vs = light_pos_vs - vOut.position_vs.xyz; // light vector (towards light)
			float3 light_ambient_term = vertex_light_params[2 + i*4].xyz;
			float light_one_plus_inner_radius_over_dradius = vertex_light_params[1 + i*4].w;
			float light_neg_inv_dradius = vertex_light_params[2 + i*4].w;
			float3 light_secondary_diffuse_term = light_ambient_term;
			float light_inv_dcos = vertex_light_params[0 + i*4].w;
			float light_neg_mincos_over_dcos = vertex_light_params[3 + i*4].w;
			float3 light_dir_vs = vertex_light_params[3 + i*4].xyz; // direction spot light is pointing

			float lightdir_length = length(lightdir_vs);

			// distance falloff
			float light_falloff_term = mad_sat1(lightdir_length, light_neg_inv_dradius, light_one_plus_inner_radius_over_dradius);
			light_falloff_term *= light_falloff_term;

			lightdir_vs *= 1/lightdir_length; // normalize

			// angular falloff
			light_falloff_term *= mad_sat1(dot(-lightdir_vs, light_dir_vs), light_inv_dcos, light_neg_mincos_over_dcos);

			float vertex_diffusedot = dot(vOut.normal_vs_and_unused.xyz, lightdir_vs);
			float vertex_diffuse_val = saturate(vertex_diffusedot);
			float3 vertex_diffuse_prod = light_diffuse_term * vertex_diffuse_val;
			float vertex_secondary_diffuse_val = 1 - vertex_diffuse_val; // saturate(-vertex_diffusedot);
			// If a directional light, the "ambient_term" is a secondary diffuse term instead, and needs -diffusedot instead of ambient (global ambient added elsewhere)
			float is_dir_light = saturate(light_one_plus_inner_radius_over_dradius - 990000);
			light_secondary_diffuse_term *= lerp(1, saturate(-vertex_diffusedot), is_dir_light);
			float3 vertex_secondary_diffuse_prod = light_secondary_diffuse_term * vertex_secondary_diffuse_val;

			vOut.diffuse_value += float4(light_falloff_term*(vertex_diffuse_prod+vertex_secondary_diffuse_prod), 0);
		}
		float diffuseComponentIntensity = getIntensityQuick(vOut.diffuse_value.rgb) * exposure_transform.x;
#ifdef NO_AMBIENT_FALLOFF
		vOut.diffuse_value.rgb += ambient_color.rgb * ambient_color.w;
#else
		vOut.diffuse_value.rgb += (saturate(1-diffuseComponentIntensity) * ambient_color.rgb) * ambient_color.w;
#endif
		#ifdef ShowVertexLighting
			vOut.diffuse_value = float4(vertex_lighting.rgb, 0);
		#endif

		vOut.diffuse_value *= 0.25;
	#else
		vOut.vertex_lighting = ambient_color + float4(vertex_lighting, 0);
	#endif
}
#endif
