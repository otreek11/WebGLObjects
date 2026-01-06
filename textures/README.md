# Textures Directory

This directory is for storing texture image files used in the WebGL 3D scene.

## How to Use

Place your texture image files (JPG or PNG format) in this directory.

The application is configured to load:
- **wood.jpg** - Wood texture for the cube object

## Texture File Requirements

- **Format**: JPG or PNG
- **Size**: Any size works, but power-of-2 dimensions (256×256, 512×512, 1024×1024) are optimal for WebGL
- **Recommended**: At least one texture file named `wood.jpg`

## Fallback Behavior

If texture files cannot be loaded, the application will use:
- A procedurally generated checkerboard texture as a fallback
- The texture will still be visible on the cube with lighting applied

## Adding More Textures

To add more textures:

1. Place your image file in this directory
2. In [src/main.js](../src/main.js), add a line in the `main()` function:
   ```javascript
   textureLoader.loadTexture('texture-name', './textures/yourfile.jpg');
   ```
3. Assign it to an object in `setupScene()`:
   ```javascript
   object.hasTexture = true;
   object.textureId = 'texture-name';
   ```

## Example Texture Sources

Free textures can be found at:
- [Textures.com](https://www.textures.com/)
- [Poly Haven](https://polyhaven.com/textures)
- [FreePBR](https://freepbr.com/)
