


#ifdef HAS_TRUNK_WIND || HAS_WIND

float4 smooth_curve(float4 x)
{
	return x * x * (3.0 - 2.0 * x);
}

float4 triangle_wave(float4 x)
{
	return abs(frac(x + 0.5) * 2.0 - 1.0);
}

float get_trunk_bend_amt(float height, float maxHeight)
{
	float bendAmt = max(height / (maxHeight * 2.5), 0); 

	bendAmt += 1.0;
	bendAmt *= bendAmt;
	bendAmt = bendAmt * bendAmt - bendAmt;

	return bendAmt;
}

//the vector is stored as an angle around the Y axis. 
void unpack_angle(in float val, in float twist_bias, out float3 wind_vec)
{
	val +=  twist_bias;
	wind_vec = normalize(float3(sin(val), 0, cos(val)));
}

void unpack_bendiness_rustling(in float val, out float bending, out float rustling)
{
	bending = frac(val) * 2.0001;
	rustling = floor(val) / 100.0 * 2.0;
}

float3 bend_offset(in float3 modelPos, in float3 vertPos, in float3 windVec, in float windMag, in float bendAmt)
{
	float3 relativePosition = vertPos - modelPos;
	float originalLength = length(relativePosition);
	float3 newPos;
	
	// Wind Effect on Vert Position
	newPos = ((windVec * bendAmt) * windMag) + relativePosition;
	// Prevent stretching as wind causes the vert to get pushed
	newPos = normalize(newPos) * originalLength;
	// Return new position in relation to original position.
	return newPos - relativePosition;
}

//this computes the offset for trunk bending
float4 do_trunk_wind(in float4 position_ws, in float4 inst_wind_params, in float3 model_scale, in float3 model_trans)
{
	
	float time = global_wind_params.x;
	float pivotOffset = global_wind_params.y;
	float angle = inst_wind_params.y;
	float phase = inst_wind_params.z;
	float modelHeight = global_wind_params.z;

	float bending, rustling;
	unpack_bendiness_rustling(inst_wind_params.x, bending, rustling);

	//we need to apply the scale since we are working in worldspace
	float bendAmt = get_trunk_bend_amt(((position_ws.y - model_trans.y) - pivotOffset * model_scale.y) * bending, modelHeight * model_scale.y); 
	
	float windMag = inst_wind_params.w;
	float3 windVec;
	unpack_angle(angle, 0, windVec); 

	return float4(bend_offset(model_trans, position_ws.xyz, windVec, windMag, bendAmt), 0);
}

#endif

#ifdef HAS_WIND

//this computes the offset for leaf rustling
float4 do_wind(in float4 position_ws, in float3 normal_ws, in float4 vertex_color, in float4 inst_wind_params, in float4 trunkWindAdd)
{
	float time = global_wind_params.x;
	float angle = inst_wind_params.y;
	float phase = inst_wind_params.z;

	float bending, rustling;
	unpack_bendiness_rustling(inst_wind_params.x, bending, rustling);

	float windMag = inst_wind_params.w;
	float3 windVec;
	unpack_angle(angle, 0, windVec); 

	float rustleSpeed = 0.02 * pow(abs(windMag), 0.96);
	float rustleAmt = min(saturate(sqrt(windMag)/10) * rustling, 15);

	float branchAmt = vertex_color.r;
	float floppyness = vertex_color.g;
	float leafphase = vertex_color.b;

	float vertexPhase = dot(position_ws, frac(phase) + leafphase);

	float2 wavesIn = time + float2(vertexPhase, leafphase + frac(phase));
	
	float4 wavesSlow = (frac(wavesIn.xxyy * float4(1.975, 0.793, 0.375, 0.193)) * 2.0 - 1.0) * rustleSpeed;
	wavesSlow = smooth_curve(triangle_wave(wavesSlow));
	float2 wavesSlowSum = wavesSlow.xz + wavesSlow.yw;
	wavesSlowSum *= 2;
	
	float3 rustleAdd = wavesSlowSum.xyx * rustleAmt * branchAmt;

	float4 wavesFast = (frac(wavesIn.xxyy * float4(1.875, 0.693, 0.275, 0.093)) * 2.0 - 1.0) * rustleSpeed * 8;
	wavesFast = smooth_curve(triangle_wave(wavesFast));
	float2 wavesFastSum = wavesFast.xz + wavesFast.yw;

	rustleAdd += wavesFastSum.xxy * float3(normal_ws.z, normal_ws.y, 1) * rustleAmt * floppyness;

	//the leaves kind of detach if they go too fast so we fudge it a little to push them back on the branch
	float3 fudgeFactor = (trunkWindAdd * floppyness * branchAmt * rustleAmt * 0.25).xyz;
	
	return float4((windVec * rustleAdd*2 + fudgeFactor) * windMag, 0);
}


#endif