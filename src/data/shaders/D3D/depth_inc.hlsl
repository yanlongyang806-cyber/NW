
/// Sampling a depth texture

float viewSpaceDepth(float depthHW)
{
#ifdef _XBOX
	// Derivation:
	// Reverse Z direction (0=far, 1=near)
	// depthHW = 1.0 - depthHW;
	// "Invert" projection
	// depthZ = proj_mat_Z.w / ( proj_mat_W.z * xboxDepth - proj_mat_Z.z );

	// This code is the simplified version
	return -proj_mat_Z.w / ( proj_mat_W.z - proj_mat_W.z * depthHW - proj_mat_Z.z );
#else
	float fOneIfOrtho = proj_mat_W.w;
	float fNumerator = proj_mat_Z.w - depthHW * fOneIfOrtho;
	float fDenominator = (1.0f-fOneIfOrtho)*depthHW + proj_mat_Z.z;
	return fNumerator / fDenominator;
#endif
}

float4 viewSpaceDepth4(float4 depthHW)
{
#ifdef _XBOX
	// Derivation:
	// Reverse Z direction (0=far, 1=near)
	// depthHW = 1.0 - depthHW;
	// "Invert" projection
	// depthZ = proj_mat_Z.w / ( proj_mat_W.z * xboxDepth - proj_mat_Z.z );

	// This code is the simplified version
	return -proj_mat_Z.wwww / ( proj_mat_W.zzzz - proj_mat_W.zzzz * depthHW - proj_mat_Z.zzzz );
#else
	float fOneIfOrtho = proj_mat_W.w;
	float4 fNumerator = proj_mat_Z.wwww - depthHW * fOneIfOrtho;
	float4 fDenominator = (1.0f-fOneIfOrtho)*depthHW + proj_mat_Z.zzzz;
	return fNumerator / fDenominator;
#endif
}

float calcHWDepth(float4 depthVals)
{
#ifdef RAWZ_DEPTH
	{
		// correct for any rounding error before depth reconstruction
		float3 depth = floor( 255.0f*depthVals.arg +0.5f);

		// the 0.00000001 is there to fix a compiler bug
		return 0.00000001 + dot(depth, float3(
										0.996093809371817670572857294849, 0.0038909914428586627756752238080039,
										1.5199185323666651467481343000015e-5)) / 255.0f;
	}
#else
	{
		return depthVals.r;
	}
#endif
}

// Sample TEXTURE at TEXCOORD and return the screen space depth. 
float sampleTexDepthInternal(in SAMPLER_PARAM1_TYPE() depth_tex,
				in SAMPLER_PARAM2_TYPE() samdepth_tex,
				in float2 texcoord)
{
	return calcHWDepth(sampleTex2DNoMips(depth_tex, texcoord));
}

#macro sampleTexDepth(s, uvs)
sampleTexDepthInternal(s, sam##s, uvs)
#endmacro


// Sample TEXTURE at TEXCOORD and return the view space depth.
float sampleTexDepthVSInternal(in SAMPLER_PARAM1_TYPE() depth_tex,
				  in SAMPLER_PARAM2_TYPE() samdepth_tex,
				  in float2 texcoord)
{
	return viewSpaceDepth(calcHWDepth(sampleTex2DNoMips(depth_tex, texcoord)));
}

#macro sampleTexDepthVS(s, uvs)
sampleTexDepthVSInternal(s, sam##s, uvs)
#endmacro

float calcDepthNormalized(float4 depthVals)
{
	float depthZ = calcHWDepth(depthVals);
	
	depthZ = viewSpaceDepth(depthZ);
	return depthZ * depth_range.y;
}

// extracts a view space normal from the compressed MRT format
float3 extractNormal(float2 normal_xy, float gloss)
{
	float3 normal_vs;
	normal_vs.xy = normal_xy;
	normal_vs.z = sqrt(1 - normal_vs.x * normal_vs.x - normal_vs.y * normal_vs.y);
	normal_vs.z = lerp(normal_vs.z, -normal_vs.z, step(gloss, 0)); // negative normal z if gloss <= 0
	return normal_vs;
}

float compressDepth(float camera_z)
{
	return sqrt(-camera_z * depth_range.y);
}

float uncompressDepth(float compressed_depth)
{
	return compressed_depth * compressed_depth * depth_range.x;
}

#ifdef STEREOSCOPIC

float3 StereoToMonoClipSpace(float3 StereoClipPos)
{
	float3 monoClipPos = StereoClipPos;
	
	float2 stereoParms = sampleTex2DNoMips(stereoscopic_sampler, float2(0.0625,0.5)).xy;
	stereoParms.x *= depth_range.z;

	monoClipPos.x += stereoParms.x * (monoClipPos.z + stereoParms.y);
	return monoClipPos;
}

#endif

// Following three functions do NOT correct for stereoscopic vision if it is enabled.

// extracts a view space position from the depth and screen coordinates [0,0]-[1,1]
float3 extractPositionUncompressed(float depth, float2 screen_coords)
{
	float3 position_vs;
	position_vs.xy = depth * depth_range.zw * (screen_coords.xy * float2(2.0f, -2.0f) + float2(-1.0f, 1.0f));
	position_vs.z = -depth;
	return position_vs;
}

// extracts a view space position from the compressed depth and screen coordinates [0,0]-[1,1]
float3 extractPosition(float compressed_depth, float2 screen_coords)
{
	float depth = uncompressDepth(compressed_depth);
	return extractPositionUncompressed(depth, screen_coords);
}

float3 extractPositionUncompressedWithOffset(float depth, float2 screen_coords)
{
	float3 position_vs;
	screen_coords -= inv_screen_params.xy;
	position_vs.xy = depth * depth_range.zw * (screen_coords.xy * float2(2.0f, -2.0f) + float2(-1.0f, 1.0f));
	position_vs.z = -depth;
	return position_vs;
}

// Following three functions correct for stereoscopic vision should it be enabled.

// extracts a view space position from the depth and screen coordinates [0,0]-[1,1]
float3 extractPositionUncompressedWithCorrection(float compressed_depth, float2 screen_coords)
{
	float3 position_vs = extractPositionUncompressed(compressed_depth, screen_coords);
#ifdef STEREOSCOPIC
	position_vs = StereoToMonoClipSpace(position_vs);
#endif
	return position_vs;
}

// extracts a view space position from the compressed depth and screen coordinates [0,0]-[1,1]
float3 extractPositionWithCorrection(float compressed_depth, float2 screen_coords)
{
	float3 position_vs = extractPosition(compressed_depth, screen_coords);
#ifdef STEREOSCOPIC
	position_vs = StereoToMonoClipSpace(position_vs);
#endif
	return position_vs;
}

float3 extractPositionUncompressedWithOffsetWithCorrection(float depth, float2 screen_coords)
{
	float3 position_vs = extractPositionUncompressedWithOffset(depth, screen_coords);
#ifdef STEREOSCOPIC
	position_vs = StereoToMonoClipSpace(position_vs);
#endif
	return position_vs;
}

//#endif

/*
float encodeDepth(float3 position_vs)
{
#ifdef _XBOX
 	return 1 - dot(proj_mat_Z, float4(position_vs, 1)) / dot(proj_mat_W, float4(position_vs, 1));
#else
 	return dot(proj_mat_Z, float4(position_vs, 1)) / dot(proj_mat_W, float4(position_vs, 1));
#endif
}*/
