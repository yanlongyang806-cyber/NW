// Force SM2.0 flag.  This allows GraphicsLib to override the shader
// model actually being compiled for, for measuring lower end shaders.
#ifdef FORCE_SM20
#undef SM2B
#undef SM30
#undef D3D11
#define SM20
#endif

#ifdef SM20
#ifdef SM2B
Error in defines, can't be SM2B and SM20'
#elifdef SM30
Error in defines, can't be SM30 and SM20'
#endif

// Just SM20, no 2A or 2B or 30
#define NO_SPECULAR
#define NO_SHADOW
#define NO_NORMALMAP
#define VERTEX_FOG
#undef HasDiffuseWarp
#undef HALFTONE
#endif

#ifndef SM30
// Adds a couple extra instructions to lighting we can't afford
#undef TINT_SHADOW
// texlod not supported
#undef AllowRefMIPBias
// Actually need "SM30_PLUS" for CCLIGHTING (5 lights support), so a small set of cards may be getting a few extra instructions
#define NO_CCLIGHTING
#endif

#pragma warning(disable:3206) // implicit truncation of vector type (e.g. float3 a = (float4)b;)
#pragma warning(disable:3571) // pow(f, e) will not work for negative f, use abs(f) or conditionally handle negative values if you expect them