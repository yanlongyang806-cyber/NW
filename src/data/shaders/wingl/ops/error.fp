!!ARBfp1.0
OPTION ARB_precision_hint_fastest;

#ifdef MRTS
#ifdef ATI
	OPTION ATI_draw_buffers;
#else
	OPTION ARB_draw_buffers;
#endif
#endif

#ifdef MRTS
MOV result.color[0], {0.9, 0.5, 0.5, 1.0};
MOV result.color[1], {0.5, 0.9, 0.5, 1.0};
MOV result.color[2], {0.5, 0.5, 0.9, 1.0};
MOV result.color[3], {0.9, 0.5, 0.5, 1.0};
#else
PARAM color = {0.9, 0.5, 0.5, 1.0};
MOV result.color, color;
#endif

END
