#ifdef SHOW_ALPHA|SHOW_RED|SHOW_GREEN|SHOW_BLUE
#define SHOW_COLOR_DEBUG
float4 debug_map_color(float4 color)
{
	float4 ret = {0, 0, 0, color.w};
	#ifdef SHOW_RED
		#ifdef SHOW_GREEN|SHOW_BLUE
			ret.x = color.x;
		#else
			ret.xyz = color.x;
		#endif
	#endif
	#ifdef SHOW_GREEN
		#ifdef SHOW_RED|SHOW_BLUE
			ret.y = color.y;
		#else
			ret.xyz = color.y;
		#endif
	#endif
	#ifdef SHOW_BLUE
		#ifdef SHOW_RED|SHOW_GREEN
			ret.z = color.z;
		#else
			ret.xyz = color.z;
		#endif
	#endif

	#ifdef SHOW_ALPHA
		#ifdef SHOW_RED|SHOW_GREEN|SHOW_BLUE
			ret.w = color.w;
		#else
			#define SHOW_COLOR_DEBUG_ALPHA
			#define NO_ALPHA_CLIP
			ret.xyz = color.w;
			ret.w = 1;
		#endif
	#endif
	return ret;
}
#endif
