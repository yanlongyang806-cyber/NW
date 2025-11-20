'use strict';
//
// Stencil
//

function Stencil(strCode)
{
	//
	// All stencils are functions used in the following form.
	//
	//     stencilName(deref, object|null, fn)
	//
	// The first parameter is the function that will be used to look up values
	//   referenced in the stencil. Stencil.derefAndContinue will typically
	//   be used for this.
	// The second parameter is the default (root) context that data values
	//   will be looked up within.
	// The function fn is called when the render is complete. This may
	//   not be for a while if data needs to be looked up. it is in the form:
	//
	//     fn(error, result)
	//
	//   where error is an error object or undefined, and result is the result
	//   of the stencil in array form. You can use res.join('') to get a
	//   single string.
	//

	return new Function('n' /* name */, 'd' /* deref */, 'c' /* the context array */, 'x' /* doen callback */, strCode);
}

module.exports = Stencil;

// End of File
