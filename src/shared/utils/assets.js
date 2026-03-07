function isConvertibleRasterPath(path) {
  return /\.(png|jpe?g)$/i.test(path);
}

function toWebpPath(path) {
  return path.replace(/\.(png|jpe?g)$/i, ".webp");
}

export function preferWebpPath(path) {
  return isConvertibleRasterPath(path) ? toWebpPath(path) : path;
}
