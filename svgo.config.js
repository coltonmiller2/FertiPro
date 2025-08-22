// svgo.config.js
module.exports = {
  multipass: true, // run multiple passes for max cleanup
  plugins: [
    // Remove XML/doctype/comment noise
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',

    // Remove editor-specific stuff
    'removeMetadata',
    'removeEditorsNSData',

    // Convert style attributes to real SVG attributes
    'convertStyleToAttrs',

    // Strip unused / default attrs
    'removeUnknownsAndDefaults',
    'cleanupAttrs',

    // Shorten/optimize styles & path data
    'minifyStyles',
    'convertPathData',

    // Optional: collapse groups where possible
    'collapseGroups',

    // Optional: remove title/desc if you don't need accessibility metadata
    { name: 'removeTitle', active: false },
    { name: 'removeDesc', active: false },
  ],
};
