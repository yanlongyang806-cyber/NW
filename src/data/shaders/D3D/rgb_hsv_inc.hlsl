float3 RGBtoHSV( float3 p_vRGB )
{
	float3 a_vRGBPermute, a_vUPermute;
	float3 a_vU = { 0.0f, 2.0f, 4.0f };
	float a_fH = 0.0f;

	// rotate the RGB values and the matching Hue offsets to move
	// the maximum component into the R slot
	{
		// rotate if G > R or B > R
		float a_fIsGOrBGreaterThanR = float( p_vRGB.g > p_vRGB.r || p_vRGB.b > p_vRGB.r );
		a_vRGBPermute = lerp( p_vRGB, p_vRGB.gbr, a_fIsGOrBGreaterThanR );
		a_vUPermute = lerp( a_vU, a_vU.gbr, a_fIsGOrBGreaterThanR  );

		// rotate again if G > R
		a_fIsGOrBGreaterThanR = float( a_vRGBPermute.g > a_vRGBPermute.r );
		p_vRGB = lerp( a_vRGBPermute, a_vRGBPermute.gbr, a_fIsGOrBGreaterThanR );
		a_vU.xy = lerp( a_vUPermute, a_vUPermute.gbr, a_fIsGOrBGreaterThanR  ).xy;
	}

	// now R is largest, so G or B is smallest
	float a_fMin = min( p_vRGB.b, p_vRGB.g );
	float a_fMinMaxDelta = p_vRGB.r - a_fMin;
	float a_f1oR = 1.0 / p_vRGB.r;

	if ( a_fMinMaxDelta )
	{
		// add one because the first part of the expression may be negatively offset from the
		// base hue offset
		a_fH = ( p_vRGB.g - p_vRGB.b ) / a_fMinMaxDelta + a_vU.x;
	}

	// FIXME: Ugly hack. If the resulting hue is too close
	//   to an integer, it may not be converted back
	//   properly, so nudge it away from them a bit. -Cliff
	if(frac(a_fH) < 0.001) a_fH += 0.001;
	if(frac(a_fH) > 0.999) a_fH -= 0.001;

	float3 a_vHSVOut = { a_fH, 1.0 - a_fMin * a_f1oR, p_vRGB.r };

	return a_vHSVOut;
}

float3 HSVtoRGB( float3 a_vHSV )
{
	static const float g_f1o6 = 0.1666666666666;

	float3 a_vRGBOut, a_vRGBTemp;
	float a_fAlpha, a_f1mS, a_f1mA;

	a_fAlpha = frac(a_vHSV.x);

	a_f1mS = 1.0f - a_vHSV.y;

	// generate the RGB reconstruction piecewise curve points
	// for the specified sextant of H. The RGB curves are phased 1/3 (relative to [0-1], 
	// not [0-360]) off from each other
	// R 0_    _1  G 0 __   1  R 0    __    
	//     \__/       /  \__       __/  \   
	a_vRGBOut.r = a_vHSV.x + 4;
	a_vRGBOut.g = a_vHSV.x + 2;
	a_vRGBOut.b = a_vHSV.x;

	a_vRGBOut /= 6.0f;

	a_vRGBTemp = a_vRGBOut + g_f1o6;

	// restrict to 0 or 1 
	a_vRGBOut = floor( frac( a_vRGBOut ) + 0.5 );
	a_vRGBTemp = floor( frac( a_vRGBTemp ) + 0.5 );

	// interpolate between the start and end point of this piece of the curve
	a_vRGBOut = lerp( a_vRGBOut, a_vRGBTemp, a_fAlpha );

	// adjust for saturation and value
	a_vRGBOut = a_vHSV.z * ( a_f1mS + a_vRGBOut * a_vHSV.yyy );

	return a_vRGBOut;
}

