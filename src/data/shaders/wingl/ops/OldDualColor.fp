%GenTemp:A_temp%
MOV %A_temp%, %A%; # Do swizzling
LRP %Result%.xyz, %B%, %Color0%, %Color1%;
LRP %Result%.xyz, %A_temp%.w, 1, %Result%;
MUL %Result%.xyz, %A_temp%, %Result%;
MOV %Result%.w, %B%;
