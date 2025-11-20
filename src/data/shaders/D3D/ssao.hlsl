#define NOGRAD
//#define USEDD

#define SSAO_PREPASS_ENABLED
//#define ENABLE_SSAO_DEBUGGING

// DX11 compiler is convinced that the parameter below, "depth" is uninitialized, so I'm disabling this warning and re-enabling it lower.
// I have to put a space before "pragma" or our preprocessor comments it out.
# pragma warning( disable : 4000 )

float calcSSAOInternal(in SAMPLER_PARAM1_TYPE() depth_tex,
				in SAMPLER_PARAM2_TYPE() samdepth_tex,
				in SAMPLER_PARAM1_TYPE() noise_tex,
				in SAMPLER_PARAM2_TYPE() samnoise_tex,
				float3 position_vs, float2 screen_texcoord,
				float depth, int offset)
{

	float farDepth = depth_range.x;

	#ifndef _PS3
	#ifndef TRANSGAMING
	#ifdef NOGRAD
	[branch]
	#else
	[flatten] 
	#endif
	#endif
	#endif
	if (depth >= farDepth) 
	{
		return 0;
	}

	#ifdef USEDD
	float derivx = ddx(screen_texcoord.x);
	float derivy = ddy(screen_texcoord.y);
	#else
	float derivx = depth_step.x;
	float derivy = depth_step.y;
	#endif

	float2 screen_texcoordx = float2(screen_texcoord.x + derivx, screen_texcoord.y);
	float2 screen_texcoordy = float2(screen_texcoord.x, screen_texcoord.y + derivy);

	float depthx = sampleTexDepthVS(depth_tex, screen_texcoordx);
	float depthy = sampleTexDepthVS(depth_tex, screen_texcoordy);

	float3 position_vsx = extractPositionUncompressed(depthx, screen_texcoordx);
	float3 position_vsy = extractPositionUncompressed(depthy, screen_texcoordy);

	float result=0;

	// This is supposed to prevent rim shadowing of stuff - there may not be a perfect value to check against.
	if (abs(depthx-depth) < 5 && abs(depthy-depth) < 5)
	{

		float3 normal = normalize(cross(position_vsy - position_vs,position_vsx -  position_vs));

		int i;
		float4 plane = sampleTex2DNoMips(noise_tex, float2(plane_res.xy * screen_texcoord));
		plane.xyz = rangeExpand(plane.xyz);

		float ssao = 0;

#ifdef SSAO_PREPASS
		int iSamplesToRun = 8;  // we want this to be as low as we can get it and not create holes in the final image.  Holes are very noticeable
#else
#ifdef SSAO_PREPASS_ENABLED
		int iSamplesToRun = 12;
#else
		int iSamplesToRun = 8;
#endif
#endif

	#ifndef _PS3	
	#ifndef TRANSGAMING
		[unroll]
	#endif
	#endif
		for (i = 0; i < iSamplesToRun; ++i)
		{
			int iVec = i+offset;
			float3 reflectedvec = reflect(ssao_vectors[iVec%16].xyz, plane.xyz);
			reflectedvec *= sign(dot(reflectedvec, normal));

#ifdef SSAO_PREPASS
			// these distances need to be a good cross section of the real distances, and it would be good if they were not
			// in sync with the reflection pattern either.  "offset" should be accomplishing that?
			float fSampleDist = i*(0.8/iSamplesToRun)+0.1;
#else
			float fSampleDist = ssao_vectors[iVec].w;
#endif

			// I am adjusting the vector here to avoid shallow creases from generating occlusion, which looks
			// bad on terrain, etc.  It's also an optimization cause it puts less stuff in the mask
			float3 ssao_vector = (0.15 * normal + 0.85 * reflectedvec) * fSampleDist;

			float4 sample_pos_vs = float4(position_vs + ssao_vector * plane_res.w, 1);

			// this line can be used to verify that diff is coming out right.  (It should be 0 for position_vs)
			//sample_pos_vs = float4(position_vs, 1);

			float4 sample_projected;
			sample_projected.x = dot(proj_mat_X, sample_pos_vs);
			sample_projected.y = dot(proj_mat_Y, sample_pos_vs);
			sample_projected.w = dot(proj_mat_W, sample_pos_vs);
			float2 texcoord = sample_projected.xy / sample_projected.w * 0.5f + 0.5f;
			texcoord.y = 1-texcoord.y;

			// doing this sample is slow, presumably because it's not cached.
			float sample_depth = sampleTexDepthVS(depth_tex, texcoord);
			float diff = -(sample_pos_vs.z  + sample_depth);

#ifdef ENABLE_SSAO_DEBUGGING
			//return ssao_vector.y; //very suspicious
			//return abs(normal.y); // hella lines
			//return position_vsx.x+0.6;
			//return abs(position_vsx - position_vs).x*5;
			//return abs(position_vs.x)*0.1;
			//return abs(depthy-depth)*100;
			//return abs(screen_texcoordy.y - screen_texcoord.y)*200;
			//return derivy*500;
			//return position_vs.y;
			//return (screen_texcoord.y-0.3)*8;  // screen_texcoord is wrong??
			//return (depth*0.01-0.21)*24;
			//viewSpaceDepth(calcHWDepth(sampleTex2DNoMips(depth_tex, texcoord)));
			//return sampleTex2DNoMips(depth_tex, screen_texcoord);
			//return (sampleTex2DNoMips(depth_tex, screen_texcoord)-0.5)*10;
			//return (calcHWDepth(sampleTex2DNoMips(depth_tex, screen_texcoord))-0.5)*10;
			//return viewSpaceDepth(calcHWDepth(sampleTex2DNoMips(depth_tex, screen_texcoord)))-1.4;
			//return (depth_range.w-0.4)*15; // THIS ONE IS FINE
			//return (position_vsx.y+0.4)*1.5;
			//return (sample_pos_vs.x+1)*0.5;
			//return (sample_depth*0.01-0.2)*4; // I'm getting lines in this now
			//return texcoord.x;
			return abs(diff); // this is the best way to tell if everything is broken.  If you uncomment the line 90ish, you should get black
			//return (proj_mat_X.x-1.12)*300;
			//return (proj_mat_Y.y-1.919)*300;
			//return (abs(proj_mat_W.z)-0.99)*70;  // these 3 all seem the same
			//float4 sample_pos_vs = float4(position_vs + ssao_vector * plane_res.w, 1);
			//return (-sample_pos_vs.z*0.005-0.4)*3;  // this looks a little off maybe? (think it's just the debug view)
			//return -position_vs.x;
			//return abs(position_vs.x - sample_pos_vs.x)*20000;  // these are identical
			//return abs(screen_texcoord.y - texcoord.y)*200; // these are not
			//return -sample_projected.x*0.01;

			// the next two are off, but not good tests?
			//return screen_texcoord.y > 0.4176; // the one on the right is fatter.  (because of quantization?)
			//return texcoord.y < 0.183;
#endif

			#ifndef TRANSGAMING
			[flatten]
			#endif
			// this line makes sure not to include things that are self occluding in the distance.  Not sure how it works
			if (diff > 0.05+0.07*pow(depth/50*saturate(sqrt((1-abs(normal.z)))),2))
			{
#ifdef SSAO_PREPASS
				if (diff < 8)
					return 1.0f;
#else
				diff *= param_vec.z;
				ssao += param_vec.w / (1.0 + diff*diff);
#endif
			}
		}
		//result = saturate(param_vec.x * param_vec.w*(pow(2,hits/NUM_SSAO_SAMPLES())-1) - param_vec.y);
		result = saturate(param_vec.x * ssao /iSamplesToRun - param_vec.y);
	}

	return result;
}

# pragma warning( enable : 4000 )

#macro calcSSAO(tex1, depth, b, c, tex2, d)
calcSSAOInternal(tex1, sam##tex1, tex2, sam##tex2, b, c, depth, d)
#endmacro