TEX %Result%, %TexCoord%, texture[%NormalMap%], 2D;
MAD %Result%.xyz, %Result%, 2.0, -1.0;
