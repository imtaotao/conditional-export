module.exports = function() {
  const [moduleId, options] = arguments;
  if (moduleId.startsWith("demo")) {
    return require.resolve(
      moduleId,
      { paths: [options.basedir] },
    )
  } else {
    return options.defaultResolver.apply(this, arguments)
  }
}